export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = Number(params.id);

  const result = await sql`
    UPDATE testimonies
    SET
      approved = COALESCE(${body.approved ?? null}, approved),
      client_name = COALESCE(${body.client_name ?? null}, client_name),
      client_company = COALESCE(${body.client_company ?? null}, client_company),
      content = COALESCE(${body.content ?? null}, content),
      rating = COALESCE(${body.rating ?? null}, rating)
    WHERE id = ${id}
    RETURNING *
  `;

  if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await sql`DELETE FROM testimonies WHERE id = ${Number(params.id)}`;
  return NextResponse.json({ success: true });
}
