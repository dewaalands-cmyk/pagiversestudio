"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable from "@/components/admin/DataTable";
import { Check, X, Star, Loader2, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Testimony } from "@/types";

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            size={22}
            className={`transition-colors ${
              n <= (hovered || value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-white/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function AddModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ client_name: "", client_company: "", rating: 5, content: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_name.trim() || !form.content.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/testimonies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Gagal menyimpan."); return; }
    onAdded();
    onClose();
  }

  const inputClass =
    "w-full rounded-xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-navy-deep dark:text-white placeholder-slate-muted dark:placeholder-slate-label focus:outline-none focus:ring-2 focus:ring-mint transition";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-soft shadow-xl">
        <div className="flex items-center justify-between border-b border-cloud-200 dark:border-white/10 px-6 py-4">
          <h3 className="font-semibold text-navy-deep dark:text-white">Tambah Testimoni</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-muted hover:bg-cloud-100 dark:hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">Nama *</label>
              <input
                required
                value={form.client_name}
                onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                placeholder="Nama klien"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">Perusahaan / Brand</label>
              <input
                value={form.client_company}
                onChange={(e) => setForm((p) => ({ ...p, client_company: e.target.value }))}
                placeholder="Nama bisnis (opsional)"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-navy-deep dark:text-white">Rating</label>
            <StarPicker value={form.rating} onChange={(n) => setForm((p) => ({ ...p, rating: n }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">Isi Testimoni *</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder="Cerita pengalaman klien..."
              className={inputClass + " resize-none"}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-slate-muted dark:text-slate-label">Testimoni yang ditambahkan admin langsung tampil tanpa perlu disetujui.</p>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-cloud-200 dark:border-white/10 px-4 py-2 text-sm text-slate-muted hover:text-navy-deep dark:hover:text-white transition-colors">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-mint px-5 py-2 text-sm font-semibold text-navy-deep hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TestimoniesAdminPage() {
  const [items, setItems] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

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
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-mint px-4 py-2 text-sm font-semibold text-navy-deep hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            Tambah Testimoni
          </button>
        </div>

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
                      r.approved ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
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
                          ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
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
                      className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Hapus"
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

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdded={load} />}
    </div>
  );
}
