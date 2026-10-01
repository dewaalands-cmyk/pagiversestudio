export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

const STATUSES = ["draft", "submitted", "processing", "revision", "completed"];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(session && (session.user as any).role === "admin");
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  try {
    const rows = await sql`SELECT * FROM template_projects WHERE id = ${id} LIMIT 1`;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Data project belum dapat dimuat." }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  try {
    const body = await request.json();
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const rows = await sql`
      UPDATE template_projects SET status = ${body.status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Status belum dapat diperbarui." }, { status: 503 });
  }
}
