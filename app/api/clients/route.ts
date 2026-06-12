export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await sql`
    SELECT c.*, u.name, u.email, u.avatar_url
    FROM clients c
    JOIN users u ON u.id = c.user_id
    ORDER BY c.created_at DESC
  `;

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { user_id, company_name, phone, address } = body;

  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const result = await sql`
    INSERT INTO clients (user_id, company_name, phone, address)
    VALUES (${user_id}, ${company_name ?? null}, ${phone ?? null}, ${address ?? null})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}

