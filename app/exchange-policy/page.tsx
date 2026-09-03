import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { buildMetadata } from "@/lib/seo";
import { exchangeReturnPolicySections } from "@/lib/exchangeReturnPolicyContent";

export const metadata: Metadata = buildMetadata({
  title: "سياسة الاستبدال",
  description:
    "تعرف على سياسة الاستبدال لدى الفرعون للأثاث: أحكام استبدال المنتجات المصنعة حسب الطلب والمنتجات القياسية، وشروط الفحص عند الاستلام وفقًا للقانون المصري.",
  path: "/exchange-policy",
});

export default function ExchangePolicyPage() {
  return <PolicyPage title="سياسة الاستبدال" sections={exchangeReturnPolicySections} />;
}
