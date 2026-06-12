export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

// Public: submit inquiry from contact form
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, company, message, budget_range } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO inquiries (name, email, phone, company, message, budget_range)
    VALUES (${name}, ${email}, ${phone ?? null}, ${company ?? null}, ${message ?? null}, ${budget_range ?? null})
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

