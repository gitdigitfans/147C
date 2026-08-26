import { NextRequest, NextResponse } from "next/server";
import { d1Query } from "@/lib/d1";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, message: "invalid" });
    }

    const rows = await d1Query("SELECT * FROM coupons WHERE code = ?", [code.trim()]);
    const coupon = rows?.[0];

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "not_found" });
    }
    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, message: "invalid" });
    }

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json({ valid: false, message: "expired" });
    }
    if (coupon.ends_at && new Date(coupon.ends_at) < now) {
      return NextResponse.json({ valid: false, message: "expired" });
    }

    if (coupon.min_order_amount != null && Number(subtotal) < Number(coupon.min_order_amount)) {
      return NextResponse.json({ valid: false, message: "min_order" });
    }

    if (coupon.usage_limit != null && Number(coupon.used_count) >= Number(coupon.usage_limit)) {
      return NextResponse.json({ valid: false, message: "limit_reached" });
    }

    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (Number(subtotal) * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount != null) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount));
      }
    } else {
      discountAmount = Number(coupon.discount_value);
    }
    discountAmount = Math.min(discountAmount, Number(subtotal));

    return NextResponse.json({
      valid: true,
      discountAmount,
      code: coupon.code,
      description: coupon.description_ar,
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: "invalid" }, { status: 500 });
  }
}
