/**
 * Wishlist validation — shared by the client form and the /api/wishlist
 * serverless function so the rules can never drift between the two.
 */

import { OPENING_DATE_ISO } from "./target-date";

export interface WishlistPayload {
  full_name: string;
  phone_number: string;
  team_name_a: string;
  team_name_b: string;
  number_of_players: number;
  preferred_date: string;
  preferred_time: string;
}

export type WishlistErrors = Partial<Record<keyof WishlistPayload, string>>;

const MAX_TEXT_LENGTH = 80;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 30;

/** Accepts 01xxxxxxxxx, +8801xxxxxxxxx, 8801xxxxxxxxx, 1xxxxxxxxx and
 * normalizes all of them to the bare 11-digit `01XXXXXXXXX` form. */
export function normalizePhoneNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("880")) digits = digits.slice(3);
  if (digits.length === 10 && digits.startsWith("1")) digits = `0${digits}`;
  return digits;
}

export function isValidBdPhoneNumber(phone: string): boolean {
  return /^01\d{9}$/.test(phone);
}

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isValidTimeString(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [h, m] = value.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

/** Validates an unknown parsed body; on success returns a trimmed,
 * normalized payload ready to persist. */
export function validateWishlistInput(
  raw: unknown,
): { ok: true; value: WishlistPayload } | { ok: false; errors: WishlistErrors } {
  const errors: WishlistErrors = {};

  if (typeof raw !== "object" || raw === null) {
    return { ok: false, errors: { full_name: "Please fill in every field." } };
  }

  const body = raw as Record<string, unknown>;

  const full_name = typeof body.full_name === "string" ? body.full_name.trim() : "";
  if (!full_name) errors.full_name = "Please enter your name.";
  else if (full_name.length > MAX_TEXT_LENGTH)
    errors.full_name = `Name must be ${MAX_TEXT_LENGTH} characters or fewer.`;

  const phone_number = typeof body.phone_number === "string" ? normalizePhoneNumber(body.phone_number) : "";
  if (!phone_number) errors.phone_number = "Please enter your phone number.";
  else if (!isValidBdPhoneNumber(phone_number))
    errors.phone_number = "Enter a valid Bangladeshi number (11 digits, starting with 01).";

  const team_name_a = typeof body.team_name_a === "string" ? body.team_name_a.trim() : "";
  if (!team_name_a) errors.team_name_a = "Please enter the first team's name.";
  else if (team_name_a.length > MAX_TEXT_LENGTH)
    errors.team_name_a = `Team name must be ${MAX_TEXT_LENGTH} characters or fewer.`;

  const team_name_b = typeof body.team_name_b === "string" ? body.team_name_b.trim() : "";
  if (team_name_b.length > MAX_TEXT_LENGTH)
    errors.team_name_b = `Team name must be ${MAX_TEXT_LENGTH} characters or fewer.`;

  const players = body.number_of_players;
  const number_of_players =
    typeof players === "string" ? Number(players) : typeof players === "number" ? players : Number.NaN;
  if (typeof number_of_players !== "number" || !Number.isInteger(number_of_players)) {
    errors.number_of_players = "Enter the number of players.";
  } else if (number_of_players < MIN_PLAYERS || number_of_players > MAX_PLAYERS) {
    errors.number_of_players = `Players must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}.`;
  }

  const preferred_date = typeof body.preferred_date === "string" ? body.preferred_date.trim() : "";
  if (!preferred_date) errors.preferred_date = "Pick a preferred date.";
  else if (!isValidDateString(preferred_date)) errors.preferred_date = "Enter a valid date.";
  else if (preferred_date < OPENING_DATE_ISO)
    errors.preferred_date = "The turf opens on October 1, 2026 — please pick a date on or after opening day.";

  const preferred_time = typeof body.preferred_time === "string" ? body.preferred_time.trim() : "";
  if (!preferred_time) errors.preferred_time = "Pick a preferred time.";
  else if (!isValidTimeString(preferred_time)) errors.preferred_time = "Enter a valid time.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      full_name,
      phone_number,
      team_name_a,
      team_name_b,
      number_of_players,
      preferred_date,
      preferred_time,
    },
  };
}
