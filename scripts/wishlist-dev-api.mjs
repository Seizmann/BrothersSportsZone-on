/**
 * Vite dev middleware — serves GET /api/wishlist/count and POST
 * /api/wishlist during `npm run dev` so the form and counter work without
 * `vercel dev`. Production uses api/wishlist.ts and api/wishlist/count.ts
 * instead. Reads credentials from .env.local (UPSTASH_REDIS_REST_URL /
 * _TOKEN) via vite.config.ts (loadEnv), keeping them server-side only.
 *
 * @param {{ url: string, token: string }} env Upstash REST credentials.
 */

import { handleWishlistPost, handleWishlistCount } from "../src/lib/wishlist-service";

function sendJson(res, status, json) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(json));
}

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
        // Count endpoint: GET /api/wishlist/count.
        if (req.url === "/api/wishlist/count") {
          if (req.method !== "GET") {
            res.setHeader("Allow", "GET");
            sendJson(res, 405, { message: "Method not allowed." });
            return;
          }
          try {
            const result = await handleWishlistCount(env);
            sendJson(res, result.status, result.json);
          } catch (error) {
            console.error("wishlist count dev api error", error);
            sendJson(res, 500, {
              message: "Something went wrong on our side. Please try again later.",
            });
          }
          return;
        }

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

        let result;
        try {
          result = await handleWishlistPost(body, env);
        } catch (error) {
          // Never let a Redis/network error crash the dev server or the page;
          // mirror the production function's clean-JSON error contract.
          console.error("wishlist dev api error", error);
          result = {
            status: 500,
            json: { message: "Something went wrong on our side. Please try again later." },
          };
        }
        res.statusCode = result.status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result.json));
      });
    },
  };
}
