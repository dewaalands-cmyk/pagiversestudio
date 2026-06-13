export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // Get user_id first to delete the user record too
  const client = await sql`SELECT user_id FROM clients WHERE id = ${id}`;
  if (!client.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sql`DELETE FROM clients WHERE id = ${id}`;
  await sql`DELETE FROM users WHERE id = ${client[0].user_id} AND role = 'client'`;

  return NextResponse.json({ success: true });
}
