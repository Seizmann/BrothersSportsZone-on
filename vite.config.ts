import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { wishlistDevApi } from "./scripts/wishlist-dev-api.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "UPSTASH_REDIS_REST_");
  return {
    plugins: [
      react(),
      tailwindcss(),
      // loadEnv reads .env.local server-side for the wishlist dev API;
      // the credentials never reach the client bundle.
      wishlistDevApi({
        url: env.UPSTASH_REDIS_REST_URL ?? "",
        token: env.UPSTASH_REDIS_REST_TOKEN ?? "",
      }),
    ],
  };
});
