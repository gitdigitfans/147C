import { readFileSync } from "fs";

const TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";
const PFTOOL = "https://pharaoh-furniture.pharaoh-furniture.workers.dev/api/pftool";
const WP_API = "https://pharaohfurniture.com/wp-json/wc/store/v1/products";
const DINING_CAT_ID = 142;

async function pftoolQuery(sql) {
  const url = `${PFTOOL}?token=${TOKEN}&sql=${encodeURIComponent(sql)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`pftool error ${r.status}: ${await r.text()}`);
  const j = await r.json();
  if (!j.success) throw new Error(`pftool failed: ${JSON.stringify(j)}`);
  return j.result?.[0]?.results ?? j.result;
}

async function fetchAllWPDining() {
  const products = [];
  let page = 1;
  while (true) {
    console.log(`Fetching WP page ${page}...`);
    const r = await fetch(`${WP_API}?category=${DINING_CAT_ID}&per_page=100&page=${page}`);
    if (!r.ok) throw new Error(`WP API error ${r.status}`);
    const data = await r.json();
    if (data.length === 0) break;
    products.push(...data);
    page++;
  }
  return products;
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "-")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDescription(description) {
  const text = stripHtml(description);
  const dims = [];
  const counts = [];

  // Extract dimension specs: "ترابيزة X بعرض Y سم وارتفاع Z سم وعمق W سم"
  // or "ترابيزة/بوفيه/نيش ... بعرض X سم / ارتفاع Y / عمق Z"
  
  const dimPatterns = [
    // "ترابيزة سفرة متينة بعرض 180 سم وارتفاع 80 سم وعمق 90 سم"
    /(?:ترابي[زж]ة?\s+سفر[ةه]\s+\S+|بوفيه\s+عملي|نيش\s+\S+)\s+ب(?:عرض|طول)\s+(\d+(?:\s*[×x]\s*\d+)?)\s*(?:سم|SM|سنتيم|cm)?(?:\s+و(?:ارتفاع|طول)\s+(\d+(?:\s*[×x]\s*\d+)?)\s*(?:سم|SM|سنتيم|cm)?)?(?:\s+و(?:عمق|عرض)\s+(\d+(?:\s*[×x]\s*\d+)?)\s*(?:سم|SM|سنتيم|cm)?)?/gi,
    // "بوفيه عملي بعرض 180 سم"
    /بوفيه\s+عملي\s+ب(?:عرض|طول)\s+(\d+(?:\s*[×x]\s*\d+)?)\s*(?:سم|SM)?/gi,
    // "نيش أنيق عرض 100 سم"  
    /نيش\s+\S+\s+عرض\s+(\d+)\s*(?:سم|SM)?/gi,
    // generic "X سم و Y سم و Z سم" patterns after item names
  ];

  // More robust: scan the text for known furniture items and their dimensions
  const furnitureItems = [
    { name: "ترابيزة سفرة", patterns: [/(?:ترابي[زж]ة?\s+سفر[ةه]\s+\S*)/gi] },
    { name: "بوفيه", patterns: [/بوفيه\s+عملي/gi] },
    { name: "نيش", patterns: [/نيش\s+\S*/gi] },
    { name: "مرآة البوفيه", patterns: [/مرآة\s+(?:للبوفيه|البوفيه|عصرية)/gi] },
  ];

  // Better approach: extract all dimension mentions from the full text
  // Patterns like "بعرض X سم" "ارتفاع Y سم" "عمق Z سم" linked to items

  // First, find segments: each sentence/clause about a furniture piece
  const sentences = text.split(/[.!?\n]+|(?<=سم)\s+/);

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;

    // Check for count: "عدد X كراسي" / "عدد X كرسي"
    const countMatch = s.match(/عدد\s+(\d+)\s+(.+)/i);
    if (countMatch) {
      const num = countMatch[1];
      const itemDesc = countMatch[2].trim().substring(0, 50);
      counts.push({ key: `عدد ${itemDesc}`, value: num });
      continue;
    }

    // Check for dimension mentions
    const widthMatch = s.match(/(?:عرض|بعرض|العرض)\s+(\d+(?:\s*[×x]\s*\d+)?)\s*(?:سم|SM|cm)?/i);
    const heightMatch = s.match(/(?:ارتفاع|ارتفاع|الارتفاع)\s+(\d+(?:\s*[×x]\s*\d+)?)\s*(?:سم|SM|cm)?/i);
    const depthMatch = s.match(/(?:عمق|العمق)\s+(\d+(?:\s*[×x]\s*\d+)?)\s*(?:سم|SM|cm)?/i);

    if (widthMatch || heightMatch || depthMatch) {
      // Try to find the item name in this sentence
      let itemName = "غير محدد";

      if (/ترابي[زج]ة?\s+سفر[ةه]/.test(s)) {
        // Extract the full name like "ترابيزة سفرة متينة" or "ترابيزة سفرة رخام"
        const nameMatch = s.match(/(ترابي[زج]ة?\s+سفر[ةه]\s+\S*)/);
        itemName = nameMatch ? nameMatch[1].trim() : "ترابيزة سفرة";
      } else if (/بوفيه/.test(s)) {
        itemName = "بوفيه عملي";
      } else if (/نيش/.test(s)) {
        const nMatch = s.match(/(نيش\s+\S*)/);
        itemName = nMatch ? nMatch[1].trim() : "نيش";
      } else if (/مرآة/.test(s)) {
        itemName = "مرآة البوفيه";
      } else if (/كرس[يى]/.test(s)) {
        // skip - handled by count
        const countMatch2 = s.match(/عدد\s+(\d+)/);
        if (countMatch2) {
          const itemMatch = s.match(/عدد\s+\d+\s+(.+)/);
          if (itemMatch) counts.push({ key: `عدد ${itemMatch[1].trim().substring(0, 50)}`, value: countMatch2[1] });
        }
        continue;
      } else {
        // Try to extract first meaningful words as item name
        const genericMatch = s.match(/^([^،,]{2,30}?)\s+(?:بعرض|عرض|ارتفاع|عمق)/);
        if (genericMatch) itemName = genericMatch[1].trim();
      }

      if (widthMatch) dims.push({ item: itemName, dim: "العرض", value: `${widthMatch[1]} سم` });
      if (heightMatch) dims.push({ item: itemName, dim: "الارتفاع", value: `${heightMatch[1]} سم` });
      if (depthMatch) dims.push({ item: itemName, dim: "العمق", value: `${depthMatch[1]} سم` });
    }
  }

  // Also look for direct count patterns in the full text
  const countRegex = /عدد\s+(\d+)\s+([^،.!?\n]{2,40})/gi;
  let cm;
  while ((cm = countRegex.exec(text)) !== null) {
    const existing = counts.find(c => c.value === cm[1] && c.key.includes(cm[2].trim().substring(0, 10)));
    if (!existing) {
      counts.push({ key: `عدد ${cm[2].trim().substring(0, 50)}`, value: cm[1] });
    }
  }

  return { dims, counts };
}

function matchWpProduct(wpProduct, ourProducts) {
  const wpName = wpProduct.name.replace(/\s+/g, " ").trim();
  const wpSlug = decodeURIComponent(wpProduct.slug).replace(/\s+/g, " ").trim();

  // Try matching by slug
  for (const p of ourProducts) {
    const engSlug = p.slug.replace("dining-", "");
    if (wpSlug.includes(engSlug) || engSlug.includes(wpSlug.split("-")[0])) {
      return p;
    }
  }

  // Try matching by Arabic name similarity
  const cleanWpName = wpName.replace(/^(غرف[ةه]\s+سفر[ةه]|سفر[ةه])\s+/i, "").trim();
  for (const p of ourProducts) {
    const cleanDbName = p.name_ar.replace(/^(غرف[ةه]\s+سفر[ةه]|سفر[ةه])\s+/i, "").trim();
    if (cleanWpName === cleanDbName || cleanDbName.includes(cleanWpName) || cleanWpName.includes(cleanDbName)) {
      return p;
    }
  }

  return null;
}

async function main() {
  console.log("=== Fetching dining products from our DB ===");
  const dbProducts = (await pftoolQuery(
    "SELECT id, slug, name_ar FROM products WHERE category_id=(SELECT id FROM categories WHERE slug='dining') ORDER BY slug"
  ));
  console.log(`Found ${dbProducts.length} products in DB`);

  console.log("\n=== Fetching dining products from WordPress ===");
  const wpProducts = await fetchAllWPDining();
  console.log(`Found ${wpProducts.length} products on WP`);

  // Match and process
  const matches = [];
  const unmatched = [];

  for (const wp of wpProducts) {
    const dbProduct = matchWpProduct(wp, dbProducts);
    if (dbProduct) {
      matches.push({ wp, db: dbProduct });
    } else {
      unmatched.push(wp.name);
    }
  }

  console.log(`\nMatched: ${matches.length}, Unmatched: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log("Unmatched WP products:", unmatched);
  }

  // Process each matched product
  let updated = 0;
  let noSpecs = 0;

  for (const { wp, db } of matches) {
    const { dims, counts } = parseDescription(wp.description);

    if (dims.length === 0 && counts.length === 0) {
      console.log(`\n[${db.slug}] No specs found in description`);
      noSpecs++;
      continue;
    }

    console.log(`\n[${db.slug}] ${dims.length} dims, ${counts.length} counts`);

    // Delete old specs
    await pftoolQuery(`DELETE FROM product_specs WHERE product_id='${db.id}'`);

    // Insert new specs
    let specOrder = 0;
    for (const d of dims) {
      const key = `${d.item} - ${d.dim}`;
      const enDim = d.dim === "العرض" ? "Width" : d.dim === "الارتفاع" ? "Height" : "Depth";
      const enKey = `${d.item} - ${enDim}`;
      await pftoolQuery(
        `INSERT INTO product_specs (product_id, spec_key_ar, spec_key_en, spec_value_ar, spec_value_en, sort_order) VALUES ('${db.id}', '${key.replace(/'/g, "''")}', '${enKey.replace(/'/g, "''")}', '${d.value.replace(/'/g, "''")}', '${d.value.replace(/'/g, "''")}', ${specOrder++})`
      );
      console.log(`  DIM: ${key} = ${d.value}`);
    }

    for (const c of counts) {
      await pftoolQuery(
        `INSERT INTO product_specs (product_id, spec_key_ar, spec_key_en, spec_value_ar, spec_value_en, sort_order) VALUES ('${db.id}', '${c.key.replace(/'/g, "''")}', '${c.key.replace(/'/g, "''")}', '${c.value}', '${c.value}', ${specOrder++})`
      );
      console.log(`  COUNT: ${c.key} = ${c.value}`);
    }

    updated++;
  }

  console.log(`\n=== DONE ===`);
  console.log(`Updated: ${updated}, No specs: ${noSpecs}`);
}

main().catch(e => {
  console.error("FATAL:", e);
  process.exit(1);
});
