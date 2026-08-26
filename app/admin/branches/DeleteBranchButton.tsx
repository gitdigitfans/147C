"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteBranch } from "./actions";

export default function DeleteBranchButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button disabled={pending} onClick={() => { if (confirm("حذف الفرع؟")) startTransition(() => deleteBranch(id)); }} className="text-red-600">
      <Trash2 size={14} />
    </button>
  );
}
