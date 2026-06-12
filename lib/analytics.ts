import sql from "@/lib/db";

export async function trackEvent(
  eventType: string,
  pagePath?: string,
  sessionId?: string,
  userId?: number
) {
  try {
    await sql`
      INSERT INTO analytics_events (event_type, page_path, session_id, user_id)
      VALUES (${eventType}, ${pagePath ?? null}, ${sessionId ?? null}, ${userId ?? null})
    `;
  } catch {
    // Non-blocking: analytics tracking should never crash the app
  }
}

export async function getPageViews(days = 30) {
  const safeDays = Math.min(Math.max(Math.floor(Number(days)) || 30, 1), 365);
  const rows = await sql`
    SELECT
      DATE(timestamp) as date,
      COUNT(*) as views
    FROM analytics_events
    WHERE event_type = 'page_view'
      AND timestamp >= NOW() - (${safeDays} || ' days')::INTERVAL
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
  `;
  return rows;
}

export async function getTopPages(limit = 10) {
  const rows = await sql`
    SELECT
      page_path,
      COUNT(*) as views
    FROM analytics_events
    WHERE event_type = 'page_view'
      AND page_path IS NOT NULL
    GROUP BY page_path
    ORDER BY views DESC
    LIMIT ${limit}
  `;
  return rows;
}

export async function getTotalVisitors(days = 30) {
  const safeDays = Math.min(Math.max(Math.floor(Number(days)) || 30, 1), 365);
  const rows = await sql`
    SELECT COUNT(DISTINCT session_id) as total
    FROM analytics_events
    WHERE event_type = 'page_view'
      AND timestamp >= NOW() - (${safeDays} || ' days')::INTERVAL
  `;
  return Number(rows[0]?.total ?? 0);
}
