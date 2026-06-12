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

  if (user.role === "admin" && clientId) {
    const messages = await sql`
      SELECT m.*, u.name as sender_name, u.role as sender_role
      FROM messages m JOIN users u ON u.id = m.sender_id
      WHERE m.client_id = ${Number(clientId)}
      ORDER BY m.created_at ASC
    `;
    return NextResponse.json(messages);
  }

  // Client: own messages
  const client = await sql`SELECT id FROM clients WHERE user_id = ${Number(user.id)} LIMIT 1`;
  if (!client.length) return NextResponse.json([]);

  const messages = await sql`
    SELECT m.*, u.name as sender_name, u.role as sender_role
    FROM messages m JOIN users u ON u.id = m.sender_id
    WHERE m.client_id = ${client[0].id}
    ORDER BY m.created_at ASC
  `;

  // Mark as read
  await sql`
    UPDATE messages SET read = true
    WHERE client_id = ${client[0].id} AND recipient_id = ${Number(user.id)}
  `;

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { content, client_id, recipient_id } = body;

  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  let resolvedClientId = client_id;
  let resolvedRecipientId = recipient_id;

  if (user.role === "client") {
    const client = await sql`SELECT id, user_id FROM clients WHERE user_id = ${Number(user.id)} LIMIT 1`;
    if (!client.length) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    resolvedClientId = client[0].id;
    // Default recipient: admin (role = 'admin')
    const admin = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    resolvedRecipientId = admin[0]?.id;
  }

  const result = await sql`
    INSERT INTO messages (sender_id, recipient_id, client_id, content)
    VALUES (${Number(user.id)}, ${resolvedRecipientId}, ${resolvedClientId}, ${content})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}

