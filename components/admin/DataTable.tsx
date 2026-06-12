"use client";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
}

export default function DataTable<T extends { id: number | string }>({
  columns,
  data,
  emptyText = "Tidak ada data",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-cloud-200 dark:border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-cloud-50 dark:bg-white/5 border-b border-cloud-200 dark:border-white/10">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="text-left px-4 py-3 font-semibold text-slate-muted dark:text-slate-label uppercase tracking-wider text-xs"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cloud-200 dark:divide-white/10 bg-white dark:bg-navy-soft">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-muted dark:text-slate-label"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-cloud-50 dark:hover:bg-white/5 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-navy-deep dark:text-cloud-100">
                    {col.render
                      ? col.render(row)
                      : String((row as any)[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
