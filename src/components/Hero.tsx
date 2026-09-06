import { motion } from "motion/react";
import Countdown from "./Countdown";
import PitchLines from "./PitchLines";

const EASE = [0.16, 1, 0.3, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-canvas on-dark">
      <PitchLines />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-32 text-center sm:pb-24 sm:pt-40">
        <motion.p
          variants={rise}
          initial="hidden"
          animate="shown"
          transition={{ duration: 0.5, ease: EASE }}
          className="text-eyebrow uppercase text-primary"
        >
          Opening soon
        </motion.p>

        <motion.h1
          variants={rise}
          initial="hidden"
          animate="shown"
          transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
          className="mt-4 max-w-3xl text-display-xl"
        >
          Faridpur&rsquo;s football turf is almost here.
        </motion.h1>

        <motion.p
          variants={rise}
          initial="hidden"
          animate="shown"
          transition={{ duration: 0.55, delay: 0.24, ease: EASE }}
          className="mt-5 max-w-2xl text-display-sub text-mute"
        >
          Brother&rsquo;s Sports Zone brings a full-size, floodlit football turf to
          Faridpur — opening October 1, 2026.
        </motion.p>

        <motion.div
          variants={rise}
          initial="hidden"
          animate="shown"
          transition={{ duration: 0.6, delay: 0.36, ease: EASE }}
          className="mt-10"
        >
          <Countdown />
        </motion.div>

        <motion.div
          variants={rise}
          initial="hidden"
          animate="shown"
          transition={{ duration: 0.6, delay: 0.48, ease: EASE }}
          className="mt-10"
        >
          <a
            href="#wishlist"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-dark"
          >
            Join the wishlist
          </a>
          <p className="mt-3 text-caption text-mute">
            Planning a match? Get a call back when we open.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
