import { d1Query } from "@/lib/d1";
import BannerFormModal from "./BannerFormModal";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";


export default async function AdminBannersPage() {
  let banners: any[] = [];
  let errorMsg = "";
  try { banners = await d1Query("SELECT * FROM banners ORDER BY sort_order"); } catch (e: any) { errorMsg = e.message; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">البانرات</h1>
        <BannerFormModal />
      </div>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b: any) => (
          <div key={b.id} className="bg-white rounded-xl border border-gold/10 overflow-hidden">
            <div className="relative">
              {b.media_type === "video" ? (
                b.image_url ? (
                  <img src={b.image_url} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-charcoal/10 flex items-center justify-center text-charcoal/40 text-xs">فيديو بدون صورة مصغرة</div>
                )
              ) : (
                <img src={b.image_url} className="w-full h-32 object-cover" />
              )}
              {b.media_type === "video" && (
                <span className="absolute top-2 start-2 bg-charcoal/80 text-ivory text-xs px-2 py-1 rounded-full font-bold">فيديو</span>
              )}
            </div>
            <div className="p-3">
              <p className="font-bold text-sm">{b.title_ar}</p>
              <p className="text-xs text-charcoal/50 mb-2">{b.position}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold ${b.is_active ? "text-green-700" : "text-red-700"}`}>{b.is_active ? "مفعل" : "معطل"}</span>
                <div className="flex gap-2">
                  <BannerFormModal initial={{ ...b, is_active: !!b.is_active }} />
                  <DeleteButton id={b.id} />
                </div>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-charcoal/40 col-span-full text-center py-8">لا توجد بانرات بعد</p>}
      </div>
    </div>
  );
}
