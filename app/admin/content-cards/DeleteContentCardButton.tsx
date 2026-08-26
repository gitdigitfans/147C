"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteContentCard } from "./actions";

export default function DeleteContentCardButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button disabled={pending} onClick={() => { if (confirm("حذف البطاقة؟")) startTransition(() => deleteContentCard(id)); }} className="text-red-600">
      <Trash2 size={14} />
    </button>
  );
}
