"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Youtube, Music2, Image as ImageIcon, MapPin, Phone, Mail, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import { submitContactForm } from "./actions";

const socials = [
  { icon: Facebook, href: "https://www.facebook.com/share/1CwRaimBaN/?mibextid=wwXIfr", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/pharaohfurnituree?igsh=NHBreXFpd3ZtN2J6&utm_source=qr", label: "Instagram" },
  { icon: Music2, href: "https://www.tiktok.com/@pharaohfurnituree?_r=1&_t=ZS-98PZmqnXPi0", label: "TikTok" },
  { icon: Youtube, href: "https://www.youtube.com/@PharaohFurnitureAllam", label: "YouTube" },
  { icon: ImageIcon, href: "https://pin.it/2Q6MXTbaS", label: "Pinterest" },
];

export interface BranchVM {
  id: number;
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  phone: string;
  working_hours_ar: string;
  working_hours_en: string;
}

export interface ContactFieldVM {
  id: string;
  field_key: string;
  label_ar: string;
  label_en: string | null;
  field_type: "text" | "email" | "phone" | "textarea";
  is_required: number;
  sort_order: number;
  is_active: number;
}

export default function ContactClient({
  branches,
  fields,
  phone,
  email,
}: {
  branches: BranchVM[];
  fields: ContactFieldVM[];
  phone: string;
  email: string;
}) {
  const { t, locale } = useLocale();
  const [form, setForm] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactForm(form);
      setStatus("success");
    } catch {
      setStatus("error");
    }
    setForm({});
    setSubmitting(false);
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-4 text-gold-gradient">
          {t("contact_page_title")}
        </h1>
        <p className="text-center text-charcoal/60 mb-12 max-w-xl mx-auto">{t("contact_page_sub")}</p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Reveal y={30}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-md space-y-5">
            {fields.map((field) => {
              const labelText = locale === "ar" ? field.label_ar : field.label_en || field.label_ar;
              const value = form[field.field_key] || "";
              const commonProps = {
                required: !!field.is_required,
                value,
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm({ ...form, [field.field_key]: e.target.value }),
              };

              return (
                <div key={field.id}>
                  <label className="block text-sm font-bold mb-2 text-charcoal/70">{labelText}</label>
                  {field.field_type === "textarea" ? (
                    <textarea
                      {...commonProps}
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-lg border border-gold/30 outline-none focus:ring-2 focus:ring-gold resize-none"
                    />
                  ) : (
                    <input
                      {...commonProps}
                      type={field.field_type === "email" ? "email" : field.field_type === "phone" ? "tel" : "text"}
                      className="w-full px-4 py-2.5 rounded-lg border border-gold/30 outline-none focus:ring-2 focus:ring-gold"
                    />
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-gold-gradient text-charcoal font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {t("form_submit")}
            </button>

            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg p-4 text-sm font-bold"
                >
                  <CheckCircle2 size={18} />
                  {t("form_success")}
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-4 text-sm font-bold"
                >
                  <XCircle size={18} />
                  {t("form_error")}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Reveal>

        <Reveal y={30} delay={0.15}>
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="font-cairo font-bold text-xl mb-6 text-goldDark">{t("company_info_title")}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient-soft flex items-center justify-center shrink-0">
                    <MapPin className="text-goldDark" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-charcoal/50">{t("address_label")}</div>
                    <div className="font-bold">{t("address_value")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient-soft flex items-center justify-center shrink-0">
                    <Phone className="text-goldDark" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-charcoal/50">{t("phone_label")}</div>
                    <div className="font-bold" dir="ltr">{phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient-soft flex items-center justify-center shrink-0">
                    <Mail className="text-goldDark" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-charcoal/50">{t("email_label")}</div>
                    <div className="font-bold" dir="ltr">{email}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  >
                    <s.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <iframe
              src="https://maps.google.com/maps?q=30.1417958,31.3795457&z=16&output=embed"
              className="w-full h-80 md:h-96 rounded-2xl border border-gold/10"
              loading="lazy"
              title={locale === "ar" ? "خريطة موقع الفرعون للاثاث - الفرع الرئيسي" : "Pharaoh Furniture - Main Branch location map"}
            />
          </div>
        </Reveal>
      </div>

      {branches.length > 0 && (
        <Reveal y={30} delay={0.1}>
          <div className="mt-16">
            <h2 className="font-cairo font-bold text-2xl mb-8 text-center text-goldDark">{t("branches_title")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-6 shadow-md space-y-3">
                  <h3 className="font-cairo font-bold text-lg text-charcoal">
                    {locale === "ar" ? b.name_ar : b.name_en}
                  </h3>
                  {(locale === "ar" ? b.address_ar : b.address_en) && (
                    <div className="flex items-start gap-2 text-sm text-charcoal/70">
                      <MapPin className="text-goldDark shrink-0" size={16} />
                      <span>{locale === "ar" ? b.address_ar : b.address_en}</span>
                    </div>
                  )}
                  {b.phone && (
                    <div className="flex items-center gap-2 text-sm text-charcoal/70">
                      <Phone className="text-goldDark shrink-0" size={16} />
                      <span dir="ltr">{b.phone}</span>
                    </div>
                  )}
                  {(locale === "ar" ? b.working_hours_ar : b.working_hours_en) && (
                    <div className="flex items-center gap-2 text-sm text-charcoal/70">
                      <Clock className="text-goldDark shrink-0" size={16} />
                      <span>{locale === "ar" ? b.working_hours_ar : b.working_hours_en}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
