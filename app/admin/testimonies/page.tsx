"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable from "@/components/admin/DataTable";
import { Check, X, Star, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Testimony } from "@/types";

export default function TestimoniesAdminPage() {
  const [items, setItems] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/testimonies");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleApprove(item: Testimony) {
    setUpdating(item.id);
    await fetch(`/api/testimonies/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !item.approved }),
    });
    await load();
    setUpdating(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus testimoni ini?")) return;
    setUpdating(id);
    await fetch(`/api/testimonies/${id}`, { method: "DELETE" });
    await load();
    setUpdating(null);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Testimoni" />
      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-mint" />
          </div>
        ) : (
          <DataTable
            data={items}
            emptyText="Belum ada testimoni"
            columns={[
              { key: "client_name", header: "Nama" },
              { key: "client_company", header: "Perusahaan", render: (r) => r.client_company ?? "-" },
              {
                key: "rating",
                header: "Rating",
                render: (r) => (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating ?? 0 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                    ))}
                    {!r.rating && <span className="text-slate-muted text-xs">-</span>}
                  </div>
                ),
              },
              {
                key: "content",
                header: "Isi",
                render: (r) => (
                  <span className="text-xs text-slate-muted dark:text-slate-label line-clamp-2 max-w-xs">
                    {r.content}
                  </span>
                ),
              },
              {
                key: "approved",
                header: "Status",
                render: (r) => (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.approved ? "Disetujui" : "Pending"}
                  </span>
                ),
              },
              { key: "created_at", header: "Tanggal", render: (r) => formatDate(r.created_at) },
              {
                key: "actions",
                header: "Aksi",
                render: (r) => (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleApprove(r)}
                      disabled={updating === r.id}
                      className={`p-1.5 rounded transition-colors ${
                        r.approved
                          ? "text-orange-500 hover:bg-orange-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={r.approved ? "Cabut persetujuan" : "Setujui"}
                    >
                      {updating === r.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : r.approved ? (
                        <X size={14} />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={updating === r.id}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </main>
    </div>
  );
}
