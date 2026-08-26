import { d1Query } from "@/lib/d1";
import SettingsForm from "./SettingsForm";
import AddSettingForm from "./AddSettingForm";

export const dynamic = "force-dynamic";

const groupLabels: Record<string, string> = {
  general: "عام",
  contact: "التواصل",
  social: "روابط التواصل الاجتماعي",
  about: "من نحن",
  stats: "الإحصائيات",
  services: "الخدمات",
  google: "جوجل (Google Analytics / Tag Manager)",
  meta: "ميتا - فيسبوك وإنستجرام (Meta)",
  tiktok: "تيك توك (TikTok)",
  whatsapp_integration: "واتساب API",
  crm: "نظام إدارة العملاء (CRM)",
  erp: "نظام تخطيط الموارد (ERP)",
};

// Controls the order groups appear in - anything not listed falls to the end, alphabetically.
const groupOrder = [
  "general", "contact", "social", "about", "stats", "services",
  "google", "meta", "tiktok", "whatsapp_integration", "crm", "erp",
];

export default async function AdminSettingsPage() {
  let settings: any[] = [];
  let errorMsg = "";
  try { settings = await d1Query("SELECT * FROM site_settings ORDER BY group_name"); } catch (e: any) { errorMsg = e.message; }

  const grouped: Record<string, any[]> = {};
  settings.forEach((s) => {
    const g = s.group_name || "general";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(s);
  });

  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    const ai = groupOrder.indexOf(a);
    const bi = groupOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">إعدادات الموقع</h1>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <AddSettingForm />
      <div className="space-y-6">
        {sortedGroups.map((group) => {
          const items = grouped[group];
          return (
          <div key={group} className="bg-white rounded-xl shadow-sm border border-gold/10 p-5">
            <h2 className="font-bold mb-4 capitalize">{groupLabels[group] || group}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => <SettingsForm key={item.key} settingKey={item.key} value={item.value} />)}
            </div>
          </div>
          );
        })}
        {settings.length === 0 && !errorMsg && <p className="text-charcoal/40 text-center py-8">لا توجد إعدادات محفوظة بعد</p>}
      </div>
    </div>
  );
}
