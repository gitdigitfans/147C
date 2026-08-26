const fs = require("fs");
const crypto = require("crypto");

const WORKER_URL = "https://pharaoh-furniture.pharaoh-furniture.workers.dev";
const PFTOOL_TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";
const CLOUDINARY_CLOUD_NAME = "cxlqxdrc";
const CLOUDINARY_API_KEY = "976656122995981";
const CLOUDINARY_API_SECRET = "6_5OAsBySh_gFfYiF3Up6Hrn-cc";
const DELAY_MS = 400;

let done = 0, failed = 0;
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
  return crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`).digest("hex");
}

function slugify(url) {
  const match = url.match(/\/([^/]+)\.(jpg|jpeg|png|webp|gif)$/i);
  if (match) return match[1].replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 80);
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function downloadImage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        redirect: "follow",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) throw new Error(`Too small: ${buf.length} bytes`);
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
  return json.secure_url;
}

function normalizeArabic(s) {
  return (s || "")
    .replace(/ة/g, "ه")          // ta marbuta -> ha
    .replace(/[\s\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0640]/g, "")
    .toLowerCase().trim();
}

async function scrapeProductImages(prodUrl) {
  try {
    const res = await fetch(prodUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return [];
    const html = await res.text();
    return [...new Set([
      ...[...html.matchAll(/href="(https:\/\/pharaohfurniture\.com\/wp-content\/uploads\/[^"]+\.(jpg|jpeg|png|webp|gif)(?:\?[^"]*)?)"/gi)].map(m => m[1]),
      ...[...html.matchAll(/src="(https:\/\/pharaohfurniture\.com\/wp-content\/uploads\/[^"]+\.(jpg|jpeg|png|webp|gif)(?:\?[^"]*)?)"/gi)].map(m => m[1]),
    ])].filter(u => !u.includes("-150x") && !u.includes("-100x") && !u.includes("-300x") && !u.includes("-430x") && !u.includes("-370x") && !u.includes("-150x200"));
  } catch (e) { return []; }
}

// Map of product slug -> WooCommerce URL (manually found)
const WOOCOMMERCE_URLS = {
  "bedroom-randy": "https://pharaohfurniture.com/product/%d8%ba%d8%b1%d9%81%d9%87-%d9%86%d9%88%d9%85-%d8%b1%d8%a7%d9%86%d8%af%d9%8a/",
  "bedroom-diva": "https://pharaohfurniture.com/product/%d8%ba%d8%b1%d9%81%d9%87-%d9%86%d9%88%d9%85-%d8%af%d9%8a%d9%81%d8%a7/",
  "bedroom-faris": "https://pharaohfurniture.com/product/%d8%ba%d8%b1%d9%81-%d9%86%d9%88%d9%85-%d9%81%d8%a7%d8%b1%d8%b3/",
  "bedroom-nefrosobek": null, // search needed
  "bedroom-nody": null,
  "bedroom-plaza": null,
  "bedroom-sara": null,
  "bedroom-sekhmet": null,
  "bedroom-shahinaz": "https://pharaohfurniture.com/product/%d8%ba%d8%b1%d9%81%d9%87-%d9%86%d9%88%d9%85-%d8%b4%d8%a7%d9%87%d9%8a%d9%86%d8%a7%d8%b2/",
  "bedroom-zizinia": null,
};

async function searchWooCommerce(term) {
  const url = `https://pharaohfurniture.com/?s=${encodeURIComponent(term)}&post_type=product`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const html = await res.text();
    // Find product links that match
    const links = [...html.matchAll(/href="(https:\/\/pharaohfurniture\.com\/product\/[^"]+)"/g)].map(m => m[1]);
    // Filter for bedroom-related links
    const bedroomLinks = links.filter(l => l.includes("%d8%ba%d8%b1%d9%81") || l.includes("غرف") || l.includes("نوم"));
    return bedroomLinks.length > 0 ? bedroomLinks[0] : (links.length > 0 ? links[0] : null);
  } catch (e) { return null; }
}

async function main() {
  // Load failed products
  const errors = JSON.parse(fs.readFileSync("scripts/fix-pn2ugoxc-errors.json", "utf8"));
  const failedIds = new Set(errors.map(e => e.id));
  
  // Get all pn2ugoxc images from D1
  const allRows = await queryD1(`
    SELECT pi.id, pi.url, pi.product_id, p.slug, p.name_ar
    FROM product_images pi
    JOIN products p ON p.id = pi.product_id
    WHERE pi.url LIKE '%pn2ugoxc%'
    ORDER BY p.slug
  `);
  
  const failedRows = allRows.filter(r => failedIds.has(r.id));
  console.log(`Re-processing ${failedRows.length} failed images...\n`);

  // Group by product
  const byProduct = {};
  for (const r of failedRows) {
    if (!byProduct[r.product_id]) byProduct[r.product_id] = { name_ar: r.name_ar, slug: r.slug, images: [] };
    byProduct[r.product_id].images.push(r);
  }

  for (const [productId, product] of Object.entries(byProduct)) {
    const slug = product.slug;
    let wooUrl = WOOCOMMERCE_URLS[slug];
    
    if (!wooUrl) {
      // Search for it
      const searchTerm = product.name_ar.replace(/غرف[هة]?/, "").trim();
      console.log(`  Searching WooCommerce for: ${searchTerm}...`);
      wooUrl = await searchWooCommerce(searchTerm);
      if (wooUrl) {
        console.log(`    Found: ${wooUrl}`);
      } else {
        console.log(`    Not found.`);
      }
    }
    
    if (!wooUrl) {
      for (const img of product.images) {
        failed++;
        errorLog.push({ id: img.id, slug, name_ar: product.name_ar, error: "No WooCommerce URL found" });
      }
      continue;
    }

    const wooImages = await scrapeProductImages(wooUrl);
    console.log(`  ${slug}: Found ${wooImages.length} WooCommerce images for ${product.images.length} D1 images.`);
    
    if (wooImages.length === 0) {
      for (const img of product.images) {
        failed++;
        errorLog.push({ id: img.id, slug, name_ar: product.name_ar, wooUrl, error: "No images scraped from WooCommerce" });
      }
      continue;
    }

    for (let i = 0; i < product.images.length; i++) {
      const img = product.images[i];
      const wooImg = wooImages[i % wooImages.length];
      try {
        const buffer = await downloadImage(wooImg);
        const cloudName = `${slug}/${slugify(wooImg)}`;
        const folder = `pharaoh-furniture/bedrooms`;
        const newUrl = await uploadToCloudinary(buffer, cloudName, folder);
        await queryD1("UPDATE product_images SET url = ? WHERE id = ?", [newUrl, img.id]);
        done++;
        console.log(`    [${done}] ${img.id} -> OK`);
      } catch (err) {
        failed++;
        errorLog.push({ id: img.id, slug, name_ar: product.name_ar, wooUrl: wooImg, error: err.message });
        console.log(`    [FAIL] ${img.id}: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Migrated: ${done}`);
  console.log(`Failed: ${failed}`);
  if (errorLog.length > 0) {
    fs.writeFileSync("scripts/fix-pn2ugoxc-errors-v2.json", JSON.stringify(errorLog, null, 2));
    console.log("Error log: scripts/fix-pn2ugoxc-errors-v2.json");
  }
}

main().catch(console.error);
