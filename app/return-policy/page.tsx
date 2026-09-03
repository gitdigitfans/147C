import PolicyPage from "@/components/PolicyPage";
import { exchangeReturnPolicySections } from "@/lib/exchangeReturnPolicyContent";

export default function ReturnPolicyPage() {
  return <PolicyPage title="سياسة الاسترجاع" sections={exchangeReturnPolicySections} />;
}
