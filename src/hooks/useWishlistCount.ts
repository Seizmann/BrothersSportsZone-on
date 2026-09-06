/**
 * Live wishlist count — fetched once from GET /api/wishlist/count and exposed
 * alongside `increment`, the optimistic +1 the UI applies after a confirmed
 * successful submit. Failures stay silent: the count is never resolved on
 * error, so the caller simply renders nothing instead of a wrong "0".
 */
import { useEffect, useState } from "react";

export interface WishlistCountState {
  count: number | null;
  increment: () => void;
}

export function useWishlistCount(): WishlistCountState {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    fetch("/api/wishlist/count", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: unknown) => {
        if (!alive) return;
        const value = (data as { count?: unknown }).count;
        if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
          setCount(value);
        }
      })
      .catch(() => {
        // Network error / endpoint down → hide the counter, never an error UI.
      });

    return () => {
      alive = false;
    };
  }, []);

  const increment = () => setCount((prev) => (prev === null ? null : prev + 1));

  return { count, increment };
}
