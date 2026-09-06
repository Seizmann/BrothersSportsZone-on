/**
 * Vite dev middleware — serves POST /api/wishlist during `npm run dev` so the
 * form works without `vercel dev`. Production uses api/wishlist.ts instead.
 * Reads credentials from .env.local (UPSTASH_REDIS_REST_URL / _TOKEN).
 */

import { handleWishlistPost } from "../src/lib/wishlist-service";

/**
 * Vite dev middleware — serves POST /api/wishlist during `npm run dev` so the
 * form works without `vercel dev`. Production uses api/wishlist.ts instead.
 * Credentials come from .env.local via vite.config.ts (loadEnv), keeping them
 * server-side only.
 *
 * @param {{ url: string, token: string }} env Upstash REST credentials.
 */
export function wishlistDevApi(env) {
  return {
    name: "wishlist-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/api/wishlist") {
          next();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Allow", "POST");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Method not allowed." }));
          return;
        }

        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const raw = Buffer.concat(chunks).toString("utf8");

        let body = null;
        try {
          body = JSON.parse(raw);
        } catch {
          body = null;
        }

        const result = await handleWishlistPost(body, env);
        res.statusCode = result.status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result.json));
      });
    },
  };
}
