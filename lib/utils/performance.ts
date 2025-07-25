import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce hook for optimizing performance-sensitive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce callback function
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Throttle hook for rate limiting function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        lastRunRef.current = now;
        callbackRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callbackRef.current(...args);
        }, delay - timeSinceLastRun);
      }
    },
    [delay]
  );
}

/**
 * Retry logic for API calls with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static marks = new Map<string, number>();

  static mark(name: string) {
    this.marks.set(name, performance.now());
  }

  static measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`Performance mark "${startMark}" not found`);
      return 0;
    }

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (!end) {
      console.warn(`Performance mark "${endMark}" not found`);
      return 0;
    }

    const duration = end - (endMark ? 0 : start);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static clear() {
    this.marks.clear();
  }
}

/**
 * Request queue for managing concurrent API calls
 */
export class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const request = this.queue.shift();

    if (request) {
      try {
        await request();
      } finally {
        this.running--;
        this.process();
      }
    }
  }

  clear() {
    this.queue = [];
  }

  get size() {
    return this.queue.length;
  }

  get isRunning() {
    return this.running > 0;
  }
}