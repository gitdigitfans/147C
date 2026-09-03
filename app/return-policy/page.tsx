import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { buildMetadata } from "@/lib/seo";
import { exchangeReturnPolicySections } from "@/lib/exchangeReturnPolicyContent";

export const metadata: Metadata = buildMetadata({
  title: "سياسة الاسترجاع",
  description:
    "تعرف على سياسة الاسترجاع لدى الفرعون للأثاث: حقوق الاسترجاع للمنتجات القياسية، التعامل مع العيوب، استرداد المبالغ، وشروط الضمان وفقًا للقانون المصري.",
  path: "/return-policy",
});

export default function ReturnPolicyPage() {
  return <PolicyPage title="سياسة الاسترجاع" sections={exchangeReturnPolicySections} />;
}
