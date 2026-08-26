import { d1Query } from "@/lib/d1";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  let shippingRates: any[] = [];
  let paymentMethods: any[] = [];
  try {
    shippingRates = await d1Query("SELECT * FROM shipping_rates WHERE is_active = 1 ORDER BY sort_order");
  } catch {
    shippingRates = [];
  }
  try {
    paymentMethods = await d1Query("SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY sort_order");
  } catch {
    paymentMethods = [];
  }

  return <CheckoutClient shippingRates={shippingRates} paymentMethods={paymentMethods} />;
}
