export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

// Public: track event
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { event_type, page_path, session_id } = body;

  if (!event_type) return NextResponse.json({ error: "event_type required" }, { status: 400 });

  await sql`
    INSERT INTO analytics_events (event_type, page_path, session_id)
    VALUES (${event_type}, ${page_path ?? null}, ${session_id ?? null})
  `;

  return NextResponse.json({ ok: true });
}

// Admin: get analytics data
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? "30");

  const [pageViews, topPages, eventCounts] = await Promise.all([
    sql`
      SELECT DATE(timestamp) as date, COUNT(*)::int as views
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND timestamp >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `,
    sql`
      SELECT page_path, COUNT(*)::int as views
      FROM analytics_events
      WHERE event_type = 'page_view' AND page_path IS NOT NULL
        AND timestamp >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `,
    sql`
      SELECT event_type, COUNT(*)::int as count
      FROM analytics_events
      WHERE timestamp >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY event_type
      ORDER BY count DESC
    `,
  ]);

  return NextResponse.json({ pageViews, topPages, eventCounts });
}

