"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SEEDERS: Record<string, string[]> = {
  STUDENT: ["What's my biggest skill gap?", "How do I improve my readiness?", "Which opportunities fit me best?"],
  INDUSTRY: ["How do I find the best talent?", "What skills should I require?", "How does the team builder work?"],
  ACADEMIA: ["Where are the biggest curriculum gaps?", "How do I align my course to industry?", "Which opportunities suit my students?"],
  INSTITUTION: ["Which branches need intervention?", "How is placement trending?", "Where is industry alignment weakest?"],
};

export function AiAssistant({ accent, tint, portalName, role }: { accent: string; tint: string; portalName: string; role: Role }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{ role: "assistant", content: `Hi! I'm your SKILL SETU AI Skill Coach for the ${portalName}. Ask me about your skills, gaps, opportunities, or next steps.` }]);
    }
  }, [open, msgs.length, portalName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        // use fallback if provided
        setMsgs([...next, { role: "assistant", content: e.fallback || "I couldn't reach the model just now — please retry." }]);
      } else {
        const { content } = await res.json();
        setMsgs([...next, { role: "assistant", content }]);
      }
    } catch {
      toast.error("Network error talking to the AI coach.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: accent, color: "white" }}
            aria-label="Open AI assistant"
          >
            <Bot className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-400" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-40 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3" style={{ background: `linear-gradient(135deg, ${accent}15, ${tint})` }}>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: accent, color: "white" }}>
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">AI Skill Coach</p>
                  <p className="text-[10px] text-slate-500">{portalName} · context-aware</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="scroll-slim flex-1 space-y-2.5 overflow-y-auto bg-slate-50/50 p-3">
              {msgs.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                      m.role === "user"
                        ? "rounded-br-md text-white"
                        : "rounded-bl-md bg-white text-slate-700 shadow-sm",
                    )}
                    style={m.role === "user" ? { backgroundColor: accent } : undefined}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin" style={{ color: accent }} />
                    <span className="text-[10px] text-slate-400">thinking…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Seeds */}
            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 border-t border-slate-200 bg-white px-3 py-2">
                {(SEEDERS[role] ?? SEEDERS.STUDENT).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-1.5 border-t border-slate-200 bg-white p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your skill coach…"
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-300"
              />
              <Button type="submit" disabled={loading || !input.trim()} size="icon" className="h-8 w-8 rounded-full" style={{ backgroundColor: accent }}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
