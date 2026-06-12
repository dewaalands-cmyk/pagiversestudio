/**
 * Run: npx ts-node -e "require('./scripts/seed.ts')"
 * Or: npx tsx scripts/seed.ts
 *
 * Creates default admin user in the database.
 */
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL!;
  const isRemote = !url.includes("localhost") && !url.includes("127.0.0.1");
  const sql = postgres(url, { ssl: isRemote ? "require" : false });
  const email = process.env.ADMIN_EMAIL ?? "admin@pagiversestudio.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO users (name, email, password, role)
    VALUES ('Admin Pagiverse', ${email}, ${hash}, 'admin')
    ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
  `;

  console.log(`Admin user seeded: ${email}`);
  await sql.end();
}

main().catch(console.error);
