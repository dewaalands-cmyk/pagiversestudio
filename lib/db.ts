import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  // In dev without DB, auth still works via hardcoded admin in auth.ts.
  // DB features (inquiries, portfolio, etc.) require DATABASE_URL.
  console.warn("[db] DATABASE_URL not set — database features disabled");
}

const dbUrl = process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";
const isRemoteDb = !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1");

const sql = postgres(dbUrl, {
  ssl: isRemoteDb ? "require" : false,
  max: 5,
  idle_timeout: 20,
  connect_timeout: 5,
});

export default sql;
