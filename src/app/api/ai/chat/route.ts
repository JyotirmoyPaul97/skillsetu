import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/session";
import { getPassport } from "@/lib/skill-engine";
import { db } from "@/lib/db";

interface ChatBody {
  messages: { role: "user" | "assistant"; content: string }[];
}

export async function POST(request: NextRequest) {
  const auth = await requireUserSoft();
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: ChatBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "missing_messages" }, { status: 400 });
  }

  // Build a role-aware system prompt with live data context.
  const systemPrompt = await buildSystemPrompt(auth.id, auth.role);

  // Convert to LLM messages (prepend system prompt)
  const llmMessages = [
    { role: "system", content: systemPrompt },
    ...body.messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    // dynamic import so the SDK never runs on the client
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: llmMessages,
      thinking: { type: "disabled" },
    });
    const content = completion.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: "ai_unavailable", fallback: fallbackReply(auth.role, body.messages[body.messages.length - 1].content) },
      { status: 502 },
    );
  }
}

// soft session: returns user id+role or null
async function requireUserSoft(): Promise<{ id: string; role: string; name: string } | null> {
  const { getSession } = await import("@/lib/session");
  const s = await getSession();
  if (!s) return null;
  return { id: s.id, role: s.role, name: s.name };
}

async function buildSystemPrompt(userId: string, role: string): Promise<string> {
  const base = `You are the SKILL SETU AI Skill Coach, an assistant embedded in the SKILL SETU Skill Intelligence Ecosystem (SIH 2026 Problem Statement 44). You help users of the ${role} portal with concrete, evidence-based advice. Be concise (3-5 short sentences), practical, and reference specific skills, evidence types, or opportunities when relevant. Never invent skill names — use what the user has.`;
  let context = "";
  try {
    if (role === "STUDENT") {
      const p = await getPassport(userId);
      if (p) {
        context = `\n\nLIVE STUDENT CONTEXT:\n- Target role: ${p.targetRole}\n- Overall readiness: ${p.overallReadiness}%\n- Skills with levels: ${p.skills.map((s) => `${s.skill.name}=${s.level}%`).join(", ") || "none yet"}\n- Top gaps: ${p.gaps.slice(0, 5).map((g) => `${g.skill.name} (need ${g.targetLevel}%, have ${g.currentLevel}%)`).join("; ") || "none"}\n- Evidence count: ${p.evidence.length}\n- Feedback received: ${p.feedbackReceived.length}`;
      }
    } else if (role === "INDUSTRY") {
      const opps = await db.opportunity.count({ where: { industryId: userId } });
      const apps = await db.application.count({ where: { opportunity: { industryId: userId } } });
      context = `\n\nLIVE INDUSTRY CONTEXT:\n- Posted opportunities: ${opps}\n- Total applications received: ${apps}`;
    } else if (role === "ACADEMIA") {
      const gaps = await db.curriculumAlignment.findMany({ where: { academiaId: userId }, include: { skill: true }, orderBy: { gap: "desc" }, take: 6 });
      context = `\n\nLIVE ACADEMIA CONTEXT:\n- Tracked curriculum gaps: ${gaps.map((g) => `${g.branch}/${g.skill.name} gap=${g.gap}`).join(", ") || "none"}`;
    } else if (role === "INSTITUTION") {
      const inst = await db.institution.findFirst({ orderBy: { createdAt: "asc" } });
      const stats = await db.branchAnalytics.findMany({ where: { institutionId: inst?.id }, orderBy: { branch: "asc" } });
      context = `\n\nLIVE INSTITUTION CONTEXT:\n- Branches tracked: ${[...new Set(stats.map((s) => s.branch))].join(", ") || "none"}\n- Avg skill scores by branch: ${stats.map((s) => `${s.branch} ${s.academicYear}=${Math.round(s.avgSkillScore)}`).join(", ")}`;
    }
  } catch {
    // context build failures shouldn't break chat
  }
  return base + context + `\n\nToday's date: ${new Date().toISOString().slice(0, 10)}.`;
}

function fallbackReply(role: string, last: string): string {
  const lc = last.toLowerCase();
  if (lc.includes("gap")) return `To close a skill gap, focus on one skill at a time: add an assessment or a small project as evidence, then request feedback from a mentor.`;
  if (lc.includes("opportunity") || lc.includes("intern")) return `Browse matched opportunities on your Opportunities tab — your match score is computed live from your evidence.`;
  return `As a ${role} user, you can use the dashboard tabs to act on skills, opportunities, and feedback. Try asking about a specific skill or opportunity.`;
}
