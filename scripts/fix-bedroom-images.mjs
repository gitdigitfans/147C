// fix-bedroom-images.mjs
// Downloads all bedroom product images from pharaohfurniture.com,
// re-uploads them to Cloudinary, and updates the D1 product_images table.

import crypto from "crypto";
import fs from "fs";

const WORKER_URL = "https://pharaoh-furniture.pharaoh-furniture.workers.dev";
const PFTOOL_TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";
const CLOUDINARY_CLOUD_NAME = "cxlqxdrc";
const CLOUDINARY_API_KEY = "976656122995981";
const CLOUDINARY_API_SECRET = "6_5OAsBySh_gFfYiF3Up6Hrn-cc";
const FOLDER = "pharaoh-furniture/bedrooms";
const DELAY_MS = 500;

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
  return crypto
    .createHash("sha1")
    .update(paramsToSign + CLOUDINARY_API_SECRET)
    .digest("hex");
}

function slugify(url) {
  const match = url.match(/\/([^/]+)\.(jpg|jpeg|png|webp|gif)$/i);
  if (match) return match[1].replace(/[^a-zA-Z0-9_-]/g, "_");
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function downloadImage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function uploadToCloudinary(buffer, filename) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = getSignature(timestamp, FOLDER);

  const formData = new FormData();
  const ext = filename.split(".").pop() || "jpg";
  const blob = new Blob([buffer], { type: `image/${ext}` });
  formData.append("file", blob, filename);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", FOLDER);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const json = await res.json();
  if (!res.ok || !json.secure_url) {
    throw new Error(json.error?.message || JSON.stringify(json));
  }
  return { url: json.secure_url, publicId: json.public_id };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("Fetching broken bedroom images from D1...");
  const rows = await queryD1(`
    SELECT pi.id, pi.url, pi.product_id, p.slug
    FROM product_images pi
    JOIN products p ON p.id = pi.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE c.slug = 'bedrooms' AND pi.url LIKE '%pharaohfurniture.com%'
    ORDER BY p.slug, pi.sort_order
  `);

  console.log(`Found ${rows.length} images to migrate.\n`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const buffer = await downloadImage(row.url);
      const cloudinaryName = `${row.slug}/${slugify(row.url)}`;
      const result = await uploadToCloudinary(buffer, cloudinaryName);

      await queryD1("UPDATE product_images SET url = ? WHERE id = ?", [
        result.url,
        row.id,
      ]);

      done++;
      if (done % 20 === 0) {
        console.log(`  Progress: ${done}/${rows.length} done, ${failed} failed`);
      }
    } catch (err) {
      failed++;
      errorLog.push({ id: row.id, slug: row.slug, url: row.url, error: err.message });
      console.error(`  FAIL [${row.id}] ${row.slug}: ${err.message}`);
    }

    if (i < rows.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Migrated: ${done}/${rows.length}`);
  console.log(`Failed: ${failed}`);

  if (errorLog.length > 0) {
    fs.writeFileSync(
      "scripts/fix-bedroom-errors.json",
      JSON.stringify(errorLog, null, 2)
    );
    console.log("Error log: scripts/fix-bedroom-errors.json");
  }
}

main().catch(console.error);
