"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const WIDTH = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className={`bg-white dark:bg-navy-soft rounded-2xl shadow-xl w-full ${WIDTH[maxWidth]} max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cloud-200 dark:border-white/10 shrink-0">
          <h2 className="font-semibold text-navy-deep dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-muted hover:text-navy-deep dark:hover:text-white hover:bg-cloud-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
