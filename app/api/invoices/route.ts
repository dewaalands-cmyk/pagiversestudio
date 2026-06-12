export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  if (user.role === "admin") {
    const invoices = status
      ? await sql`SELECT i.*, u.name as client_name, p.name as project_name FROM invoices i JOIN clients c ON c.id = i.client_id JOIN users u ON u.id = c.user_id LEFT JOIN projects p ON p.id = i.project_id WHERE i.status = ${status} ORDER BY i.created_at DESC`
      : await sql`SELECT i.*, u.name as client_name, p.name as project_name FROM invoices i JOIN clients c ON c.id = i.client_id JOIN users u ON u.id = c.user_id LEFT JOIN projects p ON p.id = i.project_id ORDER BY i.created_at DESC`;
    return NextResponse.json(invoices);
  }

  // Client: own invoices only
  const invoices = await sql`
    SELECT i.*, p.name as project_name FROM invoices i
    JOIN clients c ON c.id = i.client_id
    LEFT JOIN projects p ON p.id = i.project_id
    WHERE c.user_id = ${Number(user.id)}
    ORDER BY i.created_at DESC
  `;
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { client_id, project_id, amount, due_date, notes } = body;

  if (!client_id || !amount) {
    return NextResponse.json({ error: "client_id and amount required" }, { status: 400 });
  }

  const invoice_number = generateInvoiceNumber();

  const result = await sql`
    INSERT INTO invoices (client_id, project_id, invoice_number, amount, due_date, notes)
    VALUES (${client_id}, ${project_id ?? null}, ${invoice_number}, ${amount}, ${due_date ?? null}, ${notes ?? null})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}

