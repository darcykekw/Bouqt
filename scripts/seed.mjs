/**
 * Run AFTER executing supabase/schema.sql in the Supabase SQL Editor.
 * Inserts sample bouquets using the service role key.
 *
 *   node scripts/seed.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const bouquets = [
  {
    name: "Sunrise Garden",
    description:
      "A bright mix of sunflowers, yellow roses, and baby's breath. Like waking up to golden light.",
    price: 850.0,
    stock_quantity: 12,
    is_available: true,
  },
  {
    name: "Soft Blush Romance",
    description:
      "Blush peonies, dusty pink roses, and eucalyptus. Made for the moments that feel like poetry.",
    price: 1200.0,
    stock_quantity: 8,
    is_available: true,
  },
  {
    name: "Purple Dream",
    description:
      "Lavender, purple lisianthus, and white freesia. Fresh, calming, and absolutely stunning.",
    price: 950.0,
    stock_quantity: 6,
    is_available: true,
  },
  {
    name: "Classic Red Elegance",
    description:
      "Twelve red roses wrapped with care. Because some feelings are best said with red.",
    price: 1100.0,
    stock_quantity: 15,
    is_available: true,
  },
  {
    name: "Wildflower Joy",
    description:
      "Chamomile, daisies, and seasonal blooms. A little bit wild, a whole lot of happy.",
    price: 750.0,
    stock_quantity: 10,
    is_available: true,
  },
  {
    name: "White Wedding",
    description:
      "White lilies, ivory roses, and delicate greenery. Pure, clean, and timelessly beautiful.",
    price: 1350.0,
    stock_quantity: 5,
    is_available: true,
  },
];

console.log("Seeding bouquets…");

const { data, error } = await supabase
  .from("bouquets")
  .upsert(bouquets, { onConflict: "name", ignoreDuplicates: true })
  .select("name, price");

if (error) {
  console.error("✗ Error:", error.message);
  console.log("\nMake sure you've run supabase/schema.sql in the SQL Editor first.");
  process.exit(1);
}

console.log(`\n✅ Seeded ${data.length} bouquets:\n`);
data.forEach((b) => console.log(`  • ${b.name} — ₱${b.price}`));
console.log("\nDone! Start the dev server: npm run dev\n");
