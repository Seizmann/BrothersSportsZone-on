import type { VercelRequest, VercelResponse } from "@vercel/node";
// The .js extension is required: Vercel compiles this to ESM under
// "type": "module", and Node's ESM loader does not resolve extensionless
// relative imports (local Vite does, which is why dev worked).
import { handleWishlistPost } from "../src/lib/wishlist-service.js";

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
