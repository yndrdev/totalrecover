"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function CountAnimation({
  number,
  className
}: {
  number: number;
  className?: string;
}) {
  // For now, use a simple implementation without motion
  // Could be enhanced with framer-motion later if needed
  return <span className={cn(className)}>{number.toLocaleString()}</span>;
}