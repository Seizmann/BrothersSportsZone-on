import { motion } from "motion/react";
import { BallIcon, FloodlightIcon, StopwatchIcon } from "./icons";

const highlights = [
  {
    icon: BallIcon,
    title: "Full-size football turf",
    body: "A proper pitch built for five-a-side and full-game play.",
  },
  {
    icon: FloodlightIcon,
    title: "Floodlit evening play",
    body: "Matches don't stop at sunset — lights stay on late.",
  },
  {
    icon: StopwatchIcon,
    title: "Easy on-ground booking",
    body: "Booking opens at the venue soon after launch day.",
  },
];

export default function HighlightsStrip() {
  return (
    <section className="bg-canvas" aria-label="What the turf offers">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {highlights.map(({ icon: Icon, title, body }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, x: 48 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-64px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-md bg-canvas-soft p-6"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-canvas text-primary">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-4 text-[17px] font-semibold text-ink">{title}</h2>
              <p className="mt-1.5 text-body-md text-body-mid">{body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
