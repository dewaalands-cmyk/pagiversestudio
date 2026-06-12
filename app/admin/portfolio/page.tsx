"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Plus, Pencil, Trash2, Loader2, X, ExternalLink } from "lucide-react";
import type { PortfolioItem } from "@/types";

const EMPTY_FORM = {
  title: "",
  description: "",
  image_url: "",
  category: "",
  technologies: "",
  link: "",
  featured: false,
};

export default function PortfolioAdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/portfolio");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(item: PortfolioItem) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description ?? "",
      image_url: item.image_url ?? "",
      category: item.category ?? "",
      technologies: item.technologies ?? "",
      link: item.link ?? "",
      featured: item.featured,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/portfolio/${editing.id}` : "/api/portfolio";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus item ini?")) return;
    setDeleting(id);
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    setDeleting(null);
    await load();
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Portfolio" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex justify-end">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-mint hover:bg-mint/90 text-navy-deep font-semibold rounded-lg text-sm transition-colors"
          >
            <Plus size={16} /> Tambah Item
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-mint" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 overflow-hidden shadow-sm"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-cloud-100 dark:bg-white/5 flex items-center justify-center">
                    <span className="text-slate-muted dark:text-slate-label text-sm">No image</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy-deep dark:text-white truncate">{item.title}</h3>
                      {item.category && (
                        <span className="text-xs text-mint font-medium">{item.category}</span>
                      )}
                    </div>
                    {item.featured && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-mint/10 text-mint text-xs font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  {item.technologies && (
                    <p className="text-xs text-slate-muted dark:text-slate-label mt-1">{item.technologies}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-muted hover:text-mint transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 text-slate-muted hover:text-blue-500 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="p-1.5 text-slate-muted hover:text-red-500 transition-colors"
                    >
                      {deleting === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="col-span-full text-center text-slate-muted dark:text-slate-label py-12">
                Belum ada portfolio item
              </p>
            )}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-navy-soft rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cloud-200 dark:border-white/10">
              <h2 className="font-semibold text-navy-deep dark:text-white">
                {editing ? "Edit Portfolio" : "Tambah Portfolio"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-muted hover:text-navy-deep dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { key: "title", label: "Judul *", required: true },
                { key: "image_url", label: "URL Gambar" },
                { key: "category", label: "Kategori" },
                { key: "technologies", label: "Teknologi (pisah koma)" },
                { key: "link", label: "Link Website" },
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-navy-deep dark:text-cloud-100 mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    required={required}
                    className="w-full px-3 py-2 rounded-lg border border-cloud-200 dark:border-white/10 bg-cloud-50 dark:bg-navy-deep text-navy-deep dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-mint/50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-navy-deep dark:text-cloud-100 mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-cloud-200 dark:border-white/10 bg-cloud-50 dark:bg-navy-deep text-navy-deep dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-mint/50 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="rounded border-cloud-200"
                />
                <span className="text-sm text-navy-deep dark:text-cloud-100">Featured</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg border border-cloud-200 dark:border-white/10 text-sm font-medium text-slate-muted hover:text-navy-deep dark:hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-mint hover:bg-mint/90 text-navy-deep font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
