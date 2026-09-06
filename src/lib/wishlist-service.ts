/**
 * Core wishlist logic — framework-agnostic so it can be shared by the
 * Vercel functions (api/wishlist.ts, api/wishlist/count.ts) and the Vite
 * dev-server middleware.
 */

import { Redis } from "@upstash/redis";
import { validateWishlistInput } from "./wishlist-validation.js";

export interface WishlistEnv {
  url: string;
  token: string;
}

export interface HandlerResult {
  status: number;
  json: Record<string, unknown>;
}

const PHONE_TTL_SECONDS = 24 * 60 * 60;

/** Every accepted entry is appended to this list, so `LLEN` on it is the
 * O(1) total entry count — no separate counter key or backfill needed. */
const INDEX_KEY = "wishlist:index";

function redisFromEnv(env: WishlistEnv): Redis | null {
  if (!env.url || !env.token || !env.url.startsWith("https://")) {
    console.error(
      "Upstash Redis is not configured: UPSTASH_REDIS_REST_URL must be the",
      "https:// REST endpoint (not the redis:// connection string) and",
      "UPSTASH_REDIS_REST_TOKEN must be the REST token.",
    );
    return null;
  }
  return new Redis({ url: env.url, token: env.token });
}

export async function handleWishlistPost(
  body: unknown,
  env: WishlistEnv,
): Promise<HandlerResult> {
  const result = validateWishlistInput(body);
  if (!result.ok) {
    return {
      status: 400,
      json: {
        message: "Please check the highlighted fields and try again.",
        errors: result.errors,
      },
    };
  }

  const redis = redisFromEnv(env);
  if (!redis) {
    return {
      status: 500,
      json: {
        message:
          "Something went wrong on our side. Please try again later.",
      },
    };
  }

  const phoneKey = `wishlist:phone:${result.value.phone_number}`;

  try {
    const alreadyRegistered = await redis.set(phoneKey, "1", {
      nx: true,
      ex: PHONE_TTL_SECONDS,
    });
    if (alreadyRegistered === null) {
      return {
        status: 200,
        json: {
          message:
            "You've already registered with this number in the last 24 hours. We'll call you soon — no need to sign up again!",
        },
      };
    }

    const entry_id = crypto.randomUUID();
    const entry = {
      id: entry_id,
      ...result.value,
      submitted_at: new Date().toISOString(),
    };

    await redis.set(`wishlist:${entry_id}`, JSON.stringify(entry));
    await redis.rpush(INDEX_KEY, entry_id);

    return { status: 200, json: { entry_id } };
  } catch (error) {
    console.error("Failed to store wishlist entry", error);
    return {
      status: 500,
      json: {
        message: "Something went wrong on our side. Please try again later.",
      },
    };
  }
}

/** Current total wishlist entry count — a single O(1) `LLEN` on the index
 * list the submit handler already appends to. */
export async function handleWishlistCount(env: WishlistEnv): Promise<HandlerResult> {
  const redis = redisFromEnv(env);
  if (!redis) {
    return {
      status: 500,
      json: {
        message: "Something went wrong on our side. Please try again later.",
      },
    };
  }

  try {
    const count = (await redis.llen(INDEX_KEY)) ?? 0;
    return { status: 200, json: { count } };
  } catch (error) {
    console.error("Failed to read wishlist count", error);
    return {
      status: 500,
      json: {
        message: "Something went wrong on our side. Please try again later.",
      },
    };
  }
}
