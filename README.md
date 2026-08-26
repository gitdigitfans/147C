# الفرعون للأثاث | Pharaoh Furniture

واجهة أمامية (Frontend) فاخرة وحديثة لموقع الفرعون للأثاث، مبنية باستخدام Next.js 14 (App Router) و TypeScript و Tailwind CSS و framer-motion.

## طريقة التشغيل

1. تثبيت الحزم:

```
npm install
```

2. تشغيل السيرفر المحلي:

```
npm run dev
```

3. افتح المتصفح على `http://localhost:3000`

## ملاحظات مهمة

- هذا المشروع **واجهة أمامية فقط (Frontend Only)** ولا يحتوي على أي اتصال حقيقي بقاعدة بيانات أو خادم. جميع البيانات (المنتجات، التصنيفات، الخدمات، آراء العملاء) هي بيانات وهمية (Mock Data) موجودة في `lib/data.ts`.
- الصور مأخوذة من خدمة `picsum.photos` كصور بديلة مؤقتة فقط.
- نموذج التواصل في صفحة `/contact` وسلة الشراء في المتجر تعمل بشكل تجريبي (Client-Side) فقط دون إرسال بيانات فعلي لأي خادم.
- سيتم لاحقاً (في مرحلة تالية) ربط الموقع بخدمات خلفية حقيقية:
  - **Cloudflare D1**: لتخزين بيانات الكتالوج (المنتجات والتصنيفات).
  - **Supabase**: لإدارة تسجيل الدخول (Auth) والطلبات وبيانات المستخدمين.
  - **Cloudinary**: لاستضافة وإدارة صور المنتجات الحقيقية.

## لوحة التحكم والربط بالخدمات الخلفية (تحديث)

تم الآن ربط المشروع فعلياً بثلاث خدمات خلفية حقيقية، ولوحة تحكم كاملة على `/admin`:

1. انسخ `.env.local.example` إلى `.env.local` واملأ القيم الناقصة:
   - `CLOUDFLARE_ACCOUNT_ID` و `CLOUDFLARE_API_TOKEN`: أنشئ توكن API من Cloudflare Dashboard (My Profile > API Tokens > Create Token)
     بصلاحية "D1 Edit"، و Account ID موجود في الشريط الجانبي لصفحة Workers & Pages.
   - باقي القيم (Supabase URL/Key و Cloudinary cloud name) معبأة مسبقاً بالقيم الحقيقية للمشروع.
   - تأكد من وجود upload preset غير موقّع (unsigned) باسم `ml_default` في حساب Cloudinary تحت Settings > Upload،
     أو غيّر `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` ليطابق اسم preset آخر لديك.
2. `npm install` لتثبيت `@supabase/supabase-js` و `@supabase/ssr` الجديدتين.
3. الدخول للوحة التحكم: `/admin/login` - يتطلب حساب Supabase له `profiles.is_admin = true`.
4. لا توجد منتجات في D1 حالياً (0 صفوف) - أضف منتجاتك الحقيقية من `/admin/products/new`.
5. صلاحية منح/سحب "مسؤول" (is_admin) وتعديل مصفوفة الأدوار/الصلاحيات مقصورة على مستخدم بدور `super_admin`.

## البنية التقنية

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (ألوان مخصصة: bronze, gold, goldDark, charcoal, ivory)
- framer-motion للحركات والانتقالات
- lucide-react للأيقونات
- دعم اللغتين العربية (افتراضي) والإنجليزية عبر `lib/i18n.tsx` مع حفظ الاختيار في localStorage
