/**
 * Core wishlist submit logic — framework-agnostic so it can be shared by the
 * Vercel function (api/wishlist.ts) and the Vite dev-server middleware.
 */

import { Redis } from "@upstash/redis";
import { validateWishlistInput } from "./wishlist-validation";

export interface WishlistEnv {
  url: string;
  token: string;
}

export interface HandlerResult {
  status: number;
  json: Record<string, unknown>;
}

const PHONE_TTL_SECONDS = 24 * 60 * 60;

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

  if (!env.url || !env.token) {
    console.error("Upstash Redis is not configured");
    return {
      status: 500,
      json: {
        message:
          "Something went wrong on our side. Please try again later.",
      },
    };
  }

  const redis = new Redis({ url: env.url, token: env.token });
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
    await redis.rpush("wishlist:index", entry_id);

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
