import { d1Query } from "@/lib/d1";
import ContentCardsClient from "./ContentCardsClient";

export const dynamic = "force-dynamic";

export default async function AdminContentCardsPage() {
  let services: any[] = [];
  let aboutFeatures: any[] = [];
  let errorMsg = "";
  try {
    services = await d1Query("SELECT * FROM content_cards WHERE section='services' ORDER BY sort_order");
  } catch (e: any) { errorMsg = e.message; }
  try {
    aboutFeatures = await d1Query("SELECT * FROM content_cards WHERE section='about_features' ORDER BY sort_order");
  } catch (e: any) { errorMsg = errorMsg || e.message; }

  return (
    <ContentCardsClient
      services={services.map((s: any) => ({ ...s, is_active: !!s.is_active }))}
      aboutFeatures={aboutFeatures.map((s: any) => ({ ...s, is_active: !!s.is_active }))}
      errorMsg={errorMsg}
    />
  );
}
