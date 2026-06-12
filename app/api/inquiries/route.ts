export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLen) : null;
}

// Public: submit inquiry from contact form
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 30);
  const company = clean(body.company, 100);
  const message = clean(body.message, 5000);
  const budget_range = clean(body.budget_range, 50);

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO inquiries (name, email, phone, company, message, budget_range)
    VALUES (${name}, ${email}, ${phone}, ${company}, ${message}, ${budget_range})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}

// Admin: get all inquiries
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const items = status
    ? await sql`SELECT * FROM inquiries WHERE status = ${status} ORDER BY created_at DESC`
    : await sql`SELECT * FROM inquiries ORDER BY created_at DESC`;

  return NextResponse.json(items);
}

