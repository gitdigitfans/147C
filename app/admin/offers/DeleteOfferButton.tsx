"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteOffer } from "./actions";

export default function DeleteOfferButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button disabled={pending} onClick={() => { if (confirm("حذف العرض؟")) startTransition(() => deleteOffer(id)); }} className="text-red-600 flex items-center gap-1">
      <Trash2 size={14} />
    </button>
  );
}
