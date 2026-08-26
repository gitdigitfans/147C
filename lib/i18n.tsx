"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Locale = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const dict: Dict = {
  brand: { ar: "الفرعون للأثاث", en: "Pharaoh Furniture" },
  nav_home: { ar: "الرئيسية", en: "Home" },
  nav_shop: { ar: "المتجر", en: "Shop" },
  nav_categories: { ar: "التصنيفات", en: "Categories" },
  nav_about: { ar: "من نحن", en: "About Us" },
  nav_services: { ar: "خدماتنا", en: "Services" },
  nav_contact: { ar: "اتصل بنا", en: "Contact Us" },
  nav_gallery: { ar: "معرض الصور", en: "Gallery" },
  nav_offers: { ar: "العروض", en: "Offers" },

  hero_cta: { ar: "تسوق الآن", en: "Shop Now" },
  latest_products: { ar: "أحدث المنتجات", en: "Latest Products" },
  best_products: { ar: "أفضل المنتجات", en: "Best Products" },
  bestseller_badge: { ar: "الأكثر مبيعاً", en: "Best Seller" },
  about_us_title: { ar: "من نحن", en: "About Us" },
  bedrooms_banner_title: { ar: "غرف النوم", en: "Bedrooms" },
  bedrooms_banner_sub: { ar: "اكتشف تشكيلتنا الفاخرة من غرف النوم", en: "Discover our luxury bedroom collection" },
  gallery_section_title: { ar: "معرض التصاميم", en: "Design Gallery" },
  gallery_section_sub: { ar: "لمحة من أجمل تصاميمنا وتنفيذاتنا", en: "A glimpse of our finest designs and work" },
  offers_title: { ar: "العروض", en: "Special Offers" },
  offer_shop_now: { ar: "تسوق الآن", en: "Shop now" },
  offer_off: { ar: "خصم", en: "OFF" },
  offer_free_shipping_label: { ar: "شحن مجاني", en: "Free Shipping" },
  testimonials_title: { ar: "آراء العملاء", en: "Customer Testimonials" },
  partners_title: { ar: "شركاء النجاح", en: "Success Partners" },
  contact_cta_title: { ar: "تواصل معنا اليوم", en: "Contact Us Today" },
  contact_cta_sub: { ar: "فريقنا جاهز للإجابة على كل استفساراتك", en: "Our team is ready to answer all your inquiries" },
  contact_cta_btn: { ar: "تواصل معنا", en: "Contact Us" },

  add_to_cart: { ar: "أضف للسلة", en: "Add to Cart" },
  added_to_cart: { ar: "تمت الإضافة", en: "Added" },
  view_all: { ar: "عرض الكل", en: "View All" },
  currency: { ar: "ج.م", en: "EGP" },

  shop_title: { ar: "المتجر", en: "Shop" },
  filter_all: { ar: "الكل", en: "All" },
  sort_label: { ar: "ترتيب حسب", en: "Sort by" },
  sort_default: { ar: "الافتراضي", en: "Default" },
  sort_price_asc: { ar: "السعر: من الأقل للأعلى", en: "Price: Low to High" },
  sort_price_desc: { ar: "السعر: من الأعلى للأقل", en: "Price: High to Low" },

  categories_title: { ar: "التصنيفات", en: "Categories" },
  products_count: { ar: "منتج", en: "products" },
  explore_cta: { ar: "استكشف", en: "Explore" },

  about_page_title: { ar: "من نحن", en: "About Us" },
  about_text: {
    ar: "شركة مصرية متخصصة في تصميم وتصنيع الأثاث المنزلي والفندقي، تقدم مجموعة متنوعة من الأثاث المودرن والكلاسيك المصنوع من الأخشاب الطبيعية مع التركيز على الجودة، التشطيب الدقيق، وخدمة ما بعد البيع.",
    en: "An Egyptian company specialized in designing and manufacturing home and hotel furniture, offering a diverse range of modern and classic furniture made of natural wood, focusing on quality, precise finishing, and after-sales service.",
  },
  vision_title: { ar: "رؤيتنا", en: "Our Vision" },
  vision_text: {
    ar: "أن تصبح الوجهة الأولى للأثاث الفاخر في مصر من خلال الجمع بين جودة التصنيع، التصميم العصري، والأسعار المناسبة.",
    en: "To become the leading destination for luxury furniture in Egypt by combining manufacturing quality, modern design, and reasonable prices.",
  },
  mission_title: { ar: "رسالتنا", en: "Our Mission" },
  mission_text: {
    ar: "تقديم حلول أثاث متكاملة تجمع بين الجمال، الجودة، والراحة لتناسب مختلف الأذواق والمساحات.",
    en: "Providing integrated furniture solutions that combine beauty, quality, and comfort to suit various tastes and spaces.",
  },
  features_title: { ar: "لماذا الفرعون للأثاث؟", en: "Why Pharaoh Furniture?" },
  stats_title: { ar: "أرقامنا تتحدث", en: "Our Numbers Speak" },
  stat_years: { ar: "سنوات خبرة", en: "Years of Experience" },
  stat_clients: { ar: "عميل راضٍ", en: "Happy Clients" },
  stat_branches: { ar: "فروع", en: "Branches" },

  services_page_title: { ar: "خدماتنا", en: "Our Services" },
  services_page_sub: { ar: "نقدم لك تجربة متكاملة من التصميم حتى التسليم", en: "We offer you a complete experience from design to delivery" },

  contact_page_title: { ar: "اتصل بنا", en: "Contact Us" },
  contact_page_sub: { ar: "يسعدنا تواصلك معنا في أي وقت", en: "We are happy to hear from you anytime" },
  form_name: { ar: "الاسم", en: "Name" },
  form_email: { ar: "البريد الإلكتروني", en: "Email" },
  form_phone: { ar: "رقم الهاتف", en: "Phone Number" },
  form_message: { ar: "الرسالة", en: "Message" },
  form_submit: { ar: "إرسال", en: "Send" },
  form_success: { ar: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً", en: "Your message has been sent successfully! We will contact you soon" },
  form_error: { ar: "حدث خطأ أثناء الإرسال، حاول مرة أخرى", en: "Something went wrong while sending, please try again" },
  company_info_title: { ar: "معلومات التواصل", en: "Contact Information" },
  address_label: { ar: "العنوان", en: "Address" },
  address_value: { ar: "القاهرة، مصر", en: "Cairo, Egypt" },
  phone_label: { ar: "الهاتف", en: "Phone" },
  email_label: { ar: "البريد الإلكتروني", en: "Email" },
  branches_title: { ar: "فروعنا", en: "Our Branches" },
  working_hours_label: { ar: "مواعيد العمل", en: "Working Hours" },

  footer_about: {
    ar: "الفرعون للأثاث - شركة مصرية متخصصة في تصميم وتصنيع الأثاث الفاخر بجودة عالية وأسعار تنافسية.",
    en: "Pharaoh Furniture - An Egyptian company specialized in designing and manufacturing luxury furniture with high quality and competitive prices.",
  },
  quick_links: { ar: "روابط سريعة", en: "Quick Links" },
  our_categories: { ar: "تصنيفاتنا", en: "Our Categories" },
  newsletter_title: { ar: "النشرة البريدية", en: "Newsletter" },
  newsletter_placeholder: { ar: "بريدك الإلكتروني", en: "Your email" },
  newsletter_btn: { ar: "اشترك", en: "Subscribe" },
  copyright: { ar: "© 2026 الفرعون للأثاث. جميع الحقوق محفوظة.", en: "© 2026 Pharaoh Furniture. All rights reserved." },

  // Product detail page
  pdp_similar: { ar: "منتجات مشابهة", en: "Similar Products" },
  pdp_related: { ar: "منتجات مرتبطة", en: "Related Products" },
  pdp_also_bought: { ar: "اشتراها عملاء آخرون", en: "Also Bought" },
  pdp_specs: { ar: "المواصفات", en: "Specifications" },
  pdp_faq: { ar: "الأسئلة الشائعة", en: "FAQ" },
  pdp_reviews: { ar: "آراء العملاء", en: "Reviews" },
  pdp_write_review: { ar: "أضف تقييمك", en: "Write a Review" },
  pdp_your_rating: { ar: "تقييمك", en: "Your Rating" },
  pdp_your_review: { ar: "رأيك", en: "Your Review" },
  pdp_submit_review: { ar: "إرسال التقييم", en: "Submit Review" },
  pdp_review_submitted: { ar: "شكراً لك! تم إرسال تقييمك وسيظهر بعد المراجعة", en: "Thank you! Your review was submitted and will appear after moderation" },
  pdp_no_reviews: { ar: "لا توجد تقييمات بعد. كن أول من يقيّم", en: "No reviews yet. Be the first to review" },
  pdp_consultation: { ar: "طلب استشارة", en: "Request Consultation" },
  pdp_viewing: { ar: "طلب معاينة", en: "Request Viewing" },
  pdp_whatsapp: { ar: "تواصل عبر واتساب", en: "Chat on WhatsApp" },
  pdp_quantity: { ar: "الكمية", en: "Quantity" },
  pdp_wishlist_add: { ar: "أضف للمفضلة", en: "Add to Wishlist" },
  pdp_wishlist_remove: { ar: "إزالة من المفضلة", en: "Remove from Wishlist" },
  pdp_wishlist_login: { ar: "يرجى تسجيل الدخول لإضافة المنتج للمفضلة", en: "Please log in to add to wishlist" },
  pdp_share: { ar: "مشاركة", en: "Share" },
  pdp_share_copied: { ar: "تم نسخ الرابط", en: "Link copied" },
  pdp_request_form_name: { ar: "الاسم", en: "Name" },
  pdp_request_form_phone: { ar: "رقم الهاتف", en: "Phone" },
  pdp_request_form_message: { ar: "رسالة (اختياري)", en: "Message (optional)" },
  pdp_request_form_submit: { ar: "إرسال الطلب", en: "Submit Request" },
  pdp_request_submitted: { ar: "تم إرسال طلبك بنجاح، سنتواصل معك قريباً", en: "Your request was submitted successfully, we'll contact you soon" },
  pdp_stock_in: { ar: "متوفر", en: "In Stock" },
  pdp_stock_out: { ar: "غير متوفر", en: "Out of Stock" },
  pdp_close: { ar: "إغلاق", en: "Close" },
  pdp_description: { ar: "الوصف", en: "Description" },
  pdp_shipping_info: { ar: "مدة الشحن من 40 لـ 60 يوم عمل", en: "Shipping takes 40 to 60 business days" },
  pdp_buy_now: { ar: "اشتري الآن", en: "Buy Now" },
  pdp_added_to_cart_title: { ar: "تمت إضافة المنتج إلى السلة", en: "Added to cart" },
  pdp_go_to_cart: { ar: "الذهاب للسلة", en: "Go to Cart" },
  viewing_now_prefix: { ar: "يشاهد هذا المنتج حاليًا", en: "" },
  viewing_now_suffix: { ar: "شخصًا", en: "people are viewing this product right now" },

  // Cart & Checkout
  cart_title: { ar: "سلة المشتريات", en: "Shopping Cart" },
  cart_empty: { ar: "سلتك فارغة", en: "Your cart is empty" },
  cart_empty_cta: { ar: "تصفح المتجر", en: "Browse the shop" },
  cart_remove: { ar: "إزالة", en: "Remove" },
  cart_subtotal: { ar: "الإجمالي", en: "Subtotal" },
  cart_checkout_btn: { ar: "إتمام الطلب", en: "Checkout" },
  cart_continue_shopping: { ar: "متابعة التسوق", en: "Continue Shopping" },
  checkout_title: { ar: "إتمام الطلب", en: "Checkout" },
  checkout_name: { ar: "الاسم بالكامل", en: "Full Name" },
  checkout_phone: { ar: "رقم الهاتف", en: "Phone Number" },
  checkout_email: { ar: "البريد الإلكتروني (اختياري)", en: "Email (optional)" },
  checkout_address: { ar: "العنوان بالتفصيل", en: "Full Address" },
  checkout_governorate: { ar: "المحافظة", en: "Governorate" },
  checkout_notes: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  checkout_payment_method: { ar: "طريقة الدفع", en: "Payment Method" },
  checkout_payment_cod: { ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
  checkout_submit: { ar: "تأكيد الطلب", en: "Place Order" },
  checkout_submitting: { ar: "جاري إرسال الطلب...", en: "Placing order..." },
  checkout_order_summary: { ar: "ملخص الطلب", en: "Order Summary" },
  checkout_success_title: { ar: "تم استلام طلبك بنجاح!", en: "Your order was placed successfully!" },
  checkout_success_sub: { ar: "سيتواصل معك فريقنا قريباً لتأكيد الطلب", en: "Our team will contact you soon to confirm your order" },
  checkout_success_order_number: { ar: "رقم الطلب", en: "Order Number" },
  checkout_back_home: { ar: "العودة للرئيسية", en: "Back to Home" },
  checkout_error: { ar: "حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى", en: "Something went wrong placing your order, please try again" },

  // Checkout - shipping, payment methods, coupons
  checkout_governorate_select: { ar: "اختر المحافظة", en: "Select governorate" },
  checkout_shipping_cost: { ar: "تكلفة الشحن", en: "Shipping cost" },
  checkout_shipping_free: { ar: "مجاني", en: "Free" },
  checkout_payment_methods_title: { ar: "اختر طريقة الدفع", en: "Choose payment method" },
  checkout_payment_type_bank: { ar: "حساب بنكي", en: "Bank Account" },
  checkout_payment_type_wallet: { ar: "محفظة إلكترونية", en: "E-Wallet" },
  checkout_payment_type_instapay: { ar: "إنستاباي", en: "InstaPay" },
  checkout_payment_type_cod: { ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
  checkout_payment_account_name: { ar: "اسم صاحب الحساب", en: "Account holder" },
  checkout_payment_account_number: { ar: "رقم الحساب", en: "Account number" },
  checkout_payment_instructions: { ar: "تعليمات الدفع", en: "Payment instructions" },
  checkout_upload_proof: { ar: "ارفع صورة إثبات الدفع", en: "Upload payment proof" },
  checkout_upload_proof_required: { ar: "يرجى رفع صورة إثبات الدفع قبل تأكيد الطلب", en: "Please upload payment proof before placing the order" },
  checkout_coupon_placeholder: { ar: "أدخل كود الخصم", en: "Enter coupon code" },
  checkout_coupon_apply: { ar: "تطبيق", en: "Apply" },
  checkout_coupon_applying: { ar: "جاري التحقق...", en: "Checking..." },
  checkout_coupon_discount: { ar: "الخصم", en: "Discount" },
  checkout_coupon_remove: { ar: "إزالة", en: "Remove" },
  checkout_coupon_success: { ar: "تم تطبيق كود الخصم بنجاح", en: "Coupon applied successfully" },
  checkout_coupon_error_not_found: { ar: "كود الخصم غير موجود", en: "Coupon code not found" },
  checkout_coupon_error_expired: { ar: "كود الخصم غير صالح حالياً", en: "Coupon is not currently valid" },
  checkout_coupon_error_min_order: { ar: "الحد الأدنى للطلب غير مستوفى لاستخدام هذا الكود", en: "Order does not meet the minimum amount for this coupon" },
  checkout_coupon_error_limit_reached: { ar: "تم استنفاد عدد مرات استخدام هذا الكود", en: "This coupon has reached its usage limit" },
  checkout_coupon_error_invalid: { ar: "كود الخصم غير صالح", en: "Invalid coupon code" },
  checkout_total: { ar: "الإجمالي النهائي", en: "Total" },

  // Quality / craftsmanship section (homepage)
  quality_label: { ar: "CRAFTED WITH EXCELLENCE", en: "CRAFTED WITH EXCELLENCE" },
  quality_heading: { ar: "جودة تُصنع لتدوم", en: "Quality Built to Last" },
  quality_subtitle: {
    ar: "نختار أجود الخامات بعناية، ونصنع كل قطعة بدقة وإتقان لنقدم لك أثاثاً يجمع بين الجمال، الراحة والاستدامة.",
    en: "We carefully select the finest materials and craft every piece with precision, offering furniture that combines beauty, comfort, and durability.",
  },
  quality_card1_title: { ar: "خشب طبيعي", en: "Natural Wood" },
  quality_card1_desc: {
    ar: "نستخدم أجود أنواع الأخشاب الطبيعية المعالجة ضد الرطوبة والحشرات، لضمان متانة تدوم لسنوات طويلة.",
    en: "We use premium natural wood treated against moisture and insects, ensuring durability that lasts for years.",
  },
  quality_card2_title: { ar: "رخام فاخر", en: "Luxury Marble" },
  quality_card2_desc: {
    ar: "رخام أصلي فاخر يمنح قطعك لمسة من الفخامة، يتم اختياره يدوياً بعناية فائقة.",
    en: "Genuine luxury marble that gives your pieces a touch of elegance, hand-selected with great care.",
  },
  quality_card3_title: { ar: "أقمشة فاخرة", en: "Luxury Fabric" },
  quality_card3_desc: {
    ar: "أقمشة ناعمة عالية الجودة مقاومة للبقع وسهلة التنظيف، توفر راحة وأناقة في آن واحد.",
    en: "Soft, high-quality stain-resistant fabric that's easy to clean, offering comfort and elegance together.",
  },
  quality_card4_title: { ar: "معادن متينة", en: "Durable Metals" },
  quality_card4_desc: {
    ar: "معادن عالية الجودة مطلية بعناية، مقاومة للصدأ والخدوش لضمان أداء متميز على المدى الطويل.",
    en: "High-quality coated metals, resistant to rust and scratches, ensuring outstanding long-term performance.",
  },
  quality_card4_check1: { ar: "مقاومة للصدأ والتآكل", en: "Rust & corrosion resistant" },
  quality_card4_check2: { ar: "ثبات وقوة تحمل عالية", en: "High load-bearing stability" },
  quality_card4_check3: { ar: "تشطيبات أنيقة تدوم طويلاً", en: "Elegant long-lasting finishes" },
  quality_card4_check4: { ar: "تفاصيل دقيقة تعكس الفخامة", en: "Precise details reflecting luxury" },
  quality_discover_more: { ar: "اكتشف المزيد", en: "Discover more" },
  quality_feature1_title: { ar: "ضمان طويل الأمد", en: "Long-term warranty" },
  quality_feature1_sub: { ar: "نضمن جودة كل قطعة", en: "We guarantee every piece's quality" },
  quality_feature2_title: { ar: "تصنيع بدقة عالية", en: "High-precision manufacturing" },
  quality_feature2_sub: { ar: "على يد أمهر الحرفيين", en: "By our finest craftsmen" },
  quality_feature3_title: { ar: "مواد صديقة للبيئة", en: "Eco-friendly materials" },
  quality_feature3_sub: { ar: "للحفاظ على طبيعتنا", en: "To protect our environment" },
  quality_feature4_title: { ar: "راحة تدوم", en: "Lasting comfort" },
  quality_feature4_sub: { ar: "تصميم يجمع بين الجمال والراحة", en: "Design combining beauty and comfort" },
  trustbar_why_label: { ar: "لماذا الفرعون؟", en: "Why Pharaoh?" },
  trustbar_why_sub: { ar: "تفاصيل نصنعها لتدوم", en: "Details we craft to last" },

  // Public gallery page
  gallery_page_title: { ar: "معرض الصور", en: "Gallery" },
  gallery_page_sub: { ar: "لمحة من أجمل تصاميمنا وتنفيذاتنا", en: "A glimpse of our finest designs and work" },
  gallery_empty: { ar: "لا توجد صور بعد", en: "No images yet" },

  // Mobile bottom nav
  bottomnav_home: { ar: "الرئيسية", en: "Home" },
  bottomnav_categories: { ar: "التصنيفات", en: "Categories" },
  bottomnav_search: { ar: "بحث", en: "Search" },
  bottomnav_cart: { ar: "السلة", en: "Cart" },
  bottomnav_account: { ar: "حسابي", en: "Account" },

  // Search
  nav_search: { ar: "بحث", en: "Search" },
  search_placeholder: { ar: "ابحث عن منتج...", en: "Search for a product..." },
  search_label: { ar: "البحث", en: "Search" },
  search_no_results: { ar: "لا توجد نتائج مطابقة للبحث", en: "No results match your search" },

  // Wishlist
  nav_wishlist: { ar: "المفضلة", en: "Wishlist" },
  wishlist_title: { ar: "قائمة المفضلة", en: "Wishlist" },
  wishlist_empty: { ar: "لا توجد منتجات في المفضلة بعد", en: "No products in your wishlist yet" },
  wishlist_login_prompt: { ar: "يرجى تسجيل الدخول لعرض قائمة المفضلة الخاصة بك", en: "Please log in to view your wishlist" },
  wishlist_login_cta: { ar: "تسجيل الدخول", en: "Log In" },
  wishlist_browse_cta: { ar: "تصفح المتجر", en: "Browse the shop" },

  // Public offers page
  offers_page_title: { ar: "العروض والخصومات", en: "Offers & Discounts" },
  offers_page_sub: { ar: "أقوى العروض والخصومات على تشكيلتنا من الأثاث الفاخر", en: "The best offers and discounts on our luxury furniture collection" },
  offers_empty_title: { ar: "لا توجد عروض حالياً", en: "No offers right now" },
  offers_empty_sub: { ar: "تابعنا قريباً لمعرفة أحدث العروض والخصومات", en: "Check back soon for the latest offers and discounts" },
  offers_min_order: { ar: "على طلبات أكتر من", en: "On orders over" },
  offers_use_code: { ar: "استخدم الكود", en: "Use code" },
  offers_auto_apply: { ar: "يُطبّق تلقائيًا", en: "Applied automatically" },
  offers_code_copied: { ar: "تم نسخ الكود", en: "Code copied" },
  offers_view_products: { ar: "منتجات العرض", en: "Offer products" },
};

export function t(key: string, locale: Locale): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[locale];
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "ar",
  setLocale: () => {},
  t: (key: string) => key,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("locale") as Locale | null) : null;
    if (saved === "ar" || saved === "en") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", l);
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value: LocaleContextValue = {
    locale,
    setLocale,
    t: (key: string) => t(key, locale),
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
