"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable from "@/components/admin/DataTable";
import { formatRupiah, formatDate, getStatusColor } from "@/lib/utils";
import { Plus, X, Loader2, RefreshCw } from "lucide-react";

interface InvoiceRow {
  id: number;
  invoice_number: string;
  client_name: string;
  amount: number;
  status: string;
  due_date?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
}

interface ClientOption {
  id: number;
  name: string;
  company_name?: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Terkirim",
  paid: "Lunas",
  overdue: "Jatuh Tempo",
  cancelled: "Dibatalkan",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS);

function AddModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [form, setForm] = useState({
    client_id: "",
    amount: "",
    due_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id || !form.amount) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: Number(form.client_id),
        amount: Number(form.amount.replace(/\D/g, "")),
        due_date: form.due_date || null,
        notes: form.notes || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Gagal membuat invoice.");
      return;
    }
    onAdded();
    onClose();
  }

  const inputClass =
    "w-full rounded-xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-navy-deep dark:text-white placeholder-slate-muted dark:placeholder-slate-label focus:outline-none focus:ring-2 focus:ring-mint transition";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-soft shadow-xl">
        <div className="flex items-center justify-between border-b border-cloud-200 dark:border-white/10 px-6 py-4">
          <h3 className="font-semibold text-navy-deep dark:text-white">
            Buat Invoice Baru
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-muted hover:bg-cloud-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">
              Klien *
            </label>
            <select
              required
              value={form.client_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, client_id: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">Pilih klien...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company_name ? ` — ${c.company_name}` : ""}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="mt-1 text-xs text-amber-500">
                Belum ada klien. Tambah klien terlebih dahulu di halaman Klien.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">
              Nominal (Rp) *
            </label>
            <input
              required
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
              placeholder="Contoh: 5000000"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">
              Jatuh Tempo
            </label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, due_date: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-navy-deep dark:text-white">
              Catatan
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Detail pekerjaan, paket, dll. (opsional)"
              className={inputClass + " resize-none"}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-cloud-200 dark:border-white/10 px-4 py-2 text-sm text-slate-muted hover:text-navy-deep dark:hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-mint px-5 py-2 text-sm font-semibold text-navy-deep hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Buat Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  async function load() {
    setLoading(true);
    const url = filterStatus
      ? `/api/invoices?status=${filterStatus}`
      : "/api/invoices";
    const res = await fetch(url);
    setInvoices(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filterStatus]);

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setUpdating(null);
  }

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices
    .filter((i) => ["draft", "sent"].includes(i.status))
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Invoice" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-navy-soft p-5 shadow-sm">
            <p className="text-xs text-slate-muted dark:text-slate-label">Revenue Terbayar</p>
            <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
              {formatRupiah(totalPaid)}
            </p>
          </div>
          <div className="rounded-xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-navy-soft p-5 shadow-sm">
            <p className="text-xs text-slate-muted dark:text-slate-label">Revenue Pending</p>
            <p className="mt-1 text-xl font-bold text-orange-500 dark:text-orange-400">
              {formatRupiah(totalPending)}
            </p>
          </div>
          <div className="rounded-xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-navy-soft p-5 shadow-sm">
            <p className="text-xs text-slate-muted dark:text-slate-label">Total Invoice</p>
            <p className="mt-1 text-xl font-bold text-navy-deep dark:text-white">
              {invoices.length}
            </p>
          </div>
        </div>

        {/* Filter & actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatus("")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === ""
                ? "bg-mint text-navy-deep"
                : "bg-cloud-100 dark:bg-white/10 text-slate-muted dark:text-slate-label hover:text-navy-deep dark:hover:text-white"
            }`}
          >
            Semua
          </button>
          {STATUS_OPTIONS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterStatus === val
                  ? "bg-mint text-navy-deep"
                  : "bg-cloud-100 dark:bg-white/10 text-slate-muted dark:text-slate-label hover:text-navy-deep dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={load}
            className="p-2 rounded-lg text-slate-muted hover:text-navy-deep dark:hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-mint px-4 py-2 text-sm font-semibold text-navy-deep hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            Buat Invoice
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-mint" />
          </div>
        ) : (
          <DataTable
            data={invoices}
            emptyText="Belum ada invoice"
            columns={[
              {
                key: "invoice_number",
                header: "No. Invoice",
                render: (r) => (
                  <span className="font-mono text-xs font-semibold text-navy-deep dark:text-white">
                    {r.invoice_number}
                  </span>
                ),
              },
              { key: "client_name", header: "Klien" },
              {
                key: "amount",
                header: "Nominal",
                render: (r) => (
                  <span className="font-semibold">{formatRupiah(r.amount)}</span>
                ),
              },
              {
                key: "due_date",
                header: "Jatuh Tempo",
                render: (r) =>
                  r.due_date ? formatDate(r.due_date) : "-",
              },
              {
                key: "status",
                header: "Status",
                render: (r) => (
                  <select
                    value={r.status}
                    disabled={updating === r.id}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(r.status)} bg-transparent`}
                  >
                    {STATUS_OPTIONS.map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                ),
              },
              {
                key: "paid_at",
                header: "Lunas Pada",
                render: (r) => (r.paid_at ? formatDate(r.paid_at) : "-"),
              },
              {
                key: "created_at",
                header: "Dibuat",
                render: (r) => formatDate(r.created_at),
              },
            ]}
          />
        )}
      </main>

      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} onAdded={load} />
      )}
    </div>
  );
}
