import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCard from "@/components/admin/StatsCard";
import { formatRupiah, formatDate, getStatusColor } from "@/lib/utils";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Wallet,
  Clock,
  Database,
} from "lucide-react";
import type { Inquiry } from "@/types";

const EMPTY_DATA = {
  inquiries: { this_month: 0, all_time: 0, new_count: 0 },
  clients: 0,
  revenue: { paid: 0, pending: 0 },
  recentInquiries: [] as Inquiry[],
  activeProjects: 0,
  dbConnected: false,
};

async function getDashboardData() {
  try {
    const sql = (await import("@/lib/db")).default;
    const [inquiryStats, clientCount, revenueStats, recentInquiries, projectStats] =
      await Promise.all([
        sql`
          SELECT
            COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW()))::int as this_month,
            COUNT(*)::int as all_time,
            COUNT(*) FILTER (WHERE status = 'new')::int as new_count
          FROM inquiries
        `,
        sql`SELECT COUNT(*)::int as total FROM clients`,
        sql`
          SELECT
            COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0)::float as paid,
            COALESCE(SUM(amount) FILTER (WHERE status IN ('sent', 'draft')), 0)::float as pending
          FROM invoices
        `,
        sql`SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5`,
        sql`SELECT COUNT(*) FILTER (WHERE status = 'in_progress')::int as active FROM projects`,
      ]);

    return {
      inquiries: inquiryStats[0],
      clients: clientCount[0].total,
      revenue: revenueStats[0],
      recentInquiries: recentInquiries as unknown as Inquiry[],
      activeProjects: projectStats[0].active,
      dbConnected: true,
    };
  } catch {
    return EMPTY_DATA;
  }
}

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") redirect("/login");

  const data = await getDashboardData();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Overview" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* DB not connected banner */}
        {!data.dbConnected && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 text-sm">
            <Database size={16} className="shrink-0" />
            <span>
              Database belum terhubung. Isi <code className="font-mono bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">DATABASE_URL</code> di <code className="font-mono bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">.env.local</code> lalu restart server untuk mengaktifkan semua fitur.
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Inquiries Bulan Ini"
            value={data.inquiries.this_month}
            subtitle={`${data.inquiries.new_count} baru · ${data.inquiries.all_time} total`}
            icon={MessageSquare}
            color="mint"
          />
          <StatsCard
            title="Total Klien"
            value={data.clients}
            subtitle={`${data.activeProjects} proyek aktif`}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Revenue Terbayar"
            value={formatRupiah(data.revenue.paid)}
            icon={Wallet}
            color="purple"
          />
          <StatsCard
            title="Revenue Pending"
            value={formatRupiah(data.revenue.pending)}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-cloud-200 dark:border-white/10">
            <h2 className="font-semibold text-navy-deep dark:text-white">Inquiry Terbaru</h2>
            <a href="/admin/inquiries" className="text-sm text-mint hover:underline">
              Lihat semua
            </a>
          </div>
          <div className="divide-y divide-cloud-200 dark:divide-white/10">
            {data.recentInquiries.length === 0 ? (
              <p className="px-6 py-8 text-center text-slate-muted dark:text-slate-label text-sm">
                {data.dbConnected ? "Belum ada inquiry" : "Hubungkan database untuk melihat data"}
              </p>
            ) : (
              data.recentInquiries.map((inq) => (
                <div key={inq.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-navy-deep dark:text-white truncate">{inq.name}</p>
                    <p className="text-sm text-slate-muted dark:text-slate-label">{inq.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(inq.status)}`}>
                      {inq.status}
                    </span>
                    <span className="text-xs text-slate-muted dark:text-slate-label hidden sm:block">
                      <Clock size={12} className="inline mr-1" />
                      {formatDate(inq.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
