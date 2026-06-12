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
    UPDATE projects
    SET
      name = COALESCE(${body.name ?? null}, name),
      description = COALESCE(${body.description ?? null}, description),
      status = COALESCE(${body.status ?? null}, status),
      start_date = COALESCE(${body.start_date ?? null}, start_date),
      end_date = COALESCE(${body.end_date ?? null}, end_date),
      progress_percentage = COALESCE(${body.progress_percentage ?? null}, progress_percentage)
    WHERE id = ${id}
    RETURNING *
  `;

  if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}
