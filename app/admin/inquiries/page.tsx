"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable from "@/components/admin/DataTable";
import { getStatusColor, formatDate } from "@/lib/utils";
import type { Inquiry, InquiryStatus } from "@/types";
import { Loader2, RefreshCw, X, MessageSquare } from "lucide-react";

const STATUSES: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "new", label: "Baru" },
  { value: "contacted", label: "Dihubungi" },
  { value: "proposal_sent", label: "Proposal Dikirim" },
  { value: "closed", label: "Ditutup" },
];

function MessageModal({ inquiry, onClose }: { inquiry: Inquiry; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-soft shadow-xl">
        <div className="flex items-center justify-between border-b border-cloud-200 dark:border-white/10 px-6 py-4">
          <div>
            <h3 className="font-semibold text-navy-deep dark:text-white">{inquiry.name}</h3>
            <p className="text-xs text-slate-muted dark:text-slate-label">{inquiry.email}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-muted hover:bg-cloud-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {inquiry.budget_range && (
            <div className="flex gap-2 text-sm">
              <span className="text-slate-muted dark:text-slate-label w-20 shrink-0">Budget</span>
              <span className="font-medium text-navy-deep dark:text-white">{inquiry.budget_range}</span>
            </div>
          )}
          {inquiry.company && (
            <div className="flex gap-2 text-sm">
              <span className="text-slate-muted dark:text-slate-label w-20 shrink-0">Perusahaan</span>
              <span className="font-medium text-navy-deep dark:text-white">{inquiry.company}</span>
            </div>
          )}
          <div className="pt-2 border-t border-cloud-200 dark:border-white/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-muted dark:text-slate-label mb-2">Pesan</p>
            <p className="text-sm text-navy-deep dark:text-cloud-100 leading-relaxed whitespace-pre-wrap">
              {inquiry.message ?? <span className="italic text-slate-muted">Tidak ada pesan</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [selected, setSelected] = useState<Inquiry | null>(null);

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
                key: "message",
                header: "Pesan",
                render: (r) => r.message ? (
                  <button
                    onClick={() => setSelected(r)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-muted dark:text-slate-label hover:text-mint transition-colors max-w-[180px]"
                  >
                    <MessageSquare size={13} className="shrink-0 text-mint" />
                    <span className="truncate">{r.message}</span>
                  </button>
                ) : <span className="text-slate-muted">-</span>,
              },
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

      {selected && (
        <MessageModal inquiry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
