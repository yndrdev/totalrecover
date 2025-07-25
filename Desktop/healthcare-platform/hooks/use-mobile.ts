"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect mobile screen size with SSR-safe hydration
 * Returns true for screens smaller than 768px (tablet/mobile)
 */
export function useIsMobile() {
  // Start with false to match server rendering and prevent hydration mismatch
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === "undefined") return;

    const checkIsMobile = () => {
      // Use standard tablet/mobile breakpoint (768px)
      setIsMobile(window.innerWidth < 768);
    };

    // Check initial state
    checkIsMobile();

    // Add resize listener
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}