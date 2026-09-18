import Link from "next/link";
import { Logo } from "./logo";

interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

const GROUPS: FooterLinkGroup[] = [
  {
    title: "Ecosystem",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "About", href: "#about" },
      { label: "Closed Loop", href: "#closed-loop" },
    ],
  },
  {
    title: "Portals",
    links: [
      { label: "Student", href: "#portal-student" },
      { label: "Industry", href: "#portal-industry" },
      { label: "Academia", href: "#portal-academia" },
      { label: "Institution", href: "#portal-institution" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "#login" },
      { label: "Privacy", href: "#privacy" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand block */}
          <div className="col-span-2 lg:col-span-2">
            <Logo size={36} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              From Skill Claims to Skill Evidence. AI-Powered Skill
              Intelligence & Academia–Industry Ecosystem.
            </p>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
              SIH 2026 · Problem Statement 44
            </p>
          </div>

          {/* Link groups */}
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {g.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 SKILL SETU · Skill Intelligence Ecosystem</p>
          <p className="text-slate-400">
            Built for Smart India Hackathon · Problem Statement 44
          </p>
        </div>
      </div>
    </footer>
  );
}
