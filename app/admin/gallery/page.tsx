import { d1Query } from "@/lib/d1";
import GallerySlideFormModal from "./GallerySlideFormModal";
import DeleteGallerySlideButton from "./DeleteGallerySlideButton";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  let slides: any[] = [];
  let errorMsg = "";
  try { slides = await d1Query("SELECT * FROM gallery_slides ORDER BY sort_order"); } catch (e: any) { errorMsg = e.message; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">معرض الصور</h1>
        <GallerySlideFormModal />
      </div>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((s: any) => (
          <div key={s.id} className="bg-white rounded-xl border border-gold/10 overflow-hidden">
            <img src={s.image_url} className="w-full h-32 object-cover" />
            <div className="p-3">
              <p className="font-bold text-sm">{s.title_ar}</p>
              <p className="text-xs text-charcoal/50 mb-2">{s.subtitle_ar}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold ${s.is_active ? "text-green-700" : "text-red-700"}`}>{s.is_active ? "مفعل" : "معطل"}</span>
                <div className="flex gap-2">
                  <GallerySlideFormModal initial={{ ...s, is_active: !!s.is_active }} />
                  <DeleteGallerySlideButton id={s.id} />
                </div>
              </div>
            </div>
          </div>
        ))}
        {slides.length === 0 && <p className="text-charcoal/40 col-span-full text-center py-8">لا توجد صور بعد</p>}
      </div>
    </div>
  );
}
