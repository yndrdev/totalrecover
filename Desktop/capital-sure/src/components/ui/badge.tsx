import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 ease-out overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90 shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 shadow-sm",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-sm",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground border-border",
        success:
          "border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90 shadow-sm",
        // Status Badges
        "status-active":
          "border-transparent bg-success/10 text-success [a&]:hover:bg-success/20 shadow-sm",
        "status-pending":
          "border-transparent bg-warning/10 text-warning [a&]:hover:bg-warning/20 shadow-sm",
        "status-overdue":
          "border-transparent bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20 shadow-sm",
        "status-completed":
          "border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/20 shadow-sm",
        "safety-critical":
          "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90 shadow-md font-semibold",
        // Project Status
        "project-planning":
          "border-primary/20 bg-primary/10 text-primary [a&]:hover:bg-primary/20 shadow-sm",
        "project-active":
          "border-success/20 bg-success/10 text-success [a&]:hover:bg-success/20 shadow-sm",
        "project-onhold":
          "border-warning/20 bg-warning/10 text-warning [a&]:hover:bg-warning/20 shadow-sm",
        "project-completed":
          "border-transparent bg-gradient-to-r from-success to-success/90 text-success-foreground [a&]:hover:from-success/90 [a&]:hover:to-success/80 shadow-md",
        // Glass effect badge
        "glass":
          "glass border-white/20 text-foreground [a&]:hover:bg-white/10 backdrop-blur-md shadow-lg",
      },
      size: {
        default: "px-2 py-0.5 text-xs",
        sm: "px-1.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base font-semibold",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
