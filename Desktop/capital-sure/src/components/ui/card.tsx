import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "border-border shadow-sm hover:shadow-md",
        elevated: "border-border shadow-md hover:shadow-lg hover:-translate-y-0.5",
        construction: "border-border shadow-lg hover:shadow-xl hover:-translate-y-1 ring-2 ring-primary/10",
        glass: "glass border-white/20 backdrop-blur-md",
        outlined: "border-2 border-primary/20 shadow-sm hover:border-primary/40 hover:shadow-md",
        "safety-orange": "border-safety-orange/20 shadow-md ring-2 ring-safety-orange/10 hover:shadow-lg hover:ring-safety-orange/20",
        "construction-green": "border-construction-green/20 shadow-md ring-2 ring-construction-green/10 hover:shadow-lg hover:ring-construction-green/20",
        "warning-yellow": "border-warning-yellow/20 shadow-md ring-2 ring-warning-yellow/10 hover:shadow-lg hover:ring-warning-yellow/20",
      },
      size: {
        default: "py-6",
        sm: "py-4",
        lg: "py-8",
        xl: "py-12",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-12",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    }
  }
)

interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {}

function Card({ className, variant, size, padding, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, size }), padding === undefined ? "" : cn(padding), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  type CardProps,
}
