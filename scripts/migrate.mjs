import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Direct connection — requires DB password in DATABASE_URL env var
// or falls back to the connection string below
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

const connectionString =
  process.env.DATABASE_URL ||
  env.DATABASE_URL ||
  "postgresql://postgres:Bouquetproject123w@db.gnncutkqedaujnklyadj.supabase.co:5432/postgres";

const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30,
});

async function run() {
  console.log("Connecting to Supabase…");

  try {
    const schema = readFileSync(resolve(__dirname, "../supabase/schema.sql"), "utf8");
    await sql.unsafe(schema);
    console.log("✅ Schema applied successfully!");

    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
    console.log("\nTables:");
    tables.forEach((t) => console.log("  •", t.tablename));

    const count = await sql`SELECT count(*) FROM public.bouquets`;
    console.log(`\nSample bouquets: ${count[0].count}`);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
