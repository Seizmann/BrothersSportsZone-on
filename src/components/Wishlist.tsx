import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  validateWishlistInput,
  type WishlistErrors,
} from "../lib/wishlist-validation";
import { OPENING_DATE_ISO } from "../lib/target-date";
import { useWishlistSubmit } from "../hooks/useWishlistSubmit";
import BottomSheet from "./BottomSheet";
import { CheckIcon, ClipboardListIcon, SpinnerIcon } from "./icons";

const EASE = [0.16, 1, 0.3, 1] as const;

const PREFERENCE_NOTE =
  "This is just your preference. We'll call you to confirm the actual schedule once we're open.";

const initialForm = {
  full_name: "",
  phone_number: "",
  team_name_a: "",
  team_name_b: "",
  number_of_players: "",
  preferred_date: "",
  preferred_time: "",
};

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (ariaProps: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    className: string;
  }) => ReactNode;
}

function Field({ id, label, error, hint, children }: FieldProps) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-caption font-semibold text-ink-soft">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy || undefined,
        className: `w-full rounded-md border bg-white px-3 py-2.5 text-body-md text-ink placeholder:text-mute ${
          error ? "border-primary-dark" : "border-mute/60"
        }`,
      })}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-caption text-body-mid">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-caption text-primary-dark">
          {error}
        </p>
      )}
    </div>
  );
}

interface WishlistProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Wishlist (polish pass §3–4): the landing page keeps only a CTA band; the
 * form lives in a bottom sheet. Submission is optimistic (useWishlistSubmit):
 * the success state shows after a fixed ~1s regardless of network speed, and
 * a real failure swaps in an error state with a retry of the same payload.
 */
export default function Wishlist({ open, onOpen, onClose }: WishlistProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<WishlistErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const { phase, successMessage, errorMessage, serverErrors, submit, retry, reset } =
    useWishlistSubmit();

  function setField(key: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // Stable identity: BottomSheet's effects key on this, so it must not be
  // recreated on every keystroke-driven render.
  const closeSheet = useCallback(() => {
    onClose();
    // Reset to a clean form once the exit animation is out of view.
    setTimeout(() => {
      setForm(initialForm);
      setErrors({});
      setBanner(null);
      reset();
    }, 300);
  }, [onClose, reset]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === "pending") return;

    setBanner(null);

    const parsed = validateWishlistInput(form);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    // Fire the request now; the hook decides when the UI settles.
    submit(parsed.value);
  }

  // Server-side 400 field errors surface on the fields after the request.
  const fieldErrors: WishlistErrors = { ...errors, ...serverErrors };

  const today = new Date().toISOString().slice(0, 10);
  // Only dates on/after opening day (Oct 1, 2026) can be picked.
  const minDate = today > OPENING_DATE_ISO ? today : OPENING_DATE_ISO;

  return (
    <section id="wishlist" className="bg-canvas-soft" aria-labelledby="wishlist-heading">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-64px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="rounded-md bg-canvas px-6 py-10 text-center sm:px-10 sm:py-12"
        >
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-canvas-soft text-primary">
            <ClipboardListIcon className="size-6" />
          </span>
          <h2 id="wishlist-heading" className="mt-4 text-display-md text-ink">
            Join the wishlist
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-body-mid">
            Planning a match once the turf opens? Leave your details and we&rsquo;ll
            call you back to lock in your slot. No payment, no commitment — just
            early interest.
          </p>
          <button
            type="button"
            onClick={onOpen}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-dark"
          >
            Join the wishlist
          </button>
          <p className="mt-4 text-caption text-body-mid">
            One entry per phone number every 24 hours. We&rsquo;ll only use your
            number to call about your slot.
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <BottomSheet open={open} onClose={closeSheet} labelledBy="wishlist-sheet-heading">
            {phase === "success" ? (
              <div className="mx-auto max-w-md py-6 text-center" role="status">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-on-primary">
                  <CheckIcon className="size-7" />
                </span>
                <h3 className="mt-6 text-display-md text-ink">You&rsquo;re on the wishlist!</h3>
                <p className="mt-3 text-body-lg text-body-mid">{successMessage}</p>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="mt-8 rounded-md border border-mute/60 px-5 py-2.5 text-body-md font-medium text-ink-soft transition-colors hover:border-ink-soft"
                >
                  Done
                </button>
              </div>
            ) : phase === "error" ? (
              <div className="mx-auto max-w-md py-6 text-center" role="alert">
                <span className="inline-flex size-14 items-center justify-center rounded-full border border-primary-dark/30 text-primary-dark">
                  <ClipboardListIcon className="size-7" />
                </span>
                <h3 className="mt-6 text-display-md text-ink">We couldn&rsquo;t add you</h3>
                <p className="mt-3 text-body-lg text-body-mid">
                  {errorMessage}
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={retry}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-dark"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={closeSheet}
                    className="rounded-md border border-mute/60 px-5 py-2.5 text-body-md font-medium text-ink-soft transition-colors hover:border-ink-soft"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mx-auto max-w-xl text-center">
                  <h3 id="wishlist-sheet-heading" className="text-display-md text-ink">
                    Join the wishlist
                  </h3>
                  <p className="mt-2 text-body-md text-body-mid">
                    We&rsquo;ll call you back to lock in your slot.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field id="wishlist-name" label="Your name" error={fieldErrors.full_name}>
                    {(aria) => (
                      <input
                        {...aria}
                        type="text"
                        name="full_name"
                        autoComplete="name"
                        placeholder="e.g. Rahim Uddin"
                        value={form.full_name}
                        onChange={(e) => setField("full_name", e.target.value)}
                      />
                    )}
                  </Field>

                  <Field id="wishlist-phone" label="Phone number" error={fieldErrors.phone_number}>
                    {(aria) => (
                      <input
                        {...aria}
                        type="tel"
                        name="phone_number"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="01XXXXXXXXX"
                        value={form.phone_number}
                        onChange={(e) => setField("phone_number", e.target.value)}
                      />
                    )}
                  </Field>

                  <Field id="wishlist-team-a" label="Team name (yours)" error={fieldErrors.team_name_a}>
                    {(aria) => (
                      <input
                        {...aria}
                        type="text"
                        name="team_name_a"
                        placeholder="e.g. Faridpur FC"
                        value={form.team_name_a}
                        onChange={(e) => setField("team_name_a", e.target.value)}
                      />
                    )}
                  </Field>

                  <Field
                    id="wishlist-team-b"
                    label="Opponent team (optional)"
                    error={fieldErrors.team_name_b}
                  >
                    {(aria) => (
                      <input
                        {...aria}
                        type="text"
                        name="team_name_b"
                        placeholder="Leave empty if not decided"
                        value={form.team_name_b}
                        onChange={(e) => setField("team_name_b", e.target.value)}
                      />
                    )}
                  </Field>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <Field
                    id="wishlist-players"
                    label="Total players"
                    error={fieldErrors.number_of_players}
                  >
                    {(aria) => (
                      <input
                        {...aria}
                        type="number"
                        name="number_of_players"
                        inputMode="numeric"
                        min={2}
                        max={30}
                        placeholder="2–30"
                        value={form.number_of_players}
                        onChange={(e) => setField("number_of_players", e.target.value)}
                      />
                    )}
                  </Field>

                  <Field
                    id="wishlist-date"
                    label="Preferred date (not final)"
                    error={fieldErrors.preferred_date}
                    hint={PREFERENCE_NOTE}
                  >
                    {(aria) => (
                      <input
                        {...aria}
                        type="date"
                        name="preferred_date"
                        min={minDate}
                        value={form.preferred_date}
                        onChange={(e) => setField("preferred_date", e.target.value)}
                      />
                    )}
                  </Field>

                  <Field
                    id="wishlist-time"
                    label="Preferred time (not final)"
                    error={fieldErrors.preferred_time}
                    hint={PREFERENCE_NOTE}
                  >
                    {(aria) => (
                      <input
                        {...aria}
                        type="time"
                        name="preferred_time"
                        value={form.preferred_time}
                        onChange={(e) => setField("preferred_time", e.target.value)}
                      />
                    )}
                  </Field>
                </div>

                {banner && (
                  <p
                    role="alert"
                    className="mt-5 rounded-md border border-primary-dark/30 bg-canvas-soft px-4 py-3 text-body-md text-ink-soft"
                  >
                    {banner}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={phase === "pending"}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {phase === "pending" ? (
                    <>
                      <SpinnerIcon className="size-5" />
                      Submitting…
                    </>
                  ) : (
                    "Join the wishlist"
                  )}
                </button>

                <p className="mt-4 text-caption text-body-mid">
                  One entry per phone number every 24 hours. We&rsquo;ll only use
                  your number to call about your slot.
                </p>
              </form>
            )}
          </BottomSheet>
        )}
      </AnimatePresence>
    </section>
  );
}
