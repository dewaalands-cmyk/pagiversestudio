export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, image_url, category, technologies, link, featured } = body;
  const id = Number(params.id);

  const result = await sql`
    UPDATE portfolio_items
    SET title = ${title}, description = ${description ?? null}, image_url = ${image_url ?? null},
        category = ${category ?? null}, technologies = ${technologies ?? null},
        link = ${link ?? null}, featured = ${featured ?? false}
    WHERE id = ${id}
    RETURNING *
  `;

  if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await sql`DELETE FROM portfolio_items WHERE id = ${Number(params.id)}`;
  return NextResponse.json({ success: true });
}
