import { Logo, LogoMark } from "./logo";

const GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Ecosystem",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "About", href: "#about" },
      { label: "Closed Loop", href: "#" },
    ],
  },
  {
    title: "Portals",
    links: [
      { label: "Student", href: "#portals" },
      { label: "Industry", href: "#portals" },
      { label: "Academia", href: "#portals" },
      { label: "Institution", href: "#portals" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--ss-border)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand block */}
          <div className="col-span-2 lg:col-span-2">
            <Logo size={34} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--ss-muted)]">
              From Skill Claims to Skill Evidence. AI-Powered Skill Intelligence
              &amp; Academia–Industry Ecosystem.
            </p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ss-faint)]">
              SIH 2026 · Problem Statement 44
            </p>
          </div>

          {GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ss-muted)]">
                {g.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-[var(--ss-ink-soft)] transition-colors hover:text-[var(--ss-blue-600)]"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--ss-border)] pt-6 text-xs text-[var(--ss-muted)] sm:flex-row">
          <p>© 2026 SKILL SETU · Skill Intelligence Ecosystem</p>
          <p className="text-[var(--ss-faint)]">
            Built for Smart India Hackathon · Problem Statement 44
          </p>
        </div>
      </div>
    </footer>
  );
}
