/**
 * SKILL SETU — Phase 2 centralized demo data for student S042.
 * SINGLE SOURCE OF TRUTH (master spec §44). Every Student Portal component
 * reads from here. Mutable interactions are layered on top via student-state.ts.
 *
 * All values are controlled DEMO DATA, clearly labelled in the UI where shown.
 */

export type Priority = "High" | "Medium" | "Low";
export type Confidence = "High" | "Moderate" | "Limited" | "None";
export type EvidenceStatus = "Submitted" | "Pending Evaluation" | "Evaluated" | "Verified";
export type Verification = "Pending" | "Verified" | "Rejected";
export type AppStatus = "Applied" | "Shortlisted" | "Interview" | "Selected" | "Rejected";

export interface SkillRow {
  name: string;
  score: number;
  evidenceCount: number;
  lastUpdated: string;
  confidence: Confidence;
  roleImportance: number; // %
  contribution: number; // score * weight
}

export interface GapRow {
  skill: string;
  current: number;
  target: number;
  priority: Priority;
  roleImportance: number;
  confidence: Confidence;
  why: string;
  suggestions: string[];
}

export interface RoleOption {
  name: string;
  description: string;
  keySkills: string[];
}

// ─── Student ────────────────────────────────────────────────────
export const STUDENT = {
  id: "S042",
  name: "Aarav Sharma",
  branch: "AI & Data Science",
  year: 3,
  college: "Indian Institute of Technology, Madras",
  location: "Chennai, Tamil Nadu",
  targetRole: "Data Scientist",
  profileCompletion: 78,
  avatarColor: "#0D9488",
  greeting: "Good morning",
};

// ─── Role readiness (S042 = 60.70% precise, displayed 61%) ────────
export const READINESS = {
  displayed: 61,
  calculated: 60.70,
  total: 60.70,
  status: "Calculated",
  lastCalculated: "17 Sept 2026",
  targetRole: "Data Scientist",
  breakdown: [
    { skill: "Python",            competency: 82, weight: 25, contribution: 20.50 },
    { skill: "SQL",               competency: 64, weight: 15, contribution: 9.60 },
    { skill: "Statistics",        competency: 51, weight: 20, contribution: 10.20 },
    { skill: "Machine Learning",  competency: 43, weight: 30, contribution: 12.90 },
    { skill: "Problem Solving",   competency: 75, weight: 10, contribution: 7.50 },
  ],
  note: "Based on your current skill competency and configured role requirements.",
};

// ─── Skills ─────────────────────────────────────────────────────
export const TECHNICAL_SKILLS: SkillRow[] = [
  { name: "Python",           score: 82, evidenceCount: 5, lastUpdated: "16 Sept 2026", confidence: "High",     roleImportance: 25, contribution: 20.50 },
  { name: "SQL",              score: 64, evidenceCount: 3, lastUpdated: "14 Sept 2026", confidence: "Moderate", roleImportance: 15, contribution: 9.60 },
  { name: "Statistics",       score: 51, evidenceCount: 2, lastUpdated: "12 Sept 2026", confidence: "Limited", roleImportance: 20, contribution: 10.20 },
  { name: "Machine Learning", score: 43, evidenceCount: 1, lastUpdated: "15 Sept 2026", confidence: "Limited", roleImportance: 30, contribution: 12.90 },
  { name: "Problem Solving",  score: 75, evidenceCount: 4, lastUpdated: "15 Sept 2026", confidence: "High",     roleImportance: 10, contribution: 7.50 },
];

export const SOFT_SKILLS: SkillRow[] = [
  { name: "Communication",   score: 78, evidenceCount: 3, lastUpdated: "10 Sept 2026", confidence: "Moderate", roleImportance: 10, contribution: 7.80 },
  { name: "Teamwork",        score: 82, evidenceCount: 4, lastUpdated: "10 Sept 2026", confidence: "High",     roleImportance: 10, contribution: 8.20 },
  { name: "Leadership",      score: 65, evidenceCount: 2, lastUpdated: "08 Sept 2026", confidence: "Moderate", roleImportance: 8,  contribution: 5.20 },
  { name: "Problem Solving", score: 75, evidenceCount: 4, lastUpdated: "15 Sept 2026", confidence: "High",     roleImportance: 10, contribution: 7.50 },
  { name: "Adaptability",    score: 70, evidenceCount: 2, lastUpdated: "05 Sept 2026", confidence: "Moderate", roleImportance: 7,  contribution: 4.90 },
  { name: "Presentation",   score: 68, evidenceCount: 2, lastUpdated: "07 Sept 2026", confidence: "Moderate", roleImportance: 8,  contribution: 5.44 },
  { name: "Professionalism",score: 80, evidenceCount: 3, lastUpdated: "09 Sept 2026", confidence: "High",     roleImportance: 7,  contribution: 5.60 },
];

export const APTITUDE = [
  { category: "Quantitative", score: 72, attemptDate: "10 Sept 2026", status: "Evaluated" as EvidenceStatus },
  { category: "Logical",     score: 78, attemptDate: "10 Sept 2026", status: "Evaluated" as EvidenceStatus },
  { category: "Verbal",      score: 70, attemptDate: "10 Sept 2026", status: "Evaluated" as EvidenceStatus },
  { category: "Analytical", score: 75, attemptDate: "10 Sept 2026", status: "Evaluated" as EvidenceStatus },
];

// ─── Critical skill gaps ────────────────────────────────────────
export const GAPS: GapRow[] = [
  {
    skill: "Machine Learning", current: 43, target: 80, priority: "High", roleImportance: 30, confidence: "Limited",
    why: "Machine Learning has high importance within the configured Data Scientist role and the student's current demonstrated competency is comparatively low.",
    suggestions: ["Build an end-to-end ML project", "Complete a supervised learning assessment", "Earn an ML certification"],
  },
  {
    skill: "Statistics", current: 51, target: 80, priority: "Medium", roleImportance: 20, confidence: "Limited",
    why: "Statistics is a core requirement for the Data Scientist role and the current competency is below the target threshold.",
    suggestions: ["Practice inferential statistics", "Complete a statistics coursework module"],
  },
  {
    skill: "SQL", current: 64, target: 80, priority: "Medium", roleImportance: 15, confidence: "Moderate",
    why: "SQL proficiency is expected for data roles; closing this gap strengthens eligibility for data-centric opportunities.",
    suggestions: ["Advanced SQL case studies", "Build a dashboard over a real dataset"],
  },
];

// ─── Next best action ───────────────────────────────────────────
export const NEXT_BEST_ACTION = {
  title: "Build an End-to-End Machine Learning Project",
  skill: "Machine Learning",
  role: "Data Scientist",
  why: [
    "High-impact skill gap",
    "Relevant to target role",
    "Produces project evidence",
    "Can be evaluated by faculty/industry",
  ],
  projectedImpact: "High" as Priority,
  steps: [
    "Define a clear problem statement with a real dataset",
    "Build a supervised learning pipeline (preprocess → train → evaluate)",
    "Document results in a reproducible notebook",
    "Submit the project as evidence for faculty/industry evaluation",
  ],
};

// ─── Best opportunity match ─────────────────────────────────────
export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;        // On-site / Hybrid / Remote
  type: string;        // Full-time / Internship / Project / ...
  duration?: string;
  compensation: string;
  deadline: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  match: number;
  whyMatch: string[];
  potentialGap?: string;
  evidenceConsidered: string[];
  responsibilities?: string[];
  eligibility?: string;
  about?: string;
  domain?: string;
  problem?: string;
  teamSize?: string;
  mentor?: string;
  provider?: string;
  status?: string;
}

export const BEST_MATCH: Opportunity = {
  id: "opp-best",
  title: "Data Science Intern",
  company: "Nova Analytics",
  location: "Pune / Hybrid",
  mode: "Hybrid",
  type: "Internship",
  duration: "6 Months",
  compensation: "Paid",
  deadline: "30 Sept 2026",
  requiredSkills: ["Python", "SQL", "Machine Learning", "Statistics"],
  match: 91,
  whyMatch: ["Python alignment", "SQL alignment", "Relevant ML evidence", "Eligibility satisfied"],
  potentialGap: "Statistics",
  evidenceConsidered: ["Technical Assessment", "Project", "Skill Profile"],
  about: "Join Nova Analytics as a Data Science Intern to work on real-world analytics pipelines, model prototyping and stakeholder reporting.",
  responsibilities: ["Build and evaluate ML prototypes", "Query and model data in SQL", "Present findings to stakeholders", "Document reproducible notebooks"],
  eligibility: "Currently enrolled in a CS/AI programme, year 3+.",
};

export const JOBS: Opportunity[] = [
  { ...BEST_MATCH, id: "job-1", type: "Full-time", duration: undefined, compensation: "₹12 LPA", title: "Junior Data Scientist" },
  {
    id: "job-2", title: "Machine Learning Engineer", company: "DataForge Labs", location: "Bengaluru", mode: "On-site", type: "Full-time",
    compensation: "₹14 LPA", deadline: "25 Sept 2026", requiredSkills: ["Python", "Machine Learning", "Deep Learning", "AWS"],
    match: 76, whyMatch: ["Python alignment", "Relevant ML evidence"], potentialGap: "Deep Learning", evidenceConsidered: ["Technical Assessment", "Skill Profile"],
    about: "Build and ship ML models in production at DataForge Labs.", responsibilities: ["Design ML pipelines", "Deploy models to production", "Monitor model performance"], eligibility: "B.Tech/M.Tech in CS/AI.",
  },
  {
    id: "job-3", title: "Backend Engineer", company: "TechNova Solutions", location: "Remote", mode: "Remote", type: "Full-time",
    compensation: "₹10 LPA", deadline: "28 Sept 2026", requiredSkills: ["Python", "SQL", "System Design"],
    match: 68, whyMatch: ["Python alignment", "SQL alignment"], potentialGap: "System Design", evidenceConsidered: ["Skill Profile"],
    about: "Work on scalable backend services at TechNova.", responsibilities: ["Design APIs", "Optimise databases", "Build microservices"], eligibility: "B.Tech CS.",
  },
  {
    id: "job-4", title: "Data Analyst", company: "Insightify", location: "Hyderabad", mode: "Hybrid", type: "Full-time",
    compensation: "₹8 LPA", deadline: "02 Oct 2026", requiredSkills: ["SQL", "Python", "Statistics", "Data Visualization"],
    match: 84, whyMatch: ["SQL alignment", "Python alignment"], potentialGap: "Data Visualization", evidenceConsidered: ["Technical Assessment", "Skill Profile"],
    about: "Turn raw product data into dashboards and insights.", responsibilities: ["Build dashboards", "Run SQL analyses", "Present insights"], eligibility: "Any branch with data coursework.",
  },
];

export const INTERNSHIPS: Opportunity[] = [
  { ...BEST_MATCH, id: "int-1" },
  {
    id: "int-2", title: "ML Research Intern", company: "DataForge Labs", location: "Hyderabad", mode: "On-site", type: "Internship",
    duration: "3 Months", compensation: "₹40,000/mo", deadline: "20 Sept 2026", requiredSkills: ["Python", "Machine Learning", "Deep Learning"],
    match: 72, whyMatch: ["Python alignment", "Relevant ML evidence"], potentialGap: "Deep Learning", evidenceConsidered: ["Technical Assessment", "Project"],
    about: "Fine-tune LLMs and build evaluation pipelines.", responsibilities: ["Run experiments", "Document results"], eligibility: "Year 3+ CS/AI.",
  },
  {
    id: "int-3", title: "Data Engineering Intern", company: "CloudPeak Systems", location: "Pune", mode: "Hybrid", type: "Internship",
    duration: "4 Months", compensation: "₹35,000/mo", deadline: "22 Sept 2026", requiredSkills: ["Python", "SQL", "AWS"],
    match: 69, whyMatch: ["Python alignment", "SQL alignment"], potentialGap: "AWS", evidenceConsidered: ["Skill Profile"],
    about: "Build data pipelines on AWS.", responsibilities: ["ETL pipelines", "Data modelling"], eligibility: "Year 2+ CS.",
  },
];

export const PROJECTS: Opportunity[] = [
  {
    id: "prj-1", title: "Document AI MVP", company: "Nova Analytics", location: "Remote", mode: "Remote", type: "Project",
    duration: "6 Weeks", compensation: "Mentorship + Cert", deadline: "10 Oct 2026", requiredSkills: ["Python", "Machine Learning", "NLP"],
    match: 86, whyMatch: ["Python alignment", "Relevant ML evidence"], potentialGap: "NLP", evidenceConsidered: ["Technical Assessment", "Project"],
    about: "Build a document classification MVP end-to-end.", problem: "Classify and extract structured data from unstructured business documents.", teamSize: "3", mentor: "Dr. Meena Krishnan (Nova Analytics)",
  },
  {
    id: "prj-2", title: "Supply Chain Dashboard", company: "Insightify", location: "Remote", mode: "Remote", type: "Project",
    duration: "4 Weeks", compensation: "Stipend", deadline: "15 Oct 2026", requiredSkills: ["SQL", "Python", "Data Visualization"],
    match: 80, whyMatch: ["SQL alignment", "Python alignment"], potentialGap: "Data Visualization", evidenceConsidered: ["Skill Profile"],
    about: "Build an interactive supply-chain analytics dashboard.", problem: "Stakeholders lack real-time visibility into supply-chain KPIs.", teamSize: "2", mentor: "Ankit Verma (Insightify)",
  },
  {
    id: "prj-3", title: "Smart Campus IoT Analytics", company: "CloudPeak Systems", location: "Hybrid", mode: "Hybrid", type: "Project",
    duration: "8 Weeks", compensation: "Mentorship", deadline: "20 Oct 2026", requiredSkills: ["Python", "Sensors", "Cloud"],
    match: 58, whyMatch: ["Python alignment"], potentialGap: "Cloud", evidenceConsidered: ["Skill Profile"],
    about: "Analyse campus IoT sensor data for energy optimisation.", problem: "Campus energy waste from un-optimised HVAC.", teamSize: "4", mentor: "Suresh Pillai (CloudPeak)",
  },
];

export const INDUSTRY_LEARNING: Opportunity[] = [
  { id: "lrn-1", title: "Applied Machine Learning", company: "Coursera", location: "Online", mode: "Online", type: "Certification", compensation: "₹3,000", deadline: "Self-paced", requiredSkills: ["Machine Learning"], match: 90, whyMatch: ["Relevant ML evidence"], evidenceConsidered: ["Skill Profile"], about: "A project-based ML specialisation.", provider: "Coursera", status: "Not started", duration: "8 weeks" },
  { id: "lrn-2", title: "Advanced SQL Workshop", company: "DataForge Labs", location: "Online", mode: "Online", type: "Workshop", compensation: "Free", deadline: "25 Sept 2026", requiredSkills: ["SQL"], match: 82, whyMatch: ["SQL alignment"], evidenceConsidered: ["Skill Profile"], about: "Hands-on advanced SQL case studies.", provider: "DataForge Labs", status: "Enrolled", duration: "2 days" },
  { id: "lrn-3", title: "Industry Mentorship: Data Science", company: "Nova Analytics", location: "Hybrid", mode: "Hybrid", type: "Mentorship", compensation: "Free", deadline: "Rolling", requiredSkills: ["Python", "Machine Learning", "Statistics"], match: 88, whyMatch: ["Python alignment", "Relevant ML evidence"], evidenceConsidered: ["Skill Profile"], about: "1-on-1 mentorship with a senior data scientist.", provider: "Nova Analytics", status: "Application open", duration: "12 weeks" },
  { id: "lrn-4", title: "Cloud & DevOps for ML", company: "CloudPeak Systems", location: "Online", mode: "Online", type: "Training", compensation: "₹5,000", deadline: "05 Oct 2026", requiredSkills: ["AWS", "Docker", "Python"], match: 60, whyMatch: ["Python alignment"], evidenceConsidered: ["Skill Profile"], about: "Deploy ML services to the cloud end-to-end.", provider: "CloudPeak Systems", status: "Not started", duration: "6 weeks" },
];

export const ALL_OPPORTUNITIES: Opportunity[] = [BEST_MATCH, ...JOBS.slice(1), ...INTERNSHIPS.slice(1), ...PROJECTS, ...INDUSTRY_LEARNING];

// ─── Applications ───────────────────────────────────────────────
export interface ApplicationRow {
  id: string;
  title: string;
  company: string;
  status: AppStatus;
  date: string;
  timeline: AppStatus[];
}
export const APPLICATIONS: ApplicationRow[] = [
  { id: "app-1", title: "Data Science Intern", company: "Nova Analytics", status: "Applied", date: "17 Sept 2026", timeline: ["Applied", "Shortlisted", "Interview", "Selected"] },
  { id: "app-2", title: "Junior Data Scientist", company: "DataForge Labs", status: "Shortlisted", date: "12 Sept 2026", timeline: ["Applied", "Shortlisted", "Interview", "Selected"] },
];

// ─── Evidence ───────────────────────────────────────────────────
export interface EvidenceRow {
  id: string;
  date: string;
  time: string;
  skill: string;
  source: string;
  score: number | null;
  status: EvidenceStatus;
  verification: Verification;
  description: string;
  reference?: string;
}
export const EVIDENCE: EvidenceRow[] = [
  { id: "ev-1", date: "15 Sept 2026", time: "14:30", skill: "Machine Learning", source: "Technical Assessment", score: 43, status: "Evaluated", verification: "Pending", description: "Technical assessment covering supervised learning fundamentals, model evaluation and basic feature engineering.", reference: "TA-ML-2026-09" },
  { id: "ev-2", date: "16 Sept 2026", time: "10:15", skill: "Python", source: "Project Evidence", score: null, status: "Submitted", verification: "Pending", description: "Submitted a data-cleaning and EDA notebook for review.", reference: "PRJ-PY-2026-04" },
  { id: "ev-3", date: "17 Sept 2026", time: "09:00", skill: "Machine Learning", source: "Practice Activity", score: null, status: "Submitted", verification: "Pending", description: "45 minutes of guided ML practice on model selection and cross-validation." },
  { id: "ev-4", date: "14 Sept 2026", time: "16:45", skill: "SQL", source: "Technical Assessment", score: 64, status: "Evaluated", verification: "Pending", description: "SQL assessment covering joins, aggregations and window functions.", reference: "TA-SQL-2026-08" },
  { id: "ev-5", date: "12 Sept 2026", time: "11:20", skill: "Statistics", source: "Coursework", score: 51, status: "Evaluated", verification: "Pending", description: "Inferential statistics coursework submission." },
  { id: "ev-6", date: "16 Sept 2026", time: "18:00", skill: "Python", source: "Technical Assessment", score: 82, status: "Evaluated", verification: "Pending", description: "Python proficiency assessment — advanced types, data structures, OOP." },
];

// ─── Hackathons ─────────────────────────────────────────────────
export interface Hackathon {
  id: string;
  name: string;
  domain: string;
  deadline: string;
  teamSize: string;
  requiredSkills: string[];
  match: number;
  status?: string;
  problem?: string;
  team?: string;
  role?: string;
  project?: string;
  evaluation?: string;
  evidenceStatus?: EvidenceStatus;
}
export const UPCOMING_HACKATHONS: Hackathon[] = [
  { id: "hk-1", name: "AI Innovation Challenge", domain: "AI/ML", deadline: "30 Sept 2026", teamSize: "3-5", requiredSkills: ["Python", "Machine Learning", "Statistics"], match: 88 },
  { id: "hk-2", name: "Cybersecurity Sprint", domain: "Security", deadline: "15 Oct 2026", teamSize: "2-4", requiredSkills: ["Networking", "Python"], match: 64 },
  { id: "hk-3", name: "Smart Campus Buildathon", domain: "IoT", deadline: "20 Oct 2026", teamSize: "4-6", requiredSkills: ["Python", "Sensors", "Cloud"], match: 72 },
];
export const COMPLETED_HACKATHONS: Hackathon[] = [
  { id: "hk-c1", name: "Smart India Hackathon 2025", domain: "AI/ML", deadline: "Completed", teamSize: "6", requiredSkills: ["Python", "ML"], match: 100, status: "Completed", problem: "Campus waste-management prediction", team: "Team DataForge", role: "ML Lead", project: "Waste-Predict v2", evaluation: "Top 10 finalist", evidenceStatus: "Evaluated" },
];

// ─── Skill Passport ─────────────────────────────────────────────
export interface ProjectPassport {
  id: string;
  name: string;
  description: string;
  technology: string[];
  skills: string[];
  date: string;
  role: string;
  contribution: string;
  github?: string;
  liveDemo?: string;
  verification: Verification;
}
export const PASSPORT_PROJECTS: ProjectPassport[] = [
  { id: "pp-1", name: "Student Performance Predictor", description: "End-to-end ML pipeline predicting student performance from engagement data.", technology: ["Python", "scikit-learn", "Pandas"], skills: ["Python", "Machine Learning", "Statistics"], date: "Aug 2026", role: "ML Developer", contribution: "Solo", github: "", liveDemo: "", verification: "Pending" },
  { id: "pp-2", name: "Campus Event Dashboard", description: "Interactive dashboard for campus event analytics.", technology: ["Python", "Streamlit", "SQL"], skills: ["Python", "SQL", "Data Visualization"], date: "Jul 2026", role: "Full-stack", contribution: "Team of 3", github: "https://github.com/s042/campus-dashboard", liveDemo: "", verification: "Pending" },
];

export interface CertificationRow {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  status: "Uploaded" | "Pending Verification" | "Verified";
}
export const CERTIFICATIONS: CertificationRow[] = [
  { id: "cert-1", name: "Python for Data Science", issuer: "Coursera", date: "Aug 2026", credentialId: "CRT-PY-2026-042", status: "Verified" },
  { id: "cert-2", name: "SQL Fundamentals", issuer: "HackerRank", date: "Jul 2026", credentialId: "CRT-SQL-2026-088", status: "Pending Verification" },
  { id: "cert-3", name: "Intro to Machine Learning", issuer: "Coursera", date: "—", credentialId: "—", status: "Uploaded" },
];

export interface InternshipPassport {
  id: string;
  company: string;
  role: string;
  duration: string;
  skills: string[];
  feedback: string;
  verification: Verification;
}
export const PASSPORT_INTERNSHIPS: InternshipPassport[] = [
  { id: "pi-1", company: "Insightify", role: "Data Analyst Intern", duration: "2 Months (Summer 2026)", skills: ["SQL", "Python", "Data Visualization"], feedback: "Strong SQL and clean analysis; improve stakeholder communication.", verification: "Verified" },
];

// ─── Notifications ──────────────────────────────────────────────
export interface NotificationRow {
  id: string;
  type: "Skill Gap Detected" | "New Opportunity Match" | "Hackathon Recommendation" | "Application Update" | "Evidence Added" | "Mentor Session";
  title: string;
  detail: string;
  time: string;
  read?: boolean;
}
export const NOTIFICATIONS: NotificationRow[] = [
  { id: "n-1", type: "Skill Gap Detected", title: "Machine Learning gap widened", detail: "Your ML competency (43) is below the target (80) for Data Scientist.", time: "2h ago" },
  { id: "n-2", type: "New Opportunity Match", title: "Data Science Intern — 91% match", detail: "Nova Analytics posted an internship matching your profile.", time: "5h ago" },
  { id: "n-3", type: "Hackathon Recommendation", title: "AI Innovation Challenge", detail: "88% skills match — consider forming a team.", time: "1d ago" },
  { id: "n-4", type: "Application Update", title: "Shortlisted at DataForge Labs", detail: "Your application for Junior Data Scientist moved to Shortlisted.", time: "2d ago" },
  { id: "n-5", type: "Evidence Added", title: "Python project submitted", detail: "Your EDA notebook is pending evaluation.", time: "3d ago" },
  { id: "n-6", type: "Mentor Session", title: "Mentor session scheduled", detail: "Dr. Meena Krishnan — Friday 4 PM.", time: "4d ago" },
];

// ─── Roles (role selector) ──────────────────────────────────────
export const ROLES: RoleOption[] = [
  { name: "Data Scientist",            description: "Build models, run analyses, derive insight from data.", keySkills: ["Python", "SQL", "Statistics", "Machine Learning"] },
  { name: "ML Engineer",               description: "Productionise and deploy machine learning systems.",   keySkills: ["Python", "Machine Learning", "Docker", "AWS"] },
  { name: "Software Engineer",          description: "Design and build robust software systems.",            keySkills: ["Data Structures", "System Design", "Python"] },
  { name: "Full Stack Developer",       description: "Own end-to-end web applications.",                     keySkills: ["React", "Node.js", "SQL", "TypeScript"] },
  { name: "Cybersecurity Analyst",       description: "Protect systems and detect threats.",                keySkills: ["Networking", "Cybersecurity", "Python"] },
  { name: "DevOps Engineer",            description: "Automate delivery and operations.",                    keySkills: ["Docker", "Kubernetes", "AWS", "CI/CD"] },
  { name: "Cloud Architect",            description: "Design scalable cloud infrastructure.",                keySkills: ["AWS", "System Design", "Docker"] },
  { name: "Embedded Systems Engineer",  description: "Build firmware for constrained devices.",             keySkills: ["C/C++", "Embedded", "RTOS"] },
  { name: "Mechanical Design Engineer", description: "Design mechanical systems and components.",            keySkills: ["CAD", "Solid Mechanics", "Manufacturing"] },
  { name: "Power Systems Engineer",     description: "Design and analyse electrical power systems.",         keySkills: ["Power Systems", "Electrical", "Control Systems"] },
  { name: "Structural Engineer",        description: "Design safe, durable structures.",                     keySkills: ["Structural Analysis", "CAD", "Materials"] },
  { name: "VLSI Design Engineer",       description: "Design integrated circuits.",                          keySkills: ["VLSI", "Digital Design", "Verilog"] },
];

// ─── Assessments ────────────────────────────────────────────────
export interface AssessmentCard {
  id: string;
  type: "Aptitude" | "Technical" | "Coding / Practical";
  description: string;
  duration: string;
  questions: number;
  status: "Not started" | "In Progress" | "Completed";
}
export const ASSESSMENTS: AssessmentCard[] = [
  { id: "as-1", type: "Aptitude", description: "Quantitative, logical, verbal and analytical reasoning.", duration: "45 min", questions: 40, status: "Completed" },
  { id: "as-2", type: "Technical", description: "Python, SQL, Statistics and ML fundamentals.", duration: "60 min", questions: 30, status: "In Progress" },
  { id: "as-3", type: "Coding / Practical", description: "Hands-on coding problems and a small ML task.", duration: "90 min", questions: 4, status: "Not started" },
];

// ─── Helper: skill lookup ───────────────────────────────────────
export function findSkill(name: string): SkillRow | undefined {
  return [...TECHNICAL_SKILLS, ...SOFT_SKILLS].find((s) => s.name.toLowerCase() === name.toLowerCase());
}
export function findGap(skill: string): GapRow | undefined {
  return GAPS.find((g) => g.skill.toLowerCase() === skill.toLowerCase());
}
export function findOpp(id: string): Opportunity | undefined {
  return ALL_OPPORTUNITIES.find((o) => o.id === id);
}
