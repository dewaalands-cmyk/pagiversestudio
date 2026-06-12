"use client";

import { useEffect, useState } from "react";
import { getStatusColor } from "@/lib/utils";
import type { Project } from "@/types";
import { Loader2 } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  planning: "Perencanaan",
  in_progress: "Berjalan",
  review: "Review",
  completed: "Selesai",
  on_hold: "Ditunda",
};

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => { setProjects(d); setLoading(false); });
  }, []);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-navy-deep dark:text-white">Proyek Saya</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-mint" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 p-12 text-center">
          <p className="text-slate-muted dark:text-slate-label">Belum ada proyek</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-navy-deep dark:text-white">{p.name}</h2>
                  {p.description && (
                    <p className="text-sm text-slate-muted dark:text-slate-label mt-1">{p.description}</p>
                  )}
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(p.status)}`}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-muted dark:text-slate-label">Progress</span>
                  <span className="font-semibold text-navy-deep dark:text-white">
                    {p.progress_percentage}%
                  </span>
                </div>
                <div className="h-2 bg-cloud-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-mint rounded-full transition-all duration-500"
                    style={{ width: `${p.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Timeline */}
              {(p.start_date || p.end_date) && (
                <div className="flex items-center gap-6 mt-4 text-sm">
                  {p.start_date && (
                    <div>
                      <span className="text-slate-muted dark:text-slate-label">Mulai: </span>
                      <span className="text-navy-deep dark:text-white">{p.start_date}</span>
                    </div>
                  )}
                  {p.end_date && (
                    <div>
                      <span className="text-slate-muted dark:text-slate-label">Target: </span>
                      <span className="text-navy-deep dark:text-white">{p.end_date}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
