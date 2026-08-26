export type Locale = "ar" | "en";

// Returns a stable image URL using picsum.photos (reliable, no API key needed).
export function furnitureImg(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

export interface Category {
  slug: string;
  name: { ar: string; en: string };
  seed: string;
  count: number;
}

export interface Product {
  id: number;
  name: { ar: string; en: string };
  category: string; // slug
  price: number;
  oldPrice?: number;
  seed: string;
  bestseller?: boolean;
  offer?: boolean;
}

export interface Service {
  icon: string;
  name: { ar: string; en: string };
  desc: { ar: string; en: string };
}

export interface Feature {
  icon: string;
  name: { ar: string; en: string };
}

export interface Testimonial {
  name: { ar: string; en: string };
  text: { ar: string; en: string };
  rating: number;
  seed: string;
}

export const categories: Category[] = [
  { slug: "bedrooms", name: { ar: "غرف نوم", en: "Bedrooms" }, seed: "bedroom1", count: 5 },
  { slug: "dining", name: { ar: "غرف سفرة", en: "Dining Rooms" }, seed: "dining1", count: 4 },
  { slug: "kids", name: { ar: "غرف أطفال", en: "Kids Rooms" }, seed: "kids1", count: 3 },
  { slug: "entree", name: { ar: "انتريهات", en: "Entrée Sets" }, seed: "entree1", count: 4 },
  { slug: "salons", name: { ar: "صالونات", en: "Salons" }, seed: "salon1", count: 3 },
  { slug: "corner", name: { ar: "ركن", en: "Corner Sets" }, seed: "corner1", count: 3 },
  { slug: "dressing", name: { ar: "دريسنج روم", en: "Dressing Rooms" }, seed: "dressing1", count: 2 },
  { slug: "tv-units", name: { ar: "وحدات تلفزيون", en: "TV Units" }, seed: "tvunit1", count: 4 },
  { slug: "tables", name: { ar: "ترابيزات", en: "Tables" }, seed: "table1", count: 3 },
  { slug: "cabinets", name: { ar: "جزامات", en: "Cabinets" }, seed: "cabinet1", count: 2 },
  { slug: "lazy-boy", name: { ar: "ليزي بوي", en: "Lazy Boy" }, seed: "lazyboy1", count: 3 },
  { slug: "ready", name: { ar: "منتجات جاهزة للاستلام", en: "Ready to Pickup" }, seed: "ready1", count: 3 },
  { slug: "offers", name: { ar: "عروض خاصة", en: "Special Offers" }, seed: "offer1", count: 4 },
  { slug: "misc", name: { ar: "متنوع", en: "Miscellaneous" }, seed: "misc1", count: 3 },
];

export const products: Product[] = [
  { id: 1, name: { ar: "غرفة نوم كلاسيك ملكية", en: "Royal Classic Bedroom" }, category: "bedrooms", price: 45000, seed: "prod-bed-1", bestseller: true },
  { id: 2, name: { ar: "غرفة نوم مودرن رمادي", en: "Modern Gray Bedroom" }, category: "bedrooms", price: 38000, seed: "prod-bed-2" },
  { id: 3, name: { ar: "غرفة نوم خشب زان", en: "Beech Wood Bedroom" }, category: "bedrooms", price: 41000, oldPrice: 47000, seed: "prod-bed-3", offer: true },
  { id: 4, name: { ar: "طقم سفرة 8 كراسي", en: "8-Chair Dining Set" }, category: "dining", price: 32000, seed: "prod-din-1", bestseller: true },
  { id: 5, name: { ar: "طقم سفرة مودرن زجاج", en: "Modern Glass Dining Set" }, category: "dining", price: 28500, seed: "prod-din-2" },
  { id: 6, name: { ar: "سفرة كلاسيك منقوشة", en: "Carved Classic Dining Set" }, category: "dining", price: 36000, seed: "prod-din-3" },
  { id: 7, name: { ar: "غرفة أطفال أميرة", en: "Princess Kids Room" }, category: "kids", price: 22000, seed: "prod-kid-1" },
  { id: 8, name: { ar: "غرفة أطفال كابتن", en: "Captain Kids Room" }, category: "kids", price: 24000, seed: "prod-kid-2", bestseller: true },
  { id: 9, name: { ar: "انتريه مخمل أزرق", en: "Blue Velvet Living Set" }, category: "entree", price: 29500, seed: "prod-ent-1" },
  { id: 10, name: { ar: "انتريه جلد طبيعي", en: "Genuine Leather Living Set" }, category: "entree", price: 52000, seed: "prod-ent-2", bestseller: true },
  { id: 11, name: { ar: "صالون شرقي فاخر", en: "Luxury Oriental Salon" }, category: "salons", price: 34000, seed: "prod-sal-1" },
  { id: 12, name: { ar: "صالون مودرن مينمال", en: "Minimal Modern Salon" }, category: "salons", price: 26500, seed: "prod-sal-2" },
  { id: 13, name: { ar: "ركن قماش رمادي L", en: "Gray Fabric L-Corner" }, category: "corner", price: 27000, oldPrice: 31000, seed: "prod-cor-1", offer: true },
  { id: 14, name: { ar: "ركن جلد بني", en: "Brown Leather Corner" }, category: "corner", price: 33500, seed: "prod-cor-2" },
  { id: 15, name: { ar: "دريسنج روم مرايا كاملة", en: "Full Mirror Dressing Room" }, category: "dressing", price: 19500, seed: "prod-dre-1" },
  { id: 16, name: { ar: "وحدة تلفزيون خشب طبيعي", en: "Natural Wood TV Unit" }, category: "tv-units", price: 12500, seed: "prod-tv-1" },
  { id: 17, name: { ar: "وحدة تلفزيون معلقة مودرن", en: "Modern Floating TV Unit" }, category: "tv-units", price: 9800, seed: "prod-tv-2", bestseller: true },
  { id: 18, name: { ar: "ترابيزة رخام دائرية", en: "Round Marble Table" }, category: "tables", price: 8500, seed: "prod-tab-1" },
  { id: 19, name: { ar: "ترابيزة وسط زجاج", en: "Glass Coffee Table" }, category: "tables", price: 6200, seed: "prod-tab-2" },
  { id: 20, name: { ar: "جزامة كلاسيك منقوشة", en: "Classic Carved Cabinet" }, category: "cabinets", price: 15500, seed: "prod-cab-1" },
  { id: 21, name: { ar: "كرسي ليزي بوي جلد", en: "Leather Lazy Boy Chair" }, category: "lazy-boy", price: 11000, seed: "prod-laz-1", bestseller: true },
  { id: 22, name: { ar: "كرسي ليزي بوي قماش", en: "Fabric Lazy Boy Chair" }, category: "lazy-boy", price: 9200, seed: "prod-laz-2" },
  { id: 23, name: { ar: "طقم جاهز للاستلام فوري", en: "Instant Pickup Set" }, category: "ready", price: 17500, seed: "prod-rdy-1" },
  { id: 24, name: { ar: "عرض خاص: غرفة نوم + دريسنج", en: "Special Offer: Bedroom + Dressing", }, category: "offers", price: 55000, oldPrice: 68000, seed: "prod-off-1", offer: true },
];

export const services: Service[] = [
  { icon: "PenTool", name: { ar: "تصميم أثاث حسب الطلب", en: "Custom Furniture Design" }, desc: { ar: "تصميمات فريدة تناسب ذوقك ومساحتك", en: "Unique designs tailored to your taste and space" } },
  { icon: "Hammer", name: { ar: "تصنيع الأثاث", en: "Furniture Manufacturing" }, desc: { ar: "تصنيع دقيق بأيدٍ مصرية ماهرة", en: "Precise manufacturing by skilled Egyptian hands" } },
  { icon: "Home", name: { ar: "تصميم داخلي", en: "Interior Design" }, desc: { ar: "تنسيق كامل لمساحتك من الألف للياء", en: "Complete coordination of your space from A to Z" } },
  { icon: "MessageCircle", name: { ar: "استشارة مجانية", en: "Free Consultation" }, desc: { ar: "استشارة مجانية مع خبرائنا قبل التنفيذ", en: "Free consultation with our experts before execution" } },
  { icon: "Box", name: { ar: "تصميم ثلاثي الأبعاد (3D)", en: "3D Design" }, desc: { ar: "معاينة تصميمك بتقنية ثلاثية الأبعاد", en: "Preview your design in realistic 3D" } },
  { icon: "Layers", name: { ar: "اختيار الخامات", en: "Material Selection" }, desc: { ar: "أفضل الخامات الطبيعية بجودة عالية", en: "Finest natural materials of high quality" } },
  { icon: "Calculator", name: { ar: "تقدير التكلفة", en: "Cost Estimation" }, desc: { ar: "تقدير دقيق وشفاف للتكلفة مقدماً", en: "Accurate and transparent cost estimation upfront" } },
  { icon: "ShieldCheck", name: { ar: "خدمة ما بعد البيع", en: "After-Sales Service" }, desc: { ar: "متابعة ودعم مستمر بعد الاستلام", en: "Ongoing follow-up and support after delivery" } },
];

export const features: Feature[] = [
  { icon: "Gem", name: { ar: "خامات عالية الجودة", en: "High-Quality Materials" } },
  { icon: "Trees", name: { ar: "أخشاب طبيعية", en: "Natural Wood" } },
  { icon: "Factory", name: { ar: "تصنيع مصري", en: "Made in Egypt" } },
  { icon: "Sparkles", name: { ar: "تشطيب احترافي", en: "Professional Finish" } },
  { icon: "Palette", name: { ar: "تصميمات مودرن وكلاسيك", en: "Modern & Classic Designs" } },
  { icon: "BadgePercent", name: { ar: "أسعار تنافسية", en: "Competitive Prices" } },
  { icon: "Ruler", name: { ar: "تنفيذ حسب المقاسات", en: "Custom Sizing" } },
  { icon: "ShieldCheck", name: { ar: "ضمان الجودة", en: "Quality Guarantee" } },
  { icon: "Truck", name: { ar: "شحن لجميع المحافظات", en: "Shipping Nationwide" } },
  { icon: "Headset", name: { ar: "خدمة عملاء سريعة", en: "Fast Customer Service" } },
];

export const testimonials: Testimonial[] = [
  { name: { ar: "أحمد عبد الله", en: "Ahmed Abdullah" }, text: { ar: "جودة رائعة وتشطيب ممتاز، فاق توقعاتي تماماً", en: "Amazing quality and excellent finish, exceeded my expectations" }, rating: 5, seed: "cust1" },
  { name: { ar: "مروة سامي", en: "Marwa Sami" }, text: { ar: "تعامل راقٍ وسرعة في التنفيذ، أنصح بشدة", en: "Great service and fast execution, highly recommend" }, rating: 5, seed: "cust2" },
  { name: { ar: "خالد إبراهيم", en: "Khaled Ibrahim" }, text: { ar: "أثاث فاخر بسعر مناسب جداً مقارنة بالسوق", en: "Luxury furniture at a very reasonable price compared to the market" }, rating: 4, seed: "cust3" },
  { name: { ar: "سارة محمود", en: "Sara Mahmoud" }, text: { ar: "غرفة النوم اللي اخدتها فاقت الخيال، شكراً الفرعون", en: "The bedroom I got was beyond imagination, thank you Pharaoh" }, rating: 5, seed: "cust4" },
  { name: { ar: "يوسف طارق", en: "Youssef Tarek" }, text: { ar: "فريق محترف من الاستشارة للتركيب", en: "Professional team from consultation to installation" }, rating: 5, seed: "cust5" },
];

export const heroSlides = [
  { seed: "hero-1", title: { ar: "فخامة تليق بك", en: "Luxury That Suits You" }, subtitle: { ar: "أثاث مصري فاخر بلمسة عصرية", en: "Luxury Egyptian furniture with a modern touch" } },
  { seed: "hero-2", title: { ar: "تصاميم لا تُنسى", en: "Unforgettable Designs" }, subtitle: { ar: "من الكلاسيك إلى المودرن، اختر ما يناسبك", en: "From classic to modern, choose what suits you" } },
  { seed: "hero-3", title: { ar: "جودة تدوم للأجيال", en: "Quality That Lasts Generations" }, subtitle: { ar: "أخشاب طبيعية 100% وتصنيع مصري دقيق", en: "100% natural wood and precise Egyptian craftsmanship" } },
  { seed: "hero-4", title: { ar: "من بيتك يبدأ الفخامة", en: "Luxury Starts at Home" }, subtitle: { ar: "اكتشف مجموعتنا الجديدة الآن", en: "Discover our new collection now" } },
];

export const partners = ["Nile Group", "Cairo Homes", "Delta Interiors", "Golden Villas", "Luxor Living", "Alex Estates"];
