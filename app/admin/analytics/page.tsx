"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";

interface AnalyticsData {
  pageViews: { date: string; views: number }[];
  topPages: { page_path: string; views: number }[];
  eventCounts: { event_type: string; count: number }[];
}

const COLORS = ["#00D4A0", "#4B9CD3", "#A78BFA", "#F97316", "#EC4899"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/analytics?days=${days}`);
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [days]);

  const totalViews = data?.pageViews.reduce((sum, d) => sum + d.views, 0) ?? 0;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Analytics" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                days === d
                  ? "bg-mint text-navy-deep"
                  : "bg-cloud-100 dark:bg-white/10 text-slate-muted dark:text-slate-label hover:text-navy-deep dark:hover:text-white"
              }`}
            >
              {d} hari
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-muted dark:text-slate-label">
            Total: <strong className="text-navy-deep dark:text-white">{totalViews}</strong> page views
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-mint" />
          </div>
        ) : (
          <>
            {/* Page Views Chart */}
            <div className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 p-6 shadow-sm">
              <h2 className="font-semibold text-navy-deep dark:text-white mb-4">Page Views</h2>
              {data && data.pageViews.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.pageViews}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#00D4A0"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-muted dark:text-slate-label py-12 text-sm">
                  Belum ada data page views
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <div className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 p-6 shadow-sm">
                <h2 className="font-semibold text-navy-deep dark:text-white mb-4">Top Halaman</h2>
                {data && data.topPages.length > 0 ? (
                  <div className="space-y-2">
                    {data.topPages.map((p, i) => {
                      const max = data.topPages[0].views;
                      return (
                        <div key={p.page_path}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-navy-deep dark:text-cloud-100 truncate">{p.page_path}</span>
                            <span className="text-slate-muted dark:text-slate-label ml-2">{p.views}</span>
                          </div>
                          <div className="h-1.5 bg-cloud-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mint rounded-full"
                              style={{ width: `${(p.views / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-muted dark:text-slate-label py-8 text-sm">
                    Belum ada data
                  </p>
                )}
              </div>

              {/* Event Breakdown */}
              <div className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 p-6 shadow-sm">
                <h2 className="font-semibold text-navy-deep dark:text-white mb-4">Event Breakdown</h2>
                {data && data.eventCounts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.eventCounts}
                        dataKey="count"
                        nameKey="event_type"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {data.eventCounts.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-muted dark:text-slate-label py-8 text-sm">
                    Belum ada data events
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
