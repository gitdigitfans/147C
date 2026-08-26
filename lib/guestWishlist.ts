// Client-side-only guest wishlist storage. Lets anonymous (logged-out)
// visitors favorite products without an account, persisted purely in
// localStorage on this device/browser.
//
// NOTE (future scope, not implemented now): when a guest later logs in, this
// localStorage list could be merged into their Supabase `wishlists` table.
// That merge is intentionally out of scope here - this stays a fully
// independent, browser-only store that coexists alongside the authenticated
// Supabase-based wishlist.

const STORAGE_KEY = "pharaoh_guest_wishlist";

function readRaw(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

function writeRaw(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore write failures (e.g. storage disabled/full).
  }
}

export function getGuestWishlist(): string[] {
  return readRaw();
}

export function addToGuestWishlist(productId: string): string[] {
  const current = readRaw();
  if (current.includes(productId)) return current;
  const updated = [...current, productId];
  writeRaw(updated);
  return updated;
}

export function removeFromGuestWishlist(productId: string): string[] {
  const current = readRaw();
  const updated = current.filter((id) => id !== productId);
  writeRaw(updated);
  return updated;
}

export function isInGuestWishlist(productId: string): boolean {
  return readRaw().includes(productId);
}
