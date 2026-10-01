export const dynamic = "force-dynamic";

import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import { getTemplateById } from "@/lib/template-library";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function safeConfiguration(template: any, value: unknown) {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const result: Record<string, string> = {};
  for (const field of template.editableFields) {
    const raw = source[field.key];
    if (typeof raw !== "string") continue;
    const limit = field.type === "image" ? 2_200_000 : 5000;
    result[field.key] = raw.slice(0, limit);
  }
  return result;
}

async function insertWithProjectCode(values: {
  templateId: string;
  templateName: string;
  customerName: string;
  businessName: string;
  whatsapp: string;
  email: string;
  notes: string;
  configuration: Record<string, string>;
}) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const projectCode = `PV-${randomInt(1000, 10000)}`;
    try {
      const rows = await sql`
        INSERT INTO template_projects (
          project_code, template_id, template_name, customer_name,
          business_name, whatsapp, email, notes, configuration, status
        ) VALUES (
          ${projectCode}, ${values.templateId}, ${values.templateName}, ${values.customerName},
          ${values.businessName}, ${values.whatsapp}, ${values.email}, ${values.notes || null},
          ${sql.json(values.configuration)}, 'submitted'
        )
        RETURNING id, project_code, status, created_at
      `;
      return rows[0];
    } catch (error: any) {
      if (error?.code !== "23505") throw error;
    }
  }
  throw new Error("Could not generate a unique project code");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = getTemplateById(clean(body.templateId, 120));
    if (!template) return NextResponse.json({ error: "Template tidak ditemukan." }, { status: 404 });

    const customerName = clean(body.customer?.name, 255);
    const email = clean(body.customer?.email, 255).toLowerCase();
    const whatsapp = clean(body.customer?.whatsapp, 30).replace(/[^0-9+\-\s]/g, "");
    const notes = clean(body.customer?.notes, 5000);
    const configuration = safeConfiguration(template, body.configuration);
    const businessName = clean(configuration.businessName, 255);

    if (!customerName || !businessName || !whatsapp || !email) {
      return NextResponse.json({ error: "Nama, nama bisnis, WhatsApp, dan email wajib diisi." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Format email belum benar." }, { status: 400 });
    }

    const result = await insertWithProjectCode({
      templateId: template.id,
      templateName: template.name,
      customerName,
      businessName,
      whatsapp,
      email,
      notes,
      configuration,
    });

    return NextResponse.json({ projectId: result.project_code, status: result.status }, { status: 201 });
  } catch (error) {
    console.error("[template-projects] submit failed", error);
    return NextResponse.json({ error: "Project belum bisa dikirim. Silakan coba lagi atau hubungi Pagiverse." }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = new URL(request.url).searchParams.get("status");
    const allowed = ["draft", "submitted", "processing", "revision", "completed"];
    const rows = status && allowed.includes(status)
      ? await sql`SELECT * FROM template_projects WHERE status = ${status} ORDER BY created_at DESC`
      : await sql`SELECT * FROM template_projects ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("[template-projects] list failed", error);
    return NextResponse.json({ error: "Data project belum dapat dimuat." }, { status: 503 });
  }
}
