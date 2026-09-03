import type { Metadata } from "next";
import { d1Query } from "@/lib/d1";
import { buildMetadata } from "@/lib/seo";
import { features as mockFeatures } from "@/lib/data";
import AboutClient from "./AboutClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "من نحن",
  description:
    "الفرعون للأثاث شركة مصرية متخصصة في تصميم وتصنيع الأثاث المنزلي والفندقي الفاخر، بخبرة طويلة في الحرفية المصرية الأصيلة وأعلى معايير الجودة والضمان.",
  path: "/about",
});

async function fetchFeatureCards() {
  try {
    return await d1Query<any>("SELECT * FROM content_cards WHERE section='about_features' AND is_active=1 ORDER BY sort_order", []);
  } catch {
    return [];
  }
}

async function fetchAboutSettings() {
  try {
    return await d1Query<any>("SELECT key, value FROM site_settings WHERE group_name IN ('about','stats')", []);
  } catch {
    return [];
  }
}

export default async function AboutPage() {
  const [rows, settingsRows] = await Promise.all([fetchFeatureCards(), fetchAboutSettings()]);

  const features =
    rows.length > 0
      ? rows.map((r: any) => ({ icon: r.icon, name: { ar: r.title_ar, en: r.title_en } }))
      : mockFeatures;

  const map: Record<string, string> = {};
  settingsRows.forEach((r: any) => { map[r.key] = r.value; });

  return (
    <AboutClient
      features={features}
      aboutImage={map["about_image"] || undefined}
      aboutTitle={{ ar: map["about_title_ar"] || "", en: map["about_title_en"] || "" }}
      aboutText={{ ar: map["about_text_ar"] || "", en: map["about_text_en"] || "" }}
      visionTitle={{ ar: map["vision_title_ar"] || "", en: map["vision_title_en"] || "" }}
      visionText={{ ar: map["vision_text_ar"] || "", en: map["vision_text_en"] || "" }}
      missionTitle={{ ar: map["mission_title_ar"] || "", en: map["mission_title_en"] || "" }}
      missionText={{ ar: map["mission_text_ar"] || "", en: map["mission_text_en"] || "" }}
      statYears={map["stat_years_value"] || "10+"}
      statClients={map["stat_clients_value"] || "5000+"}
      statBranches={map["stat_branches_value"] || "3"}
    />
  );
}
