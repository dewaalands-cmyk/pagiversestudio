export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import { getTemplateById } from "@/lib/template-library";
import { ensureTemplateProjectsTable } from "@/lib/template-projects-db";
import { buildTemplateProjectZip } from "@/lib/template-project-artifacts";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  await ensureTemplateProjectsTable();
  const project = (await sql`SELECT * FROM template_projects WHERE id = ${id} LIMIT 1`)[0];
  if (!project) return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
  const template = getTemplateById(project.template_id);
  if (!template) return NextResponse.json({ error: "Template sumber tidak tersedia." }, { status: 409 });
  const archive = await buildTemplateProjectZip(template, project.configuration, project.project_code);
  const filename = `${project.project_code.toLowerCase()}-${String(project.business_name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "website"}.zip`;
  const body = archive.buffer.slice(archive.byteOffset, archive.byteOffset + archive.byteLength) as ArrayBuffer;
  return new Response(body, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" } });
}
