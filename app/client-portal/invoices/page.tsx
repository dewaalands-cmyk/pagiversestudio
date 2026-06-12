"use client";

import { useEffect, useState } from "react";
import { getStatusColor, formatRupiah, formatDate } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/types";
import { Loader2, Download } from "lucide-react";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Dikirim",
  paid: "Lunas",
  overdue: "Terlambat",
  cancelled: "Dibatalkan",
};

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((d) => { setInvoices(d); setLoading(false); });
  }, []);

  const filtered = filter ? invoices.filter((i) => i.status === filter) : invoices;
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "sent").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-navy-deep dark:text-white">Invoice</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Total Lunas</p>
          <p className="text-xl font-bold text-green-800 dark:text-green-300">{formatRupiah(totalPaid)}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-orange-700 dark:text-orange-400 font-medium mb-1">Total Pending</p>
          <p className="text-xl font-bold text-orange-800 dark:text-orange-300">{formatRupiah(totalPending)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "sent", "paid", "overdue"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s
                ? "bg-mint text-navy-deep"
                : "bg-cloud-100 dark:bg-white/10 text-slate-muted dark:text-slate-label hover:text-navy-deep dark:hover:text-white"
            }`}
          >
            {s === "" ? "Semua" : STATUS_LABEL[s as InvoiceStatus]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-mint" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy-deep dark:text-white">{inv.invoice_number}</p>
                  {(inv as any).project_name && (
                    <p className="text-sm text-slate-muted dark:text-slate-label mt-0.5">
                      {(inv as any).project_name}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                      {STATUS_LABEL[inv.status]}
                    </span>
                    {inv.due_date && (
                      <span className="text-xs text-slate-muted dark:text-slate-label">
                        Due: {formatDate(inv.due_date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-navy-deep dark:text-white">
                    {formatRupiah(inv.amount)}
                  </p>
                  <p className="text-xs text-slate-muted dark:text-slate-label mt-0.5">
                    {formatDate(inv.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-slate-muted dark:text-slate-label py-12 text-sm">
              Tidak ada invoice
            </p>
          )}
        </div>
      )}
    </div>
  );
}
