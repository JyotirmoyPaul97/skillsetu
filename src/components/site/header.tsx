"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useApp } from "@/lib/store";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Portals", href: "#portals" },
  { label: "About", href: "#about" },
];

export function Header() {
  const { setView } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
          ? "border-b border-slate-200/70 bg-white/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="#" aria-label="SKILL SETU home" className="shrink-0">
          <Logo size={36} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                scrolled
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "text-slate-700 hover:bg-white/40 hover:text-slate-900",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            onClick={() => setView("login")}
            className={cn(
              "h-9 px-3 text-sm font-medium",
              scrolled
                ? "text-slate-700 hover:text-slate-900"
                : "text-slate-800 hover:bg-white/40",
            )}
          >
            Login
          </Button>
          <Button
            onClick={() => setView("register")}
            className="h-9 gap-1.5 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Get Started
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-lg md:hidden",
            scrolled
              ? "text-slate-700 hover:bg-slate-100"
              : "text-slate-800 hover:bg-white/40",
          )}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => { setOpen(false); setView("login"); }}
                className="h-9 flex-1 text-sm font-medium"
              >
                Login
              </Button>
              <Button
                onClick={() => { setOpen(false); setView("register"); }}
                className="h-9 flex-1 gap-1.5 bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
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
