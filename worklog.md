# SKILL SETU Portal Build — Worklog

Source reference: https://skillsetu.space-z.ai/
Project: Academia-Industry Collaboration Portal (SIH 2026 · Problem Statement 44)
Tagline: "From Skill Claims to Skill Evidence."

## Design Summary (captured via VLM analysis of original site)

- **Style**: Modern SaaS, clean, professional, glassmorphism hints
- **Background**: Hero uses a bright workspace photograph (laptop, plants, notebook, window light) with subtle overlay
- **Typography**: Geometric sans-serif (Inter-like), extra-bold/black headlines (56–72px), tight line-height (~1.1)
- **Colors**:
  - Primary text: `#0F172A` / `#111827`
  - Secondary text: `#6B7280` / `#475569`
  - Background: white / `#F8FAFC`
  - Accent teal: `#14B8A6`
  - Per-portal theme:
    - Student → Teal/Emerald (`#14B8A6` / `#CCFBF1`)
    - Industry → Amber (`#F59E0B` / `#FEF3C7`)
    - Academia → Rose (`#F43F5E` / `#FFE4E6`)
    - Institution → Violet/Indigo (`#6366F1` / `#E0E7FF`)
- **Sections**:
  1. Sticky header (logo + nav + Login/Get Started)
  2. Hero (badge pill, headline, subheadline, two CTAs) over workspace photo
  3. Skill Intelligence Layer card (overlapping hero) — network diagram with central dark node + 4 satellite nodes
  4. Four Portals (4-col grid of portal cards w/ number badges + theme tags + enter links)
  5. Closed Loop (flow diagram with pill nodes: Student→Evidence→Skill Intelligence→Industry Opportunity→Feedback / Skill Passport / Institutional Insight)
  6. Why SKILL SETU (gradient headline + 3 feature cards: Evidence Over Claims, Role-Specific Readiness, Continuous Feedback)
  7. Final CTA ("Build Skills. Create Evidence. Find Opportunity.")
  8. Footer (sticky bottom) — logo + Ecosystem/Portals/Account/Privacy/Contact + copyright

## Build Plan

- Single user-visible route: `/` (src/app/page.tsx)
- Split into section components under `src/components/site/`
- Use existing shadcn/ui primitives + Lucide icons + framer-motion
- Generate a workspace hero photo via image-generation skill
- Sticky footer via root wrapper `min-h-screen flex flex-col` + `mt-auto` on footer

---
Task ID: 0
Agent: orchestrator (main)
Task: Capture original site design, plan build, initialize worklog

Work Log:
- Read https://skillsetu.space-z.ai/ via page_reader CLI
- Opened site with agent-browser, captured full-page + section screenshots
- Analyzed hero / portals / closed-loop sections with VLM to extract colors, typography, layout
- Wrote this worklog with the design summary and build plan
- Created todo list (10 items)

Stage Summary:
- Design references fully captured (screenshots in /tmp/skillsetu_*.png)
- Build plan locked in: 8 sections, single route, split components
- Ready to dispatch image-gen + start coding layout/components

---
Task ID: 1-9
Agent: orchestrator (main)
Task: Build all SKILL SETU sections + verify

Work Log:
- Generated hero workspace background image via z-ai image CLI (1344x768, valid JPEG saved to public/hero/workspace.jpg)
- Updated src/app/layout.tsx with SKILL SETU metadata (title, description, keywords, OG/Twitter)
- Added custom CSS utilities to src/app/globals.css: bg-dot-grid, bg-dot-grid-dark, text-gradient-it, glow-conic, pulse-ring, float-y, dash-flow, scroll-slim scrollbar
- Created src/components/site/theme.ts with centralised PORTALS config (4 portals with accent/tint/borderTint/icon) + FLOW_NODES + FLOW_SECONDARY
- Built src/components/site/logo.tsx — LogoMark (squircle w/ network glyph) + Logo wordmark
- Built src/components/site/header.tsx — sticky nav with scroll-aware bg, desktop links + mobile hamburger menu
- Built src/components/site/hero.tsx — workspace bg + overlays, badge pill, gradient headline w/ hand-drawn underline, two CTAs, stat strip
- Built src/components/site/skill-layer.tsx — overlapping "Skill Intelligence Layer" card: mock-window header bar (pulse dot + title + ellipsis), dot-grid diagram region with central dark node (conic glow) + 4 themed satellites + dashed SVG connectors + bottom process strip
- Built src/components/site/portals.tsx — "One Ecosystem. Four Perspectives." heading + 4-col responsive grid of portal cards (icon, number badge, title, desc, themed tags, enter link, hover accent bar)
- Built src/components/site/closed-loop.tsx — light-gray section with "Connected by Evidence." gradient heading + 5 pill flow nodes (Student→Evidence→Skill Intelligence→Industry Opportunity→Feedback) with arrows + 2 secondary nodes (Skill Passport, Institutional Insight) + branch-line SVG
- Built src/components/site/why-skillsetu.tsx — "Not Just a Portal. A Skill Intelligence Layer." gradient heading + 3 feature cards (Evidence Over Claims/teal-shield, Role-Specific Readiness/amber-target, Continuous Feedback/violet-trending)
- Built src/components/site/cta.tsx — dark slate CTA with dot-grid bg, blurred color blobs, badge, headline, two buttons
- Built src/components/site/footer.tsx — sticky (mt-auto) white footer with logo block + 3 link columns (Ecosystem/Portals/Account) + copyright bar + SIH 2026 label
- Assembled src/app/page.tsx with min-h-screen flex-col wrapper, mt-auto footer, section order matching original (Hero → SkillLayer → Portals → ClosedLoop → Why → CTA → Footer)
- Added allowedDevOrigins: ["*.space-z.ai"] to next.config.ts to silence cross-origin dev warning
- Ran `bun run lint` — clean, no errors
- Verified with agent-browser end-to-end:
  * Desktop 1440x900: hero, skill-layer card (all 4 satellites), 4 portal cards, closed loop (5 nodes + 2 secondary), why (3 cards), CTA buttons, footer — all render correctly
  * Mobile 390x844: hero responsive, buttons stacked, hamburger menu opens overlay with all links + Login/Get Started
  * No console errors, no runtime errors, page returns 200
  * Sticky footer confirmed (mt-auto in flex-col wrapper)

Stage Summary:
- Production-ready SKILL SETU portal live at / (dev server on :3000)
- Faithful recreation of the original skillsetu.space-z.ai landing page: same 8-section structure, same colour system per portal (teal/amber/rose/violet), same badges/headings/flow diagrams, plus subtle motion (framer-motion) and animated connectors
- All section components in src/components/site/, page assembled in src/app/page.tsx
- Image asset in public/hero/workspace.jpg (AI-generated)
- Lint clean; no browser console/runtime errors
- Sticky footer + responsive design verified

---
Task ID: BE-1
Agent: orchestrator (main)
Task: Build complete backend — schema, seed, session, all API routes, skill engine

Work Log:
- Wrote comprehensive Prisma schema (users, sessions, profiles, institutions, skills, evidence, target-role-skills, opportunities, applications, team-builds, feedback, curriculum-alignment, branch-analytics, placement-records) with enums for Role/EvidenceType/OpportunityType/OpportunityStatus/ApplicationStatus
- Ran db:push (clean)
- Wrote prisma/seed.ts with realistic demo data: 3 institutions, 20 skills, 6 target roles (31 role-skill rows), 8 students + 4 industries + 3 faculty + 1 institution admin, 32 evidence rows, 7 opportunities, 10 applications (with computed matchScore), 5 feedback rows, 8 curriculum gaps, 15 branch-analytics + 15 placement-records. Added `db:seed` script to package.json. Ran successfully.
- Built src/lib/session.ts: cookie-based httpOnly session (createSession/getSession/clearSession/requireUser/requireRole/hashPassword) backed by the Session table
- Built src/lib/types.ts: shared API payload/return types (AuthUser, SkillPassport, OpportunityCard, ApplicationRow, TalentRow, FeedbackItem, CurriculumGapRow, BranchStatRow, PlacementRow, ChatMessage, TeamBuildResult)
- Built src/lib/skill-engine.ts: getStudentSkills (level = 0.7*max + 0.3*mean), getGapsForRole, computeReadiness, getPassport (full passport), matchStudentToOpportunity, searchTalent — the core intelligence layer reused across student/industry/institution routes
- Built all API routes (Route Handlers):
  * POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me (with role-specific profile hydration)
  * GET /api/skills, GET /api/institutions (public lookups for forms)
  * GET /api/student/passport, GET /api/student/opportunities (matched + applied flag + live matchScore), GET /api/student/applications, POST /api/student/apply (computes matchScore on apply), POST /api/student/evidence
  * GET+POST /api/industry/opportunities, GET /api/industry/talent (filters: skills/branch/targetRole/minCgpa/requiredSkills), GET+PATCH /api/industry/applications (status update with ownership check), POST /api/industry/feedback, POST /api/industry/team-builder (AI/evidence-based multi-role team composition, persisted to DB)
  * GET /api/academia/opportunities, GET+POST /api/academia/curriculum
  * GET /api/institution/analytics, GET /api/institution/placements, GET /api/institution/students (with avg skill score computation)
  * POST /api/ai/chat (LLM-powered, role-aware system prompt built from live DB context per portal; graceful fallback on AI failure)

Stage Summary:
- Full backend live and functioning: auth (cookie sessions), CRUD for all 4 portals, AI team-builder + AI chat
- Skill intelligence logic centralised in skill-engine.ts — matchScore & readiness derived from real evidence, not claims
- Demo logins (password "skillsetu"):
  Student: aarav@iitm.ac.in | Industry: talent@technova.com | Academia: meena@iitm.ac.in | Institution: admin@iitm.ac.in
- Ready to build the authenticated frontend (app shell + auth + 4 dashboards + AI chatbot) — frontend-first per workflow

---
Task ID: FE-1
Agent: orchestrator (main)
Task: Build complete authenticated frontend — app shell, auth, 4 portal dashboards, AI assistant; wire to landing; verify end-to-end

Work Log:
- Built src/lib/store.ts (Zustand): session (fetchUser/login/register/logout via /api/auth/*), view router (landing|login|register|student|industry|academia|institution), portal tab state, pendingRole for auth prefill. login/register hydrate full profile via /me after success.
- Built src/components/app/auth-screen.tsx: modal with dark brand panel (quick demo-login buttons for all 4 roles) + form panel (login/register tabs, role picker with theme colors, dynamic role-specific fields for student/industry/academia, validation, error mapping)
- Built src/components/app/dash-shared.tsx: DashHeader, StatCard, SkillBar, Pill, MatchBadge, DashCard, EmptyState, VerifiedBadge — shared UI primitives
- Built src/components/app/app-shell.tsx: sidebar (desktop) + mobile drawer + top bar, role-aware nav items, portal-themed accent, user block + logout, AnimatePresence tab transitions, mounts AiAssistant
- Built 4 portal dashboards:
  * student-dashboard.tsx (teal): Overview (readiness ring, top gaps, top opps), Skill Passport (radar chart + gap analysis + evidence cards + Add Evidence modal), Opportunities (matched cards w/ apply), Applications (status badges), Feedback (star ratings)
  * industry-dashboard.tsx (amber): Talent Discovery (skill/branch/role/CGPA filters + student cards w/ inline Give Feedback), Post Opportunity (form + dynamic required-skills weights), My Opportunities (applicants + status PATCH dropdown), AI Team Builder (multi-role spec → POST /api/industry/team-builder → recommended team + reasoning), Feedback Given
  * academia-dashboard.tsx (rose): Industry Opportunities (filter tabs + cards), Curriculum Alignment (stat cards + bar chart current-vs-target by branch + gap list w/ recommendations + Track-gap modal)
  * institution-dashboard.tsx (violet): Skill Intelligence (4 KPIs + horizontal bar chart + line trend + branch table), Placement Insights (placement funnel bar + top recruiters), Student Intelligence (per-student avg scores + branch filter), Industry Alignment (pie distribution + alignment bars)
- Built src/components/app/ai-assistant.tsx: floating launcher (portal-themed), chat panel, seed questions per role, calls POST /api/ai/chat, graceful fallback on AI failure
- Refactored page.tsx into a client orchestrator: loading splash → authenticated AppShell OR public landing + AuthScreen overlay
- Wired landing CTAs to store navigation: Header (Login→login, Get Started→register), Hero (Explore→register), Portals (Enter X Portal→register w/ pendingRole), CTA (both→register)
- Fixed lint: removed require() in session.ts; restructured data-fetch effects to inline async IIFE pattern (react-hooks/set-state-in-effect)
- Fixed runtime bug: ROLES.find() comparison in auth-screen was `x.key.toLowerCase() === d.toUpperCase()` (never matched) → changed to `x.key === d.toUpperCase()`
- Fixed UX: Overview "Top skill gaps" now filters to gap>0 (shows empty state when role-ready); store login/register now hydrate profile via /me so branch/year/CGPA show in header
- Ran `bun run lint` — clean (0 errors)
- Verified end-to-end with agent-browser:
  * Landing renders (workspace hero, all 8 sections)
  * Login modal opens, fills, logs in
  * Student dashboard (Aarav): branch "Computer Science · Year 4 · CGPA 8.7" now shows; Skill Passport radar + 5 evidence cards; Opportunities with match scores (100%/26%/0%); AI assistant gave context-aware reply citing actual skill levels (React 88%, DSA 91%)
  * Industry dashboard (TechNova): Talent Discovery with 6 student cards + skill pills; AI Team Builder POSTed successfully, returned Aarav Sharma (100% match) + evidence-based reasoning
  * Academia dashboard (Dr. Meena): Industry Opportunities (7 cards, filter tabs); Curriculum Alignment (bar chart current-vs-target, 2 critical gaps w/ recommendations)
  * Institution dashboard (Dr. Rajesh): Skill Intelligence (70% avg, 78% placement, 412 students; bar chart by branch + line trend 2023-2025 + branch table)
  * Mobile 390px: hamburger drawer opens, stat cards stack 2-col, charts full-width
  * No console/runtime errors; all API calls returned 200

Stage Summary:
- Full-stack SKILL SETU portal COMPLETE and verified live at / (dev server :3000)
- 4 fully-functional portals (Student/Industry/Academia/Institution) with real backend, real data, real AI
- AI features working: skill-match scoring (evidence-based), AI Team Builder (multi-role composition), context-aware AI Skill Coach chatbot (LLM + live DB context per portal)
- Auth: cookie sessions, role-based registration with dynamic fields, role-based routing to the right portal
- Lint clean; no runtime errors; responsive (mobile drawer + desktop sidebar)
- Demo logins (password "skillsetu"): aarav@iitm.ac.in | talent@technova.com | meena@iitm.ac.in | admin@iitm.ac.in
