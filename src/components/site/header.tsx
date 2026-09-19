"use client";

import { useEffect, useState } from "react";
import { Menu, X, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useRouter } from "@/lib/router";
import { SystemArchitectureBadge } from "./system-architecture-badge";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Portals", href: "#portals" },
  { label: "About", href: "#about" },
];

export function Header() {
  const { navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[var(--ss-border)] bg-white/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* LEFT: brand */}
        <a href="#" aria-label="SKILL SETU home" className="shrink-0">
          <Logo size={34} />
        </a>

        {/* CENTER: nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                scrolled
                  ? "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]"
                  : "text-[var(--ss-ink-soft)] hover:bg-white/40 hover:text-[var(--ss-ink)]",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* RIGHT: actions */}
        <div className="hidden items-center gap-2 md:flex relative">
          <SystemArchitectureBadge />
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="h-9 px-3 text-sm font-medium text-[var(--ss-ink-soft)] hover:text-[var(--ss-ink)]"
          >
            Login
          </Button>
          <Button
            variant="navy"
            onClick={() => navigate("/login")}
            className="h-9 gap-1.5 px-4"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Get Started
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={mobileNav ? "Close menu" : "Open menu"}
          aria-expanded={mobileNav}
          onClick={() => setMobileNav(!mobileNav)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-lg md:hidden",
            scrolled
              ? "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"
              : "text-[var(--ss-ink)] hover:bg-white/40",
          )}
        >
          {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer (below header) */}
      {mobileNav && (
        <div className="border-t border-[var(--ss-border)] bg-white/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileNav(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)]"
              >
                {l.label}
                <ChevronRight className="h-4 w-4 text-[var(--ss-faint)]" />
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => { setMobileNav(false); navigate("/login"); }}
                className="h-9 flex-1 text-sm font-medium"
              >
                Login
              </Button>
              <Button
                variant="navy"
                onClick={() => { setMobileNav(false); navigate("/login"); }}
                className="h-9 flex-1 gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
