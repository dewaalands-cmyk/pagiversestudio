import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set in .env.local");
    process.exit(1);
  }

  const sql = postgres(url, { ssl: "require" });

  console.log("Connecting to database...");
  const schemaPath = path.join(process.cwd(), "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  console.log("Running schema.sql...");
  // Run each statement separately (split by semicolon)
  const statements = schemaSql
    .split(";")
    .map((s) => {
      // Strip leading comment lines, keep the actual SQL
      const lines = s.split("\n").filter((l) => !l.trim().startsWith("--"));
      return lines.join("\n").trim();
    })
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        console.log(`  Skipped (already exists): ${stmt.slice(0, 60)}...`);
      } else {
        console.error(`  Error on: ${stmt.slice(0, 80)}`);
        console.error(`  ${err.message}`);
      }
    }
  }

  console.log("Schema setup complete!");
  await sql.end();
}

main().catch(console.error);
