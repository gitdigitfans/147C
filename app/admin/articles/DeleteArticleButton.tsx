"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteArticle } from "./actions";

export default function DeleteArticleButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button disabled={pending} onClick={() => { if (confirm("حذف المقال؟")) startTransition(() => deleteArticle(id)); }} className="text-red-600">
      <Trash2 size={14} />
    </button>
  );
}
