"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

export default function PaymentProofViewer({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full max-w-[220px] overflow-hidden rounded-xl border border-gold/20 shadow-sm"
      >
        <img src={url} alt="إثبات الدفع" className="w-full h-40 object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors">
          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-charcoal/90 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={url}
            alt="إثبات الدفع"
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
