"use client";

import DataTable from "./DataTable";
import { formatDate } from "@/lib/utils";

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
  {
    key: "company_name",
    header: "Perusahaan",
    render: (r: ClientRow) => r.company_name ?? "-",
  },
  {
    key: "phone",
    header: "Telepon",
    render: (r: ClientRow) => r.phone ?? "-",
  },
  { key: "project_count", header: "Proyek" },
  { key: "invoice_count", header: "Invoice" },
  {
    key: "created_at",
    header: "Bergabung",
    render: (r: ClientRow) => formatDate(r.created_at),
  },
] satisfies { key: string; header: string; render?: (r: ClientRow) => React.ReactNode }[];

export default function ClientsTable({ clients }: { clients: ClientRow[] }) {
  return (
    <DataTable
      data={clients}
      emptyText="Belum ada klien"
      columns={columns}
    />
  );
}
