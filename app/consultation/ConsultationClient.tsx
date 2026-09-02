"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { submitContactForm } from "@/app/contact/actions";
import Reveal from "@/components/Reveal";

export default function ConsultationClient({ whatsappNumber }: { whatsappNumber: string }) {
  const { t, locale } = useLocale();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactForm(
        { name, phone, message: message || "" },
        "consultation"
      );
      setSubmitted(true);
      const waText =
        locale === "ar"
          ? `طلب استشارة جديد من ${name} - ${phone}${message ? " - " + message : ""}`
          : `New consultation request from ${name} - ${phone}${message ? " - " + message : ""}`;
      const waUrl = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, "_blank");
    } catch {
      // submitContactForm throwing means the D1 insert failed - keep the
      // form visible (submitted stays false) so the visitor can retry.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-4 text-gold-gradient">
          {t("pdp_consultation")}
        </h1>
        <p className="text-center text-charcoal/60 mb-12">{t("contact_page_sub")}</p>
      </Reveal>

      <Reveal y={30}>
        {submitted ? (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-2xl p-6 text-sm font-bold justify-center text-center">
            <CheckCircle2 size={20} />
            {t("pdp_request_submitted")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-md space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 text-charcoal/70">{t("pdp_request_form_name")}</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gold/30 outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-charcoal/70">{t("pdp_request_form_phone")}</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gold/30 outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-charcoal/70">{t("pdp_request_form_message")}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gold/30 outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-gold-gradient text-charcoal font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {t("pdp_request_form_submit")}
            </button>
          </form>
        )}
      </Reveal>
    </div>
  );
}
