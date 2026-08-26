"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const text = {
    title: { ar: "تسجيل الدخول", en: "Login" },
    email: { ar: "البريد الإلكتروني", en: "Email" },
    password: { ar: "كلمة المرور", en: "Password" },
    submit: { ar: "تسجيل الدخول", en: "Login" },
    submitting: { ar: "جاري الدخول...", en: "Signing in..." },
    noAccount: { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
    register: { ar: "إنشاء حساب", en: "Register" },
    error: { ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة", en: "Invalid email or password" },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError(text.error[locale]);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .maybeSingle();

    router.push(profile?.is_admin ? "/admin" : "/account");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4 py-16" dir={locale === "ar" ? "rtl" : "ltr"}>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-gold/10 p-8 w-full max-w-sm font-cairo">
        <div className="text-center mb-6">
          <h1 className="font-cairo text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent">
            {text.title[locale]}
          </h1>
        </div>
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center">
            {error}
          </p>
        )}
        <div className="mb-4">
          <label className="block text-sm font-bold text-charcoal/70 mb-1">{text.email[locale]}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-charcoal/70 mb-1">{text.password[locale]}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-gold-gradient text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          <LogIn size={18} /> {loading ? text.submitting[locale] : text.submit[locale]}
        </button>
        <p className="text-center text-sm text-charcoal/60 mt-4">
          {text.noAccount[locale]}{" "}
          <Link href="/register" className="text-goldDark font-bold hover:underline">
            {text.register[locale]}
          </Link>
        </p>
      </form>
    </div>
  );
}
