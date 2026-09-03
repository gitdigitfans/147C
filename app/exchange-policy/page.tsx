import PolicyPage from "@/components/PolicyPage";
import { exchangeReturnPolicySections } from "@/lib/exchangeReturnPolicyContent";

export default function ExchangePolicyPage() {
  return <PolicyPage title="سياسة الاستبدال" sections={exchangeReturnPolicySections} />;
}
