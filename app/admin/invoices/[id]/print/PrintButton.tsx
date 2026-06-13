"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export default function PrintButton({ invoiceNumber }: { invoiceNumber: string }) {
  useEffect(() => {
    document.title = `Invoice ${invoiceNumber}`;
  }, [invoiceNumber]);

  return (
    <button className="print-btn" onClick={() => window.print()}>
      <Printer size={16} />
      Cetak / Simpan PDF
    </button>
  );
}
