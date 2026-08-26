"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "./actions";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
          startTransition(() => deleteProduct(id));
        }
      }}
      className="text-red-600 font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
    >
      <Trash2 size={14} /> حذف
    </button>
  );
}
