export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export async function GET() {
  const settings = await sql`SELECT key, value FROM settings ORDER BY key`;
  const obj = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json(obj);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const entries = Object.entries(body) as [string, string][];

  for (const [key, value] of entries) {
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }

  return NextResponse.json({ success: true });
}

