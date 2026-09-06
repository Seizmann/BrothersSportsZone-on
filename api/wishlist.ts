import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";
import { validateWishlistInput } from "../src/lib/wishlist-validation";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}

const PHONE_TTL_SECONDS = 24 * 60 * 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;

  const result = validateWishlistInput(body);
  if (!result.ok) {
    return res.status(400).json({
      message: "Please check the highlighted fields and try again.",
      errors: result.errors,
    });
  }

  let db: Redis;
  try {
    db = getRedis();
  } catch {
    console.error("Upstash Redis is not configured");
    return res.status(500).json({ message: "Something went wrong on our side. Please try again later." });
  }

  const phoneKey = `wishlist:phone:${result.value.phone_number}`;
  try {
    const alreadyRegistered = await db.set(phoneKey, "1", { nx: true, ex: PHONE_TTL_SECONDS });
    if (alreadyRegistered === null) {
      return res.status(200).json({
        message: "You've already registered with this number in the last 24 hours. We'll call you soon — no need to sign up again!",
      });
    }

    const entry_id = crypto.randomUUID();
    const entry = {
      id: entry_id,
      ...result.value,
      submitted_at: new Date().toISOString(),
    };

    await db.set(`wishlist:${entry_id}`, JSON.stringify(entry));
    await db.rpush("wishlist:index", entry_id);

    return res.status(200).json({ entry_id });
  } catch (error) {
    console.error("Failed to store wishlist entry", error);
    return res.status(500).json({ message: "Something went wrong on our side. Please try again later." });
  }
}

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
