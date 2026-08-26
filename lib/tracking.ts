// Client-side analytics/tracking helpers. These are best-effort and never
// throw - if GTM/GA4/Meta Pixel scripts aren't loaded (e.g. because the
// owner hasn't pasted in their IDs yet in /admin/settings), calling these
// functions is a silent no-op.

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: { track?: (...args: any[]) => void; page?: (...args: any[]) => void } & ((...args: any[]) => void);
    dataLayer?: any[];
  }
}

export interface TrackableItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

export function trackAddToCart(item: TrackableItem) {
  try {
    if (typeof window === "undefined") return;

    const value = item.price * item.quantity;

    if (typeof window.gtag === "function") {
      window.gtag("event", "add_to_cart", {
        currency: "EGP",
        value,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
          },
        ],
      });
    }

    if (typeof window.fbq === "function") {
      window.fbq("track", "AddToCart", {
        content_ids: [item.id],
        content_name: item.name,
        value,
        currency: "EGP",
      });
    }

    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("AddToCart", {
        content_id: String(item.id),
        content_name: item.name,
        quantity: item.quantity,
        price: item.price,
        value,
        currency: "EGP",
      });
    }
  } catch {
    // tracking must never break the app
  }
}

export interface TrackablePurchase {
  orderId: string;
  total: number;
  items: TrackableItem[];
}

export function trackPurchase(order: TrackablePurchase) {
  try {
    if (typeof window === "undefined") return;

    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: order.orderId,
        value: order.total,
        currency: "EGP",
        items: order.items.map((i) => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });
    }

    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", {
        value: order.total,
        currency: "EGP",
        content_ids: order.items.map((i) => i.id),
      });
    }

    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("CompletePayment", {
        content_ids: order.items.map((i) => String(i.id)),
        value: order.total,
        currency: "EGP",
      });
    }
  } catch {
    // tracking must never break the app
  }
}
