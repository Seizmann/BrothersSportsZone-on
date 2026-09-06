import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

/* Stroke icons adapted from Lucide (ISC license), single weight. */

export function BallIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}

export function GoalpostIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20v-9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9" />
      <path d="M4 20h16" />
      <path d="M9 20v-5a3 3 0 0 1 6 0v5" />
    </svg>
  );
}

export function FloodlightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3h4l2 6H10l2-6z" />
      <path d="M14 9v7" />
      <path d="M8 21a6 6 0 0 1 12 0" />
      <path d="M8 21h12" />
    </svg>
  );
}

export function StopwatchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M9 2h6" />
      <path d="M19.5 6.5 18 8" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
