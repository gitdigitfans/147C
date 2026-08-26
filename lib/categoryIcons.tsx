import { BedDouble, UtensilsCrossed, Baby, Sofa, Armchair, Shirt, Tv, Table2, Truck, type LucideIcon } from "lucide-react";

// Admin-chosen icon registry for category cards. The admin picks one of
// these keys (and uploads a photo) per category in the dashboard - there is
// no automatic guessing/fallback here on purpose: a category with no
// icon_key set simply shows no icon overlay until the admin assigns one,
// rather than silently defaulting every unmatched category to a sofa icon.
export const CATEGORY_ICON_OPTIONS: { key: string; label_ar: string; icon: LucideIcon }[] = [
  { key: "bed", label_ar: "سرير (غرف نوم)", icon: BedDouble },
  { key: "dining", label_ar: "أدوات مائدة (غرف سفرة)", icon: UtensilsCrossed },
  { key: "kids", label_ar: "أطفال", icon: Baby },
  { key: "sofa", label_ar: "كنبة", icon: Sofa },
  { key: "armchair", label_ar: "مقعد/ركن", icon: Armchair },
  { key: "dressing", label_ar: "دريسنج روم", icon: Shirt },
  { key: "tv", label_ar: "وحدة تلفزيون", icon: Tv },
  { key: "table", label_ar: "ترابيزة", icon: Table2 },
  { key: "delivery", label_ar: "منتجات جاهزة / توصيل سريع", icon: Truck },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICON_OPTIONS.map((o) => [o.key, o.icon])
);

// Returns the icon component for a category's chosen icon_key, or null if
// the admin hasn't assigned one yet - callers should simply not render an
// icon in that case.
export function getCategoryIcon(iconKey?: string | null): LucideIcon | null {
  if (!iconKey) return null;
  return ICON_MAP[iconKey] || null;
}
