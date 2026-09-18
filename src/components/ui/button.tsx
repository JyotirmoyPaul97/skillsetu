import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// SKILL SETU button system — premium, soft-shadow, rounded-lg.
// Variants map onto the master palette: navy (primary), blue, teal, orange.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:translate-y-px",
  {
    variants: {
      variant: {
        // Primary — deep navy, premium soft shadow + hover lift
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-[var(--ss-navy-800)] hover:shadow-lift",
        // Navy alias (explicit)
        navy:
          "bg-[var(--ss-navy-900)] text-white shadow-soft hover:bg-[var(--ss-navy-800)] hover:shadow-lift",
        // Blue — primary interactive
        blue:
          "bg-[var(--ss-blue-600)] text-white shadow-soft hover:bg-[var(--ss-blue-500)] hover:shadow-lift",
        // Teal — evidence / success accent
        teal:
          "bg-[var(--ss-teal-600)] text-white shadow-soft hover:bg-[var(--ss-teal-500)] hover:shadow-lift",
        // Orange — subtle accent
        orange:
          "bg-[var(--ss-orange-600)] text-white shadow-soft hover:bg-[var(--ss-orange-500)] hover:shadow-lift",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // Outline — white surface, navy border
        outline:
          "border border-[var(--ss-line)] bg-white text-[var(--ss-ink)] shadow-xs hover:bg-[var(--ss-surface-2)] hover:border-[var(--ss-faint)]",
        // Secondary — soft neutral
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        // Ghost — transparent, hover tint
        ghost:
          "text-[var(--ss-ink-soft)] hover:bg-[var(--ss-surface-2)] hover:text-[var(--ss-ink)]",
        // Link
        link: "text-[var(--ss-blue-600)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 text-[13px]",
        lg: "h-11 rounded-xl px-6 has-[>svg]:px-4 text-[15px]",
        xl: "h-12 rounded-xl px-7 has-[>svg]:px-5 text-base",
        icon: "size-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
