import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleWishlistPost } from "../src/lib/wishlist-service";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;

  const result = await handleWishlistPost(body, {
    url: process.env.UPSTASH_REDIS_REST_URL ?? "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  });

  return res.status(result.status).json(result.json);
}

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
