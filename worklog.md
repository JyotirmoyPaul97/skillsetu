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
