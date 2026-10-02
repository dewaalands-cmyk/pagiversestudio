"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Eye, Loader2, RefreshCw, Search, X } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import TemplateRenderer from "@/components/templates/NativeTemplateRenderer";
import { getTemplateById } from "@/lib/template-library";
import type { TemplateProject, TemplateProjectStatus } from "@/types";

const STATUSES: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "submitted", label: "Masuk" },
  { value: "processing", label: "Diproses" },
  { value: "revision", label: "Revisi" },
  { value: "completed", label: "Selesai" },
  { value: "draft", label: "Draft" },
];

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-50 text-blue-700",
  processing: "bg-amber-50 text-amber-700",
  revision: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function ProjectModal({ project, onClose }: { project: TemplateProject; onClose: () => void }) {
  const template = getTemplateById(project.template_id);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-navy-soft">
        <header className="flex items-start justify-between gap-4 border-b border-cloud-200 px-5 py-4 dark:border-white/10 sm:px-7">
          <div><p className="text-xs font-bold uppercase tracking-wider text-mint">{project.project_code}</p><h2 className="mt-1 text-xl font-bold text-navy-deep dark:text-white">{project.business_name}</h2><p className="mt-1 text-xs text-slate-muted">{project.template_name} · {formatDate(project.created_at)}</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-muted hover:bg-cloud-100 dark:hover:bg-white/10"><X size={18} /></button>
        </header>
        <div className="grid lg:grid-cols-[1fr_300px]">
          <div className="max-h-[76vh] overflow-auto bg-[#d8d6d0] p-2 sm:p-4">{template ? <div className="overflow-hidden rounded-xl bg-white"><TemplateRenderer template={template} config={project.configuration} /></div> : <div className="p-10 text-center text-sm">Template tidak lagi tersedia.</div>}</div>
          <aside className="border-t border-cloud-200 p-6 dark:border-white/10 lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-muted">Data pemesan</p>
            <dl className="mt-5 grid gap-4 text-sm">
              <div><dt className="text-xs text-slate-muted">Nama</dt><dd className="mt-1 font-semibold text-navy-deep dark:text-white">{project.customer_name}</dd></div>
              <div><dt className="text-xs text-slate-muted">WhatsApp</dt><dd className="mt-1"><a href={`https://wa.me/${project.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-teal-700">{project.whatsapp}<ExternalLink size={12} /></a></dd></div>
              <div><dt className="text-xs text-slate-muted">Email</dt><dd className="mt-1 break-all font-semibold text-navy-deep dark:text-white">{project.email}</dd></div>
              <div><dt className="text-xs text-slate-muted">Catatan</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-navy-deep dark:text-cloud-100">{project.notes || "Tidak ada catatan"}</dd></div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function TemplateProjectsPage() {
  const [projects, setProjects] = useState<TemplateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TemplateProject | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/template-projects${filter ? `?status=${filter}` : ""}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Data gagal dimuat.");
      setProjects(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Data gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id: number, status: TemplateProjectStatus) {
    setUpdating(id);
    try {
      const response = await fetch(`/api/template-projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error();
      setProjects((items) => items.map((item) => item.id === id ? { ...item, status } : item));
      if (selected?.id === id) setSelected({ ...selected, status });
    } finally {
      setUpdating(null);
    }
  }

  const visible = projects.filter((project) => `${project.project_code} ${project.customer_name} ${project.business_name} ${project.template_name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminHeader title="Template Projects" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">{STATUSES.map((status) => <button key={status.value} type="button" onClick={() => setFilter(status.value)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${filter === status.value ? "bg-mint text-navy-deep" : "bg-cloud-100 text-slate-muted dark:bg-white/10 dark:text-slate-label"}`}>{status.label}</button>)}</div>
          <div className="flex flex-1 items-center gap-2 xl:justify-end"><label className="flex max-w-sm flex-1 items-center gap-2 rounded-xl border border-cloud-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"><Search size={15} className="text-slate-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari project atau pemesan" className="w-full bg-transparent text-sm text-navy-deep outline-none dark:text-white" /></label><button type="button" onClick={load} aria-label="Muat ulang" className="rounded-xl p-2.5 text-slate-muted hover:bg-cloud-100 dark:hover:bg-white/10"><RefreshCw size={17} /></button></div>
        </div>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-mint" /></div> : error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}<button type="button" onClick={load} className="ml-2 font-bold underline">Coba lagi</button></div> : visible.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-cloud-300 bg-white p-16 text-center text-sm text-slate-muted dark:border-white/10 dark:bg-white/5">Belum ada project template.</div> : (
          <div className="mt-6 grid gap-3">
            {visible.map((project) => (
              <article key={project.id} className="grid gap-4 rounded-2xl border border-cloud-200 bg-white p-4 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-wider text-mint">{project.project_code}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[project.status]}`}>{STATUSES.find((status) => status.value === project.status)?.label || project.status}</span></div><h2 className="mt-2 truncate text-base font-bold text-navy-deep dark:text-white">{project.business_name}</h2><p className="mt-1 text-xs text-slate-muted dark:text-slate-label">{project.customer_name} · {project.template_name} · {formatDate(project.created_at)}</p></div>
                <div className="flex items-center gap-2"><select value={project.status} disabled={updating === project.id} onChange={(event) => updateStatus(project.id, event.target.value as TemplateProjectStatus)} className="rounded-xl border border-cloud-200 bg-white px-3 py-2 text-xs font-semibold text-navy-deep outline-none dark:border-white/10 dark:bg-navy-deep dark:text-white">{STATUSES.filter((status) => status.value).map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select><button type="button" onClick={() => setSelected(project)} className="inline-flex items-center gap-2 rounded-xl bg-navy-deep px-3 py-2 text-xs font-bold text-white dark:bg-mint dark:text-navy-deep"><Eye size={15} />Lihat</button></div>
              </article>
            ))}
          </div>
        )}
      </main>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
