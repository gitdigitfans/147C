import { NextResponse } from "next/server";
import crypto from "crypto";

// Signs a Cloudinary upload request server-side so the browser can upload
// directly to Cloudinary WITHOUT needing an unsigned upload preset
// (the "Upload preset must be whitelisted for unsigned uploads" error).
// Requires CLOUDINARY_API_SECRET in .env.local (found in the Cloudinary
// console under Settings > Access Keys - never expose this to the browser).
export async function POST(request: Request) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY || "881644294242566";
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "btbpg2fq";

  if (!apiSecret) {
    return NextResponse.json(
      {
        error:
          "Missing CLOUDINARY_API_SECRET. Add it to .env.local (find it in the Cloudinary console under Settings > Access Keys).",
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const folder = body?.folder || "pharaoh-furniture";

  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signs the exact set of params sent (excluding file/api_key/signature),
  // sorted alphabetically as "key=value" pairs joined with "&", then appends the secret.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
}
