const fs = require("fs");
const crypto = require("crypto");

const WORKER_URL = "https://pharaoh-furniture.pharaoh-furniture.workers.dev";
const PFTOOL_TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";
const CLOUDINARY_CLOUD_NAME = "cxlqxdrc";
const CLOUDINARY_API_KEY = "976656122995981";
const CLOUDINARY_API_SECRET = "6_5OAsBySh_gFfYiF3Up6Hrn-cc";
const FOLDER_BASE = "pharaoh-furniture";
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

async function scrapeAllBedroomProducts() {
  const products = {};
  for (let page = 1; page <= 10; page++) {
    const url = page === 1
      ? "https://pharaohfurniture.com/product-category/%d8%ba%d8%b1%d9%81-%d9%86%d9%88%d9%85/"
      : `https://pharaohfurniture.com/product-category/%d8%ba%d8%b1%d9%81-%d9%86%d9%88%d9%85/page/${page}/`;
    console.log(`  Scraping page ${page}...`);
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) { console.log(`  Page ${page}: HTTP ${res.status}, stopping.`); break; }
      const html = await res.text();
      const links = [...new Set([...html.matchAll(/href="(https:\/\/pharaohfurniture\.com\/product\/[^"]+)"/g)].map(m => m[1]))];
      if (links.length === 0) break;
      console.log(`  Found ${links.length} product links.`);
      for (const prodUrl of links) {
        try {
          const pRes = await fetch(prodUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
          if (!pRes.ok) continue;
          const pHtml = await pRes.text();
          const titleMatch = pHtml.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([^<]+)<\/h1>/) || pHtml.match(/<h1[^>]*>([^<]+)<\/h1>/);
          const title = titleMatch ? titleMatch[1].trim() : "";
          // Get ALL images from wp-content/uploads
          const allImgs = [...new Set([
            ...[...pHtml.matchAll(/href="(https:\/\/pharaohfurniture\.com\/wp-content\/uploads\/[^"]+\.(jpg|jpeg|png|webp|gif)(?:\?[^"]*)?)"/gi)].map(m => m[1]),
            ...[...pHtml.matchAll(/src="(https:\/\/pharaohfurniture\.com\/wp-content\/uploads\/[^"]+\.(jpg|jpeg|png|webp|gif)(?:\?[^"]*)?)"/gi)].map(m => m[1]),
          ])].filter(u => !u.includes("-150x150") && !u.includes("-100x100") && !u.includes("-300x300") && !u.includes("-430x430"));
          if (allImgs.length > 0) {
            products[title] = allImgs;
          }
          await new Promise(r => setTimeout(r, 200));
        } catch (e) { /* skip */ }
      }
    } catch (e) { break; }
  }
  return products;
}

function normalizeArabic(s) {
  return (s || "").replace(/[\s\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0611\u0612\u0613\u0614\u061B\u061E\u061F\u0640\u0660-\u0669\u066A\u066B\u066C\u066D\u06D4\u0601\u0602\u0603\u0604\u0606\u0607\u0608\u060B\u060C\u060D\u061A\u061E]/g, "").toLowerCase().trim();
}

async function main() {
  console.log("Step 1: Scraping WooCommerce bedroom products...");
  const wooData = await scrapeAllBedroomProducts();
  console.log(`Found ${Object.keys(wooData).length} products from WooCommerce.\n`);

  console.log("Step 2: Getting all pn2ugoxc images from D1...");
  const rows = await queryD1(`
    SELECT pi.id, pi.url, pi.product_id, p.slug, p.name_ar
    FROM product_images pi
    JOIN products p ON p.id = pi.product_id
    WHERE pi.url LIKE '%pn2ugoxc%'
    ORDER BY p.slug
  `);
  console.log(`Found ${rows.length} images to fix.\n`);

  // Group by product
  const byProduct = {};
  for (const r of rows) {
    if (!byProduct[r.product_id]) byProduct[r.product_id] = { name_ar: r.name_ar, slug: r.slug, images: [] };
    byProduct[r.product_id].images.push(r);
  }

  // Build name -> woo images lookup
  const wooLookup = {};
  for (const [wooName, imgs] of Object.entries(wooData)) {
    wooLookup[normalizeArabic(wooName)] = imgs;
  }

  console.log("Step 3: Matching and re-uploading...\n");
  let noMatch = 0;

  for (const [productId, product] of Object.entries(byProduct)) {
    const normName = normalizeArabic(product.name_ar);
    let wooImages = wooLookup[normName];
    
    if (!wooImages) {
      // Fuzzy: check if any woo name contains this or vice versa
      for (const [wn, wi] of Object.entries(wooLookup)) {
        if ((normName.length > 3 && wn.includes(normName)) || (wn.length > 3 && normName.includes(wn))) {
          wooImages = wi;
          break;
        }
      }
    }

    if (!wooImages) {
      noMatch++;
      for (const img of product.images) {
        failed++;
        errorLog.push({ id: img.id, slug: product.slug, name_ar: product.name_ar, error: `No WooCommerce match` });
      }
      continue;
    }

    for (let i = 0; i < product.images.length; i++) {
      const img = product.images[i];
      const wooImg = wooImages[i % wooImages.length];
      try {
        const buffer = await downloadImage(wooImg);
        const cloudName = `${product.slug}/${slugify(wooImg)}`;
        const newUrl = await uploadToCloudinary(buffer, cloudName, `${FOLDER_BASE}/${product.slug.split("-")[0]}`);
        await queryD1("UPDATE product_images SET url = ? WHERE id = ?", [newUrl, img.id]);
        done++;
      } catch (err) {
        failed++;
        errorLog.push({ id: img.id, slug: product.slug, name_ar: product.name_ar, wooUrl: wooImg, error: err.message });
      }
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Migrated: ${done}/${rows.length}`);
  console.log(`Failed: ${failed}`);
  console.log(`No WooCommerce match: ${noMatch} products`);
  if (errorLog.length > 0) {
    fs.writeFileSync("scripts/fix-pn2ugoxc-errors.json", JSON.stringify(errorLog, null, 2));
    console.log("Error log: scripts/fix-pn2ugoxc-errors.json");
  }
}

main().catch(console.error);
