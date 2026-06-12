export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export async function GET() {
  const items = await sql`
    SELECT * FROM portfolio_items ORDER BY created_at DESC
  `;
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, image_url, category, technologies, link, featured } = body;

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const result = await sql`
    INSERT INTO portfolio_items (title, description, image_url, category, technologies, link, featured)
    VALUES (${title}, ${description ?? null}, ${image_url ?? null}, ${category ?? null}, ${technologies ?? null}, ${link ?? null}, ${featured ?? false})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}

