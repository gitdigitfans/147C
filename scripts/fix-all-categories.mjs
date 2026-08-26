import crypto from "crypto";
import fs from "fs";

const WORKER_URL = "https://pharaoh-furniture.pharaoh-furniture.workers.dev";
const PFTOOL_TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";
const CLOUDINARY_CLOUD_NAME = "cxlqxdrc";
const CLOUDINARY_API_KEY = "976656122995981";
const CLOUDINARY_API_SECRET = "6_5OAsBySh_gFfYiF3Up6Hrn-cc";
const DELAY_MS = 300;

let done = 0;
let failed = 0;
const errorLog = [];

async function queryD1(sql, params = []) {
  const res = await fetch(`${WORKER_URL}/api/pftool`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, params, token: PFTOOL_TOKEN }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.result[0].results;
}

function getSignature(timestamp, folder) {
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  return crypto.createHash("sha1").update(paramsToSign + CLOUDINARY_API_SECRET).digest("hex");
}

function slugify(url) {
  const match = url.match(/\/([^/]+)\.(jpg|jpeg|png|webp|gif)$/i);
  if (match) return match[1].replace(/[^a-zA-Z0-9_-]/g, "_");
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function downloadImage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        redirect: "follow",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error(`Too small: ${buf.length} bytes`);
      return buf;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function uploadToCloudinary(buffer, filename, folder) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = getSignature(timestamp, folder);
  const formData = new FormData();
  const ext = filename.split(".").pop() || "jpg";
  formData.append("file", new Blob([buffer], { type: `image/${ext}` }), filename);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok || !json.secure_url) throw new Error(json.error?.message || JSON.stringify(json));
  return { url: json.secure_url, publicId: json.public_id };
}

async function processCategory(categorySlug) {
  console.log(`\n--- ${categorySlug} ---`);
  const rows = await queryD1(`
    SELECT pi.id, pi.url, pi.product_id, p.slug
    FROM product_images pi
    JOIN products p ON p.id = pi.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE c.slug = ? AND pi.url LIKE '%pharaohfurniture.com%'
    ORDER BY p.slug, pi.sort_order
  `, [categorySlug]);

  if (rows.length === 0) {
    console.log("  No broken images.");
    return;
  }
  console.log(`  Found ${rows.length} broken images.`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const folder = `pharaoh-furniture/${categorySlug}`;
      const buffer = await downloadImage(row.url);
      const cloudinaryName = `${row.slug}/${slugify(row.url)}`;
      const result = await uploadToCloudinary(buffer, cloudinaryName, folder);
      await queryD1("UPDATE product_images SET url = ? WHERE id = ?", [result.url, row.id]);
      done++;
    } catch (err) {
      failed++;
      errorLog.push({ id: row.id, slug: row.slug, category: categorySlug, url: row.url, error: err.message });
    }
    if (i < rows.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }
  console.log(`  Done: ${rows.length - failed} migrated, ${failed} failed.`);
}

async function main() {
  const categories = [
    "dining", "entree", "ready", "kids", "corner", "salons",
    "tables", "lazy-boy", "dressing", "tv-units", "cabinets",
    "misc", "offers"
  ];

  for (const cat of categories) {
    await processCategory(cat);
  }

  console.log(`\n=== GRAND TOTAL ===`);
  console.log(`Migrated: ${done}`);
  console.log(`Failed: ${failed}`);
  if (errorLog.length > 0) {
    fs.writeFileSync("scripts/fix-all-errors.json", JSON.stringify(errorLog, null, 2));
    console.log("Error log: scripts/fix-all-errors.json");
  }
}

main().catch(console.error);
