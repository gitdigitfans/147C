"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, PackageCheck, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { trackPurchase } from "@/lib/tracking";
import Reveal from "@/components/Reveal";
import CloudinaryUploader from "@/components/CloudinaryUploader";

interface ShippingRate {
  id: string;
  governorate_ar: string;
  governorate_en: string;
  price: number;
  is_active: number;
  sort_order: number;
}

interface PaymentMethod {
  id: string;
  type: "bank" | "wallet" | "instapay" | "cod";
  label_ar: string;
  label_en: string;
  account_name?: string | null;
  account_number?: string | null;
  instructions_ar?: string | null;
  instructions_en?: string | null;
  image_url?: string | null;
  is_active: number;
  sort_order: number;
}

function generateOrderNumber() {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PH-${ymd}-${rand}`;
}

const paymentTypeKey: Record<string, string> = {
  bank: "checkout_payment_type_bank",
  wallet: "checkout_payment_type_wallet",
  instapay: "checkout_payment_type_instapay",
  cod: "checkout_payment_type_cod",
};

const couponErrorKey: Record<string, string> = {
  not_found: "checkout_coupon_error_not_found",
  expired: "checkout_coupon_error_expired",
  min_order: "checkout_coupon_error_min_order",
  limit_reached: "checkout_coupon_error_limit_reached",
  invalid: "checkout_coupon_error_invalid",
};

interface AppliedOfferInfo {
  discountAmount: number;
  freeShipping?: boolean;
  title: string;
  offerId: string;
}

export default function CheckoutClient({
  shippingRates,
  paymentMethods,
}: {
  shippingRates: ShippingRate[];
  paymentMethods: PaymentMethod[];
}) {
  const { t, locale } = useLocale();
  const { items, total: subtotal, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [governorateId, setGovernorateId] = useState("");
  const [notes, setNotes] = useState("");

  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  // A second, parallel discount mechanism (see app/admin/offers). Entered via
  // the same code box as coupons - coupon is tried first, and only if it's
  // not recognized do we fall back to looking the typed code up as an offer.
  const [manualOffer, setManualOffer] = useState<AppliedOfferInfo | null>(null);
  // Automatically-applied offer (no code needed) - fetched whenever the cart
  // changes, independent of whatever the customer typed in the code box.
  // Since automatic offers always have no `code` and manual/coupon codes
  // always require one, these two can never refer to the same offer row, so
  // stacking them additively never double-counts a single offer.
  const [autoOffer, setAutoOffer] = useState<AppliedOfferInfo | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0 && !successOrderNumber) {
      router.replace("/cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, successOrderNumber]);

  const selectedShipping = useMemo(
    () => shippingRates.find((r) => r.id === governorateId) || null,
    [shippingRates, governorateId]
  );
  const shippingAmount = selectedShipping ? Number(selectedShipping.price) : 0;

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((m) => m.id === paymentMethodId) || null,
    [paymentMethods, paymentMethodId]
  );

  // Fetch any automatic (no-code) offer whenever the cart's items/subtotal
  // change, so it shows up even before the customer types anything.
  useEffect(() => {
    if (items.length === 0) {
      setAutoOffer(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/offers/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ id: i.id, categoryId: i.categoryId, price: i.price, qty: i.qty })),
            subtotal,
          }),
        });
        const data = await res.json();
        if (!cancelled) {
          setAutoOffer(
            data?.applied
              ? { discountAmount: data.discountAmount || 0, freeShipping: data.freeShipping, title: data.title, offerId: data.offerId }
              : null
          );
        }
      } catch {
        if (!cancelled) setAutoOffer(null);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, subtotal]);

  const couponDiscount = appliedCoupon?.discountAmount ?? 0;
  const manualOfferDiscount = manualOffer?.discountAmount ?? 0;
  const autoOfferDiscount = autoOffer?.discountAmount ?? 0;
  const discountAmount = couponDiscount + manualOfferDiscount + autoOfferDiscount;
  const freeShipping = !!manualOffer?.freeShipping || !!autoOffer?.freeShipping;
  const effectiveShippingAmount = freeShipping ? 0 : shippingAmount;
  const total = Math.max(0, subtotal + effectiveShippingAmount - discountAmount);

  const requiresProof = !!selectedPaymentMethod && selectedPaymentMethod.type !== "cod";
  const proofMissing = requiresProof && !paymentProofUrl;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    setCouponError(null);
    setManualOffer(null);
    try {
      const res = await fetch("/api/checkout/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
        setCouponError(null);
        return;
      }

      // Coupon didn't recognize this code - fall back to checking whether
      // it matches an offer's code instead (a separate, parallel mechanism).
      setAppliedCoupon(null);
      try {
        const offerRes = await fetch("/api/offers/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ id: i.id, categoryId: i.categoryId, price: i.price, qty: i.qty })),
            subtotal,
            code: couponInput.trim(),
          }),
        });
        const offerData = await offerRes.json();
        if (offerData.applied) {
          setManualOffer({
            discountAmount: offerData.discountAmount || 0,
            freeShipping: offerData.freeShipping,
            title: offerData.title,
            offerId: offerData.offerId,
          });
          setCouponError(null);
        } else {
          setCouponError(couponErrorKey[data.message] || "checkout_coupon_error_invalid");
        }
      } catch {
        setCouponError(couponErrorKey[data.message] || "checkout_coupon_error_invalid");
      }
    } catch {
      setAppliedCoupon(null);
      setManualOffer(null);
      setCouponError("checkout_coupon_error_invalid");
    } finally {
      setCouponApplying(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setManualOffer(null);
    setCouponInput("");
    setCouponError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    if (proofMissing) {
      setError(t("checkout_upload_proof_required"));
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const orderNumber = generateOrderNumber();
      const governorateLabel = selectedShipping?.governorate_ar || "";
      const fullAddress = `${address}${governorateLabel ? " - " + governorateLabel : ""}`;

      const paymentMethodType = selectedPaymentMethod?.type || "cod";
      const paymentMethodLabel = selectedPaymentMethod
        ? locale === "ar"
          ? selectedPaymentMethod.label_ar
          : selectedPaymentMethod.label_en
        : t("checkout_payment_type_cod");

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user?.id ?? null,
          guest_name: name,
          guest_phone: phone,
          guest_email: email || null,
          status: "pending",
          payment_status: "unpaid",
          payment_method: paymentMethodType,
          payment_method_label: paymentMethodLabel,
          payment_proof_url: paymentProofUrl || null,
          governorate: governorateLabel || null,
          subtotal: subtotal,
          discount_amount: discountAmount,
          shipping_amount: effectiveShippingAmount,
          total: total,
          coupon_code: appliedCoupon?.code || null,
          notes: `${fullAddress}${notes ? " | " + notes : ""}`,
        })
        .select()
        .single();

      if (orderError || !order) {
        throw orderError || new Error("order insert failed");
      }

      const orderItemsPayload = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: `${item.name[locale] || item.name.ar}${item.variantLabel ? " — " + item.variantLabel : ""}`,
        product_image: item.image || null,
        unit_price: item.price,
        quantity: item.qty,
        total_price: item.price * item.qty,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
      if (itemsError) throw itemsError;

      if (appliedCoupon) {
        try {
          await supabase.from("coupon_usages").insert({
            coupon_code: appliedCoupon.code,
            user_id: user?.id ?? null,
            order_id: order.id,
          });
        } catch {
          // non-critical - do not block order success
        }
        try {
          await fetch("/api/checkout/confirm-coupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: appliedCoupon.code }),
          });
        } catch {
          // non-critical - do not block order success
        }
      }

      try {
        trackPurchase({
          orderId: orderNumber,
          total,
          items: items.map((item) => ({
            id: item.id,
            name: item.name[locale] || item.name.ar,
            price: item.price,
            quantity: item.qty,
          })),
        });
      } catch {
        // tracking must never block the success screen
      }

      try {
        fetch("/api/integrations/order-created", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            orderNumber,
            total,
            customerName: name,
            customerPhone: phone,
            customerEmail: email || null,
            items: items.map((item) => ({
              name: item.name[locale] || item.name.ar,
              price: item.price,
              quantity: item.qty,
            })),
          }),
        }).catch(() => {
          // fire-and-forget - non-critical
        });
      } catch {
        // must never block the success screen
      }

      setSuccessOrderNumber(orderNumber);
      clear();
    } catch (err) {
      setError(t("checkout_error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (successOrderNumber) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16" dir={locale === "ar" ? "rtl" : "ltr"}>
        <Reveal>
          <div className="bg-white rounded-2xl shadow-xl border border-gold/10 p-10 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-6">
              <PackageCheck className="text-white" size={30} />
            </div>
            <h1 className="font-playfair font-cairo text-2xl font-bold text-charcoal mb-2">
              {t("checkout_success_title")}
            </h1>
            <p className="text-charcoal/60 mb-6">{t("checkout_success_sub")}</p>
            <p className="text-sm text-charcoal/50 mb-8">
              {t("checkout_success_order_number")}: <span className="font-bold text-goldDark">{successOrderNumber}</span>
            </p>
            <Link
              href="/"
              className="px-8 py-3 rounded-full bg-gold-gradient text-charcoal font-bold hover:scale-105 inline-block transition-transform"
            >
              {t("checkout_back_home")}
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Reveal>
        <h1 className="font-playfair font-cairo text-3xl md:text-4xl font-bold text-center mb-12 text-gold-gradient">
          {t("checkout_title")}
        </h1>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Reveal className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-gold/10 p-6 space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center">{error}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-charcoal/70 mb-1">{t("checkout_name")}</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-charcoal/70 mb-1">{t("checkout_phone")}</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal/70 mb-1">{t("checkout_email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-charcoal/70 mb-1">{t("checkout_address")}</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-charcoal/70 mb-1">{t("checkout_governorate")}</label>
                <select
                  required
                  value={governorateId}
                  onChange={(e) => setGovernorateId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold bg-white"
                >
                  <option value="" disabled>
                    {t("checkout_governorate_select")}
                  </option>
                  {shippingRates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {locale === "ar" ? r.governorate_ar : r.governorate_en} —{" "}
                      {Number(r.price) > 0 ? `${r.price} ${t("currency")}` : t("checkout_shipping_free")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal/70 mb-1">{t("checkout_notes")}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal/70 mb-2">{t("checkout_payment_methods_title")}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((m) => {
                  const selected = paymentMethodId === m.id;
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-colors ${
                        selected ? "border-gold bg-ivory" : "border-gold/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={selected}
                        onChange={() => {
                          setPaymentMethodId(m.id);
                          setPaymentProofUrl("");
                        }}
                      />
                      <span className="text-sm font-bold text-charcoal">
                        {locale === "ar" ? m.label_ar : m.label_en}
                      </span>
                      <span className="text-xs text-charcoal/40">({t(paymentTypeKey[m.type] || "checkout_payment_type_cod")})</span>
                    </label>
                  );
                })}
              </div>

              {selectedPaymentMethod && selectedPaymentMethod.type !== "cod" && (
                <div className="mt-3 p-4 rounded-lg border border-gold/30 bg-ivory/50 space-y-2">
                  {selectedPaymentMethod.image_url && (
                    <img
                      src={selectedPaymentMethod.image_url}
                      alt={selectedPaymentMethod.label_ar}
                      className="max-h-32 rounded-lg object-contain mb-2"
                    />
                  )}
                  {selectedPaymentMethod.account_name && (
                    <p className="text-sm text-charcoal">
                      <span className="font-bold">{t("checkout_payment_account_name")}: </span>
                      {selectedPaymentMethod.account_name}
                    </p>
                  )}
                  {selectedPaymentMethod.account_number && (
                    <p className="text-sm text-charcoal">
                      <span className="font-bold">{t("checkout_payment_account_number")}: </span>
                      {selectedPaymentMethod.account_number}
                    </p>
                  )}
                  {(locale === "ar" ? selectedPaymentMethod.instructions_ar : selectedPaymentMethod.instructions_en) && (
                    <p className="text-sm text-charcoal/70 whitespace-pre-line">
                      <span className="font-bold">{t("checkout_payment_instructions")}: </span>
                      {locale === "ar" ? selectedPaymentMethod.instructions_ar : selectedPaymentMethod.instructions_en}
                    </p>
                  )}
                  <div className="pt-2">
                    <CloudinaryUploader
                      label={t("checkout_upload_proof")}
                      previewUrl={paymentProofUrl || undefined}
                      onUploaded={(url) => setPaymentProofUrl(url)}
                    />
                    {proofMissing && (
                      <p className="mt-1 text-xs text-red-600">{t("checkout_upload_proof_required")}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || items.length === 0 || proofMissing}
              className="w-full py-3 rounded-lg bg-gold-gradient text-charcoal font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <Check size={18} /> {submitting ? t("checkout_submitting") : t("checkout_submit")}
            </button>
          </form>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-ivory rounded-2xl border border-gold/20 p-6 sticky top-24">
            <h2 className="font-cairo font-bold text-charcoal mb-4">{t("checkout_order_summary")}</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <img src={item.image} alt={item.name[locale]} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-bold text-charcoal">{item.name[locale]}</p>
                    {item.variantLabel && <p className="text-xs text-charcoal/40">{item.variantLabel}</p>}
                    <p className="text-charcoal/50">
                      {item.qty} × {item.price.toLocaleString()} {t("currency")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gold/20 pt-4 space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t("checkout_coupon_placeholder")}
                  disabled={!!appliedCoupon || !!manualOffer}
                  className="flex-1 px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold text-sm disabled:opacity-60"
                />
                {appliedCoupon || manualOffer ? (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="px-3 py-2 rounded-lg border border-gold/40 text-xs font-bold text-charcoal/70"
                  >
                    {t("checkout_coupon_remove")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponApplying || !couponInput.trim()}
                    className="px-3 py-2 rounded-lg bg-gold-gradient text-charcoal text-xs font-bold flex items-center gap-1 disabled:opacity-60"
                  >
                    {couponApplying && <Loader2 size={12} className="animate-spin" />}
                    {couponApplying ? t("checkout_coupon_applying") : t("checkout_coupon_apply")}
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs text-red-600">{t(couponError)}</p>}
              {appliedCoupon && <p className="text-xs text-green-700">{t("checkout_coupon_success")}</p>}
              {manualOffer && (
                <p className="text-xs text-green-700">
                  {locale === "ar" ? `تم تطبيق عرض: ${manualOffer.title}` : `Offer applied: ${manualOffer.title}`}
                </p>
              )}
              {autoOffer && (
                <p className="text-xs text-green-700">
                  {locale === "ar" ? `عرض تلقائي فعّال: ${autoOffer.title}` : `Automatic offer active: ${autoOffer.title}`}
                </p>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-charcoal/70">
                <span>{t("cart_subtotal")}</span>
                <span>
                  {subtotal.toLocaleString()} {t("currency")}
                </span>
              </div>
              <div className="flex items-center justify-between text-charcoal/70">
                <span>{t("checkout_shipping_cost")}</span>
                <span>
                  {freeShipping
                    ? t("checkout_shipping_free")
                    : shippingAmount > 0
                    ? `${shippingAmount.toLocaleString()} ${t("currency")}`
                    : t("checkout_shipping_free")}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-green-700">
                  <span>{t("checkout_coupon_discount")}</span>
                  <span>
                    -{couponDiscount.toLocaleString()} {t("currency")}
                  </span>
                </div>
              )}
              {manualOffer && manualOfferDiscount > 0 && (
                <div className="flex items-center justify-between text-green-700">
                  <span>{locale === "ar" ? "خصم العرض" : "Offer discount"}</span>
                  <span>
                    -{manualOfferDiscount.toLocaleString()} {t("currency")}
                  </span>
                </div>
              )}
              {autoOffer && autoOfferDiscount > 0 && (
                <div className="flex items-center justify-between text-green-700">
                  <span>{locale === "ar" ? "خصم عرض تلقائي" : "Automatic offer discount"}</span>
                  <span>
                    -{autoOfferDiscount.toLocaleString()} {t("currency")}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-gold/20 mt-4 pt-4 flex items-center justify-between font-bold text-charcoal">
              <span>{t("checkout_total")}</span>
              <span className="text-goldDark">
                {total.toLocaleString()} {t("currency")}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
