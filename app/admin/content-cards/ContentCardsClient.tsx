"use client";

import { useState } from "react";
import ContentCardFormModal from "./ContentCardFormModal";
import DeleteContentCardButton from "./DeleteContentCardButton";

type Tab = "services" | "about_features";

export default function ContentCardsClient({
  services,
  aboutFeatures,
  errorMsg,
}: {
  services: any[];
  aboutFeatures: any[];
  errorMsg?: string;
}) {
  const [tab, setTab] = useState<Tab>("services");
  const items = tab === "services" ? services : aboutFeatures;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">بطاقات المحتوى</h1>
        <ContentCardFormModal section={tab} />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("services")}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "services" ? "bg-gold-gradient text-white" : "bg-white border border-gold/20 text-charcoal/60"}`}
        >
          خدماتنا
        </button>
        <button
          onClick={() => setTab("about_features")}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "about_features" ? "bg-gold-gradient text-white" : "bg-white border border-gold/20 text-charcoal/60"}`}
        >
          لماذا نحن
        </button>
      </div>

      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-charcoal/50 text-xs border-b border-gold/10">
              <th className="text-start p-3">الأيقونة</th>
              <th className="text-start p-3">العنوان</th>
              <th className="text-start p-3">الترتيب</th>
              <th className="text-start p-3">الحالة</th>
              <th className="text-start p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-charcoal/40">لا توجد بطاقات بعد</td></tr>}
            {items.map((c: any) => (
              <tr key={c.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-mono text-xs">{c.icon}</td>
                <td className="p-3 font-bold">{c.title_ar}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {c.is_active ? "مفعل" : "معطل"}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <ContentCardFormModal section={tab} initial={c} />
                  <DeleteContentCardButton id={c.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
