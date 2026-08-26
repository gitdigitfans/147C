"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  Newspaper,
  Image as ImageIcon,
  Tag,
  Ticket,
  MapPin,
  ShieldCheck,
  BarChart3,
  Settings,
  Search,
  Truck,
  CreditCard,
  LayoutGrid,
  Star,
  Images,
  ClipboardList,
  MessageSquare,
  ListChecks,
} from "lucide-react";

const links = [
  { href: "/admin", label: "لوحة القيادة", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/categories", label: "التصنيفات", icon: FolderTree },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/reviews", label: "التقييمات", icon: Star },
  { href: "/admin/requests", label: "طلبات العملاء", icon: ClipboardList },
  { href: "/admin/contact-submissions", label: "رسائل التواصل", icon: MessageSquare },
  { href: "/admin/contact-fields", label: "حقول التواصل", icon: ListChecks },
  { href: "/admin/articles", label: "المقالات", icon: Newspaper },
  { href: "/admin/banners", label: "البانرات", icon: ImageIcon },
  { href: "/admin/gallery", label: "معرض الصور", icon: Images },
  { href: "/admin/offers", label: "العروض", icon: Tag },
  { href: "/admin/coupons", label: "الكوبونات", icon: Ticket },
  { href: "/admin/branches", label: "الفروع", icon: MapPin },
  { href: "/admin/content-cards", label: "بطاقات المحتوى", icon: LayoutGrid },
  { href: "/admin/shipping", label: "الشحن", icon: Truck },
  { href: "/admin/payment-methods", label: "طرق الدفع", icon: CreditCard },
  { href: "/admin/users", label: "مستخدمو الإدارة", icon: ShieldCheck },
  { href: "/admin/reports", label: "التقارير", icon: BarChart3 },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/seo", label: "SEO", icon: Search },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-charcoal text-ivory shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="p-5 border-b border-white/10">
        <h1 className="font-bold text-lg bg-gold-gradient bg-clip-text text-transparent">الفرعون للأثاث</h1>
        <p className="text-xs text-ivory/50 mt-0.5">لوحة التحكم</p>
      </div>
      <nav className="flex-1 py-3">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                active ? "bg-gold-gradient text-white font-bold" : "text-ivory/70 hover:bg-white/5 hover:text-ivory"
              }`}
            >
              <Icon size={17} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
