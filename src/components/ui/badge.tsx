import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 shadow-glow-sm",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/20 text-white hover:bg-primary/30 glass-effect",
        secondary:
          "border-secondary/30 bg-secondary/20 text-white hover:bg-secondary/30 glass-effect",
        destructive:
          "border-destructive/30 bg-destructive/20 text-white hover:bg-destructive/30 glass-effect",
        outline: "text-white border-white/30 glass-effect",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
