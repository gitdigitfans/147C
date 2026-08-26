"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteGallerySlide } from "./actions";

export default function DeleteGallerySlideButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button disabled={pending} onClick={() => { if (confirm("حذف صورة المعرض؟")) startTransition(() => deleteGallerySlide(id)); }} className="text-red-600">
      <Trash2 size={14} />
    </button>
  );
}
