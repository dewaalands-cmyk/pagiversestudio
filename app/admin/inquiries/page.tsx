"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable from "@/components/admin/DataTable";
import { getStatusColor, formatDate } from "@/lib/utils";
import type { Inquiry, InquiryStatus } from "@/types";
import { Loader2, RefreshCw } from "lucide-react";

const STATUSES: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "new", label: "Baru" },
  { value: "contacted", label: "Dihubungi" },
  { value: "proposal_sent", label: "Proposal Dikirim" },
  { value: "closed", label: "Ditutup" },
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/inquiries${filter ? `?status=${filter}` : ""}`);
    const data = await res.json();
    setInquiries(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id: number, status: InquiryStatus) {
    setUpdating(id);
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setUpdating(null);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Inquiries" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === s.value
                  ? "bg-mint text-navy-deep"
                  : "bg-cloud-100 dark:bg-white/10 text-slate-muted dark:text-slate-label hover:text-navy-deep dark:hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={load}
            className="ml-auto p-2 rounded-lg text-slate-muted hover:text-navy-deep dark:hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-mint" />
          </div>
        ) : (
          <DataTable
            data={inquiries}
            emptyText="Tidak ada inquiry"
            columns={[
              { key: "name", header: "Nama" },
              { key: "email", header: "Email" },
              {
                key: "phone",
                header: "No. WA",
                render: (r) => {
                  if (!r.phone) return <span className="text-slate-muted">-</span>;
                  const normalized = r.phone.replace(/^0/, "62").replace(/\D/g, "");
                  return (
                    <a
                      href={`https://wa.me/${normalized}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-mint hover:underline font-medium"
                    >
                      {r.phone}
                    </a>
                  );
                },
              },
              { key: "company", header: "Perusahaan", render: (r) => r.company ?? "-" },
              { key: "budget_range", header: "Budget", render: (r) => r.budget_range ?? "-" },
              {
                key: "status",
                header: "Status",
                render: (r) => (
                  <select
                    value={r.status}
                    disabled={updating === r.id}
                    onChange={(e) => updateStatus(r.id, e.target.value as InquiryStatus)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(r.status)} bg-transparent`}
                  >
                    {STATUSES.filter((s) => s.value).map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                ),
              },
              {
                key: "created_at",
                header: "Tanggal",
                render: (r) => formatDate(r.created_at),
              },
            ]}
          />
        )}
      </main>
    </div>
  );
}
