import type { Metadata } from "next";
import { d1Query } from "@/lib/d1";
import { buildMetadata } from "@/lib/seo";
import ConsultationClient from "./ConsultationClient";

export const metadata: Metadata = buildMetadata({
  title: "اطلب استشارة",
  description:
    "احصل على استشارة مجانية من فريق الفرعون للأثاث لاختيار القطع المناسبة لمساحتك وذوقك - اترك بياناتك وهنتواصل معك سريعًا لمساعدتك في قرار الشراء.",
  path: "/consultation",
});

async function fetchWhatsappNumber(): Promise<string> {
  try {
    const rows = await d1Query<{ value: string }>("SELECT value FROM site_settings WHERE key = 'whatsapp' LIMIT 1", []);
    return rows[0]?.value || "+201000000000";
  } catch {
    return "+201000000000";
  }
}

export default async function ConsultationPage() {
  const whatsappNumber = await fetchWhatsappNumber();
  return <ConsultationClient whatsappNumber={whatsappNumber} />;
}
