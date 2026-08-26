"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError("بيانات الدخول غير صحيحة");
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single();
    if (!profile?.is_admin) {
      setError("هذا الحساب لا يملك صلاحية الدخول للوحة التحكم");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-4" dir="rtl">
      <form onSubmit={handleSubmit} className="bg-ivory rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-cairo text-2xl font-bold text-gold-gradient bg-gold-gradient bg-clip-text text-transparent">
            الفرعون للأثاث
          </h1>
          <p className="text-charcoal/60 text-sm mt-1">لوحة تحكم الإدارة</p>
        </div>
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-bold text-charcoal/70 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gold/40 outline-none focus:border-gold"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-charcoal/70 mb-1">كلمة المرور</label>
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
          <LogIn size={18} /> {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
