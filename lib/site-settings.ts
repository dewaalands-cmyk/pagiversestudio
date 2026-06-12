import sql from "@/lib/db";

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await sql`SELECT key, value FROM settings ORDER BY key`;
    return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  } catch {
    return {};
  }
}

export function parseJsonSetting<T>(settings: Record<string, string>, key: string, fallback: T): T {
  const raw = settings[key];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
