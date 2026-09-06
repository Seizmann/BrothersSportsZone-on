/**
 * Signature motif (REQUIREMENT §4.6): white field-marking lines at ~5% opacity
 * over the dark hero — center circle, halfway line, penalty boxes, corner arcs.
 * Decorative only; slow drift handled by `.animate-pitch-drift` (CSS keyframes).
 */
export default function PitchLines() {
  return (
    <div
      aria-hidden
      className="animate-pitch-drift pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        className="absolute left-1/2 top-1/2 h-[140%] w-[160%] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.05"
        strokeWidth="2"
      >
        {/* halfway line */}
        <line x1="600" y1="0" x2="600" y2="800" />
        {/* center circle + spot */}
        <circle cx="600" cy="400" r="160" />
        <circle cx="600" cy="400" r="4" fill="#FFFFFF" fillOpacity="0.05" stroke="none" />
        {/* top penalty box + arc */}
        <rect x="330" y="-120" width="540" height="240" />
        <rect x="450" y="-120" width="300" height="100" />
        <path d="M 480 120 A 130 130 0 0 0 720 120" />
        {/* bottom penalty box + arc */}
        <rect x="330" y="680" width="540" height="240" />
        <rect x="450" y="820" width="300" height="100" />
        <path d="M 480 680 A 130 130 0 0 1 720 680" />
        {/* corner arcs */}
        <path d="M 0 30 A 30 30 0 0 0 30 0" />
        <path d="M 1170 0 A 30 30 0 0 0 1200 30" />
        <path d="M 30 800 A 30 30 0 0 0 0 770" />
        <path d="M 1200 770 A 30 30 0 0 0 1170 800" />
      </svg>
    </div>
  );
}
