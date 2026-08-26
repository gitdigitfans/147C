"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const text = {
    title: { ar: "إنشاء حساب جديد", en: "Create an Account" },
    fullName: { ar: "الاسم الكامل", en: "Full Name" },
    phone: { ar: "رقم الهاتف", en: "Phone Number" },
    email: { ar: "البريد الإلكتروني", en: "Email" },
    password: { ar: "كلمة المرور", en: "Password" },
    submit: { ar: "إنشاء حساب", en: "Register" },
    submitting: { ar: "جاري الإنشاء...", en: "Creating account..." },
    haveAccount: { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
    login: { ar: "تسجيل الدخول", en: "Login" },
    successConfirm: {
      ar: "تم إنشاء حسابك بنجاح! يرجى تفعيل الحساب من خلال الرابط المرسل إلى بريدك الإلكتروني قبل تسجيل الدخول.",
      en: "Your account was created successfully! Please confirm your email via the link we sent you before logging in.",
    },
    successDirect: { ar: "تم إنشاء حسابك بنجاح! جاري تحويلك...", en: "Your account was created successfully! Redirecting..." },
    genericError: { ar: "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى", en: "An error occurred while creating your account, please try again" },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    if (signUpError) {
      setError(signUpError.message || text.genericError[locale]);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);

    if (data.session) {
      // Email confirmation disabled — user is already signed in.
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1200);
    }
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

        {success && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2 text-center">
            {(success && !error) ? text.successConfirm[locale] : ""}
          </p>
        )}

        {!success && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-bold text-charcoal/70 mb-1">{text.fullName[locale]}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-charcoal/70 mb-1">{text.phone[locale]}</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold"
              />
            </div>
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
                minLength={6}
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
              <UserPlus size={18} /> {loading ? text.submitting[locale] : text.submit[locale]}
            </button>
          </>
        )}

        <p className="text-center text-sm text-charcoal/60 mt-4">
          {text.haveAccount[locale]}{" "}
          <Link href="/login" className="text-goldDark font-bold hover:underline">
            {text.login[locale]}
          </Link>
        </p>
      </form>
    </div>
  );
}
