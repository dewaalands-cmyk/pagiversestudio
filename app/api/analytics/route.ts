export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

const ALLOWED_EVENTS = new Set(["page_view", "click", "form_submit", "scroll"]);

// Public: track event
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event_type = typeof body.event_type === "string" ? body.event_type.slice(0, 50) : "";
  const page_path = typeof body.page_path === "string" ? body.page_path.slice(0, 300) : null;
  const session_id = typeof body.session_id === "string" ? body.session_id.slice(0, 100) : null;

  if (!ALLOWED_EVENTS.has(event_type)) {
    return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
  }

  await sql`
    INSERT INTO analytics_events (event_type, page_path, session_id)
    VALUES (${event_type}, ${page_path}, ${session_id})
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
  const days = Math.min(Math.max(Math.floor(Number(searchParams.get("days"))) || 30, 1), 365);

  const [pageViews, topPages, eventCounts] = await Promise.all([
    sql`
      SELECT to_char(d.day, 'YYYY-MM-DD') as date, COALESCE(COUNT(a.id), 0)::int as views
      FROM generate_series(
        (CURRENT_DATE - ((${days} - 1) || ' days')::INTERVAL),
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS d(day)
      LEFT JOIN analytics_events a
        ON DATE(a.timestamp) = d.day::date
        AND a.event_type = 'page_view'
      GROUP BY d.day
      ORDER BY d.day ASC
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

