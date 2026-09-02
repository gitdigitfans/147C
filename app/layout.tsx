import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import ConsultationFloatButton from "@/components/ConsultationFloatButton";
import OfferTopBar from "@/components/OfferTopBar";
import OfferPopup from "@/components/OfferPopup";
import MobileBottomNav from "@/components/MobileBottomNav";
import ImageProtection from "@/components/ImageProtection";
import { d1Query } from "@/lib/d1";
import { unstable_cache } from "next/cache";
import { getSiteSettings, getActiveCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "الفرعون للأثاث | Pharaoh Furniture",
  description: "شركة مصرية متخصصة في تصميم وتصنيع الأثاث المنزلي والفندقي الفاخر",
};

// getSiteSettings/getActiveCategories are shared with app/page.tsx and
// app/shop/page.tsx, so they live in lib/catalog.ts. The two offer lookups
// below are only used here, so they stay local - same unstable_cache
// rationale (D1 binding calls bypass Next's fetch cache entirely).
const getTopbarOffer = unstable_cache(
  async () => {
    try {
      const rows = await d1Query<any>(
        `SELECT o.*, c.slug as category_slug FROM offers o LEFT JOIN categories c ON c.id = o.category_id
         WHERE o.is_active = 1 AND o.show_in_topbar = 1
         AND (o.starts_at IS NULL OR o.starts_at <= date('now'))
         AND (o.ends_at IS NULL OR o.ends_at >= date('now'))
         ORDER BY o.created_at DESC LIMIT 1`,
        []
      );
      return rows[0] || null;
    } catch {
      return null;
    }
  },
  ["topbar-offer"],
  { revalidate: 60, tags: ["offers"] }
);

const getPopupOffer = unstable_cache(
  async () => {
    try {
      const rows = await d1Query<any>(
        `SELECT o.*, c.slug as category_slug FROM offers o LEFT JOIN categories c ON c.id = o.category_id
         WHERE o.is_active = 1 AND o.show_as_popup = 1
         AND (o.starts_at IS NULL OR o.starts_at <= date('now'))
         AND (o.ends_at IS NULL OR o.ends_at >= date('now'))
         ORDER BY o.created_at DESC LIMIT 1`,
        []
      );
      return rows[0] || null;
    } catch {
      return null;
    }
  },
  ["popup-offer"],
  { revalidate: 60, tags: ["offers"] }
);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settingsMap, categories, topbarOffer, popupOffer] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
    getTopbarOffer(),
    getPopupOffer(),
  ]);

  const settings = {
    site_name_ar: settingsMap.site_name_ar || "",
    site_name_en: settingsMap.site_name_en || "",
    phone: settingsMap.phone || "",
    whatsapp: settingsMap.whatsapp || "",
    email: settingsMap.email || "",
    facebook_url: settingsMap.facebook_url || "",
    instagram_url: settingsMap.instagram_url || "",
    tiktok_url: settingsMap.tiktok_url || "",
    youtube_url: settingsMap.youtube_url || "",
    pinterest_url: settingsMap.pinterest_url || "",
  };

  // Marketing/tracking integrations - only configured via /admin/settings
  // (group_name='integrations'). Anything blank simply doesn't render.
  const gtmContainerId = (settingsMap.gtm_container_id || "").trim();
  const ga4MeasurementId = (settingsMap.ga4_measurement_id || "").trim();
  const metaPixelId = (settingsMap.meta_pixel_id || "").trim();
  const tiktokPixelId = (settingsMap.tiktok_pixel_id || "").trim();

  return (
    <html lang="ar" dir="rtl">
      <head>
        {gtmContainerId && (
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmContainerId}');`}
          </Script>
        )}

        {ga4MeasurementId && (
          <>
            <Script
              id="ga4-gtag-src"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
            />
            <Script id="ga4-gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4MeasurementId}');`}
            </Script>
          </>
        )}

        {metaPixelId && (
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');`}
          </Script>
        )}

        {tiktokPixelId && (
          <Script id="tiktok-pixel-init" strategy="afterInteractive">
            {`!function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');`}
          </Script>
        )}
      </head>
      <body className="font-cairo text-charcoal antialiased">
        {gtmContainerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {metaPixelId && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}

        <LocaleProvider>
          <CartProvider>
            <OfferTopBar offer={topbarOffer} />
            <Header />
            <main className="min-h-screen pb-20 sm:pb-0">{children}</main>
            <Footer settings={settings} categories={categories} />
            <WhatsAppFloatButton phoneNumber={settings.whatsapp} />
            <ConsultationFloatButton />
            <OfferPopup offer={popupOffer} />
            <MobileBottomNav />
            <ImageProtection />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
