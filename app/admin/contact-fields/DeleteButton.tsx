"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteContactField } from "./actions";

export default function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("حذف هذا الحقل؟")) startTransition(() => deleteContactField(id));
      }}
      className="text-red-600"
    >
      <Trash2 size={14} />
    </button>
  );
}
