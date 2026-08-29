import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const SLUGS = [
  "achiq-gusht", "assorti-manti", "assorti-plov", "beef-cutlet", "borsh",
  "carrot-salad", "cottage-pancake", "dumplings-soup", "eggs-sausage", "fresh-salad",
  "fried-lagman", "fries", "gardan-kabob", "golubtsi", "grilled-chicken",
  "gulyash", "hanum", "jiz-biz-fries", "jiz-biz-ribs", "kazan-kebab",
  "kuza-shurpa", "lagmon-soup", "lamb-soup", "manti", "mastava",
  "mujskoy", "norin", "okroshka", "olivie", "plov",
  "qurtob", "salted-cabbage", "salted-pickles", "salty-assorted", "samarkand",
  "shox-kabob", "smak", "suzma", "tandoor-lamb",
];

let spriteBase64Promise;

function getSpriteBase64() {
  if (!spriteBase64Promise) {
    const filePath = path.join(process.cwd(), "public", "assets", "pdf-menu", "food-sprite.webp");
    spriteBase64Promise = readFile(filePath).then((buffer) => buffer.toString("base64"));
  }
  return spriteBase64Promise;
}

export async function GET(_request, { params }) {
  const { slug } = await params;
  const index = SLUGS.indexOf(slug);
  if (index < 0) return new Response("Not found", { status: 404 });

  const col = index % 5;
  const row = Math.floor(index / 5);
  const x = col * 140;
  const y = row * 105;

  try {
    const base64 = await getSpriteBase64();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} 140 105"><image href="data:image/webp;base64,${base64}" x="0" y="0" width="700" height="840"/></svg>`;
    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("menu image render failed", error);
    return new Response("Image unavailable", { status: 500 });
  }
}
