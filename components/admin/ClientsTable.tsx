"use client";

import { useState } from "react";
import DataTable from "./DataTable";
import { formatDate } from "@/lib/utils";
import { Plus, X, Loader2, Trash2 } from "lucide-react";

interface ClientRow {
  id: number;
  name: string;
  email: string;
  company_name?: string;
  phone?: string;
  project_count: number;
  invoice_count: number;
  created_at: string;
}

function AddModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", company_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Gagal menyimpan klien."); return; }
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
          <h3 className="font-semibold text-navy-deep dark:text-white">Tambah Klien Baru</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-muted hover:bg-cloud-100 dark:hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">Nama *</label>
              <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nama lengkap" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@domain.com" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">Perusahaan</label>
            <input value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} placeholder="Nama perusahaan" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">Telepon</label>
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="08xx-xxxx-xxxx" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">Alamat</label>
              <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Alamat (opsional)" className={inputClass} />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-cloud-200 dark:border-white/10 px-4 py-2 text-sm text-slate-muted hover:text-navy-deep dark:hover:text-white transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-mint px-5 py-2 text-sm font-semibold text-navy-deep hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsTable({ clients: initialClients }: { clients: ClientRow[] }) {
  const [clients, setClients] = useState(initialClients);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function reload() {
    const res = await fetch("/api/clients");
    setClients(await res.json());
  }

  async function handleDelete(client: ClientRow) {
    if (!confirm(`Hapus klien "${client.name}"?\n\nSemua data klien ini akan dihapus permanen.`)) return;
    setDeleting(client.id);
    await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    await reload();
    setDeleting(null);
  }

  const columns = [
    {
      key: "name",
      header: "Nama",
      render: (r: ClientRow) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-slate-muted dark:text-slate-label">{r.email}</p>
        </div>
      ),
    },
    { key: "company_name", header: "Perusahaan", render: (r: ClientRow) => r.company_name ?? "-" },
    { key: "phone", header: "Telepon", render: (r: ClientRow) => r.phone ?? "-" },
    { key: "project_count", header: "Proyek" },
    { key: "invoice_count", header: "Invoice" },
    { key: "created_at", header: "Bergabung", render: (r: ClientRow) => formatDate(r.created_at) },
    {
      key: "actions",
      header: "Aksi",
      render: (r: ClientRow) => (
        <button
          onClick={() => handleDelete(r)}
          disabled={deleting === r.id}
          title="Hapus klien"
          className="p-1.5 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
        >
          {deleting === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      ),
    },
  ] satisfies { key: string; header: string; render?: (r: ClientRow) => React.ReactNode }[];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-mint px-4 py-2 text-sm font-semibold text-navy-deep hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} />
          Tambah Klien
        </button>
      </div>
      <DataTable data={clients} emptyText="Belum ada klien" columns={columns} />
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdded={reload} />}
    </>
  );
}
