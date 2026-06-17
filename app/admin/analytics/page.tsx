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
import { Loader2, TrendingUp, Calendar, BarChart3 } from "lucide-react";

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

  const peakDay = data?.pageViews.length
    ? data.pageViews.reduce((max, d) => (d.views > max.views ? d : max), data.pageViews[0])
    : null;

  const avgViews = data?.pageViews.length ? Math.round(totalViews / data.pageViews.length) : 0;

  function formatDateShort(dateStr: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "short", year: "2-digit"
    }).format(new Date(dateStr + "T00:00:00"));
  }

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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-mint/10 to-teal-50 dark:from-mint/5 dark:to-teal-900/10 rounded-xl border border-mint/20 dark:border-mint/10 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-mint/20 rounded-lg">
                    <BarChart3 size={18} className="text-mint" />
                  </div>
                  <span className="text-xs font-medium text-slate-muted dark:text-slate-label">TOTAL VIEWS</span>
                </div>
                <p className="text-2xl font-bold text-navy-deep dark:text-white">{totalViews}</p>
                <p className="text-xs text-slate-muted dark:text-slate-label mt-1">{days} hari terakhir</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border border-yellow-200/50 dark:border-yellow-900/20 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Calendar size={18} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-muted dark:text-slate-label">HARI PUNCAK</span>
                </div>
                {peakDay ? (
                  <>
                    <p className="text-2xl font-bold text-navy-deep dark:text-white">{peakDay.views}</p>
                    <p className="text-xs text-slate-muted dark:text-slate-label mt-1">{formatDateShort(peakDay.date)}</p>
                  </>
                ) : (
                  <p className="text-slate-muted text-sm">-</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border border-blue-200/50 dark:border-blue-900/20 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-muted dark:text-slate-label">RATA-RATA/HARI</span>
                </div>
                <p className="text-2xl font-bold text-navy-deep dark:text-white">{avgViews}</p>
                <p className="text-xs text-slate-muted dark:text-slate-label mt-1">views per hari</p>
              </div>
            </div>

            {/* Page Views Chart */}
            <div className="bg-white dark:bg-navy-soft rounded-xl border border-cloud-200 dark:border-white/10 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-navy-deep dark:text-white">Page Views Trend</h2>
                {peakDay && (
                  <span className="text-xs bg-mint/20 text-mint px-2.5 py-1 rounded-full font-medium">
                    Puncak: {formatDateShort(peakDay.date)}
                  </span>
                )}
              </div>
              {data && data.pageViews.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.pageViews}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      interval={Math.floor(data.pageViews.length / 6) || 0}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 34, 64, 0.95)",
                        border: "1px solid rgba(0, 212, 160, 0.3)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value) => [
                        `${value} views`,
                        value === peakDay?.views ? "📍 Puncak" : "Views",
                      ]}
                      labelFormatter={(label) => formatDateShort(label)}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#00D4A0"
                      strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const isPeak = payload?.views === peakDay?.views;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isPeak ? 6 : 3}
                            fill={isPeak ? "#00D4A0" : "transparent"}
                            stroke={isPeak ? "#00D4A0" : "transparent"}
                            strokeWidth={2}
                          />
                        );
                      }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-muted dark:text-slate-label py-16 text-sm">
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
