"use client";

/**
 * SKILL SETU — Phase 10 Event Timeline (§18).
 *
 * Slide-in panel showing the chronological demo event log.
 * Each event: timestamp, actor, action, affected entity, category badge.
 * Click an event to see its "Why did this change?" explanation (§19).
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  X, Clock, User, Activity, ShieldCheck, FilePlus, MessageSquare,
  TrendingUp, Sparkles, AlertCircle, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useDemoStore, type DemoEvent, type DemoEventCategory } from "@/lib/demo/demo-store";
import { cn } from "@/lib/utils";
import { SsDataSourceLabel } from "@/components/ui/ss-intelligence";

const CATEGORY_META: Record<DemoEventCategory, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  "Demand Change":             { icon: TrendingUp,    tone: "text-[var(--ss-orange-600)] bg-[var(--ss-orange-50)]" },
  "Evidence Generated":        { icon: FilePlus,      tone: "text-[var(--ss-blue-600)] bg-[var(--ss-blue-50)]" },
  "Evidence Verified":         { icon: ShieldCheck,   tone: "text-[var(--ss-teal-600)] bg-[var(--ss-teal-50)]" },
  "Readiness Recalculated":    { icon: Activity,      tone: "text-[var(--ss-navy-800)] bg-[var(--ss-surface-3)]" },
  "Skill Gap Recalculated":    { icon: AlertCircle,   tone: "text-amber-700 bg-amber-50" },
  "Match Recalculated":        { icon: Activity,      tone: "text-[var(--ss-blue-600)] bg-[var(--ss-blue-50)]" },
  "Recommendation Recalculated": { icon: Sparkles,    tone: "text-purple-700 bg-purple-50" },
  "Feedback Submitted":        { icon: MessageSquare, tone: "text-[var(--ss-orange-600)] bg-[var(--ss-orange-50)]" },
  "Passport Updated":          { icon: FilePlus,      tone: "text-[var(--ss-teal-600)] bg-[var(--ss-teal-50)]" },
  "Institution Insight Updated": { icon: Activity,    tone: "text-[var(--ss-navy-800)] bg-[var(--ss-surface-3)]" },
  "Academia Signal Updated":   { icon: TrendingUp,    tone: "text-[var(--ss-blue-600)] bg-[var(--ss-blue-50)]" },
  "Demo Reset":                { icon: AlertCircle,   tone: "text-[var(--ss-muted)] bg-[var(--ss-surface-2)]" },
  "Demo Started":              { icon: Sparkles,      tone: "text-[var(--ss-teal-600)] bg-[var(--ss-teal-50)]" },
};

const ACTOR_TONE: Record<string, string> = {
  "Industry Portal":            "text-[var(--ss-orange-600)]",
  "Student Portal":             "text-[var(--ss-teal-600)]",
  "Academia Portal":            "text-[var(--ss-blue-600)]",
  "Institution Portal":         "text-[var(--ss-navy-800)]",
  "Skill Intelligence Engine":  "text-[var(--ss-navy-900)]",
  "Opportunity Match Engine":   "text-[var(--ss-blue-600)]",
  "Evaluator":                  "text-[var(--ss-muted)]",
};

export function EventTimelineDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const events = useDemoStore((s) => s.events);
  const [selectedEvent, setSelectedEvent] = useState<DemoEvent | null>(null);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }),
      };
    } catch {
      return { date: iso, time: "" };
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div className="absolute inset-0 bg-[#0a1628]/55 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute right-0 top-0 flex h-screen w-full max-w-md flex-col bg-white shadow-pop"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--ss-border)] bg-gradient-to-r from-[var(--ss-navy-900)] to-[var(--ss-navy-800)] px-4 py-3 text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">SKILL SETU</p>
                  <h3 className="text-sm font-bold">Event Timeline</h3>
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Intro */}
              <div className="border-b border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-4 py-2.5">
                <p className="text-[11px] text-[var(--ss-ink-soft)]">
                  Every state transition is recorded chronologically. Click any event to see{" "}
                  <span className="font-semibold text-[var(--ss-blue-600)]">why it changed</span>.
                </p>
                <div className="mt-1.5">
                  <SsDataSourceLabel source="platform" />
                </div>
              </div>

              {/* Events list */}
              <div className="flex-1 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                    <Clock className="h-8 w-8 text-[var(--ss-faint)]" />
                    <p className="text-sm font-semibold text-[var(--ss-muted)]">No events yet</p>
                    <p className="text-xs text-[var(--ss-faint)]">Start the demo to record state transitions.</p>
                  </div>
                ) : (
                  <ol className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-[var(--ss-border)]" />
                    {events.map((ev, idx) => {
                      const meta = CATEGORY_META[ev.category];
                      const Icon = meta.icon;
                      const time = formatTime(ev.timestamp);
                      return (
                        <li key={ev.id} className="relative pl-16 pr-4 py-3">
                          {/* Dot */}
                          <span className={cn("absolute left-5 top-3.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white", meta.tone)}>
                            <Icon className="h-3 w-3" />
                          </span>
                          <button
                            onClick={() => setSelectedEvent(ev)}
                            className="block w-full text-left"
                          >
                            <div className="flex items-center gap-2 text-[10px] text-[var(--ss-muted)]">
                              <span className="font-semibold">{time.date}</span>
                              <span>·</span>
                              <span>{time.time}</span>
                            </div>
                            <p className="mt-0.5 text-xs font-semibold text-[var(--ss-ink)]">{ev.action}</p>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                              <span className={cn("font-semibold", ACTOR_TONE[ev.actor] ?? "text-[var(--ss-muted)]")}>
                                <User className="mr-1 inline h-2.5 w-2.5" />{ev.actor}
                              </span>
                              <span className="text-[var(--ss-faint)]">·</span>
                              <span className="text-[var(--ss-muted)]">{ev.affectedEntity}</span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-1">
                              <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", meta.tone)}>
                                {ev.category}
                              </span>
                              <ChevronRight className="ml-auto h-3 w-3 text-[var(--ss-faint)]" />
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-4 py-2.5">
                <p className="text-[10px] text-[var(--ss-muted)]">
                  <span className="font-bold text-[var(--ss-ink-soft)]">{events.length}</span> event(s) recorded · Cross-portal propagation via shared Zustand stores
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event detail / "Why did this change?" modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventWhyModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function EventWhyModal({ event, onClose }: { event: DemoEvent; onClose: () => void }) {
  const meta = CATEGORY_META[event.category];
  const Icon = meta.icon;
  const time = (() => {
    try {
      const d = new Date(event.timestamp);
      return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    } catch {
      return event.timestamp;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-[#0a1628]/55 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-white shadow-pop"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--ss-border)] px-5 py-4">
          <div className="flex items-start gap-2.5">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", meta.tone)}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ss-blue-600)]">Why did this change?</p>
              <h3 className="mt-0.5 text-base font-bold text-[var(--ss-ink)]">{event.action}</h3>
              <p className="text-[11px] text-[var(--ss-muted)]">{time}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--ss-faint)] hover:bg-[var(--ss-surface-2)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <div className="mb-4 space-y-2">
            <div className="rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface-2)] px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Explanation</p>
              <p className="mt-1 text-sm text-[var(--ss-ink-soft)]">{event.explanation}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-[var(--ss-border)] px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Actor</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--ss-ink)]">{event.actor}</p>
              </div>
              <div className="rounded-md border border-[var(--ss-border)] px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Affected entity</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--ss-ink)]">{event.affectedEntity}</p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-muted)]">Affected modules</p>
              <div className="flex flex-wrap gap-1.5">
                {event.affectedModules.map((m) => (
                  <span key={m} className="rounded-full bg-[var(--ss-teal-50)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ss-teal-700)] ring-1 ring-[var(--ss-teal-100)]">
                    ✓ {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-md border border-[var(--ss-blue-100)] bg-[var(--ss-blue-50)] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ss-blue-600)]">Architecture note</p>
            <p className="mt-1 text-[11px] text-[var(--ss-ink-soft)]">
              This change propagated through shared Zustand stores — Industry, Career, Academia, Institution, and Hackathon
              stores all subscribe to the central <code className="rounded bg-white px-1 font-mono text-[10px]">useIntelligence</code> store.
              No duplicate data, no manual sync.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
