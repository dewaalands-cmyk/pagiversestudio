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
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 100) : "";
  const company_name = typeof body.company_name === "string" ? body.company_name.trim().slice(0, 100) : null;
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 20) : null;
  const address = typeof body.address === "string" ? body.address.trim().slice(0, 255) : null;
  const user_id = typeof body.user_id === "number" ? body.user_id : null;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  let finalUserId = user_id;

  if (!user_id) {
    const users = await sql`
      INSERT INTO users (name, email, role)
      VALUES (${name}, ${email}, 'client')
      RETURNING id
    `;
    finalUserId = users[0].id;
  }

  const result = await sql`
    INSERT INTO clients (user_id, company_name, phone, address)
    VALUES (${finalUserId}, ${company_name}, ${phone}, ${address})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}

