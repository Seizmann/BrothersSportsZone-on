/**
 * Typography-based wordmark (no logo image exists): a small pitch-mark glyph,
 * "BROTHER'S" tracked uppercase, over "SPORTS ZONE". Two polarity variants.
 */
export default function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="Brother's Sports Zone">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-7 shrink-0 text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.5" />
        <line x1="12" y1="3" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="21" />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={`text-eyebrow uppercase ${
            onDark ? "text-mute" : "text-body-mid"
          }`}
        >
          Brother&rsquo;s
        </span>
        <span
          className={`text-[15px] font-semibold tracking-tight ${
            onDark ? "text-canvas" : "text-ink"
          }`}
        >
          Sports Zone
        </span>
      </span>
    </span>
  );
}
