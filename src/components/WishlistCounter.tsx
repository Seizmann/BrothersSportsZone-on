/**
 * Animated live-count caption for the "Join the wishlist" CTA — e.g.
 * "🎉 128 people already joined". The parent renders this only once the
 * count has loaded, so the mount fade-in IS the reveal (the CTA above it
 * never waits on the fetch). Digit changes roll via the same CSS slot-roll
 * the countdown uses; prefers-reduced-motion gets an instant swap.
 */
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface WishlistCounterProps {
  count: number;
  variant?: "hero" | "band";
}

export default function WishlistCounter({ count, variant = "band" }: WishlistCounterProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={
        variant === "hero"
          ? "mt-2 whitespace-nowrap text-caption text-mute"
          : "mt-4 whitespace-nowrap text-caption text-body-mid"
      }
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      <span aria-hidden>
        🎉{" "}
        {/* Mask keeps the roll travel clipped; keying by count replays the
            roll exactly when the number changes. */}
        <span className="inline-block overflow-hidden align-bottom">
          <span key={count} className={reducedMotion ? "inline-block" : "slot-roll inline-block"}>
            {count}
          </span>
        </span>{" "}
        {count === 1 ? "person" : "people"} already joined
      </span>
      <span className="sr-only">
        {count} {count === 1 ? "person has" : "people have"} already joined the wishlist
      </span>
    </motion.p>
  );
}
