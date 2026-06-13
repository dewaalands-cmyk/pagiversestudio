import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import sql from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import PrintButton from "./PrintButton";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Terkirim",
  paid: "Lunas",
  overdue: "Jatuh Tempo",
  cancelled: "Dibatalkan",
};

async function getInvoice(id: number) {
  const rows = await sql`
    SELECT i.*, u.name as client_name, u.email as client_email,
      c.phone as client_phone, c.company_name, c.address as client_address,
      p.name as project_name
    FROM invoices i
    JOIN clients c ON c.id = i.client_id
    JOIN users u ON u.id = c.user_id
    LEFT JOIN projects p ON p.id = i.project_id
    WHERE i.id = ${id}
  `;
  return rows[0] ?? null;
}

function fmt(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(dateStr));
}

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") redirect("/login");

  const inv = await getInvoice(Number(params.id));
  if (!inv) notFound();

  const isPaid = inv.status === "paid";

  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Invoice {inv.invoice_number}</title>
        <style>{`
          @page {
            size: A4 portrait;
            margin: 0;
          }
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          html, body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #f0f4f8;
            color: #1a2332;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Screen: centered card */
          .wrapper {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 40px 24px 80px;
          }

          .page {
            width: 720px;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          }

          /* Print: full width, no card */
          @media print {
            html, body { background: white; }
            .wrapper { padding: 0; min-height: auto; }
            .page {
              width: 100%;
              border-radius: 0;
              box-shadow: none;
            }
            .no-print { display: none !important; }
          }

          /* ---- Header ---- */
          .inv-header {
            background: #0f2240;
            padding: 32px 44px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
          }
          .studio-name { font-size: 20px; font-weight: 700; color: #00D4A0; }
          .studio-sub { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 3px; }
          .inv-right { text-align: right; }
          .inv-title { font-size: 26px; font-weight: 800; color: white; letter-spacing: 0.04em; }
          .inv-num { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 3px; }
          .status-badge {
            display: inline-block;
            margin-top: 8px;
            padding: 3px 12px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            background: ${isPaid ? '#00D4A0' : 'rgba(255,255,255,0.15)'};
            color: ${isPaid ? '#0f2240' : 'white'};
          }

          /* ---- Body ---- */
          .inv-body { padding: 32px 44px 28px; }

          /* Meta row */
          .meta-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 28px;
          }
          .meta-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #8899aa;
            margin-bottom: 6px;
          }
          .client-name { font-size: 15px; font-weight: 700; color: #1a2332; margin-bottom: 4px; }
          .client-detail { font-size: 12px; color: #556677; line-height: 1.7; }
          .date-block { margin-bottom: 12px; }
          .date-val { font-size: 13px; color: #1a2332; margin-top: 2px; }
          .date-val.paid { color: #00b882; font-weight: 600; }
          .date-val.overdue { color: #ef4444; }

          /* Divider */
          .divider { border: none; border-top: 1px solid #e8edf2; margin: 0 0 24px; }

          /* Table */
          .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .inv-table th {
            font-size: 9px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.1em; color: #8899aa;
            padding: 0 10px 10px;
            text-align: left; border-bottom: 2px solid #e8edf2;
          }
          .inv-table th.right { text-align: right; }
          .inv-table td { padding: 14px 10px; font-size: 13px; vertical-align: top; }
          .inv-table td.right { text-align: right; font-weight: 600; }
          .row-title { font-weight: 600; color: #1a2332; }

          /* Total */
          .total-wrap { display: flex; justify-content: flex-end; margin-bottom: 20px; }
          .total-box { min-width: 240px; }
          .total-line { display: flex; justify-content: space-between; font-size: 12px; color: #778899; padding: 5px 0; }
          .total-sep { border: none; border-top: 1.5px solid #e8edf2; margin: 6px 0; }
          .total-final { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #0f2240; padding-top: 6px; }

          /* Notes */
          .notes-box { background: #f8fafc; border-left: 3px solid #00D4A0; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px; }
          .notes-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #8899aa; margin-bottom: 5px; }
          .notes-text { font-size: 12px; color: #445566; line-height: 1.6; }

          /* Footer */
          .inv-footer { text-align: center; font-size: 11px; color: #99aabb; padding-top: 20px; border-top: 1px solid #e8edf2; }
          .inv-footer p + p { margin-top: 3px; }

          /* LUNAS stamp */
          .lunas-stamp {
            position: absolute;
            top: 140px; right: 60px;
            transform: rotate(-18deg);
            font-size: 36px;
            font-weight: 900;
            color: rgba(0,212,160,0.22);
            border: 5px solid rgba(0,212,160,0.22);
            border-radius: 6px;
            padding: 4px 14px;
            letter-spacing: 0.1em;
            pointer-events: none;
          }

          /* Print button */
          .print-btn {
            position: fixed;
            bottom: 32px; right: 32px;
            background: #00D4A0;
            color: #0f2240;
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 16px rgba(0,212,160,0.35);
            z-index: 100;
          }
          .print-btn:hover { background: #00c491; }
        `}</style>
      </head>
      <body>
        <div className="wrapper">
          <div className="page" style={{ position: "relative" }}>

            {/* Header */}
            <div className="inv-header">
              <div>
                <div className="studio-name">Pagiverse Studio</div>
                <div className="studio-sub">Jasa Pembuatan Website &amp; Aplikasi</div>
                <div className="studio-sub" style={{ marginTop: 4 }}>Garut, Indonesia</div>
              </div>
              <div className="inv-right">
                <div className="inv-title">INVOICE</div>
                <div className="inv-num">{inv.invoice_number}</div>
                <span className="status-badge">{STATUS_LABELS[inv.status] ?? inv.status}</span>
              </div>
            </div>

            {/* Body */}
            <div className="inv-body">

              {/* Meta */}
              <div className="meta-row">
                <div>
                  <div className="meta-label">Tagihan Kepada</div>
                  <div className="client-name">{inv.client_name}</div>
                  <div className="client-detail">
                    {inv.company_name && <div>{inv.company_name}</div>}
                    {inv.client_email && <div>{inv.client_email}</div>}
                    {inv.client_phone && <div>{inv.client_phone}</div>}
                    {inv.client_address && <div>{inv.client_address}</div>}
                  </div>
                </div>
                <div>
                  <div className="date-block">
                    <div className="meta-label">Tanggal Invoice</div>
                    <div className="date-val">{fmt(inv.created_at)}</div>
                  </div>
                  {inv.due_date && (
                    <div className="date-block">
                      <div className="meta-label">Jatuh Tempo</div>
                      <div className={`date-val${inv.status === "overdue" ? " overdue" : ""}`}>
                        {fmt(inv.due_date)}
                      </div>
                    </div>
                  )}
                  {inv.paid_at && (
                    <div className="date-block">
                      <div className="meta-label">Tanggal Lunas</div>
                      <div className="date-val paid">{fmt(inv.paid_at)}</div>
                    </div>
                  )}
                </div>
              </div>

              <hr className="divider" />

              {/* Table */}
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Deskripsi</th>
                    <th className="right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="row-title">
                        {inv.project_name ?? "Jasa Pembuatan Website / Aplikasi"}
                      </div>
                    </td>
                    <td className="right">{formatRupiah(inv.amount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Total */}
              <div className="total-wrap">
                <div className="total-box">
                  <div className="total-line">
                    <span>Subtotal</span>
                    <span>{formatRupiah(inv.amount)}</span>
                  </div>
                  <div className="total-line">
                    <span>Pajak / PPN</span>
                    <span>-</span>
                  </div>
                  <hr className="total-sep" />
                  <div className="total-final">
                    <span>Total</span>
                    <span>{formatRupiah(inv.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {inv.notes && (
                <div className="notes-box">
                  <div className="notes-label">Catatan</div>
                  <div className="notes-text">{inv.notes}</div>
                </div>
              )}

              {/* Footer */}
              <div className="inv-footer">
                <p>Terima kasih telah mempercayakan proyek Anda kepada Pagiverse Studio.</p>
                <p>Pertanyaan? Hubungi kami di Instagram @pagiversestudio</p>
              </div>
            </div>

            {/* LUNAS stamp */}
            {isPaid && <div className="lunas-stamp">LUNAS</div>}
          </div>
        </div>

        <PrintButton invoiceNumber={inv.invoice_number} />
      </body>
    </html>
  );
}
