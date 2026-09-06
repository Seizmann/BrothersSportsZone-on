import { motion } from "motion/react";
import Countdown from "./Countdown";
import PitchLines from "./PitchLines";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Polish pass §5: Hero enters with a slide-from-the-right + fade. Elements
 * stagger on load (the section is above the fold, so whileInView fires
 * immediately); `once: true` prevents replay on scroll-up. Under
 * prefers-reduced-motion, MotionConfig reducedMotion="user" drops the
 * translate and keeps a fade only. */
const slideFromRight = {
  hidden: { opacity: 0, x: 48 },
  shown: { opacity: 1, x: 0 },
};

export default function Hero({ onJoinWishlist }: { onJoinWishlist: () => void }) {
  return (
    <section className="relative overflow-hidden bg-ink text-canvas on-dark">
      <PitchLines />
      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-64px" }}
        className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-32 text-center sm:pb-24 sm:pt-40"
      >
        <motion.p
          variants={slideFromRight}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-eyebrow uppercase text-primary"
        >
          Opening soon
        </motion.p>

        <motion.h1
          variants={slideFromRight}
          transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
          className="mt-4 max-w-3xl text-display-xl"
        >
          Faridpur&rsquo;s football turf is almost here.
        </motion.h1>

        <motion.p
          variants={slideFromRight}
          transition={{ duration: 0.55, delay: 0.24, ease: EASE }}
          className="mt-5 max-w-2xl text-display-sub text-mute"
        >
          Brother&rsquo;s Sports Zone brings a full-size, floodlit football turf to
          Faridpur — opening October 1, 2026.
        </motion.p>

        <motion.div
          variants={slideFromRight}
          transition={{ duration: 0.6, delay: 0.36, ease: EASE }}
          className="mt-10"
        >
          <Countdown />
        </motion.div>

        <motion.div
          variants={slideFromRight}
          transition={{ duration: 0.6, delay: 0.48, ease: EASE }}
          className="mt-10"
        >
          <button
            type="button"
            onClick={onJoinWishlist}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-dark"
          >
            Join the wishlist
          </button>
          <p className="mt-3 text-caption text-mute">
            Planning a match? Get a call back when we open.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
