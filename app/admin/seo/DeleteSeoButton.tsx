"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSeo } from "./actions";

export default function DeleteSeoButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button disabled={pending} onClick={() => { if (confirm("حذف؟")) startTransition(() => deleteSeo(id)); }} className="text-red-600">
      <Trash2 size={14} />
    </button>
  );
}
