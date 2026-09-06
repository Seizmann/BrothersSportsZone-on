/**
 * Dev-only asset generator: renders SVG sources in assets-src/ to the PNGs in
 * public/ that crawlers and iOS need. Run: npm run generate-assets
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = (name) => readFileSync(join(root, "assets-src", name), "utf8");
const fontFile = join(
  root,
  "public",
  "fonts",
  "inter-latin-wght-normal.woff2",
);

const font = readFileSync(fontFile);

function render(svgText, sizes) {
  const resvg = new Resvg(svgText, {
    fitTo: sizes.fitTo,
    font: {
      fontFiles: [{ name: "Inter Variable", data: font, weight: 400 }],
      loadSystemFonts: false,
    },
  });
  return resvg.render().asPng();
}

const ogPng = render(src("og.svg"), { mode: "width", value: 1200 });
writeFileSync(join(root, "public", "og.png"), ogPng);

const applePng = render(src("favicon.svg"), { mode: "width", value: 180 });
writeFileSync(join(root, "public", "apple-touch-icon.png"), applePng);

const icon32Png = render(src("favicon.svg"), { mode: "width", value: 32 });
writeFileSync(join(root, "public", "icon-32.png"), icon32Png);

console.log("Generated public/og.png, public/apple-touch-icon.png, public/icon-32.png");
