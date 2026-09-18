# Task ID: P2-HackMisc
Agent: full-stack-developer (hackathons + notifications + profile)
Task: Build hackathons.tsx + misc.tsx

## Context Reads
- /home/z/my-project/worklog.md (full — established Phase 2 foundation + dashboard pattern)
- src/lib/student-data.ts (UPCOMING_HACKATHONS, COMPLETED_HACKATHONS, NOTIFICATIONS, STUDENT, ROLES, Hackathon, NotificationRow)
- src/lib/student-state.ts (joinedTeams, joinTeam, readNotifications, markRead, markAllRead, currentRole)
- src/lib/router.ts (useRouter().navigate)
- src/components/app/student-parts.tsx (DashHeader, Modal, EmptyState, DemoBadge, MatchBadge, EvidenceStatusBadge, Field, RoleSelector)
- src/components/app/student/dashboard.tsx (PATTERN REFERENCE — matched style)
- src/components/ui/ss.tsx (SsCard, SsBadge)
- src/components/ui/button.tsx (navy/blue/teal/orange/outline variants)
- src/app/globals.css (tokens — ss-* vars, navy-gradient, bg-dot-grid-dark, scroll-slim)

## Work Log
- Built src/components/app/student/hackathons.tsx — HackathonsPage({section}) with 5-section switcher (Discover/My Hackathons/My Teams/Submissions/Mentorship):
  * Section switcher tabs scrollable horizontally on mobile, active tab in navy bg.
  * Discover: UPCOMING_HACKATHONS as SsCard tone=lift grid (1/2/3 cols), name + domain + MatchBadge + team/deadline meta + required skills pills + View (opens Modal) and Find Team buttons. Find Team calls joinTeam(id) → button switches to teal "Joined" with CheckCircle2.
  * My Hackathons: filters UPCOMING_HACKATHONS by joinedTeams + COMPLETED_HACKATHONS. Completed cards show team/role/project/outcome with teal Completed badge; joined cards show deadline + skill pills with blue Joined badge. Empty state safety net with Discover CTA.
  * My Teams: joined teams rendered with team member avatar stack (-space-x-2) + "3 members · 2 spots open" + Open Team Chat / View Brief. Empty state with Find a Team CTA.
  * Submissions: 2 inline demo rows (Waste-Predict v2 Evaluated, Civic Grievance Mapper Submitted) in a single bordered card with FileText icon + EvidenceStatusBadge + chevron.
  * Mentorship: 2 inline demo mentor cards (Dr. Meena Krishnan Scheduled, Ankit Verma Pending) with teal Calendar avatar, SsBadge tone varies by status, Join Session / Confirm Slot / View Notes conditional CTA.
  * HackathonDetailModal: domain/team/deadline/match grid + required skills + Sparkles info callout explaining SKILL SETU team-matching + footer Close/Find Team.
- Built src/components/app/student/misc.tsx — NotificationsPage + ProfilePage:
  * NotificationsPage: DashHeader "Notifications" with live unread count + Mark all as read button (markAllRead). Filter tabs (All/Skill Gaps/Opportunities/Hackathons/Applications). NOTIF_META maps each of 6 types → unique lucide icon (AlertTriangle/Briefcase/Trophy/ClipboardList/Award/CalendarClock) + tone (orange/blue/teal) + filter group. Unread notifications have navy left border + blue dot; clicking marks them read (markRead). Read items dimmed with check icon.
  * ProfilePage: Navy gradient header strip with avatar color accent (radial-gradient in student.avatarColor = #0D9488) + initials squircle (AS) + name/ID/branch/year/college + ProfileRing (78% SVG ring). Personal Information card with 6 fields. Target Role card with Edit Role button → RoleSelector modal (reused from student-parts; reactively updates currentRole). Profile Completion card with gradient progress bar (teal→blue) + 3-step checklist (Personal Info done / Skills done / Evidence pending).
- Reused Phase 1 design system EXACTLY: navy/blue/teal/orange palette only; SsCard tone="soft"/"lift"; shadow-soft; rounded-2xl; DemoBadge on every demo section; EmptyState on Teams/Mine/Notifications; framer-motion subtle entry transitions.
- Stateful (spec §39): Find Team→Joined (joinTeam + reactive Set lookup); mark notifications read (markRead/markAllRead); role change via RoleSelector (setRole via useStudentState).
- TypeScript strict — explicit NotifTone/NotifGroup/FilterId/MentorStatus types, no `any` casts; "use client"; responsive (cards grid 1/2/3 cols, switcher scroll-slim on mobile).
- NO backend/fetch. All data from student-data.ts; mutations via useStudentState only.
- Lint: my two files clean (npx eslint on both → 0 errors). NOTE: pre-existing 1 lint error in passport.tsx (set-state-in-effect at line 503) is from another agent's file — not my scope.

## Stage Summary
- Two files delivered exactly per export contract: HackathonsPage({section}) in hackathons.tsx; NotificationsPage + ProfilePage in misc.tsx.
- All 5 hackathon sections functional with stateful Join flow; NotificationsPage has filter + read/unread state; ProfilePage has reactive role editing + profile completion meter.
- Style matches dashboard.tsx pattern (DashHeader + DemoBadge + SsCard sections + EmptyState + Modal/Drawer). Ready for AppShell to import.
