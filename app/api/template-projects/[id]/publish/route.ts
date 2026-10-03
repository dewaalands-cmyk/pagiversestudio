export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import { ensureTemplateProjectsTable } from "@/lib/template-projects-db";

const RESERVED = new Set(["admin", "api", "preview", "site", "sites", "studio", "templates", "login"]);

function normalizeSlug(value: unknown) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 63);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  await ensureTemplateProjectsTable();
  const body = await request.json().catch(() => ({}));
  const current = (await sql`SELECT * FROM template_projects WHERE id = ${id} LIMIT 1`)[0];
  if (!current) return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
  if (!current.preview_token_hash) return NextResponse.json({ error: "Buat link preview sebelum publish." }, { status: 409 });
  const slug = normalizeSlug(body.slug || `${current.business_name}-${current.project_code}`);
  if (slug.length < 3 || RESERVED.has(slug)) return NextResponse.json({ error: "Slug website belum valid." }, { status: 400 });
  try {
    const rows = await sql`
      UPDATE template_projects
      SET slug = ${slug}, published_configuration = configuration, published_at = NOW(), status = 'completed', updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    const origin = new URL(request.url).origin;
    return NextResponse.json({ project: rows[0], publishedUrl: `${origin}/sites/${slug}` });
  } catch (error: any) {
    if (error?.code === "23505") return NextResponse.json({ error: "Slug sudah dipakai project lain." }, { status: 409 });
    throw error;
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  await ensureTemplateProjectsTable();
  const rows = await sql`UPDATE template_projects SET published_at = NULL, updated_at = NOW() WHERE id = ${id} RETURNING *`;
  if (!rows[0]) return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ project: rows[0] });
}
