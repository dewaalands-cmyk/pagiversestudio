export const dynamic = "force-dynamic";

import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import { ensureTemplateProjectsTable } from "@/lib/template-projects-db";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  await ensureTemplateProjectsTable();
  const token = randomBytes(32).toString("hex");
  const digest = createHash("sha256").update(token).digest("hex");
  const rows = await sql`
    UPDATE template_projects
    SET preview_token_hash = ${digest}, preview_expires_at = NOW() + INTERVAL '7 days', updated_at = NOW()
    WHERE id = ${id}
    RETURNING project_code, preview_expires_at
  `;
  if (!rows[0]) return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
  const origin = new URL(request.url).origin;
  return NextResponse.json({ previewUrl: `${origin}/preview/${rows[0].project_code}?token=${token}`, expiresAt: rows[0].preview_expires_at });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  await ensureTemplateProjectsTable();
  await sql`UPDATE template_projects SET preview_token_hash = NULL, preview_expires_at = NULL, updated_at = NOW() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
