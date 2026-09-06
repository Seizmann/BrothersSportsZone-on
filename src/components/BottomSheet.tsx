/**
 * Bottom sheet modal (polish pass §3): slides up from the bottom edge on
 * mobile; on sm+ screens it becomes a centered modal that still slides up, so
 * the motion feel is identical across breakpoints. Swipe-down (mobile drag)
 * or backdrop tap dismisses; Escape closes; background scroll is locked while
 * open. Content is portaled so no ancestor overflow/transform can clip it.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion, type PanInfo } from "motion/react";
import { XIcon } from "./icons";

const SPRING = { type: "spring", damping: 30, stiffness: 300 } as const;

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, labelledBy, children }: BottomSheetProps) {
  const reducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  // Keep the latest onClose without letting its identity drive effects: the
  // parent recreates this callback on every form keystroke, and re-running
  // the focus effect below would steal focus from the field being typed in.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Lock body scroll + focus the sheet only when it opens/closes. Keyed on
  // `open` alone — never on onClose or form state — so typing in a field
  // never re-runs this effect and never yanks focus away from the input.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Escape closes the sheet while it's open; the handler reads the latest
  // onClose through a ref so the listener never needs re-subscribing.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  const swipeDismiss = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 90 || info.velocity.y > 800) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      <motion.button
        type="button"
        aria-label="Close"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/50"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
        animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
        transition={reducedMotion ? { duration: 0.15 } : SPRING}
        drag={reducedMotion ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={swipeDismiss}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-canvas shadow-surface outline-none sm:inset-x-4 sm:bottom-auto sm:top-1/2 sm:max-h-[85dvh] sm:-translate-y-1/2 sm:rounded-xl"
      >
        {/* Drag handle — visual affordance on mobile; hidden on desktop where
            there is no sheet edge to pull. */}
        <div className="flex shrink-0 items-center justify-center pt-3 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-mute/60" />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
        >
          <XIcon className="size-5" />
        </button>

        <div className="overflow-y-auto overscroll-contain px-6 pb-8 pt-6 sm:px-8 sm:pb-10">
          {children}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
