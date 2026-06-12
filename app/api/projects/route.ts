export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");

  if (user.role === "admin") {
    const projects = clientId
      ? await sql`SELECT p.*, c.company_name, u.name as client_name FROM projects p JOIN clients c ON c.id = p.client_id JOIN users u ON u.id = c.user_id WHERE p.client_id = ${Number(clientId)} ORDER BY p.created_at DESC`
      : await sql`SELECT p.*, c.company_name, u.name as client_name FROM projects p JOIN clients c ON c.id = p.client_id JOIN users u ON u.id = c.user_id ORDER BY p.created_at DESC`;
    return NextResponse.json(projects);
  }

  // Client: only own projects
  const projects = await sql`
    SELECT p.* FROM projects p
    JOIN clients c ON c.id = p.client_id
    WHERE c.user_id = ${Number(user.id)}
    ORDER BY p.created_at DESC
  `;
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { client_id, name, description, status, start_date, end_date, progress_percentage } = body;

  if (!client_id || !name) {
    return NextResponse.json({ error: "client_id and name required" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO projects (client_id, name, description, status, start_date, end_date, progress_percentage)
    VALUES (${client_id}, ${name}, ${description ?? null}, ${status ?? "planning"}, ${start_date ?? null}, ${end_date ?? null}, ${progress_percentage ?? 0})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}

