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

function formatDateLong(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(dateStr));
}

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") redirect("/login");

  const invoice = await getInvoice(Number(params.id));
  if (!invoice) notFound();

  const statusLabel = STATUS_LABELS[invoice.status] ?? invoice.status;
  const isPaid = invoice.status === "paid";

  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Invoice {invoice.invoice_number}</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #f5f7fa;
            color: #1a2332;
            padding: 40px 24px;
          }
          .page {
            max-width: 720px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          }
          .header {
            background: #0f2240;
            padding: 40px 48px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
          }
          .studio-name { font-size: 22px; font-weight: 700; color: #00D4A0; }
          .studio-sub { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px; }
          .invoice-title { font-size: 28px; font-weight: 800; color: white; text-align: right; }
          .invoice-number { font-size: 13px; color: rgba(255,255,255,0.6); text-align: right; margin-top: 4px; }
          .status-badge {
            display: inline-block;
            margin-top: 8px;
            padding: 4px 14px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            background: ${isPaid ? '#00D4A0' : 'rgba(255,255,255,0.15)'};
            color: ${isPaid ? '#0f2240' : 'white'};
          }
          .body { padding: 40px 48px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
          .meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8899aa; margin-bottom: 6px; }
          .meta-value { font-size: 14px; color: #1a2332; line-height: 1.6; }
          .meta-value strong { display: block; font-size: 15px; font-weight: 600; }
          .divider { border: none; border-top: 1px solid #e8edf2; margin: 28px 0; }
          .table { width: 100%; border-collapse: collapse; }
          .table th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8899aa; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e8edf2; }
          .table th:last-child { text-align: right; }
          .table td { padding: 14px 12px; font-size: 14px; border-bottom: 1px solid #f0f4f8; vertical-align: top; }
          .table td:last-child { text-align: right; font-weight: 600; }
          .table .desc { color: #556677; font-size: 12px; margin-top: 3px; }
          .total-row { display: flex; justify-content: flex-end; margin-top: 24px; }
          .total-box { background: #f5f7fa; border-radius: 12px; padding: 20px 28px; min-width: 260px; }
          .total-line { display: flex; justify-content: space-between; font-size: 13px; color: #556677; margin-bottom: 8px; }
          .total-final { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #0f2240; margin-top: 12px; padding-top: 12px; border-top: 2px solid #e8edf2; }
          .notes { margin-top: 32px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #00D4A0; }
          .notes-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8899aa; margin-bottom: 6px; }
          .notes-text { font-size: 13px; color: #334455; line-height: 1.6; }
          .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e8edf2; text-align: center; font-size: 12px; color: #8899aa; }
          .paid-stamp {
            position: fixed;
            top: 160px; right: 80px;
            transform: rotate(-20deg);
            font-size: 42px;
            font-weight: 900;
            color: rgba(0,212,160,0.25);
            border: 6px solid rgba(0,212,160,0.25);
            border-radius: 8px;
            padding: 6px 16px;
            letter-spacing: 0.06em;
            pointer-events: none;
          }
          .print-btn {
            position: fixed;
            top: 24px; right: 24px;
            background: #00D4A0;
            color: #0f2240;
            border: none;
            border-radius: 10px;
            padding: 10px 22px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(0,212,160,0.3);
          }
          .print-btn:hover { background: #00b88a; }
          @media print {
            body { background: white; padding: 0; }
            .page { box-shadow: none; border-radius: 0; max-width: 100%; }
            .print-btn { display: none !important; }
            .paid-stamp { position: absolute; }
          }
        `}</style>
      </head>
      <body>
        <PrintButton invoiceNumber={invoice.invoice_number} />

        <div className="page">
          <div className="header">
            <div>
              <div className="studio-name">Pagiverse Studio</div>
              <div className="studio-sub">Jasa Pembuatan Website & Aplikasi</div>
              <div className="studio-sub" style={{ marginTop: 8 }}>Garut, Indonesia</div>
            </div>
            <div>
              <div className="invoice-title">INVOICE</div>
              <div className="invoice-number">{invoice.invoice_number}</div>
              <span className="status-badge">{statusLabel}</span>
            </div>
          </div>

          <div className="body">
            <div className="meta-grid">
              <div>
                <div className="meta-label">Tagihan Kepada</div>
                <div className="meta-value">
                  <strong>{invoice.client_name}</strong>
                  {invoice.company_name && <span>{invoice.company_name}</span>}
                  {invoice.client_email && <span>{invoice.client_email}</span>}
                  {invoice.client_phone && <span>{invoice.client_phone}</span>}
                  {invoice.client_address && <span>{invoice.client_address}</span>}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div className="meta-label">Tanggal Invoice</div>
                  <div className="meta-value">{formatDateLong(invoice.created_at)}</div>
                </div>
                {invoice.due_date && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="meta-label">Jatuh Tempo</div>
                    <div className="meta-value" style={{ color: invoice.status === "overdue" ? "#ef4444" : undefined }}>
                      {formatDateLong(invoice.due_date)}
                    </div>
                  </div>
                )}
                {invoice.paid_at && (
                  <div>
                    <div className="meta-label">Tanggal Lunas</div>
                    <div className="meta-value" style={{ color: "#00D4A0", fontWeight: 600 }}>
                      {formatDateLong(invoice.paid_at)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="divider" />

            <table className="table">
              <thead>
                <tr>
                  <th>Deskripsi</th>
                  <th style={{ textAlign: "right" }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {invoice.project_name ?? "Jasa Pembuatan Website / Aplikasi"}
                    </div>
                    {invoice.notes && <div className="desc">{invoice.notes}</div>}
                  </td>
                  <td>{formatRupiah(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>

            <div className="total-row">
              <div className="total-box">
                <div className="total-line">
                  <span>Subtotal</span>
                  <span>{formatRupiah(invoice.amount)}</span>
                </div>
                <div className="total-line">
                  <span>Pajak / PPN</span>
                  <span>-</span>
                </div>
                <div className="total-final">
                  <span>Total</span>
                  <span>{formatRupiah(invoice.amount)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="notes">
                <div className="notes-label">Catatan</div>
                <div className="notes-text">{invoice.notes}</div>
              </div>
            )}

            <div className="footer">
              <p>Terima kasih telah mempercayakan proyek Anda kepada Pagiverse Studio.</p>
              <p style={{ marginTop: 4 }}>Pertanyaan? Hubungi kami di Instagram @pagiversestudio</p>
            </div>
          </div>
        </div>

        {isPaid && <div className="paid-stamp">LUNAS</div>}
      </body>
    </html>
  );
}
