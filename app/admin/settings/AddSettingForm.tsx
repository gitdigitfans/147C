"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createSetting } from "./actions";

export default function AddSettingForm() {
  const [key, setKey] = useState("");
  const [group, setGroup] = useState("");
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";

  function handleAdd() {
    if (!key.trim()) return;
    startTransition(async () => {
      try {
        await createSetting(key.trim(), group.trim() || "general", value);
        setKey("");
        setGroup("");
        setValue("");
        setMsg("تمت الإضافة");
        setTimeout(() => setMsg(""), 2000);
      } catch (err: any) {
        alert("خطأ: " + err.message);
      }
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-5 mb-6">
      <h2 className="font-bold mb-4">إضافة إعداد جديد</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={label}>المفتاح (key)</label>
          <input className={input} value={key} onChange={(e) => setKey(e.target.value)} placeholder="snapchat_url" />
        </div>
        <div>
          <label className={label}>المجموعة (group_name)</label>
          <input className={input} value={group} onChange={(e) => setGroup(e.target.value)} placeholder="social" />
        </div>
        <div>
          <label className={label}>القيمة</label>
          <input className={input} value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          disabled={pending}
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm disabled:opacity-60"
        >
          <Plus size={16} /> {msg || (pending ? "جاري الإضافة..." : "إضافة")}
        </button>
      </div>
    </div>
  );
}
