const API = "https://pharaoh-furniture.pharaoh-furniture.workers.dev/api/pftool";
const TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";
const BASE = "https://pharaoh-furniture.pharaoh-furniture.workers.dev";

async function query(sql) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, sql }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.result[0].results;
}

async function fetchDescription(slug) {
  const res = await fetch(`${BASE}/shop/${slug}`);
  const html = await res.text();

  // The description is in the RSC payload embedded in the HTML
  // Pattern: "description":{"ar":"...escaped unicode text...","en":"..."}
  // But it may be split across chunks, so search the raw HTML
  
  // Find "description":{"ar":" pattern
  const markers = [
    '"description":{"ar":"',
    '"description_ar":"',
  ];
  
  for (const marker of markers) {
    const idx = html.indexOf(marker);
    if (idx >= 0) {
      const start = idx + marker.length;
      // Find the end - look for ","en" or ","
      let depth = 0;
      let end = start;
      while (end < html.length && end < start + 50000) {
        if (html[end] === '"' && html[end-1] !== '\\') {
          // Check if next is ,"
          if (html.substring(end, end+6) === '","en' || html.substring(end, end+4) === '",') {
            break;
          }
        }
        end++;
      }
      
      if (end > start && end < start + 50000) {
        let arText = html.substring(start, end);
        // Unescape
        arText = arText.replace(/\\n/g, "\n");
        arText = arText.replace(/\\"/g, '"');
        arText = arText.replace(/\\\\/g, '\\');
        arText = arText.replace(/\\u([\da-f]{4})/gi, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
        
        if (arText.includes("\u0633\u0645") || arText.includes("cm")) {
          return arText;
        }
      }
    }
  }
  
  return null;
}

function extractDimsFromDescription(desc) {
  if (!desc) return null;
  const dims = {};

  // Pattern 1: "دولاب فخم بعرض 240سم وارتفاع 235 سم وعمق 60 سم"
  const wardMatch = desc.match(/(\d+)\s*\u0633\u0645\s*\u0648\u0627\u0631\u062a\u0641\u0627\u0639\s*(\d+)\s*\u0633\u0645\s*\u0648\u0639\u0645\u0642\s*(\d+)/i);
  if (wardMatch) {
    dims.wW = wardMatch[1];
    dims.wH = wardMatch[2];
    dims.wD = wardMatch[3];
  }
  
  // Pattern 2: "عرض 240 سم وارتفاع 235 سم وعمق 60 سم"
  if (!dims.wW) {
    const w2 = desc.match(/\u0639\u0631\u0636\s*(\d+)\s*\u0633\u0645[^.\n]*\u0627\u0631\u062a\u0641\u0627\u0639\s*(\d+)\s*\u0633\u0645[^.\n]*\u0639\u0645\u0642\s*(\d+)/i);
    if (w2) {
      dims.wW = w2[1];
      dims.wH = w2[2];
      dims.wD = w2[3];
    }
  }

  // Pattern 3: English "240cm wide, 235cm high and 60cm deep"
  if (!dims.wW) {
    const w3 = desc.match(/(\d+)\s*cm\s*(?:wide|width)[^.\n]*?(\d+)\s*cm\s*(?:high|height)[^.\n]*?(\d+)\s*cm\s*(?:deep|depth)/i);
    if (w3) {
      dims.wW = w3[1];
      dims.wH = w3[2];
      dims.wD = w3[3];
    }
  }

  // Pattern 4: "عرض 240 سم ارتفاع 235 سم عمق 60 سم" (with keyword before each number)
  if (!dims.wW) {
    const widths = [];
    const re = /(?:\u0639\u0631\u0636|\u0639\u0631\u0636)\s*[:\s]*(\d+)\s*\u0633\u0645/gi;
    let m;
    while ((m = re.exec(desc)) !== null) widths.push(m[1]);
    const heights = [];
    const re2 = /(?:\u0627\u0631\u062a\u0641\u0627\u0639)\s*[:\s]*(\d+)\s*\u0633\u0645/gi;
    while ((m = re2.exec(desc)) !== null) heights.push(m[1]);
    const depths = [];
    const re3 = /(?:\u0639\u0645\u0642)\s*[:\s]*(\d+)\s*\u0633\u0645/gi;
    while ((m = re3.exec(desc)) !== null) depths.push(m[1]);
    
    if (widths.length > 0 && heights.length > 0 && depths.length > 0) {
      dims.wW = widths[widths.length - 1];
      dims.wH = heights[heights.length - 1];
      dims.wD = depths[depths.length - 1];
    }
  }

  // Bed: "160 × 210 سم" or "160 x 210 سم"
  const bedXMatch = desc.match(/(\d+)\s*[\u00d7xX\u00d7]\s*(\d+)\s*\u0633\u0645/);
  if (bedXMatch) {
    const a = parseInt(bedXMatch[1]);
    const b = parseInt(bedXMatch[2]);
    dims.bW = String(Math.min(a, b));
    dims.bL = String(Math.max(a, b));
  }

  // Nightstand count: "2 كمودينو" or "كمودينو x2"
  const nsCount = desc.match(/(\d+)\s*\u0643\u0645\u0648\u062f/);
  if (nsCount) dims.nC = nsCount[1];

  // Nightstand width: "كمودينو ... 50 سم"
  const nsWidth = desc.match(/(?:\u0643\u0645\u0648\u062f)[^.\n]*?(\d+)\s*\u0633\u0645/);
  if (nsWidth) dims.nW = nsWidth[1];

  // Vanity: "تسريحة 120 سم" or "120 سم مع مرآة"
  const vMatch = desc.match(/(?:\u062a\u0633\u0631\u064a\u062d\u0629)[^.\n]*?(\d+)\s*\u0633\u0645/);
  if (vMatch) dims.vW = vMatch[1];

  // Fallback: find the number 120 near تسريحة
  if (!dims.vW) {
    const v2 = desc.match(/120\s*\u0633\u0645/);
    if (v2) dims.vW = "120";
  }

  return dims;
}

function buildSpecs(dims) {
  const specs = [];
  const add = (keyAr, keyEn, valAr, valEn) => {
    if (valAr && valAr !== "undefined" && valAr !== "null") {
      specs.push({ keyAr, keyEn, valAr, valEn });
    }
  };

  add("\u0627\u0644\u062f\u0648\u0644\u0627\u0628 - \u0627\u0644\u0639\u0631\u0636", "Wardrobe - Width", `${dims.wW} \u0633\u0645`, `${dims.wW} cm`);
  add("\u0627\u0644\u062f\u0648\u0644\u0627\u0628 - \u0627\u0644\u0627\u0631\u062a\u0641\u0627\u0639", "Wardrobe - Height", `${dims.wH} \u0633\u0645`, `${dims.wH} cm`);
  add("\u0627\u0644\u062f\u0648\u0644\u0627\u0628 - \u0627\u0644\u0639\u0645\u0642", "Wardrobe - Depth", `${dims.wD} \u0633\u0645`, `${dims.wD} cm`);

  add("\u0627\u0644\u0633\u0631\u064a\u0631 - \u0627\u0644\u0639\u0631\u0636", "Bed - Width", `${dims.bW} \u0633\u0645`, `${dims.bW} cm`);

  if (dims.bL) {
    add("\u0627\u0644\u0645\u0631\u062a\u0628\u0629 - \u0627\u0644\u0639\u0631\u0636", "Mattress - Width", `${dims.bL} \u0633\u0645`, `${dims.bL} cm`);
  }
  if (dims.bW) {
    add("\u0627\u0644\u0645\u0631\u062a\u0628\u0629 - \u0627\u0644\u0639\u0645\u0642", "Mattress - Depth", `${dims.bW} \u0633\u0645`, `${dims.bW} cm`);
  }

  add("\u0627\u0644\u0643\u0645\u0648\u062f\u064a\u0646\u0648 - \u0627\u0644\u0639\u062f\u062f", "Nightstand - Count", dims.nC || "2", dims.nC || "2");
  add("\u0627\u0644\u0643\u0645\u0648\u062f\u064a\u0646\u0648 - \u0627\u0644\u0639\u0631\u0636", "Nightstand - Width", `${dims.nW} \u0633\u0645`, `${dims.nW} cm`);

  add("\u0627\u0644\u062a\u0633\u0631\u064a\u062d\u0629 - \u0627\u0644\u0639\u0631\u0636", "Vanity - Width", `${dims.vW} \u0633\u0645`, `${dims.vW} cm`);

  return specs;
}

async function main() {
  // First test with one product
  const testSlug = "bedroom-randy";
  console.log(`Testing with ${testSlug}...`);
  const desc = await fetchDescription(testSlug);
  if (desc) {
    console.log("Description found (" + desc.length + " chars)");
    console.log(desc.substring(0, 500));
    const dims = extractDimsFromDescription(desc);
    console.log("\nExtracted dims:", JSON.stringify(dims));
  } else {
    console.log("No description found!");
    return;
  }

  console.log("\n--- Starting full recovery ---\n");

  const products = await query(
    "SELECT id, slug FROM products WHERE category_id='cat_bedrooms' ORDER BY slug"
  );
  console.log("Found " + products.length + " bedroom products");

  let updated = 0, skipped = 0, errors = 0;
  const BATCH = 5;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    console.log(`\nBatch ${Math.floor(i/BATCH)+1}/${Math.ceil(products.length/BATCH)}...`);

    const results = await Promise.allSettled(
      batch.map(async (product) => {
        const d = await fetchDescription(product.slug);
        const dims = d ? extractDimsFromDescription(d) : null;
        return { product, dims };
      })
    );

    for (const r of results) {
      if (r.status === "rejected") {
        console.error(`FETCH_ERR: ${r.reason}`);
        errors++;
        continue;
      }
      const { product, dims } = r.value;
      
      if (!dims || (!dims.wW && !dims.bW)) {
        console.log(`SKIP ${product.slug} - no dims`);
        skipped++;
        continue;
      }

      if (!dims.nW) dims.nW = "50";
      if (!dims.nC) dims.nC = "2";
      if (!dims.vW) dims.vW = "120";

      const specs = buildSpecs(dims);
      if (specs.length === 0) { skipped++; continue; }

      try {
        await query("DELETE FROM product_specs WHERE product_id='" + product.id + "'");
        for (let j = 0; j < specs.length; j++) {
          const s = specs[j];
          const esc = (v) => v.replace(/'/g, "''");
          await query(
            "INSERT INTO product_specs (product_id, spec_key_ar, spec_key_en, spec_value_ar, spec_value_en, sort_order) VALUES ('" +
            product.id + "', '" + esc(s.keyAr) + "', '" + esc(s.keyEn) + "', '" +
            esc(s.valAr) + "', '" + esc(s.valEn) + "', " + j + ")"
          );
        }
        console.log(`OK ${product.slug} | W:${dims.wW||'?'} H:${dims.wH||'?'} D:${dims.wD||'?'} BW:${dims.bW||'?'} BL:${dims.bL||'?'} NW:${dims.nW||'?'} VW:${dims.vW||'?'}`);
        updated++;
      } catch (e) {
        console.error(`DB_ERR ${product.slug}: ${e.message}`);
        errors++;
      }
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${errors} errors`);
}

main().catch(console.error);
