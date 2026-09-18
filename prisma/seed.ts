/**
 * SKILL SETU seed script.
 * Creates a realistic ecosystem: institutions, skills, target roles,
 * users for all 4 portals (with profiles), evidence, opportunities,
 * applications, feedback, curriculum gaps, branch analytics, placements.
 *
 * Run with: `bun run prisma/seed.ts`
 */
import { PrismaClient, Role, EvidenceType, OpportunityType, OpportunityStatus, ApplicationStatus } from "@prisma/client";
import { randomUUID, createHash } from "crypto";

const prisma = new PrismaClient();

const hash = (pw: string) => createHash("sha256").update(pw).digest("hex");
const now = () => new Date();
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000);

async function main() {
  console.log("🧹 Cleaning existing data…");
  // Delete in dependency order
  const tables = [
    "feedback", "applications", "team_build_requests", "opportunities",
    "curriculum_alignment", "placement_records", "branch_analytics",
    "skill_evidence", "target_role_skills", "skills",
    "student_profiles", "industry_profiles", "academia_profiles",
    "institutions", "sessions", "users",
  ];
  for (const t of tables) {
    try {
      // @ts-expect-error dynamic table access
      await prisma[t].deleteMany();
    } catch {
      // ignore
    }
  }

  // ─── Institutions ─────────────────────────────────────────────
  console.log("🏫 Creating institutions…");
  const inst1 = await prisma.institution.create({ data: { name: "Indian Institute of Technology, Madras", code: "IITM", location: "Chennai", type: "Engineering" } });
  const inst2 = await prisma.institution.create({ data: { name: "National Institute of Technology, Trichy", code: "NITT", location: "Tiruchirappalli", type: "Engineering" } });
  const inst3 = await prisma.institution.create({ data: { name: "Vellore Institute of Technology", code: "VIT", location: "Vellore", type: "Engineering" } });

  // ─── Skills catalog ───────────────────────────────────────────
  console.log("🧠 Creating skill catalog…");
  const skillDefs: [string, string, string][] = [
    ["Data Structures & Algorithms", "Technical", "Fundamental CS problem-solving"],
    ["React.js", "Frontend", "Component-based UI development"],
    ["Node.js", "Backend", "Server-side JavaScript runtime"],
    ["Python", "Programming", "General-purpose scripting & ML"],
    ["Machine Learning", "AI/ML", "Supervised & unsupervised learning"],
    ["Deep Learning", "AI/ML", "Neural networks & transformers"],
    ["SQL", "Database", "Relational query language"],
    ["MongoDB", "Database", "Document-oriented NoSQL"],
    ["Docker", "DevOps", "Containerization"],
    ["Kubernetes", "DevOps", "Container orchestration"],
    ["AWS", "Cloud", "Amazon Web Services"],
    ["TypeScript", "Programming", "Typed JavaScript superset"],
    ["System Design", "Architecture", "Scalable distributed system design"],
    ["Communication", "Soft Skills", "Effective verbal & written expression"],
    ["Leadership", "Soft Skills", "Team guidance & decision-making"],
    ["UI/UX Design", "Design", "User-centered interface design"],
    ["Cybersecurity", "Security", "Threat modeling & secure coding"],
    ["DevOps Practices", "DevOps", "CI/CD pipelines & IaC"],
    ["Data Visualization", "Analytics", "Communicating insight visually"],
    ["Project Management", "Soft Skills", "Planning, tracking & delivery"],
  ];
  const skills = await Promise.all(
    skillDefs.map(([name, category, description]) =>
      prisma.skill.create({ data: { name, category, description } }),
    ),
  );
  const skillByName = (n: string) => skills.find((s) => s.name === n)!;

  // ─── Target role skill matrix ─────────────────────────────────
  console.log("🎯 Defining target roles…");
  const roles: { name: string; skills: [string, number, number][] }[] = [
    {
      name: "Frontend Engineer",
      skills: [
        ["React.js", 1.0, 85],
        ["TypeScript", 0.9, 80],
        ["UI/UX Design", 0.6, 70],
        ["Data Structures & Algorithms", 0.7, 75],
        ["Communication", 0.5, 75],
      ],
    },
    {
      name: "Backend Engineer",
      skills: [
        ["Node.js", 1.0, 85],
        ["Python", 0.8, 75],
        ["SQL", 0.9, 80],
        ["System Design", 0.9, 80],
        ["Docker", 0.6, 70],
        ["Data Structures & Algorithms", 0.9, 85],
      ],
    },
    {
      name: "ML Engineer",
      skills: [
        ["Machine Learning", 1.0, 85],
        ["Deep Learning", 0.85, 80],
        ["Python", 0.95, 85],
        ["Data Visualization", 0.6, 70],
        ["AWS", 0.5, 65],
      ],
    },
    {
      name: "DevOps Engineer",
      skills: [
        ["Docker", 1.0, 85],
        ["Kubernetes", 0.95, 85],
        ["AWS", 0.9, 85],
        ["DevOps Practices", 1.0, 85],
        ["System Design", 0.7, 75],
      ],
    },
    {
      name: "Full-Stack Engineer",
      skills: [
        ["React.js", 0.9, 80],
        ["Node.js", 0.9, 80],
        ["TypeScript", 0.85, 80],
        ["SQL", 0.8, 75],
        ["System Design", 0.8, 80],
        ["Docker", 0.6, 70],
      ],
    },
    {
      name: "Data Analyst",
      skills: [
        ["SQL", 1.0, 85],
        ["Python", 0.9, 80],
        ["Data Visualization", 0.95, 85],
        ["Communication", 0.7, 75],
      ],
    },
  ];
  for (const r of roles) {
    for (const [skillName, weight, target] of r.skills) {
      await prisma.targetRoleSkill.create({
        data: { roleName: r.name, skillId: skillByName(skillName).id, weight, targetLevel: target },
      }).catch(() => {});
    }
  }

  // ─── Users across 4 portals ───────────────────────────────────
  console.log("👥 Creating users for all portals…");

  const pw = hash("skillsetu"); // shared demo password

  // Admin (institution)
  const instAdmin = await prisma.user.create({
    data: {
      email: "admin@iitm.ac.in", passwordHash: pw, name: "Dr. Rajesh Kumar", role: Role.INSTITUTION, avatarColor: "#6D28D9",
    },
  });

  // Students
  const studentDefs = [
    ["Aarav Sharma", "aarav@iitm.ac.in", "CS21B001", "Computer Science", 4, 8.7, "Frontend Engineer", "#0D9488", inst1.id],
    ["Priya Nair", "priya@iitm.ac.in", "CS21B002", "Computer Science", 4, 9.1, "ML Engineer", "#0D9488", inst1.id],
    ["Rohan Gupta", "rohan@nitt.ac.in", "EC21B014", "Electronics & Comm", 3, 8.2, "Full-Stack Engineer", "#0D9488", inst2.id],
    ["Ananya Iyer", "ananya@vit.ac.in", "IT20B021", "Information Technology", 4, 8.9, "Backend Engineer", "#0D9488", inst3.id],
    ["Karthik Reddy", "karthik@iitm.ac.in", "CS22B007", "Computer Science", 2, 8.4, "DevOps Engineer", "#0D9488", inst1.id],
    ["Sneha Patel", "sneha@vit.ac.in", "DS21B033", "Data Science", 3, 8.6, "Data Analyst", "#0D9488", inst3.id],
    ["Vikram Singh", "vikram@nitt.ac.in", "ME20B045", "Mechanical", 4, 7.9, "Frontend Engineer", "#0D9488", inst2.id],
    ["Divya Menon", "divya@iitm.ac.in", "CS21B019", "Computer Science", 4, 9.3, "ML Engineer", "#0D9488", inst1.id],
  ];
  const students = await Promise.all(
    studentDefs.map(async ([name, email, rollNo, branch, year, cgpa, targetRole, color, institutionId]) => {
      const u = await prisma.user.create({
        data: { email, passwordHash: pw, name: name as string, role: Role.STUDENT, avatarColor: color as string },
      });
      await prisma.studentProfile.create({
        data: {
          userId: u.id,
          rollNo: rollNo as string,
          branch: branch as string,
          year: year as number,
          cgpa: cgpa as number,
          bio: `${name} — ${branch} student passionate about ${targetRole}.`,
          targetRole: targetRole as string,
          institutionId: institutionId as string,
        },
      });
      return u;
    }),
  );

  // Industry users
  const industryDefs = [
    ["TechNova Solutions", "talent@technova.com", "Software", "https://technova.example", "Bengaluru", "201-500", "#B45309"],
    ["DataForge Labs", "careers@dataforge.io", "AI/ML", "https://dataforge.io", "Hyderabad", "51-200", "#B45309"],
    ["CloudPeak Systems", "hr@cloudpeak.dev", "Cloud/DevOps", "https://cloudpeak.dev", "Pune", "201-500", "#B45309"],
    ["PixelCraft Studio", "jobs@pixelcraft.design", "Design/ Frontend", "https://pixelcraft.design", "Mumbai", "11-50", "#B45309"],
  ];
  const industries = await Promise.all(
    industryDefs.map(async ([companyName, email, industry, website, location, size, color]) => {
      const u = await prisma.user.create({
        data: { email, passwordHash: pw, name: companyName as string, role: Role.INDUSTRY, avatarColor: color as string },
      });
      await prisma.industryProfile.create({
        data: {
          userId: u.id,
          companyName: companyName as string,
          industry: industry as string,
          website: website as string,
          location: location as string,
          size: size as string,
        },
      });
      return u;
    }),
  );

  // Academia (faculty)
  const academiaDefs = [
    ["Dr. Meena Krishnan", "meena@iitm.ac.in", "Computer Science", "Professor", inst1.id, "NLP, Distributed Systems", "#BE123C"],
    ["Prof. Suresh Pillai", "suresh@nitt.ac.in", "Electronics & Comm", "Associate Professor", inst2.id, "VLSI, Signal Processing", "#BE123C"],
    ["Dr. Anitha Rao", "anitha@vit.ac.in", "Information Technology", "Assistant Professor", inst3.id, "Machine Learning, Computer Vision", "#BE123C"],
  ];
  const faculty = await Promise.all(
    academiaDefs.map(async ([name, email, department, designation, institutionId, researchAreas, color]) => {
      const u = await prisma.user.create({
        data: { email, passwordHash: pw, name: name as string, role: Role.ACADEMIA, avatarColor: color as string },
      });
      await prisma.academiaProfile.create({
        data: {
          userId: u.id,
          department: department as string,
          designation: designation as string,
          institutionId: institutionId as string,
          researchAreas: researchAreas as string,
        },
      });
      return u;
    }),
  );

  // ─── Skill evidence for students ──────────────────────────────
  console.log("📊 Seeding skill evidence…");
  const evidenceSeed: { studentIdx: number; skillName: string; type: EvidenceType; title: string; score: number; verified: boolean; provider: string }[] = [
    // Aarav (0) — Frontend target
    { studentIdx: 0, skillName: "React.js", type: EvidenceType.PROJECT, title: "E-commerce storefront (React + Vite)", score: 88, verified: true, provider: "Hackathon Judge" },
    { studentIdx: 0, skillName: "TypeScript", type: EvidenceType.CERTIFICATION, title: "TS Advanced Types cert", score: 82, verified: true, provider: "Microsoft" },
    { studentIdx: 0, skillName: "UI/UX Design", type: EvidenceType.PROJECT, title: "Design system for fintech app", score: 75, verified: false, provider: "Self" },
    { studentIdx: 0, skillName: "Data Structures & Algorithms", type: EvidenceType.ASSESSMENT, title: "DSA lab — 9.1/10", score: 91, verified: true, provider: "IITM" },
    { studentIdx: 0, skillName: "Communication", type: EvidenceType.FEEDBACK, title: "Presentation peer review", score: 80, verified: true, provider: "Faculty" },
    // Priya (1) — ML target
    { studentIdx: 1, skillName: "Machine Learning", type: EvidenceType.PROJECT, title: "Image classifier (CIFAR-10, 94%)", score: 94, verified: true, provider: "DataForge" },
    { studentIdx: 1, skillName: "Deep Learning", type: EvidenceType.CERTIFICATION, title: "Deep Learning Specialization", score: 89, verified: true, provider: "Coursera" },
    { studentIdx: 1, skillName: "Python", type: EvidenceType.ASSESSMENT, title: "Python proficiency — 9.3/10", score: 93, verified: true, provider: "IITM" },
    { studentIdx: 1, skillName: "Data Visualization", type: EvidenceType.PROJECT, title: "Tableau dashboards for NGO", score: 78, verified: false, provider: "Self" },
    // Rohan (2) — Full-stack target
    { studentIdx: 2, skillName: "Node.js", type: EvidenceType.INTERNSHIP, title: "Backend intern — NITT startup cell", score: 79, verified: true, provider: "NITT" },
    { studentIdx: 2, skillName: "React.js", type: EvidenceType.PROJECT, title: "Real-time chat (MERN)", score: 74, verified: false, provider: "Self" },
    { studentIdx: 2, skillName: "SQL", type: EvidenceType.ASSESSMENT, title: "DBMS lab — 8.4/10", score: 84, verified: true, provider: "NITT" },
    { studentIdx: 2, skillName: "Docker", type: EvidenceType.CERTIFICATION, title: "Docker fundamentals", score: 68, verified: false, provider: "Self" },
    // Ananya (3) — Backend
    { studentIdx: 3, skillName: "Node.js", type: EvidenceType.INTERNSHIP, title: "SDE intern — CloudPeak", score: 86, verified: true, provider: "CloudPeak" },
    { studentIdx: 3, skillName: "SQL", type: EvidenceType.CERTIFICATION, title: "PostgreSQL advanced", score: 88, verified: true, provider: "VIT" },
    { studentIdx: 3, skillName: "System Design", type: EvidenceType.ASSESSMENT, title: "Distributed systems course", score: 81, verified: true, provider: "VIT" },
    { studentIdx: 3, skillName: "Data Structures & Algorithms", type: EvidenceType.ASSESSMENT, title: "Competitive programming — 4★", score: 85, verified: true, provider: "Codeforces" },
    // Karthik (4) — DevOps
    { studentIdx: 4, skillName: "Docker", type: EvidenceType.PROJECT, title: "Containerized monorepo CI", score: 76, verified: false, provider: "Self" },
    { studentIdx: 4, skillName: "Kubernetes", type: EvidenceType.CERTIFICATION, title: "CKA in progress", score: 62, verified: false, provider: "CNCF" },
    { studentIdx: 4, skillName: "AWS", type: EvidenceType.CERTIFICATION, title: "Cloud Practitioner", score: 71, verified: true, provider: "AWS" },
    { studentIdx: 4, skillName: "DevOps Practices", type: EvidenceType.PROJECT, title: "GitHub Actions pipelines", score: 74, verified: false, provider: "Self" },
    // Sneha (5) — Data Analyst
    { studentIdx: 5, skillName: "SQL", type: EvidenceType.ASSESSMENT, title: "Advanced SQL — 9.0/10", score: 90, verified: true, provider: "VIT" },
    { studentIdx: 5, skillName: "Python", type: EvidenceType.PROJECT, title: "Pandas analysis — retail data", score: 83, verified: true, provider: "VIT" },
    { studentIdx: 5, skillName: "Data Visualization", type: EvidenceType.PROJECT, title: "Power BI — supply chain", score: 86, verified: true, provider: "VIT" },
    { studentIdx: 5, skillName: "Communication", type: EvidenceType.FEEDBACK, title: "Stakeholder demo review", score: 82, verified: true, provider: "Internship Mentor" },
    // Vikram (6) — Frontend (career switcher, gap-heavy)
    { studentIdx: 6, skillName: "React.js", type: EvidenceType.PROJECT, title: "Portfolio site in React", score: 58, verified: false, provider: "Self" },
    { studentIdx: 6, skillName: "UI/UX Design", type: EvidenceType.COURSEWORK, title: "HCI coursework", score: 65, verified: true, provider: "NITT" },
    { studentIdx: 6, skillName: "Communication", type: EvidenceType.FEEDBACK, title: "Workshop peer review", score: 72, verified: true, provider: "Faculty" },
    // Divya (7) — ML (strong)
    { studentIdx: 7, skillName: "Machine Learning", type: EvidenceType.PROJECT, title: "NLP for Indian languages", score: 92, verified: true, provider: "IITM Research" },
    { studentIdx: 7, skillName: "Deep Learning", type: EvidenceType.PROJECT, title: "Transformer fine-tuning", score: 90, verified: true, provider: "DataForge" },
    { studentIdx: 7, skillName: "Python", type: EvidenceType.ASSESSMENT, title: "Python — 9.5/10", score: 95, verified: true, provider: "IITM" },
    { studentIdx: 7, skillName: "Communication", type: EvidenceType.FEEDBACK, title: "Conference presentation review", score: 88, verified: true, provider: "ICML reviewer" },
  ];
  for (const e of evidenceSeed) {
    await prisma.skillEvidence.create({
      data: {
        studentId: students[e.studentIdx].id,
        skillId: skillByName(e.skillName).id,
        type: e.type,
        title: e.title,
        score: e.score,
        verified: e.verified,
        provider: e.provider,
      },
    });
  }

  // ─── Opportunities ────────────────────────────────────────────
  console.log("💼 Creating opportunities…");
  const reqSkills = (arr: [string, number, number][]) =>
    JSON.stringify(arr.map(([name, weight, minLevel]) => ({ name, weight, minLevel })));

  const oppDefs = [
    { ind: 0, title: "Frontend Engineer Intern", desc: "Build customer-facing React dashboards for our SaaS platform. Mentorship included.", type: OpportunityType.INTERNSHIP, skills: [["React.js", 1, 75], ["TypeScript", 0.8, 70], ["UI/UX Design", 0.5, 60]], location: "Bengaluru / Remote", stipend: "₹35,000/mo", deadline: "30 days", openings: 2 },
    { ind: 0, title: "Full-Stack Developer", desc: "Work across our MERN stack, ship features end-to-end.", type: OpportunityType.FULL_TIME, skills: [["React.js", 0.8, 75], ["Node.js", 0.9, 80], ["SQL", 0.7, 70], ["System Design", 0.7, 70]], location: "Bengaluru", stipend: "₹12 LPA", deadline: "21 days", openings: 1 },
    { ind: 1, title: "ML Research Intern", desc: "Fine-tune LLMs and build evaluation pipelines for document AI.", type: OpportunityType.INTERNSHIP, skills: [["Machine Learning", 1, 80], ["Python", 0.9, 80], ["Deep Learning", 0.7, 70]], location: "Hyderabad", stipend: "₹40,000/mo", deadline: "14 days", openings: 2 },
    { ind: 1, title: "Data Analyst", desc: "Turn raw product data into dashboards and insights for stakeholders.", type: OpportunityType.FULL_TIME, skills: [["SQL", 1, 80], ["Python", 0.8, 70], ["Data Visualization", 0.9, 80]], location: "Hyderabad / Remote", stipend: "₹8 LPA", deadline: "25 days", openings: 1 },
    { ind: 2, title: "DevOps Engineer", desc: "Own our Kubernetes clusters and CI/CD on AWS.", type: OpportunityType.FULL_TIME, skills: [["Docker", 1, 80], ["Kubernetes", 0.9, 80], ["AWS", 0.9, 80], ["DevOps Practices", 1, 80]], location: "Pune", stipend: "₹14 LPA", deadline: "18 days", openings: 1 },
    { ind: 2, title: "Cloud Project (Mentorship)", desc: "6-week mentored project migrating a sample app to AWS with review sessions.", type: OpportunityType.MENTORSHIP, skills: [["AWS", 1, 65], ["Docker", 0.6, 60], ["System Design", 0.5, 60]], location: "Remote", stipend: "Unpaid + cert", deadline: "10 days", openings: 3 },
    { ind: 3, title: "UI/UX Design Intern", desc: "Design flows for a consumer mobile app; ship to production.", type: OpportunityType.INTERNSHIP, skills: [["UI/UX Design", 1, 75], ["React.js", 0.4, 50], ["Communication", 0.5, 70]], location: "Mumbai / Remote", stipend: "₹25,000/mo", deadline: "12 days", openings: 1 },
  ];
  const opportunities = await Promise.all(
    oppDefs.map((o) =>
      prisma.opportunity.create({
        data: {
          industryId: industries[o.ind].id,
          title: o.title,
          description: o.desc,
          type: o.type,
          requiredSkills: reqSkills(o.skills as [string, number, number][]),
          location: o.location,
          stipend: o.stipend,
          deadline: o.deadline,
          openings: o.openings,
          status: OpportunityStatus.OPEN,
        },
      }),
    ),
  );

  // ─── Applications (with computed matchScore) ─────────────────
  console.log("📨 Seeding applications…");
  const computeMatch = (studentIdx: number, oppIdx: number) => {
    const opp = oppDefs[oppIdx];
    const studentEvidence = evidenceSeed.filter((e) => e.studentIdx === studentIdx);
    let weighted = 0, totalW = 0;
    for (const [skillName, weight, minLevel] of opp.skills as [string, number, number][]) {
      const ev = studentEvidence.find((e) => e.skillName === skillName);
      const level = ev ? ev.score : 0;
      const ratio = level >= minLevel ? 1 : level / minLevel;
      weighted += ratio * weight;
      totalW += weight;
    }
    return Math.round((weighted / (totalW || 1)) * 100);
  };
  const appDefs: [number, number, ApplicationStatus][] = [
    [0, 0, ApplicationStatus.SHORTLISTED], // Aarav → Frontend intern
    [0, 1, ApplicationStatus.PENDING],     // Aarav → Full-time
    [1, 2, ApplicationStatus.SELECTED],    // Priya → ML intern
    [1, 3, ApplicationStatus.REJECTED],    // Priya → Data Analyst (irrelevant)
    [2, 1, ApplicationStatus.PENDING],     // Rohan → Full-stack
    [3, 4, ApplicationStatus.SHORTLISTED], // Ananya → DevOps (gap)
    [4, 5, ApplicationStatus.PENDING],     // Karthik → Cloud mentorship
    [5, 3, ApplicationStatus.SHORTLISTED], // Sneha → Data Analyst
    [6, 0, ApplicationStatus.PENDING],     // Vikram → Frontend (gaps)
    [7, 2, ApplicationStatus.SELECTED],    // Divya → ML intern
  ];
  for (const [sIdx, oIdx, status] of appDefs) {
    await prisma.application.create({
      data: {
        opportunityId: opportunities[oIdx].id,
        studentId: students[sIdx].id,
        status,
        matchScore: computeMatch(sIdx, oIdx),
        coverNote: "Excited to contribute — my evidence aligns with your requirements.",
      },
    });
  }

  // ─── Feedback (industry → student) ────────────────────────────
  console.log("📩 Seeding feedback…");
  const feedbackDefs: { from: number; to: number; opp: number | null; rating: number; comment: string }[] = [
    { from: 1, to: 1, opp: 2, rating: 5, comment: "Outstanding ML fundamentals. Strong Python and clean experimentation." },
    { from: 0, to: 0, opp: 0, rating: 4, comment: "Solid React skills; improve TypeScript types discipline." },
    { from: 2, to: 3, opp: 4, rating: 4, comment: "Great backend instincts; needs more cloud exposure." },
    { from: 1, to: 7, opp: 2, rating: 5, comment: "Research-calibre work on transformer fine-tuning. Highly recommended." },
    { from: 3, to: 5, opp: 6, rating: 5, comment: "Excellent data storytelling; dashboards were board-ready." },
  ];
  for (const f of feedbackDefs) {
    await prisma.feedback.create({
      data: {
        fromUserId: industries[f.from].id,
        toStudentId: students[f.to].id,
        opportunityId: f.opp === null ? null : opportunities[f.opp].id,
        rating: f.rating,
        comment: f.comment,
      },
    });
  }

  // ─── Curriculum alignment (academia) ──────────────────────────
  console.log("📚 Seeding curriculum gaps…");
  const currDefs: { acad: number; branch: string; skillName: string; current: number; target: number; rec: string }[] = [
    { acad: 0, branch: "Computer Science", skillName: "React.js", current: 55, target: 80, rec: "Introduce a capstone project module with modern frontend tooling." },
    { acad: 0, branch: "Computer Science", skillName: "System Design", current: 45, target: 75, rec: "Add a dedicated Scalable Systems elective in semester 6." },
    { acad: 0, branch: "Computer Science", skillName: "Docker", current: 30, target: 70, rec: "Containerisation lab in the DevOps mini-elective." },
    { acad: 1, branch: "Electronics & Comm", skillName: "Python", current: 50, target: 75, rec: "Python for signal processing in semester 5." },
    { acad: 1, branch: "Electronics & Comm", skillName: "Machine Learning", current: 35, target: 70, rec: "Bridge module on edge ML in the final year." },
    { acad: 2, branch: "Information Technology", skillName: "AWS", current: 40, target: 75, rec: "Cloud practitioner certification support group." },
    { acad: 2, branch: "Information Technology", skillName: "SQL", current: 72, target: 85, rec: "Industry dataset case-studies in DBMS lab." },
    { acad: 2, branch: "Data Science", skillName: "Deep Learning", current: 60, target: 85, rec: "GPU cluster access + research-style coursework." },
  ];
  for (const c of currDefs) {
    await prisma.curriculumAlignment.create({
      data: {
        academiaId: faculty[c.acad].id,
        branch: c.branch,
        skillId: skillByName(c.skillName).id,
        currentLevel: c.current,
        targetLevel: c.target,
        gap: c.target - c.current,
        recommendation: c.rec,
      },
    });
  }

  // ─── Branch analytics + placements (institution) ─────────────
  console.log("📈 Seeding branch analytics & placements…");
  const branches = ["Computer Science", "Electronics & Comm", "Information Technology", "Data Science", "Mechanical"];
  const years = ["2023", "2024", "2025"];
  for (const year of years) {
    for (const branch of branches) {
      const baseScore = 55 + Math.round(Math.random() * 25);
      const placementRate = branch === "Mechanical" ? 0.55 + Math.random() * 0.15 : 0.7 + Math.random() * 0.2;
      await prisma.branchAnalytics.create({
        data: {
          institutionId: inst1.id,
          branch,
          academicYear: year,
          avgSkillScore: baseScore + (year === "2025" ? 6 : year === "2024" ? 3 : 0),
          placementRate: Math.round(placementRate * 100),
          internshipRate: Math.round((placementRate + 0.1) * 100),
          studentCount: 60 + Math.round(Math.random() * 40),
        },
      });
      await prisma.placementRecord.create({
        data: {
          institutionId: inst1.id,
          branch,
          academicYear: year,
          totalStudents: 60 + Math.round(Math.random() * 40),
          placed: Math.round((60 + Math.random() * 40) * placementRate),
          avgPackage: (6 + Math.random() * 8),
          topRecruiters: JSON.stringify(["TechNova", "DataForge", "CloudPeak", "PixelCraft", "Infosys", "TCS"]),
        },
      });
    }
  }

  // ─── Summary ──────────────────────────────────────────────────
  const counts = {
    users: await prisma.user.count(),
    students: await prisma.studentProfile.count(),
    industries: await prisma.industryProfile.count(),
    faculty: await prisma.academiaProfile.count(),
    institutions: await prisma.institution.count(),
    skills: await prisma.skill.count(),
    targetRoles: await prisma.targetRoleSkill.count(),
    evidence: await prisma.skillEvidence.count(),
    opportunities: await prisma.opportunity.count(),
    applications: await prisma.application.count(),
    feedback: await prisma.feedback.count(),
    curriculum: await prisma.curriculumAlignment.count(),
    branchAnalytics: await prisma.branchAnalytics.count(),
    placements: await prisma.placementRecord.count(),
  };
  console.log("✅ Seed complete. Summary:", counts);
  console.log("\n🔐 Demo login (password for all: skillsetu)");
  console.log("   Student:    aarav@iitm.ac.in");
  console.log("   Industry:   talent@technova.com");
  console.log("   Academia:   meena@iitm.ac.in");
  console.log("   Institution: admin@iitm.ac.in");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
