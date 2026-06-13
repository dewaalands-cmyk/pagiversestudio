export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const approvedOnly = searchParams.get("approved") === "true";
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === "admin";

  const items = approvedOnly || !isAdmin
    ? await sql`SELECT * FROM testimonies WHERE approved = true ORDER BY created_at DESC`
    : await sql`SELECT * FROM testimonies ORDER BY created_at DESC`;

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const client_name = typeof body.client_name === "string" ? body.client_name.trim().slice(0, 100) : "";
  const client_company = typeof body.client_company === "string" ? body.client_company.trim().slice(0, 100) : null;
  const content = typeof body.content === "string" ? body.content.trim().slice(0, 1000) : "";
  const rating = Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5 ? body.rating : null;

  if (!client_name || !content) {
    return NextResponse.json({ error: "Name and content required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === "admin";

  const result = await sql`
    INSERT INTO testimonies (client_name, client_company, content, rating, approved)
    VALUES (${client_name}, ${client_company ?? null}, ${content}, ${rating ?? null}, ${isAdmin})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}

