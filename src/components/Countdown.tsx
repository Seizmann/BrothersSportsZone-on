import { useEffect, useState } from "react";
import { timeRemaining, type TimeRemaining } from "../lib/target-date";

/**
 * Isolated ticking component (REQUIREMENT §8): owns the single 1s interval and
 * its own state, so a tick never re-renders the rest of the tree. Digits use
 * tabular-nums and cell-sized boxes — no layout jitter. Digit changes animate
 * via a CSS roll (key remount inside an overflow-hidden mask).
 *
 * Layout (REQUIREMENT §9): boxes fill cells of a fluid grid — 2×2 on the
 * narrowest phones, single 4-across row from 400px up — so width always comes
 * from the viewport, never from a fixed `ch` measure that can't hold the
 * `countdown-digit` type.
 */
function TimeUnit({ value, label }: { value: number; label: string }) {
  const text = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center justify-center rounded-md bg-canvas-soft px-2 py-4 sm:px-3 sm:py-5">
      <span
        className="overflow-hidden text-countdown text-ink"
        style={{ fontVariantNumeric: "tabular-nums" }}
        aria-hidden
      >
        {/* key remount triggers the roll animation on change */}
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

export default function Countdown() {
  const [time, setTime] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    setTime(timeRemaining());
    const id = setInterval(() => setTime(timeRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) {
    // Reserve identical space so hydration of real values causes no shift.
    return (
      <div className="grid grid-cols-2 gap-3 min-[448px]:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-md bg-canvas-soft px-2 py-4 sm:px-3 sm:py-5">
            <span className="block text-countdown text-ink opacity-0">00</span>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { value: time.days, label: "Days" },
    { value: time.hours, label: "Hours" },
    { value: time.minutes, label: "Minutes" },
    { value: time.seconds, label: "Seconds" },
  ];

  return (
    <div>
      <div
        className="grid grid-cols-2 gap-3 min-[448px]:grid-cols-4"
        role="timer"
        aria-label={`Opening in ${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds`}
      >
        {units.map((u) => (
          <TimeUnit key={u.label} value={u.value} label={u.label} />
        ))}
      </div>
      {time.isOpen && (
        <p className="mt-4 text-center text-body-md text-primary" role="status">
          It&rsquo;s open — see you on the pitch.
        </p>
      )}
    </div>
  );
}
