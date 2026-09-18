import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  /** Show the wordmark + ecosystem subtitle next to the mark */
  withWordmark?: boolean;
  /** Use white text (for dark backgrounds) */
  onDark?: boolean;
}

/**
 * SKILL SETU logo mark — a rounded-square squircle with a node/network glyph
 * (four dots connected to a central dot — represents the four-portal ecosystem
 * converging on a single intelligence layer).
 */
export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-sm ring-1 ring-black/5",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* connectors */}
        <path
          d="M12 12 L5 5 M12 12 L19 5 M12 12 L5 19 M12 12 L19 19"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* satellites */}
        <circle cx="5" cy="5" r="2.1" fill="#14B8A6" />
        <circle cx="19" cy="5" r="2.1" fill="#F59E0B" />
        <circle cx="5" cy="19" r="2.1" fill="#F43F5E" />
        <circle cx="19" cy="19" r="2.1" fill="#8B5CF6" />
        {/* centre */}
        <circle cx="12" cy="12" r="3.2" fill="white" />
        <circle cx="12" cy="12" r="1.4" fill="#0F172A" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  size = 36,
  withWordmark = true,
  onDark = false,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-[15px] font-extrabold tracking-[0.18em]",
              onDark ? "text-white" : "text-slate-900",
            )}
          >
            SKILL SETU
          </span>
          <span
            className={cn(
              "mt-1 text-[9px] font-medium uppercase tracking-[0.32em]",
              onDark ? "text-white/60" : "text-slate-500",
            )}
          >
            Skill Intelligence Ecosystem
          </span>
        </span>
      )}
    </span>
  );
}
