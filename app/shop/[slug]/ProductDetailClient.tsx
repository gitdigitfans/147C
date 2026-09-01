"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  MessageCircle,
  Eye,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  X,
  ZoomIn,
  Truck,
} from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import Reveal from "@/components/Reveal";
import { onImgError } from "@/lib/imageFallback";
import { cldUrl } from "@/lib/cloudinaryUrl";

export interface ProductVM {
  id: string;
  slug: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  shortDescription?: { ar: string; en: string };
  price: number;
  oldPrice?: number;
  categoryName: { ar: string; en: string };
  categoryId?: string;
  images: string[];
  videoUrl?: string;
  specs: { key: { ar: string; en: string }; value: { ar: string; en: string } }[];
  faqs: { question: { ar: string; en: string }; answer: { ar: string; en: string } }[];
  inStock: boolean;
  isMock: boolean;
  viewerCountMin?: number;
  viewerCountMax?: number;
  shippingText?: { ar: string; en: string };
  categorySlug?: string;
}

export interface RelatedVM {
  id: string;
  slug: string;
  name: { ar: string; en: string };
  price: number;
  image: string;
}

export interface ReviewVM {
  id: string;
  name: string;
  rating: number;
  title?: string;
  body?: string;
  createdAt: string;
}

export interface AttributeValueVM {
  id: string;
  value: { ar: string; en: string };
  image_url?: string;
  price_modifier: number;
}

export interface AttributeVM {
  id: string;
  name: { ar: string; en: string };
  values: AttributeValueVM[];
}

interface Props {
  product: ProductVM;
  similar: RelatedVM[];
  related: RelatedVM[];
  alsoBought: RelatedVM[];
  reviews: ReviewVM[];
  initialWishlisted: boolean;
  whatsappNumber?: string;
  attributes?: AttributeVM[];
}

const RAIL_GAP = 16; // px, matches gap-4

function RelatedRail({ title, items, locale }: { title: string; items: RelatedVM[]; locale: "ar" | "en" }) {
  const { t } = useLocale();
  const isRtl = locale === "ar";
  const [visibleCount, setVisibleCount] = useState(5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    function computeVisibleCount() {
      const w = window.innerWidth;
      if (w >= 1024) return 5;
      if (w >= 640) return 3;
      return 2;
    }
    setVisibleCount(computeVisibleCount());
    const onResize = () => setVisibleCount(computeVisibleCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const stepCount = Math.max(1, items.length);

  useEffect(() => {
    if (index > stepCount - 1) setIndex(0);
  }, [stepCount, index]);

  useEffect(() => {
    if (paused || stepCount <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % stepCount);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused, stepCount]);

  const goPrev = () => setIndex((i) => (i - 1 + stepCount) % stepCount);
  const goNext = () => setIndex((i) => (i + 1) % stepCount);

  if (items.length === 0) return null;

  const dir = isRtl ? 1 : -1;
  // Only stretch cards to a fixed percentage-of-container width (and enable
  // the sliding/looping behavior) when there are actually enough items to
  // fill every visible slot. With fewer items than `visibleCount`, stretching
  // to 100/visibleCount% left large dead space after the last real card -
  // instead render those with a natural fixed card width and no sliding.
  const hasEnoughToSlide = items.length > visibleCount;
  const itemWidthPct = 100 / visibleCount;

  // Loop the item list so a single-item step at the end wraps smoothly
  // without a visible jump back to the start.
  const looped = hasEnoughToSlide ? [...items, ...items.slice(0, visibleCount)] : items;

  return (
    <section className="mb-14">
      <h2 className="font-playfair font-cairo text-2xl font-bold mb-6 text-gold-gradient">{title}</h2>
      <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="overflow-hidden -mx-4 px-4">
          <div
            className="flex gap-4 transition-transform duration-700 ease-out"
            style={
              hasEnoughToSlide
                ? { transform: `translateX(${dir * index * itemWidthPct}%)` }
                : undefined
            }
          >
            {looped.map((p, i) => (
              <Link
                key={`${p.id}-${i}`}
                href={`/shop/${p.slug}`}
                className="shrink-0 bg-white rounded-xl shadow-sm border border-gold/10 overflow-hidden hover:shadow-md transition-shadow"
                style={
                  hasEnoughToSlide
                    ? { width: `calc(${itemWidthPct}% - ${((visibleCount - 1) * RAIL_GAP) / visibleCount}px)` }
                    : { width: "192px" }
                }
              >
                <div className="h-36 overflow-hidden">
                  <img src={p.image} alt={p.name[locale]} onError={onImgError} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="font-cairo font-bold text-sm text-charcoal truncate">{p.name[locale]}</p>
                  <p className="text-goldDark font-bold text-sm mt-1">
                    {p.price > 0 ? `${p.price.toLocaleString()} ${t("currency")}` : ""}
                  </p>
                </div>
              </Link>
            ))}
              </div>
        </div>

        {hasEnoughToSlide && stepCount > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="previous"
              className="flex absolute start-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-sm text-charcoal items-center justify-center hover:bg-white transition-colors -translate-x-2 sm:-translate-x-4 rtl:translate-x-2 sm:rtl:translate-x-4"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="next"
              className="flex absolute end-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-sm text-charcoal items-center justify-center hover:bg-white transition-colors translate-x-2 sm:translate-x-4 rtl:-translate-x-2 sm:rtl:-translate-x-4"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}
      </div>

      {hasEnoughToSlide && stepCount > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index % items.length ? "w-5 bg-goldDark" : "w-1.5 bg-gold/30"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function ProductDetailClient({
  product,
  similar,
  related,
  alsoBought,
  reviews,
  initialWishlisted,
  whatsappNumber,
  attributes,
}: Props) {
  const { t, locale } = useLocale();
  const { addItem } = useCart();
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [galleryHovered, setGalleryHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const justDraggedRef = useRef(false);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [addedModalOpen, setAddedModalOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [modalType, setModalType] = useState<"consultation" | "viewing" | null>(null);
  const [reqName, setReqName] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqMessage, setReqMessage] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqSubmitted, setReqSubmitted] = useState(false);

  const [shareCopied, setShareCopied] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [viewerCount, setViewerCount] = useState<number | null>(null);

  // Randomize the social-proof viewer count on each mount (i.e. each page
  // load/visit) within the admin-configured min-max range, so it appears
  // different across visits instead of a single fixed number.
  useEffect(() => {
    const min = product.viewerCountMin;
    const max = product.viewerCountMax;
    if (min == null || max == null || max < min) {
      setViewerCount(null);
      return;
    }
    setViewerCount(Math.floor(Math.random() * (max - min + 1)) + min);
  }, [product.viewerCountMin, product.viewerCountMax]);

  const activeAttributes = attributes || [];

  const selectedValueObjs = activeAttributes
    .map((attr) => {
      const valId = selectedValues[attr.id];
      return attr.values.find((v) => v.id === valId);
    })
    .filter((v): v is AttributeValueVM => !!v);

  const priceModifierTotal = selectedValueObjs.reduce((sum, v) => sum + (v.price_modifier || 0), 0);
  const effectivePrice = product.price + priceModifierTotal;

  const variantImageOverride = [...selectedValueObjs].reverse().find((v) => v.image_url)?.image_url;

  const displayImages = variantImageOverride
    ? [variantImageOverride, ...product.images.filter((img) => img !== variantImageOverride)]
    : product.images;

  // Auto-rotate the main gallery image when there's more than one photo,
  // pausing while the visitor's cursor is over it and while the lightbox is open.
  useEffect(() => {
    if (displayImages.length <= 1 || galleryHovered || lightboxOpen || isDragging) return;
    const interval = setInterval(() => {
      setActiveImage((i) => (i + 1) % displayImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [displayImages.length, galleryHovered, lightboxOpen, isDragging]);

  function goNext() {
    setActiveImage((i) => (i + 1) % displayImages.length);
  }

  function goPrev() {
    setActiveImage((i) => (i - 1 + displayImages.length) % displayImages.length);
  }

  const variantLabel = activeAttributes.length
    ? activeAttributes
        .map((attr) => {
          const val = attr.values.find((v) => v.id === selectedValues[attr.id]);
          return val ? `${attr.name[locale]}: ${val.value[locale]}` : null;
        })
        .filter(Boolean)
        .join(" · ")
    : "";

  function selectAttributeValue(attrId: string, valueId: string) {
    setSelectedValues((prev) => ({ ...prev, [attrId]: valueId }));
    setActiveImage(0);
  }

  const missingAttributes = activeAttributes.filter((attr) => !selectedValues[attr.id]);
  const canAddToCart = missingAttributes.length === 0;

  function addToCart() {
    if (!canAddToCart || effectivePrice <= 0) return false;
    addItem(
      {
        id: variantLabel ? `${product.id}__${variantLabel}` : product.id,
        slug: product.slug,
        name: product.name,
        price: effectivePrice,
        image: displayImages[0],
        variantLabel: variantLabel || undefined,
        categoryId: product.categoryId,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    return true;
  }

  function handleAddToCart() {
    const ok = addToCart();
    if (ok) setAddedModalOpen(true);
  }

  function handleBuyNow() {
    const ok = addToCart();
    if (ok) router.push("/checkout");
  }

  async function toggleWishlist() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (wishlisted) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", product.id);
      setWishlisted(false);
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: product.id });
      setWishlisted(true);
    }
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: product.name[locale], url });
        return;
      } catch {
        // user cancelled or share failed - fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // clipboard unavailable - silently ignore
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("reviews").insert({
        product_id: product.id,
        user_id: user?.id ?? null,
        guest_name: reviewName || null,
        rating: reviewRating,
        body: reviewBody,
        status: "pending",
      });
      setReviewSubmitted(true);
      setReviewBody("");
      setReviewName("");
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!modalType) return;
    setReqSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("product_requests").insert({
        type: modalType,
        product_id: product.id,
        name: reqName,
        phone: reqPhone,
        message: reqMessage || null,
        status: "new",
      });
      if (!error) {
        setReqSubmitted(true);
        const typeLabel =
          modalType === "consultation"
            ? locale === "ar"
              ? "استشارة"
              : "consultation"
            : locale === "ar"
            ? "معاينة"
            : "viewing";
        const waText =
          locale === "ar"
            ? `طلب ${typeLabel} جديد من ${reqName} - ${reqPhone} - بخصوص: ${product.name.ar}${
                reqMessage ? " - " + reqMessage : ""
              }`
            : `New ${typeLabel} request from ${reqName} - ${reqPhone} - regarding: ${product.name.en}${
                reqMessage ? " - " + reqMessage : ""
              }`;
        const waUrl = `https://wa.me/${(whatsappNumber || "+201000000000").replace(/[^\d]/g, "")}?text=${encodeURIComponent(
          waText
        )}`;
        window.open(waUrl, "_blank");
      }
    } finally {
      setReqSubmitting(false);
    }
  }

  const whatsappHref = `https://wa.me/${(whatsappNumber || "+201000000000").replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    (locale === "ar" ? "مرحباً، أنا مهتم بمنتج: " : "Hello, I'm interested in: ") + product.name[locale]
  )}`;

  const isYoutube = product.videoUrl && /youtube\.com|youtu\.be/.test(product.videoUrl);
  const youtubeEmbed = isYoutube
    ? product.videoUrl!.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
    : null;

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="pb-8 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <Reveal>
            <div>
              <div
                className="relative w-full h-80 md:h-[420px] rounded-2xl overflow-hidden bg-ivory group"
                onMouseEnter={() => setGalleryHovered(true)}
                onMouseLeave={() => setGalleryHovered(false)}
              >
                <div className="absolute inset-0 w-full h-full" aria-label="zoom">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      src={cldUrl(displayImages[activeImage], 900)}
                      alt={product.name[locale]}
                      onError={onImgError}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 touch-pan-y cursor-pointer"
                      drag={displayImages.length > 1 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.3}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={(_e, info) => {
                        setIsDragging(false);
                        if (Math.abs(info.offset.x) > 5) {
                          justDraggedRef.current = true;
                        }
                        if (info.offset.x < -80) goNext();
                        else if (info.offset.x > 80) goPrev();
                      }}
                      onClick={() => {
                        if (justDraggedRef.current) {
                          justDraggedRef.current = false;
                          return;
                        }
                        setLightboxOpen(true);
                      }}
                    />
                  </AnimatePresence>
                  <span className="absolute bottom-3 end-3 bg-charcoal/60 text-white rounded-full p-2 pointer-events-none">
                    <ZoomIn size={18} />
                  </span>
                </div>
                {displayImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                      }}
                      aria-label="previous image"
                      className="hidden sm:flex absolute start-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/70 text-charcoal items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                      }}
                      aria-label="next image"
                      className="hidden sm:flex absolute end-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/70 text-charcoal items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  </>
                )}
              </div>
              {displayImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        i === activeImage ? "border-gold" : "border-transparent"
                      }`}
                    >
                      <img src={cldUrl(img, 100)} alt="" onError={onImgError} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {youtubeEmbed && (
                <div className="mt-4 aspect-video rounded-xl overflow-hidden">
                  <iframe src={youtubeEmbed} className="w-full h-full" allowFullScreen title="product video" />
                </div>
              )}
              {product.videoUrl && !isYoutube && (
                <video src={product.videoUrl} controls className="mt-4 w-full rounded-xl" />
              )}
            </div>
          </Reveal>

          {/* Info */}
          <Reveal delay={0.1}>
            <div>
              <p className="text-goldDark font-bold text-sm mb-2">{product.categoryName[locale]}</p>
              <h1 className="font-playfair font-cairo text-2xl md:text-3xl font-bold text-charcoal mb-3">
                {product.name[locale]}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {effectivePrice > 0 && (
                  <>
                    <span className="text-2xl font-bold text-goldDark">
                      {effectivePrice.toLocaleString()} {t("currency")}
                    </span>
                    {product.oldPrice && (
                      <span className="text-charcoal/40 line-through text-sm">
                        {product.oldPrice.toLocaleString()} {t("currency")}
                      </span>
                    )}
                  </>
                )}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                    product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.inStock ? t("pdp_stock_in") : t("pdp_stock_out")}
                </span>
              </div>

              {product.shortDescription?.[locale] && (
                <p className="text-charcoal/80 font-medium leading-relaxed mb-5">
                  {product.shortDescription[locale]}
                </p>
              )}

              {product.shippingText?.[locale] && (
                <div className="flex items-center gap-2 py-2.5 px-4 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm mb-5 w-full justify-center">
                  <Truck size={16} /> {product.shippingText[locale]}
                </div>
              )}

              {product.description[locale] && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setDescOpen((o) => !o)}
                    aria-expanded={descOpen}
                    className="w-full flex items-center justify-between gap-2 cursor-pointer group"
                  >
                    <h3 className="font-cairo font-bold text-charcoal group-hover:text-goldDark transition-colors">
                      {t("pdp_description")}
                    </h3>
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gold/10 text-goldDark shrink-0">
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${descOpen ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {descOpen && (
                      <motion.div
                        key="desc-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pdp-description-html text-charcoal/60 leading-relaxed text-sm pt-2 whitespace-pre-line">
                          {product.description[locale]}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {viewerCount != null && viewerCount > 0 && (
                <div className="flex items-center gap-2 text-sm font-bold text-goldDark bg-gold/10 rounded-lg px-3 py-2 mb-6 w-fit">
                  <Eye size={16} />
                  <span>
                    {`${t("viewing_now_prefix")} ${viewerCount} ${t("viewing_now_suffix")}`.trim().replace(/\s+/g, " ")}
                  </span>
                </div>
              )}

              {/* Variant picker */}
              {activeAttributes.length > 0 && (
                <div className="mb-6 space-y-4">
                  {activeAttributes.map((attr) => (
                    <div key={attr.id}>
                      <h3 className="font-cairo font-bold text-charcoal mb-2 text-sm">{attr.name[locale]}</h3>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((v) => {
                          const selected = selectedValues[attr.id] === v.id;
                          return (
                            <button
                              type="button"
                              key={v.id}
                              onClick={() => selectAttributeValue(attr.id, v.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold transition-colors ${
                                selected ? "border-gold bg-ivory text-goldDark" : "border-gold/30 text-charcoal/70"
                              }`}
                            >
                              {v.image_url && (
                                <img src={v.image_url} alt={v.value[locale]} className="w-6 h-6 rounded-full object-cover" />
                              )}
                              {v.value[locale]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {missingAttributes.length > 0 && (
                    <p className="text-xs font-bold text-red-500">
                      {locale === "ar"
                        ? `برجاء اختيار: ${missingAttributes.map((a) => a.name.ar).join("، ")}`
                        : `Please select: ${missingAttributes.map((a) => a.name.en).join(", ")}`}
                    </p>
                  )}
                </div>
              )}

              {/* Qty + Add to cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 border border-gold/30 rounded-full px-3 py-1.5">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="decrease">
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} aria-label="increase">
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || !effectivePrice}
                  className="flex-1 py-3 rounded-full bg-gold-gradient text-charcoal font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                        <Check size={18} /> {t("added_to_cart")}
                      </motion.span>
                    ) : (
                      <motion.span key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {t("add_to_cart")}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button
                  onClick={toggleWishlist}
                  aria-label={wishlisted ? t("pdp_wishlist_remove") : t("pdp_wishlist_add")}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                    wishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-gold/30 text-charcoal"
                  }`}
                >
                  <Heart size={20} className={wishlisted ? "fill-current" : ""} />
                </button>
              </div>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart || !effectivePrice}
                className="w-full py-3 rounded-xl border-2 border-charcoal text-charcoal font-bold flex items-center justify-center gap-2 hover:bg-charcoal hover:text-ivory transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-4"
              >
                {t("pdp_buy_now")}
              </button>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-green-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  <MessageCircle size={16} /> {t("pdp_whatsapp")}
                </a>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-gold/30 text-charcoal font-bold text-sm hover:bg-gold/10 transition-colors"
                >
                  <Share2 size={16} /> {shareCopied ? t("pdp_share_copied") : t("pdp_share")}
                </button>
                <button
                  onClick={() => {
                    setModalType("consultation");
                    setReqSubmitted(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-gold/30 text-charcoal font-bold text-sm hover:bg-gold/10 transition-colors"
                >
                  {t("pdp_consultation")}
                </button>
                <button
                  onClick={() => {
                    setModalType("viewing");
                    setReqSubmitted(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-gold/30 text-charcoal font-bold text-sm hover:bg-gold/10 transition-colors"
                >
                  <Eye size={16} /> {t("pdp_viewing")}
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Specs + FAQ */}
        {(() => {
          const hasSpecs = product.specs.length > 0;
          const hasFaqs = product.faqs.length > 0;

          interface SpecItem {
            nameAr: string;
            nameEn: string;
            dimsAr: Record<string, string>;
            dimsEn: Record<string, string>;
          }

          const grouped: SpecItem[] = [];
          const ungrouped: typeof product.specs = [];

          for (const s of product.specs) {
            const keyAr = s.key.ar;
            const valAr = s.value.ar;
            const keyEn = s.key.en || s.key.ar;
            const valEn = s.value.en || s.value.ar;
            const dashIdx = keyAr.indexOf(" - ");
            if (dashIdx > 0) {
              const itemNameAr = keyAr.substring(0, dashIdx).trim();
              const dimNameAr = keyAr.substring(dashIdx + 3).trim();
              const dashIdxEn = keyEn.indexOf(" - ");
              const itemNameEn = dashIdxEn > 0 ? keyEn.substring(0, dashIdxEn).trim() : itemNameAr;
              const dimNameEn = dashIdxEn > 0 ? keyEn.substring(dashIdxEn + 3).trim() : dimNameAr;
              const existing = grouped.find((g) => g.nameAr === itemNameAr);
              if (existing) {
                existing.dimsAr[dimNameAr] = valAr;
                existing.dimsEn[dimNameEn] = valEn;
              } else {
                grouped.push({ nameAr: itemNameAr, nameEn: itemNameEn, dimsAr: { [dimNameAr]: valAr }, dimsEn: { [dimNameEn]: valEn } });
              }
            } else {
              ungrouped.push(s);
            }
          }

          const hasGrouped = grouped.length > 0;
          let specsBlock: React.ReactNode;
          const isDiningCat = product.categorySlug === "dining";
          const isKidsCat = product.categorySlug === "kids";
          const isEntreeCat = product.categorySlug === "entree";
          const isCornerCat = product.categorySlug === "corner";
          const isTvUnitCat = product.categorySlug === "tv-units";
          const isTablesCat = product.categorySlug === "tables";
          const isReadyCat = product.categorySlug === "ready";
          const isLazyBoyCat = product.categorySlug === "lazy-boy";
          const isBedroomsCat = product.categorySlug === "bedrooms";

          let readyType = "";
          if (isReadyCat) {
            const pName = product.name?.ar || product.name?.en || "";
            if (/انتريه|انتري/i.test(pName)) readyType = "entree";
            else if (/ركنه|ركن/i.test(pName)) readyType = "corner";
            else if (/سفره|غرفه سفره/i.test(pName)) readyType = "dining";
            else if (/غرفه.*اطفال|اطفال|اطفالي/i.test(pName)) readyType = "kids";
            else if (/غرفه|نوم/i.test(pName)) readyType = "bedroom";
            else if (/صالون/i.test(pName)) readyType = "salon";
            else if (/وحده|تلفزيون/i.test(pName)) readyType = "tvunit";
            else readyType = "dining";
          }

          const effectiveIsKidsCat = isKidsCat || readyType === "kids";
          const effectiveIsEntreeCat = isEntreeCat || isCornerCat || readyType === "entree" || readyType === "corner" || isLazyBoyCat || isBedroomsCat;
          const effectiveIsTvUnitCat = isTvUnitCat || readyType === "tvunit";
          const effectiveIsTablesCat = isTablesCat;
          const effectiveIsDiningCat = isDiningCat || readyType === "dining" || readyType === "bedroom" || readyType === "salon";

          const dimLabel = (ar: string, en: string) => locale === "ar" ? ar : en;

          if ((effectiveIsDiningCat || effectiveIsKidsCat || effectiveIsEntreeCat || effectiveIsTvUnitCat || effectiveIsTablesCat) && hasGrouped) {
            specsBlock = (
              <div>
                <h2 className="font-playfair font-cairo text-2xl font-bold mb-6 text-gold-gradient">{t("pdp_specs")}</h2>
                <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
                  {effectiveIsKidsCat ? (
                  <>
                  <table className="w-full text-sm border-collapse hidden sm:table">
                    <thead>
                      <tr className="bg-gold/10">
                        <th className="px-4 py-3 text-right font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("القطعة", "Piece")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("العدد", "Qty")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("العرض", "Width")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("الارتفاع", "Height")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal">{dimLabel("العمق", "Depth")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map((item, i) => {
                        const name = locale === "ar" ? item.nameAr : item.nameEn;
                        const count = locale === "ar" ? item.dimsAr["العدد"] || "" : item.dimsEn["Qty"] || item.dimsEn["Count"] || item.dimsEn["عدد"] || "";
                        const width = locale === "ar" ? item.dimsAr["العرض"] || "" : item.dimsEn["Width"] || item.dimsEn["العرض"] || "";
                        const height = locale === "ar" ? item.dimsAr["الارتفاع"] || "" : item.dimsEn["Height"] || item.dimsEn["الارتفاع"] || "";
                        const rawDepth = locale === "ar" ? item.dimsAr["العمق"] || "" : item.dimsEn["Depth"] || item.dimsEn["العمق"] || "";
                        const rawLength = locale === "ar" ? item.dimsAr["الطول"] || "" : item.dimsEn["Length"] || item.dimsEn["الطول"] || "";
                        const depth = rawDepth || rawLength;
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-ivory" : "bg-white"}>
                            <td className="px-4 py-2.5 font-bold text-charcoal border-e border-gold/10">{name}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{count || "1"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{width || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{height || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80">{depth || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="sm:hidden space-y-3 p-3">
                    {grouped.map((item, i) => {
                      const name = locale === "ar" ? item.nameAr : item.nameEn;
                      const dims = [
                        { ar: "العدد", en: "Qty" },
                        { ar: "العرض", en: "Width" },
                        { ar: "الارتفاع", en: "Height" },
                        { ar: "العمق", en: "Depth" },
                        { ar: "الطول", en: "Length" },
                      ];
                      return (
                        <div key={i} className="bg-ivory rounded-xl p-3">
                          <div className="font-bold text-charcoal text-sm mb-2">{name}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {dims.map((d) => {
                              const val = locale === "ar" ? item.dimsAr[d.ar] || "" : item.dimsEn[d.en] || item.dimsAr[d.ar] || "";
                              return val ? <div key={d.ar}><span className="text-charcoal/50">{dimLabel(d.ar, d.en)}:</span> <span className="font-bold">{val}</span></div> : null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                  ) : effectiveIsEntreeCat ? (
                  <>
                  <table className="w-full text-sm border-collapse hidden sm:table">
                    <thead>
                      <tr className="bg-gold/10">
                        <th className="px-4 py-3 text-right font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("القطعة", "Piece")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("العدد", "Qty")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("العرض", "Width")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("الارتفاع", "Height")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal">{dimLabel("العمق", "Depth")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map((item, i) => {
                        const name = locale === "ar" ? item.nameAr : item.nameEn;
                        const count = locale === "ar" ? item.dimsAr["العدد"] || "" : item.dimsEn["Qty"] || item.dimsEn["Count"] || item.dimsEn["عدد"] || "";
                        const width = locale === "ar" ? item.dimsAr["العرض"] || "" : item.dimsEn["Width"] || item.dimsEn["العرض"] || "";
                        const height = locale === "ar" ? item.dimsAr["الارتفاع"] || "" : item.dimsEn["Height"] || item.dimsEn["الارتفاع"] || "";
                        const depth = locale === "ar" ? item.dimsAr["العمق"] || "" : item.dimsEn["Depth"] || item.dimsEn["العمق"] || "";
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-ivory" : "bg-white"}>
                            <td className="px-4 py-2.5 font-bold text-charcoal border-e border-gold/10">{name}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{count || "1"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{width || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{height || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80">{depth || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="sm:hidden space-y-3 p-3">
                    {grouped.map((item, i) => {
                      const name = locale === "ar" ? item.nameAr : item.nameEn;
                      const dims = [
                        { ar: "العدد", en: "Qty" },
                        { ar: "العرض", en: "Width" },
                        { ar: "الارتفاع", en: "Height" },
                        { ar: "العمق", en: "Depth" },
                      ];
                      return (
                        <div key={i} className="bg-ivory rounded-xl p-3">
                          <div className="font-bold text-charcoal text-sm mb-2">{name}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {dims.map((d) => {
                              const val = locale === "ar" ? item.dimsAr[d.ar] || "" : item.dimsEn[d.en] || item.dimsAr[d.ar] || "";
                              return val ? <div key={d.ar}><span className="text-charcoal/50">{dimLabel(d.ar, d.en)}:</span> <span className="font-bold">{val}</span></div> : null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                  ) : effectiveIsTvUnitCat ? (
                  <>
                  <table className="w-full text-sm border-collapse hidden sm:table">
                    <thead>
                      <tr className="bg-gold/10">
                        <th className="px-4 py-3 text-right font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("القطعة", "Piece")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("العرض", "Width")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("الارتفاع", "Height")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal">{dimLabel("العمق", "Depth")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map((item, i) => {
                        const name = locale === "ar" ? item.nameAr : item.nameEn;
                        const width = locale === "ar" ? item.dimsAr["العرض"] || "" : item.dimsEn["Width"] || item.dimsEn["العرض"] || "";
                        const height = locale === "ar" ? item.dimsAr["الارتفاع"] || "" : item.dimsEn["Height"] || item.dimsEn["الارتفاع"] || "";
                        const depth = locale === "ar" ? item.dimsAr["العمق"] || "" : item.dimsEn["Depth"] || item.dimsEn["العمق"] || "";
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-ivory" : "bg-white"}>
                            <td className="px-4 py-2.5 font-bold text-charcoal border-e border-gold/10">{name}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{width || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{height || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80">{depth || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="sm:hidden space-y-3 p-3">
                    {grouped.map((item, i) => {
                      const name = locale === "ar" ? item.nameAr : item.nameEn;
                      const dims = [
                        { ar: "العرض", en: "Width" },
                        { ar: "الارتفاع", en: "Height" },
                        { ar: "العمق", en: "Depth" },
                      ];
                      return (
                        <div key={i} className="bg-ivory rounded-xl p-3">
                          <div className="font-bold text-charcoal text-sm mb-2">{name}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {dims.map((d) => {
                              const val = locale === "ar" ? item.dimsAr[d.ar] || "" : item.dimsEn[d.en] || item.dimsAr[d.ar] || "";
                              return val ? <div key={d.ar}><span className="text-charcoal/50">{dimLabel(d.ar, d.en)}:</span> <span className="font-bold">{val}</span></div> : null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                  ) : effectiveIsTablesCat ? (
                  <>
                  <table className="w-full text-sm border-collapse hidden sm:table">
                    <thead>
                      <tr className="bg-gold/10">
                        <th className="px-4 py-3 text-right font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("القطعة", "Piece")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("العدد", "Qty")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("القطر", "Diameter")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("الارتفاع", "Height")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal">{dimLabel("العمق", "Depth")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map((item, i) => {
                        const name = locale === "ar" ? item.nameAr : item.nameEn;
                        const count = locale === "ar" ? item.dimsAr["العدد"] || "" : item.dimsEn["Qty"] || item.dimsEn["Count"] || item.dimsEn["عدد"] || "";
                        const diameter = locale === "ar" ? item.dimsAr["القطر"] || "" : item.dimsEn["Diameter"] || item.dimsEn["القطر"] || "";
                        const width = locale === "ar" ? item.dimsAr["العرض"] || "" : item.dimsEn["Width"] || item.dimsEn["العرض"] || "";
                        const height = locale === "ar" ? item.dimsAr["الارتفاع"] || "" : item.dimsEn["Height"] || item.dimsEn["الارتفاع"] || "";
                        const depth = locale === "ar" ? item.dimsAr["العمق"] || "" : item.dimsEn["Depth"] || item.dimsEn["العمق"] || "";
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-ivory" : "bg-white"}>
                            <td className="px-4 py-2.5 font-bold text-charcoal border-e border-gold/10">{name}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{count || "1"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{diameter || width || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{height || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80">{depth || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="sm:hidden space-y-3 p-3">
                    {grouped.map((item, i) => {
                      const name = locale === "ar" ? item.nameAr : item.nameEn;
                      const dims = [
                        { ar: "العدد", en: "Qty" },
                        { ar: "القطر", en: "Diameter" },
                        { ar: "العرض", en: "Width" },
                        { ar: "الارتفاع", en: "Height" },
                        { ar: "العمق", en: "Depth" },
                      ];
                      return (
                        <div key={i} className="bg-ivory rounded-xl p-3">
                          <div className="font-bold text-charcoal text-sm mb-2">{name}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {dims.map((d) => {
                              const val = locale === "ar" ? item.dimsAr[d.ar] || "" : item.dimsEn[d.en] || item.dimsAr[d.ar] || "";
                              return val ? <div key={d.ar}><span className="text-charcoal/50">{dimLabel(d.ar, d.en)}:</span> <span className="font-bold">{val}</span></div> : null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                  ) : (
                  <>
                  <table className="w-full text-sm border-collapse hidden sm:table">
                    <thead>
                      <tr className="bg-gold/10">
                        <th className="px-4 py-3 text-right font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("القطعة", "Piece")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("العدد", "Qty")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("العرض", "Width")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("الارتفاع", "Height")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal">{dimLabel("الطول / العمق", "Length / Depth")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map((item, i) => {
                        const name = locale === "ar" ? item.nameAr : item.nameEn;
                        const count = locale === "ar" ? item.dimsAr["العدد"] || "" : item.dimsEn["Qty"] || item.dimsEn["Count"] || item.dimsEn["عدد"] || "";
                        const width = locale === "ar" ? item.dimsAr["العرض"] || "" : item.dimsEn["Width"] || item.dimsEn["العرض"] || "";
                        const height = locale === "ar" ? item.dimsAr["الارتفاع"] || "" : item.dimsEn["Height"] || item.dimsEn["الارتفاع"] || "";
                        const depth = locale === "ar" ? (item.dimsAr["الطول"] || item.dimsAr["العمق"] || item.dimsAr["الطويل/العمق"] || "") : (item.dimsEn["Length"] || item.dimsEn["Depth"] || item.dimsEn["Length / Depth"] || item.dimsEn["الطول"] || item.dimsEn["العمق"] || "");
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-ivory" : "bg-white"}>
                            <td className="px-4 py-2.5 font-bold text-charcoal border-e border-gold/10">{name}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{count || "1"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{width || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{height || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80">{depth || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="sm:hidden space-y-3 p-3">
                    {grouped.map((item, i) => {
                      const name = locale === "ar" ? item.nameAr : item.nameEn;
                      const dims = [
                        { ar: "العدد", en: "Qty" },
                        { ar: "العرض", en: "Width" },
                        { ar: "الارتفاع", en: "Height" },
                        { ar: "الطول / العمق", en: "Length / Depth" },
                      ];
                      return (
                        <div key={i} className="bg-ivory rounded-xl p-3">
                          <div className="font-bold text-charcoal text-sm mb-2">{name}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {dims.map((d) => {
                              const val = locale === "ar" ? (item.dimsAr[d.ar] || "") : (item.dimsEn[d.en] || item.dimsAr[d.ar] || "");
                              return val ? <div key={d.ar}><span className="text-charcoal/50">{dimLabel(d.ar, d.en)}:</span> <span className="font-bold">{val}</span></div> : null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                  )}
                </div>
              </div>
            );
          } else if (hasGrouped) {            specsBlock = (
              <div>
                <h2 className="font-playfair font-cairo text-2xl font-bold mb-6 text-gold-gradient">{t("pdp_specs")}</h2>
                <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
                  <table className="w-full text-sm border-collapse hidden sm:table">
                    <thead>
                      <tr className="bg-gold/10">
                        <th className="px-4 py-3 text-right font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("القطعة", "Piece")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("الطول / العمق", "Length / Depth")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal border-e border-gold/10">{dimLabel("العرض", "Width")}</th>
                        <th className="px-4 py-3 text-center font-cairo font-bold text-charcoal">{dimLabel("الارتفاع", "Height")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map((item, i) => {
                        const name = locale === "ar" ? item.nameAr : item.nameEn;
                        const depth = locale === "ar" ? (item.dimsAr["الطول"] || item.dimsAr["العمق"] || item.dimsAr["المقاس"] || "") : (item.dimsEn["Length"] || item.dimsEn["Depth"] || item.dimsEn["Size"] || item.dimsEn["الطول"] || item.dimsEn["العمق"] || item.dimsEn["المقاس"] || "");
                        const width = locale === "ar" ? item.dimsAr["العرض"] || "" : item.dimsEn["Width"] || item.dimsEn["العرض"] || "";
                        const height = locale === "ar" ? item.dimsAr["الارتفاع"] || "" : item.dimsEn["Height"] || item.dimsEn["الارتفاع"] || "";
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-ivory" : "bg-white"}>
                            <td className="px-4 py-2.5 font-bold text-charcoal border-e border-gold/10">{name}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{depth || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80 border-e border-gold/10">{width || "—"}</td>
                            <td className="px-4 py-2.5 text-center text-charcoal/80">{height || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="sm:hidden space-y-3 p-3">
                    {grouped.map((item, i) => {
                      const name = locale === "ar" ? item.nameAr : item.nameEn;
                      const dims = [
                        { ar: "الطول / العمق", en: "Length / Depth" },
                        { ar: "العرض", en: "Width" },
                        { ar: "الارتفاع", en: "Height" },
                      ];
                      return (
                        <div key={i} className="bg-ivory rounded-xl p-3">
                          <div className="font-bold text-charcoal text-sm mb-2">{name}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {dims.map((d) => {
                              const val = locale === "ar" ? (item.dimsAr[d.ar] || "") : (item.dimsEn[d.en] || item.dimsAr[d.ar] || "");
                              return val ? <div key={d.ar}><span className="text-charcoal/50">{dimLabel(d.ar, d.en)}:</span> <span className="font-bold">{val}</span></div> : null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          } else if (!isLazyBoyCat) {
            specsBlock = (
              <div>
                <h2 className="font-playfair font-cairo text-2xl font-bold mb-6 text-gold-gradient">{t("pdp_specs")}</h2>
                <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {product.specs.map((s, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-ivory" : "bg-white"}>
                          <td className="px-4 py-2.5 text-charcoal/60 font-bold border-e border-gold/10 w-1/2">{s.key[locale]}</td>
                          <td className="px-4 py-2.5 text-charcoal w-1/2">{s.value[locale]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          if (ungrouped.length > 0 && !isDiningCat && !isReadyCat) {
            specsBlock = (
              <div>
                {specsBlock}
                <div className="mt-4 bg-white rounded-xl border border-gold/10 overflow-hidden">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {ungrouped.map((s, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-ivory" : "bg-white"}>
                          <td className="px-4 py-2.5 text-charcoal/60 font-bold border-e border-gold/10 w-1/2">{s.key[locale]}</td>
                          <td className="px-4 py-2.5 text-charcoal w-1/2">{s.value[locale]}</td>
                        </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            );
          }

          const faqBlock = (
            <div>
              <h2 className="font-playfair font-cairo text-2xl font-bold mb-6 text-gold-gradient">{t("pdp_faq")}</h2>
              <div className="space-y-2">
                {product.faqs.map((f, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gold/10 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-start font-cairo font-bold text-charcoal"
                    >
                      {f.question[locale]}
                      <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }}>
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-sm text-charcoal/70">{f.answer[locale]}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          );

          if (hasSpecs && hasFaqs) {
            return (
              <Reveal className="mt-14 mb-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {specsBlock}
                  {faqBlock}
                </div>
              </Reveal>
            );
          }
          if (hasSpecs) {
            return (
              <Reveal className="mt-14 mb-14">
                <div className="max-w-2xl mx-auto">{specsBlock}</div>
              </Reveal>
            );
          }
          if (hasFaqs) {
            return (
              <Reveal className="mt-14 mb-14">
                <div className="max-w-2xl mx-auto">{faqBlock}</div>
              </Reveal>
            );
          }
          return null;
        })()}

        {/* Rails */}
        <div className="mt-14">
          <RelatedRail title={t("pdp_similar")} items={similar} locale={locale} />
          <RelatedRail title={t("pdp_related")} items={related} locale={locale} />
          <RelatedRail title={t("pdp_also_bought")} items={alsoBought} locale={locale} />
        </div>

        {/* Reviews */}
        <Reveal className="mt-14 mb-14">
          <h2 className="font-playfair font-cairo text-2xl font-bold mb-6 text-gold-gradient">{t("pdp_reviews")}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <p className="text-charcoal/50 text-sm">{t("pdp_no_reviews")}</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-gold/10 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-cairo font-bold text-charcoal text-sm">{r.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} size={13} className={idx < r.rating ? "fill-gold text-gold" : "text-charcoal/20"} />
                        ))}
                      </div>
                    </div>
                    {r.body && <p className="text-charcoal/70 text-sm">{r.body}</p>}
                  </div>
                ))
              )}
            </div>
            <div>
              {reviewSubmitted ? (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                  {t("pdp_review_submitted")}
                </p>
              ) : (
                <form onSubmit={submitReview} className="bg-white rounded-xl border border-gold/10 p-4 space-y-3">
                  <h3 className="font-cairo font-bold text-sm text-charcoal">{t("pdp_write_review")}</h3>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <button type="button" key={idx} onClick={() => setReviewRating(idx + 1)}>
                        <Star size={20} className={idx < reviewRating ? "fill-gold text-gold" : "text-charcoal/20"} />
                      </button>
                    ))}
                  </div>
                  <input
                    placeholder={t("checkout_name")}
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold"
                  />
                  <textarea
                    required
                    placeholder={t("pdp_your_review")}
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold resize-none"
                  />
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full py-2 rounded-lg bg-gold-gradient text-charcoal font-bold text-sm disabled:opacity-60"
                  >
                    {t("pdp_submit_review")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button className="absolute top-4 end-4 text-white" onClick={() => setLightboxOpen(false)} aria-label="close">
              <X size={28} />
            </button>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={cldUrl(displayImages[activeImage], 1600)}
                alt={product.name[locale]}
                onError={onImgError}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-full max-h-full object-contain rounded-lg touch-pan-y"
                onClick={(e) => e.stopPropagation()}
                drag={displayImages.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragEnd={(_e, info) => {
                  if (info.offset.x < -80) goNext();
                  else if (info.offset.x > 80) goPrev();
                }}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consultation / Viewing modal */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setModalType(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-cairo font-bold text-lg text-charcoal">
                  {modalType === "consultation" ? t("pdp_consultation") : t("pdp_viewing")}
                </h3>
                <button onClick={() => setModalType(null)} aria-label={t("pdp_close")}>
                  <X size={20} />
                </button>
              </div>
              {reqSubmitted ? (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                  {t("pdp_request_submitted")}
                </p>
              ) : (
                <form onSubmit={submitRequest} className="space-y-3">
                  <input
                    required
                    placeholder={t("pdp_request_form_name")}
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold"
                  />
                  <input
                    required
                    placeholder={t("pdp_request_form_phone")}
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold"
                  />
                  <textarea
                    placeholder={t("pdp_request_form_message")}
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold resize-none"
                  />
                  <button
                    type="submit"
                    disabled={reqSubmitting}
                    className="w-full py-2.5 rounded-lg bg-gold-gradient text-charcoal font-bold text-sm disabled:opacity-60"
                  >
                    {t("pdp_request_form_submit")}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added to cart confirmation modal */}
      <AnimatePresence>
        {addedModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setAddedModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-ivory rounded-2xl p-6 w-full max-w-sm relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setAddedModalOpen(false)}
                aria-label={t("pdp_close")}
                className="absolute top-3 end-3 bg-white/80 rounded-full p-1 text-charcoal hover:text-goldDark"
              >
                <X size={18} />
              </button>
              <div className="flex flex-col items-center text-center gap-3">
                <span className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <Check size={24} />
                </span>
                <h3 className="font-cairo font-bold text-lg text-charcoal">{t("pdp_added_to_cart_title")}</h3>
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gold/10 p-3 w-full">
                  <img
                    src={displayImages[0]}
                    alt={product.name[locale]}
                    onError={onImgError}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <p className="font-cairo font-bold text-sm text-charcoal text-start truncate">{product.name[locale]}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
                  <button
                    onClick={() => {
                      setAddedModalOpen(false);
                      router.push("/cart");
                    }}
                    className="flex-1 py-2.5 rounded-full bg-gold-gradient text-charcoal font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    {t("pdp_go_to_cart")}
                  </button>
                  <button
                    onClick={() => setAddedModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-gold/30 text-charcoal font-bold text-sm hover:bg-gold/10 transition-colors"
                  >
                    {t("cart_continue_shopping")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
