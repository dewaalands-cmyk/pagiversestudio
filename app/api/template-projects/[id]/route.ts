export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import { ensureTemplateProjectsTable } from "@/lib/template-projects-db";
import { fieldHasValue, getTemplateById, getTemplateFields, sanitizeTemplateConfiguration } from "@/lib/template-library";

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
    await ensureTemplateProjectsTable();
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
    await ensureTemplateProjectsTable();
    const body = await request.json();
    const currentRows = await sql`SELECT * FROM template_projects WHERE id = ${id} LIMIT 1`;
    const current = currentRows[0];
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const hasStatus = body.status !== undefined;
    const hasConfiguration = body.configuration !== undefined;
    if (!hasStatus && !hasConfiguration) return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });
    if (hasStatus && !STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    let configuration = current.configuration;
    let businessName = current.business_name;
    if (hasConfiguration) {
      const template = getTemplateById(current.template_id);
      if (!template) return NextResponse.json({ error: "Template sumber tidak tersedia." }, { status: 409 });
      configuration = sanitizeTemplateConfiguration(template, body.configuration);
      businessName = String(configuration["business.name"] || "").trim().slice(0, 255);
      const missingRequired = getTemplateFields(template)
        .filter((field: any) => field.required && !fieldHasValue(field, configuration[field.key]))
        .map((field: any) => field.key);
      if (!businessName || missingRequired.length) {
        return NextResponse.json({ error: "Field wajib pada website belum lengkap.", fields: missingRequired }, { status: 400 });
      }
    }

    const nextStatus = hasStatus ? body.status : current.status;
    const rows = await sql`
      UPDATE template_projects
      SET status = ${nextStatus}, configuration = ${sql.json(configuration as any)},
          business_name = ${businessName}, revision = revision + ${hasConfiguration ? 1 : 0}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Status belum dapat diperbarui." }, { status: 503 });
  }
}
