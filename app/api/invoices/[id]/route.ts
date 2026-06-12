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

  const paidAt = body.status === "paid" ? new Date().toISOString() : null;

  const result = await sql`
    UPDATE invoices
    SET
      status = COALESCE(${body.status ?? null}, status),
      amount = COALESCE(${body.amount ?? null}, amount),
      due_date = COALESCE(${body.due_date ?? null}, due_date),
      notes = COALESCE(${body.notes ?? null}, notes),
      paid_at = CASE WHEN ${body.status ?? ""} = 'paid' THEN NOW() ELSE paid_at END
    WHERE id = ${id}
    RETURNING *
  `;

  if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}
