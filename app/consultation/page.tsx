import { d1Query } from "@/lib/d1";
import ConsultationClient from "./ConsultationClient";

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
