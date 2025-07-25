import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 touch-target relative overflow-hidden group before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-10",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md before:from-white before:to-white",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive-hover hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md before:from-white before:to-white",
        outline:
          "border-2 border-primary bg-background text-primary shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 hover:border-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 before:from-white before:to-white",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        // Enhanced Construction-specific variants
        "safety-orange":
          "bg-safety-orange text-safety-orange-foreground shadow-md hover:bg-safety-orange-hover hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md before:from-white before:to-white ring-2 ring-safety-orange/20",
        "construction-green":
          "bg-construction-green text-construction-green-foreground shadow-md hover:bg-construction-green-hover hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md before:from-white before:to-white ring-2 ring-construction-green/20",
        "warning-yellow":
          "bg-warning-yellow text-warning-yellow-foreground shadow-md hover:bg-warning-yellow-hover hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md before:from-black before:to-black ring-2 ring-warning-yellow/20",
        glass:
          "glass text-foreground hover:shadow-xl hover:-translate-y-1 active:translate-y-0 backdrop-blur-md border border-white/20",
        // New enterprise construction variants
        "construction-primary":
          "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-1 hover:from-primary-hover hover:to-primary active:translate-y-0 before:from-white before:to-white",
        "construction-outline":
          "border-2 border-primary/20 bg-gradient-to-r from-background to-background/95 text-primary shadow-sm hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        sm: "h-10 px-4 text-sm gap-1.5 min-w-[2.5rem] has-[>svg]:px-3",
        default: "h-11 px-6 min-w-[3rem] has-[>svg]:px-4",
        lg: "h-12 px-8 text-lg min-w-[3.5rem] has-[>svg]:px-6",
        xl: "h-14 px-10 text-xl min-w-[4rem] has-[>svg]:px-8",
        icon: "size-11 p-0",
        "icon-sm": "size-10 p-0",
        "icon-lg": "size-12 p-0",
        "icon-xl": "size-14 p-0",
        // Enhanced touch-optimized sizes for construction use
        touch: "h-12 px-6 min-w-[3.5rem] min-h-[48px] touch-target-large font-medium",
        "touch-large": "h-14 px-8 min-w-[4rem] min-h-[56px] touch-target-large font-semibold text-lg",
        "touch-xl": "h-16 px-10 min-w-[5rem] min-h-[64px] text-xl font-semibold",
        // Construction field optimized sizes
        "construction": "h-14 px-8 min-w-[4rem] min-h-[56px] font-semibold text-lg tracking-wide",
        "construction-lg": "h-16 px-10 min-w-[5rem] min-h-[64px] font-bold text-xl tracking-wide",
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
