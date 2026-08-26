import { NextRequest, NextResponse } from "next/server";
import { d1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

interface OrderItemPayload {
  name: string;
  price: number;
  quantity: number;
}

interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items?: OrderItemPayload[];
}

async function getIntegrationSettings() {
  try {
    const rows = await d1Query<{ key: string; value: string }>(
      "SELECT key, value FROM site_settings WHERE group_name = 'integrations'",
      []
    );
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value || "";
    return map;
  } catch {
    return {} as Record<string, string>;
  }
}

export async function POST(req: NextRequest) {
  let payload: OrderCreatedPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: true });
  }

  const settings = await getIntegrationSettings();

  const metaConversionApiToken = (settings.meta_conversion_api_token || "").trim();
  const metaPixelId = (settings.meta_pixel_id || "").trim();
  const whatsappPhoneId = (settings.whatsapp_api_phone_id || "").trim();
  const whatsappToken = (settings.whatsapp_api_token || "").trim();
  const crmWebhookUrl = (settings.crm_webhook_url || "").trim();
  const erpWebhookUrl = (settings.erp_webhook_url || "").trim();

  const tasks: Promise<void>[] = [];

  // 1. Meta Conversion API
  tasks.push(
    (async () => {
      try {
        if (!metaConversionApiToken || !metaPixelId) return;
        const body = {
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              user_data: {},
              custom_data: {
                currency: "EGP",
                value: payload.total,
                order_id: payload.orderNumber,
              },
            },
          ],
        };
        await fetch(
          `https://graph.facebook.com/v18.0/${metaPixelId}/events?access_token=${encodeURIComponent(
            metaConversionApiToken
          )}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
      } catch {
        // best-effort only
      }
    })()
  );

  // 2. WhatsApp Cloud API
  tasks.push(
    (async () => {
      try {
        if (!whatsappPhoneId || !whatsappToken || !payload.customerPhone) return;
        const normalizedPhone = payload.customerPhone.replace(/\D/g, "");
        if (!normalizedPhone) return;
        await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${whatsappToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: normalizedPhone,
            type: "text",
            text: {
              body: `شكراً لطلبك رقم ${payload.orderNumber}! سنتواصل معك قريباً لتأكيد التفاصيل.`,
            },
          }),
        });
      } catch {
        // best-effort only
      }
    })()
  );

  // 3. CRM webhook
  tasks.push(
    (async () => {
      try {
        if (!crmWebhookUrl) return;
        await fetch(crmWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // best-effort only
      }
    })()
  );

  // 4. ERP webhook
  tasks.push(
    (async () => {
      try {
        if (!erpWebhookUrl) return;
        await fetch(erpWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // best-effort only
      }
    })()
  );

  await Promise.allSettled(tasks);

  return NextResponse.json({ success: true });
}
