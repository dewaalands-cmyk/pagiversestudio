"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FolderKanban, Receipt, MessageCircle, TrendingUp } from "lucide-react";
import { getStatusColor, formatRupiah } from "@/lib/utils";
import type { Project, Invoice } from "@/types";

export default function ClientDashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ]).then(([p, i]) => { setProjects(p); setInvoices(i); });
  }, []);

  const pendingInvoices = invoices.filter((i) => i.status === "sent");
  const activeProjects = projects.filter((p) => p.status === "in_progress");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-deep dark:text-white">
          Halo, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-muted dark:text-slate-label mt-1">
          Selamat datang di client portal Pagiverse Studio
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Proyek", value: projects.length, icon: FolderKanban, href: "/client-portal/projects", color: "text-mint" },
          { label: "Proyek Aktif", value: activeProjects.length, icon: TrendingUp, href: "/client-portal/projects", color: "text-blue-500" },
          { label: "Invoice Pending", value: pendingInvoices.length, icon: Receipt, href: "/client-portal/invoices", color: "text-orange-500" },
          { label: "Total Invoice", value: invoices.length, icon: MessageCircle, href: "/client-portal/invoices", color: "text-purple-500" },
        ].map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white dark:bg-navy-soft rounded-xl p-4 border border-cloud-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
          >
            <Icon size={20} className={`${color} mb-2`} />
            <p className="text-2xl font-bold text-navy-deep dark:text-white">{value}</p>
            <p className="text-xs text-slate-muted dark:text-slate-label mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-cloud-200 dark:border-white/10">
            <h2 className="font-semibold text-navy-deep dark:text-white">Proyek Terbaru</h2>
            <Link href="/client-portal/projects" className="text-sm text-mint hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="divide-y divide-cloud-200 dark:divide-white/10">
            {projects.slice(0, 3).map((p) => (
              <div key={p.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-navy-deep dark:text-white">{p.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-cloud-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-mint rounded-full transition-all"
                      style={{ width: `${p.progress_percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-muted dark:text-slate-label">
                    {p.progress_percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 shadow-sm">
          <div className="px-6 py-4 border-b border-cloud-200 dark:border-white/10">
            <h2 className="font-semibold text-navy-deep dark:text-white">Invoice Perlu Dibayar</h2>
          </div>
          <div className="divide-y divide-cloud-200 dark:divide-white/10">
            {pendingInvoices.map((inv) => (
              <div key={inv.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-navy-deep dark:text-white">{inv.invoice_number}</p>
                  <p className="text-xs text-slate-muted dark:text-slate-label">
                    Jatuh tempo: {inv.due_date ?? "-"}
                  </p>
                </div>
                <p className="font-semibold text-navy-deep dark:text-white">
                  {formatRupiah(inv.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
