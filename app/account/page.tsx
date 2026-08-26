import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { d1Query } from "@/lib/d1";
import AccountLogoutButton from "./AccountLogoutButton";


const text = {
  title: { ar: "حسابي", en: "My Account" },
  logout: { ar: "تسجيل الخروج", en: "Logout" },
  profileTitle: { ar: "بيانات الحساب", en: "Profile Information" },
  name: { ar: "الاسم", en: "Name" },
  phone: { ar: "الهاتف", en: "Phone" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  memberSince: { ar: "عضو منذ", en: "Member Since" },
  ordersTitle: { ar: "طلباتي", en: "My Orders" },
  noOrders: { ar: "لا توجد طلبات حتى الآن", en: "No orders yet" },
  orderNumber: { ar: "رقم الطلب", en: "Order #" },
  total: { ar: "الإجمالي", en: "Total" },
  status: { ar: "الحالة", en: "Status" },
  date: { ar: "التاريخ", en: "Date" },
  wishlistTitle: { ar: "المفضلة", en: "Wishlist" },
  noWishlist: { ar: "قائمة المفضلة فارغة", en: "Your wishlist is empty" },
  currency: { ar: "ج.م", en: "EGP" },
};

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: orders }, { data: wishlistRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("wishlists").select("product_id").eq("user_id", user.id),
  ]);

  let wishlistProducts: any[] = [];
  const productIds = (wishlistRows ?? []).map((w: any) => w.product_id).filter(Boolean);
  if (productIds.length > 0) {
    try {
      const placeholders = productIds.map(() => "?").join(",");
      wishlistProducts = await d1Query<any>(
        `SELECT p.*, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1) as image FROM products p WHERE p.id IN (${placeholders})`,
        productIds
      );
    } catch {
      wishlistProducts = [];
    }
  }

  return (
    <div className="min-h-screen bg-ivory py-12 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto font-cairo">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal">
            {text.title.ar} <span className="text-charcoal/40 text-lg">/ {text.title.en}</span>
          </h1>
          <div className="flex items-center gap-3">
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg bg-gold-gradient text-charcoal font-bold text-sm hover:opacity-90 transition-opacity"
              >
                لوحة التحكم / Dashboard
              </Link>
            )}
            <AccountLogoutButton label={`${text.logout.ar} / ${text.logout.en}`} />
          </div>
        </div>

        {/* Profile */}
        <section className="bg-white rounded-2xl shadow-sm border border-gold/10 p-6 mb-8">
          <h2 className="font-bold text-lg text-charcoal mb-4">
            {text.profileTitle.ar} <span className="text-charcoal/40 text-sm">/ {text.profileTitle.en}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-charcoal/50 mb-1">{text.name.ar} / {text.name.en}</p>
              <p className="font-bold text-charcoal">{profile?.full_name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 mb-1">{text.phone.ar} / {text.phone.en}</p>
              <p className="font-bold text-charcoal">{profile?.phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 mb-1">{text.email.ar} / {text.email.en}</p>
              <p className="font-bold text-charcoal break-all">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 mb-1">{text.memberSince.ar} / {text.memberSince.en}</p>
              <p className="font-bold text-charcoal">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ar-EG") : "-"}
              </p>
            </div>
          </div>
        </section>

        {/* Orders */}
        <section className="bg-white rounded-2xl shadow-sm border border-gold/10 mb-8 overflow-x-auto">
          <div className="p-6 pb-4 font-bold text-lg text-charcoal">
            {text.ordersTitle.ar} <span className="text-charcoal/40 text-sm">/ {text.ordersTitle.en}</span>
          </div>
          {(orders ?? []).length === 0 ? (
            <p className="px-6 pb-6 text-center text-charcoal/40 text-sm">
              {text.noOrders.ar} / {text.noOrders.en}
            </p>
          ) : (
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-charcoal/50 text-xs border-t border-b border-gold/10">
                  <th className="text-start p-3">{text.orderNumber.ar}</th>
                  <th className="text-start p-3">{text.total.ar}</th>
                  <th className="text-start p-3">{text.status.ar}</th>
                  <th className="text-start p-3">{text.date.ar}</th>
                </tr>
              </thead>
              <tbody>
                {(orders ?? []).map((o: any) => (
                  <tr key={o.id} className="border-b border-gold/5 last:border-0">
                    <td className="p-3 font-bold">{o.order_number}</td>
                    <td className="p-3">
                      {o.total?.toLocaleString()} {text.currency.ar}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-goldDark font-bold">{o.status}</span>
                    </td>
                    <td className="p-3">{new Date(o.created_at).toLocaleDateString("ar-EG")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Wishlist */}
        <section className="bg-white rounded-2xl shadow-sm border border-gold/10 p-6">
          <h2 className="font-bold text-lg text-charcoal mb-4">
            {text.wishlistTitle.ar} <span className="text-charcoal/40 text-sm">/ {text.wishlistTitle.en}</span>
          </h2>
          {wishlistProducts.length === 0 ? (
            <p className="text-center text-charcoal/40 text-sm py-4">
              {text.noWishlist.ar} / {text.noWishlist.en}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {wishlistProducts.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.slug}`}
                  className="group rounded-xl border border-gold/10 overflow-hidden bg-ivory hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-white overflow-hidden">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name_ar}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-charcoal text-sm truncate">{p.name_ar}</p>
                    <p className="text-goldDark font-bold text-sm mt-1">
                      {p.price?.toLocaleString()} {text.currency.ar}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
