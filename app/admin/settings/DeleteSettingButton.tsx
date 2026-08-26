"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSetting } from "./actions";

export default function DeleteSettingButton({ settingKey }: { settingKey: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("حذف هذا الإعداد؟")) {
          startTransition(async () => {
            try {
              await deleteSetting(settingKey);
            } catch (err: any) {
              alert("خطأ: " + err.message);
            }
          });
        }
      }}
      className="text-red-600 px-2"
      title="حذف"
    >
      <Trash2 size={14} />
    </button>
  );
}
