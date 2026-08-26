import { d1Query } from "@/lib/d1";
import { services as mockServices } from "@/lib/data";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

async function fetchServiceCards() {
  try {
    return await d1Query<any>("SELECT * FROM content_cards WHERE section='services' AND is_active=1 ORDER BY sort_order", []);
  } catch {
    return [];
  }
}

async function fetchServicesSettings() {
  try {
    return await d1Query<any>("SELECT key, value FROM site_settings WHERE group_name = 'services'", []);
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const [rows, settingsRows] = await Promise.all([fetchServiceCards(), fetchServicesSettings()]);

  const services =
    rows.length > 0
      ? rows.map((r: any) => ({
          icon: r.icon,
          name: { ar: r.title_ar, en: r.title_en },
          desc: { ar: r.desc_ar || "", en: r.desc_en || "" },
        }))
      : mockServices;

  const settingsMap: Record<string, string> = {};
  settingsRows.forEach((r: any) => { settingsMap[r.key] = r.value; });

  return (
    <ServicesClient
      services={services}
      pageTitle={{ ar: settingsMap["services_page_title_ar"] || "", en: settingsMap["services_page_title_en"] || "" }}
      pageSub={{ ar: settingsMap["services_page_sub_ar"] || "", en: settingsMap["services_page_sub_en"] || "" }}
    />
  );
}
