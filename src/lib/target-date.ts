/**
 * Opening day: October 1, 2026, 00:00 Asia/Dhaka (UTC+6, no DST).
 * 2026-09-30T18:00:00Z + 6h = 2026-10-01T00:00+06:00
 */
export const OPENING_EPOCH_MS = Date.UTC(2026, 8, 30, 18, 0, 0);

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOpen: boolean;
}

export function timeRemaining(nowMs: number = Date.now()): TimeRemaining {
  const diff = Math.max(0, OPENING_EPOCH_MS - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isOpen: diff === 0,
  };
}
