import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { timeRemaining, type TimeRemaining } from "../lib/target-date";
import { FootballIcon } from "./icons";

/**
 * Countdown (polish pass). Days/Hours/Minutes use the existing CSS digit-roll.
 * Seconds runs a 3-phase slot machine:
 *
 *   ① digit N visible (holding)
 *   ② slot content swaps to the football icon  → slot-roll animation plays
 *   ③ after icon hold, slot content swaps to digit N-1 → slot-roll plays again
 *
 * A single always-mounted <span> slot holds whichever content is current. A
 * React `key` change on that span re-triggers the CSS `slot-roll` animation,
 * so there is never a mount/unmount gap and never a concurrent overlap.
 * The state machine owns the phase timing via refs (immune to React batching).
 *
 * Phase budget (620ms total, well under the 1000ms tick):
 *   icon enters at  0ms   (slot-roll: 200ms)
 *   icon holds  until 420ms
 *   digit enters at 420ms (slot-roll: 200ms, settles at 620ms)
 *   → digit readable for ~380ms before the next tick fires.
 */

const BOX_STYLES = [
  "min-[448px]:-rotate-2 min-[448px]:translate-y-1 shadow-surface",
  "min-[448px]:rotate-1 min-[448px]:-translate-y-1.5",
  "min-[448px]:-rotate-1 min-[448px]:translate-y-1.5 shadow-surface",
  "min-[448px]:rotate-2 min-[448px]:-translate-y-1",
] as const;

const BOX_BASE =
  "flex flex-col items-center justify-center rounded-md bg-canvas-soft px-2 py-4 transition-shadow hover:shadow-surface sm:px-3 sm:py-5";

// --- Days / Hours / Minutes (unchanged CSS roll) ---------------------------

function TimeUnit({ value, label, style }: { value: number; label: string; style: string }) {
  const text = String(value).padStart(2, "0");
  return (
    <div className={`${BOX_BASE} ${style}`}>
      <span
        className="overflow-hidden text-countdown text-ink"
        style={{ fontVariantNumeric: "tabular-nums" }}
        aria-hidden
      >
        <span key={text} className="digit-roll block">
          {text}
        </span>
      </span>
      <span className="mt-1 whitespace-nowrap text-caption uppercase tracking-wide text-body-mid">
        {label}
      </span>
    </div>
  );
}

// --- Seconds slot machine --------------------------------------------------

type SlotContent =
  | { kind: "digit"; text: string }
  | { kind: "icon" };

/** ms to hold the icon before swapping back to the next digit */
const ICON_HOLD_MS = 420;

function SecondsUnit({ value, style }: { value: number; style: string }) {
  const targetText    = String(value).padStart(2, "0");
  const reducedMotion = useReducedMotion();

  // What is currently rendered in the slot.
  const [slot, setSlot] = useState<SlotContent>({ kind: "digit", text: targetText });
  // Monotone counter: incrementing forces a new `key` even if slot content
  // is identical, so the CSS animation always replays.
  const [animKey, setAnimKey] = useState(0);

  const pendingText  = useRef(targetText);
  const cycleRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCycle = useRef(false);

  useEffect(() => {
    pendingText.current = targetText;

    // Under reduced-motion: skip the icon phase; swap digit directly.
    if (reducedMotion) {
      if (cycleRef.current) clearTimeout(cycleRef.current);
      pendingCycle.current = false;
      setSlot({ kind: "digit", text: targetText });
      // No animKey bump → no CSS animation fires (prefers-reduced-motion
      // media query already disables the .slot-roll keyframe too).
      return;
    }

    // Don't stack cycles.
    if (pendingCycle.current) return;
    pendingCycle.current = true;

    // Phase ②: slot → icon (key bump replays slot-roll).
    setSlot({ kind: "icon" });
    setAnimKey(k => k + 1);

    // Phase ③: after hold, slot → digit.
    cycleRef.current = setTimeout(() => {
      pendingCycle.current = false;
      setSlot({ kind: "digit", text: pendingText.current });
      setAnimKey(k => k + 1);
    }, ICON_HOLD_MS);

    return () => {
      if (cycleRef.current) clearTimeout(cycleRef.current);
      pendingCycle.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetText, reducedMotion]);

  return (
    <div className={`${BOX_BASE} ${style}`}>
      {/* Mask: fixed height so it never collapses when holding the icon.
          overflow-hidden clips the slot-roll animation travel. */}
      <span
        className="relative block h-[1em] overflow-hidden text-countdown text-ink"
        style={{ fontVariantNumeric: "tabular-nums" }}
        aria-hidden
      >
        <span
          key={animKey}
          className="slot-roll flex h-full w-full items-center justify-center"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {slot.kind === "digit" ? (
            slot.text
          ) : (
            <FootballIcon className="size-[0.6em] fill-canvas-soft text-primary" />
          )}
        </span>
      </span>
      <span className="mt-1 whitespace-nowrap text-caption uppercase tracking-wide text-body-mid">
        Seconds
      </span>
    </div>
  );
}

// --- Root ------------------------------------------------------------------

export default function Countdown() {
  const [time, setTime] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    setTime(timeRemaining());
    const id = setInterval(() => setTime(timeRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) {
    return (
      <div className="grid grid-cols-2 gap-3 min-[448px]:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-md bg-canvas-soft px-2 py-4 sm:px-3 sm:py-5 ${BOX_STYLES[i]}`}
          >
            <span className="block text-countdown text-ink opacity-0">00</span>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { value: time.days,    label: "Days" },
    { value: time.hours,   label: "Hours" },
    { value: time.minutes, label: "Minutes" },
  ];

  return (
    <div>
      <div
        className="grid grid-cols-2 gap-3 min-[448px]:grid-cols-4"
        role="timer"
        aria-label={`Opening in ${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds`}
      >
        {units.map((u, i) => (
          <TimeUnit key={u.label} value={u.value} label={u.label} style={BOX_STYLES[i]} />
        ))}
        <SecondsUnit value={time.seconds} style={BOX_STYLES[3]} />
      </div>
      {time.isOpen && (
        <p className="mt-4 text-center text-body-md text-primary" role="status">
          It&rsquo;s open — see you on the pitch.
        </p>
      )}
    </div>
  );
}
