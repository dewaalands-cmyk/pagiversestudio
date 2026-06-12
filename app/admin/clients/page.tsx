import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ClientsTable from "@/components/admin/ClientsTable";

async function getClients() {
  try {
    const sql = (await import("@/lib/db")).default;
    return await sql`
      SELECT c.*, u.name, u.email, u.avatar_url,
        COUNT(DISTINCT p.id)::int as project_count,
        COUNT(DISTINCT i.id)::int as invoice_count
      FROM clients c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN projects p ON p.client_id = c.id
      LEFT JOIN invoices i ON i.client_id = c.id
      GROUP BY c.id, u.name, u.email, u.avatar_url
      ORDER BY c.created_at DESC
    `;
  } catch {
    return [];
  }
}

export default async function ClientsAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") redirect("/login");

  const clients = await getClients();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Klien" />
      <main className="flex-1 overflow-y-auto p-6">
        <ClientsTable clients={clients as any[]} />
      </main>
    </div>
  );
}
