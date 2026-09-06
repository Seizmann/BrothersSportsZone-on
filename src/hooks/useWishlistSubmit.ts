/**
 * Optimistic wishlist submit (polish pass §4): the network request fires in
 * the background immediately, but the success state is held for a fixed
 * ~1s "feels-instant" delay so the UI never appears to block on latency.
 * A real failure — non-2xx, timeout, network error — always wins: success is
 * never shown, and the error state carries a retry of the same payload.
 *
 * onConfirmed is invoked once per accepted submission (duplicate-phone
 * "already registered" replies included, since those entries are also in the
 * count) and only when the server returned an entry_id — never on retries.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { WishlistErrors, WishlistPayload } from "../lib/wishlist-validation";

export type SubmitPhase = "idle" | "pending" | "success" | "error";

/** Fixed delay before the success state is revealed, independent of network. */
const MIN_SUCCESS_DELAY_MS = 1000;

interface FetchResult {
  ok: boolean;
  status: number;
  data: { entry_id?: string; message?: string; errors?: WishlistErrors };
}

export function useWishlistSubmit(onConfirmed?: () => void) {
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [successMessage, setSuccessMessage] = useState(
    "We'll call you closer to opening day!",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [serverErrors, setServerErrors] = useState<WishlistErrors>({});

  const lastPayload = useRef<WishlistPayload | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  const onConfirmedRef = useRef(onConfirmed);
  onConfirmedRef.current = onConfirmed;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const settle = useCallback((result: FetchResult | null, elapsed: boolean) => {
    if (!result || !elapsed || !alive.current) return;

    if (result.ok) {
      if (result.data.entry_id) onConfirmedRef.current?.();
      if (result.data.message) setSuccessMessage(result.data.message);
      setPhase("success");
      return;
    }

    if (result.status === 400 && result.data.errors) {
      setServerErrors(result.data.errors);
    }
    setErrorMessage(
      result.data.message ??
        "We couldn't add you to the wishlist — your entry was not saved. Please try again.",
    );
    setPhase("error");
  }, []);

  /** Fire-and-forget the request; resolve UI state per the optimistic rules. */
  const run = useCallback(
    (payload: WishlistPayload) => {
      setPhase("pending");

      let result: FetchResult | null = null;
      let elapsed = false;

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        elapsed = true;
        settle(result, elapsed);
      }, MIN_SUCCESS_DELAY_MS);

      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      })
        .then(async (response) => ({
          ok: response.ok,
          status: response.status,
          data: await response.json().catch(() => ({})),
        }))
        .catch(() => ({
          ok: false,
          status: 0,
          data: {} as FetchResult["data"],
        }))
        .then((r: FetchResult) => {
          result = r;
          settle(result, elapsed);
        });
    },
    [settle],
  );

  const submit = useCallback(
    (payload: WishlistPayload) => {
      lastPayload.current = payload;
      run(payload);
    },
    [run],
  );

  /** Re-send the exact payload from the last attempt. */
  const retry = useCallback(() => {
    if (lastPayload.current) run(lastPayload.current);
  }, [run]);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    lastPayload.current = null;
    setPhase("idle");
    setServerErrors({});
    setErrorMessage("");
    setSuccessMessage("We'll call you closer to opening day!");
  }, []);

  return { phase, successMessage, errorMessage, serverErrors, submit, retry, reset };
}
