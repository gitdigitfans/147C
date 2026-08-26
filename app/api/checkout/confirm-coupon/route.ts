import { NextRequest, NextResponse } from "next/server";
import { d1Execute } from "@/lib/d1";

// Increments the coupon's used_count in D1 after an order is successfully placed
// with that coupon applied. Coupons (and used_count) live in D1 - see
// app/admin/coupons/actions.ts - while coupon_usages (per-order tracking) lives
// in Supabase and is inserted directly from the checkout client.
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ ok: false, message: "invalid" }, { status: 400 });
    }
    await d1Execute("UPDATE coupons SET used_count = used_count + 1 WHERE code = ?", [code.trim()]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
