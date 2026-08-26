const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const WORKER_URL = "https://pharaoh-furniture.pharaoh-furniture.workers.dev";
const PFTOOL_TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";
const OUTPUT_DIR = path.join(__dirname, "..", "Photo prodect");
const DELAY_MS = 100;

let totalDownloaded = 0;
let totalFailed = 0;
const errors = [];

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

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    protocol.get(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      clearTimeout(timeout);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on("finish", () => { fileStream.close(); resolve(); });
      fileStream.on("error", (err) => { fs.unlink(dest, () => {}); reject(err); });
    }).on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").substring(0, 100);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Fetching products...");
  const products = await queryD1(`
    SELECT DISTINCT p.id, p.slug, p.name_ar
    FROM products p
    WHERE EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)
    ORDER BY p.slug
  `);
  console.log(`Found ${products.length} products with images.\n`);

  let productIdx = 0;
  for (const product of products) {
    productIdx++;
    const slug = product.slug || product.id;
    const folderName = sanitizeFilename(slug);
    const productDir = path.join(OUTPUT_DIR, folderName);

    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }

    const images = await queryD1(
      "SELECT id, url, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order",
      [product.id]
    );

    process.stdout.write(`[${productIdx}/${products.length}] ${folderName} (${images.length} imgs) `);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.url) { totalFailed++; continue; }

      const ext = (img.url.match(/\.(jpg|jpeg|png|webp|gif)/i) || [".jpg"])[1] || "jpg";
      const prefix = img.is_primary ? "0_primary" : String(i + 1).padStart(2, "0");
      const filename = `${prefix}_${img.id.substring(0, 12)}.${ext}`;
      const filepath = path.join(productDir, filename);

      if (fs.existsSync(filepath)) {
        totalDownloaded++;
        continue;
      }

      try {
        await downloadFile(img.url, filepath);
        const size = fs.statSync(filepath).size;
        if (size < 100) {
          fs.unlinkSync(filepath);
          throw new Error("Too small");
        }
        totalDownloaded++;
      } catch (err) {
        totalFailed++;
        errors.push({ product: slug, imageId: img.id, url: img.url, error: err.message });
      }

      await sleep(DELAY_MS);
    }
    console.log("OK");
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Products: ${products.length}`);
  console.log(`Downloaded: ${totalDownloaded}`);
  console.log(`Failed: ${totalFailed}`);
  if (errors.length > 0) {
    fs.writeFileSync(path.join(__dirname, "download-errors.json"), JSON.stringify(errors, null, 2));
    console.log(`Error log: scripts/download-errors.json`);
  }
}

main().catch(console.error);
