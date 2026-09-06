import { useState, type FormEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  validateWishlistInput,
  type WishlistErrors,
} from "../lib/wishlist-validation";
import { OPENING_DATE_ISO } from "../lib/target-date";
import { CheckIcon, ClipboardListIcon, SpinnerIcon } from "./icons";

const EASE = [0.16, 1, 0.3, 1] as const;

const PREFERENCE_NOTE =
  "This is just your preference. We'll call you to confirm the actual schedule once we're open.";

const SUCCESS_MESSAGE = "We'll call you closer to opening day!";

type Status = "idle" | "submitting" | "success";

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

export default function Wishlist() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<WishlistErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [successMessage, setSuccessMessage] = useState(SUCCESS_MESSAGE);

  function setField(key: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setBanner(null);

    const parsed = validateWishlistInput(form);

    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.value),
      });
      const data: { entry_id?: string; message?: string; errors?: WishlistErrors } =
        await response.json().catch(() => ({}));

      if (response.ok) {
        if (data.message) {
          // Duplicate registration — friendly notice, not an error.
          setSuccessMessage(data.message);
        }
        setStatus("success");
        return;
      }

      if (response.status === 400 && data.errors) {
        setErrors(data.errors);
        setBanner(data.message ?? "Please check the highlighted fields and try again.");
        return;
      }

      setBanner(data.message ?? "Something went wrong. Please try again.");
    } catch {
      setBanner("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setStatus((prev) => (prev === "success" ? prev : "idle"));
    }
  }

  function resetForm() {
    setForm(initialForm);
    setErrors({});
    setBanner(null);
    setSuccessMessage(SUCCESS_MESSAGE);
    setStatus("idle");
  }

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
          className="rounded-md bg-canvas px-6 py-10 sm:px-10 sm:py-12"
        >
          {status === "success" ? (
            <div className="mx-auto max-w-md text-center" role="status">
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-on-primary">
                <CheckIcon className="size-7" />
              </span>
              <h2 id="wishlist-heading" className="mt-6 text-display-md text-ink">
                You&rsquo;re on the wishlist!
              </h2>
              <p className="mt-3 text-body-lg text-body-mid">{successMessage}</p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-8 rounded-md border border-mute/60 px-5 py-2.5 text-body-md font-medium text-ink-soft transition-colors hover:border-ink-soft"
              >
                Register another team
              </button>
            </div>
          ) : (
            <>
              <div className="mx-auto max-w-xl text-center">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-canvas-soft text-primary">
                  <ClipboardListIcon className="size-6" />
                </span>
                <h2 id="wishlist-heading" className="mt-4 text-display-md text-ink">
                  Join the wishlist
                </h2>
                <p className="mt-3 text-body-lg text-body-mid">
                  Planning a match once the turf opens? Leave your details and
                  we&rsquo;ll call you back to lock in your slot. No payment, no
                  commitment — just early interest.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="mx-auto mt-10 max-w-2xl">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field id="wishlist-name" label="Your name" error={errors.full_name}>
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

                  <Field id="wishlist-phone" label="Phone number" error={errors.phone_number}>
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

                  <Field id="wishlist-team-a" label="Team name (yours)" error={errors.team_name_a}>
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
                    error={errors.team_name_b}
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
                    error={errors.number_of_players}
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
                    error={errors.preferred_date}
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
                    error={errors.preferred_time}
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
                  disabled={status === "submitting"}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {status === "submitting" ? (
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
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
