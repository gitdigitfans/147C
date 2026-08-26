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

  // Method 1: Direct inline description
  const marker = '\\"description\\":{\\"ar\\":\\"';
  const idx = html.indexOf(marker);
  if (idx >= 0) {
    const start = idx + marker.length;
    let end = start;
    while (end < html.length && end < start + 50000) {
      if (html[end] === '"' && html[end - 1] !== '\\') break;
      end++;
    }
    let arText = html.substring(start, end);
    if (!arText.startsWith('$')) {
      arText = arText.replace(/\\\\/g, '\x00');
      arText = arText.replace(/\\n/g, '\n');
      arText = arText.replace(/\\"/g, '"');
      arText = arText.replace(/\x00/g, '\\');
      return arText;
    }

    // Method 2: It's a reference like $16, find the T chunk
    const refMatch = arText.match(/^\$(\w+)/);
    if (refMatch) {
      const refId = refMatch[1];
      // Look for N:Thexlen,content pattern
      const tChunkRegex = new RegExp(refId + ':T[0-9a-f]+,([^<]*)');
      const tMatch = html.match(tChunkRegex);
      if (tMatch) {
        let text = tMatch[1];
        text = text.replace(/\\n/g, '\n');
        text = text.replace(/\\"/g, '"');
        text = text.replace(/\\\\/g, '\\');
        return text;
      }
    }
  }

  return null;
}

function extractDimsFromDescription(desc) {
  if (!desc) return null;
  const dims = {};

  // Wardrobe with bullet format: "الدولاب\n• العرض: 240 سم\n• الارتفاع: 235 سم\n• العمق: 60 سم"
  const wardBlock = desc.match(/(?:\u0627\u0644\u062f\u0648\u0644\u0627\u0628|Daulab)[\s\S]*?(?:\u0627\u0644\u0639\u0631\u0636|\u0623\u0639\u0631\u0636|\u0639\u0631\u0636)[:\s]*(\d+)\s*\u0633\u0645[\s\S]*?(?:\u0627\u0644\u0627\u0631\u062a\u0641\u0627\u0639|\u0627\u0631\u062a\u0641\u0627\u0639)[:\s]*(\d+)\s*\u0633\u0645[\s\S]*?(?:\u0627\u0644\u0639\u0645\u0642|\u0639\u0645\u0642)[:\s]*(\d+)\s*\u0633\u0645/);
  if (wardBlock) {
    dims.wW = wardBlock[1];
    dims.wH = wardBlock[2];
    dims.wD = wardBlock[3];
  }

  // Inline wardrobe: "240سم وارتفاع 235 سم وعمق 60 سم"
  if (!dims.wW) {
    const w2 = desc.match(/(\d+)\s*\u0633\u0645\s*\u0648\u0627\u0631\u062a\u0641\u0627\u0639\s*(\d+)\s*\u0633\u0645\s*\u0648\u0639\u0645\u0642\s*(\d+)/i);
    if (w2) { dims.wW = w2[1]; dims.wH = w2[2]; dims.wD = w2[3]; }
  }

  // Alt: "عرض 240 سم وارتفاع 235 سم وعمق 60 سم"
  if (!dims.wW) {
    const w3 = desc.match(/\u0639\u0631\u0636\s*(\d+)\s*\u0633\u0645[^.\n]*\u0627\u0631\u062a\u0641\u0627\u0639\s*(\d+)\s*\u0633\u0645[^.\n]*\u0639\u0645\u0642\s*(\d+)/i);
    if (w3) { dims.wW = w3[1]; dims.wH = w3[2]; dims.wD = w3[3]; }
  }

  // English: "240cm wide, 235cm high and 60cm deep"
  if (!dims.wW) {
    const w4 = desc.match(/(\d+)\s*cm\s*(?:wide|width)[^.\n]*?(\d+)\s*cm\s*(?:high|height)[^.\n]*?(\d+)\s*cm\s*(?:deep|depth)/i);
    if (w4) { dims.wW = w4[1]; dims.wH = w4[2]; dims.wD = w4[3]; }
  }

  // Bed: "160 × 210 سم" or "160 195X"
  const bedXMatch = desc.match(/(\d+)\s*[\u00d7xX\u00d7]\s*(\d+)/i);
  if (bedXMatch && !dims.bW) {
    const a = parseInt(bedXMatch[1]);
    const b = parseInt(bedXMatch[2]);
    if (Math.min(a, b) >= 100) {
      dims.bW = String(Math.min(a, b));
      dims.bL = String(Math.max(a, b));
    }
  }
  // Alt: "160 195X" pattern
  if (!dims.bW) {
    const bedAlt = desc.match(/(\d+)\s+(\d+)\s*X/i);
    if (bedAlt) {
      const a = parseInt(bedAlt[1]);
      const b = parseInt(bedAlt[2]);
      if (Math.min(a, b) >= 100) {
        dims.bW = String(Math.min(a, b));
        dims.bL = String(Math.max(a, b));
      }
    }
  }

  // Nightstand count: "2 كمودينو" or "عدد 2 كمودينو"
  const nsCount = desc.match(/(\d+)\s*(?:\u0643\u0645\u0648\u062f)/i);
  if (nsCount) dims.nC = nsCount[1];

  // Nightstand width: "المقاس: 50 سم" near كمودينو, or "كمودينو ... 50 سم"
  // Check line-by-line for bullet format
  const lines = desc.split('\n');
  for (const line of lines) {
    if (/\u0643\u0645\u0648\u062f/.test(line) || /\u0643\u0648\u0645\u0648\u062f/.test(line)) {
      const nsW = line.match(/(\d+)\s*\u0633\u0645/);
      if (nsW) {
        const nw = parseInt(nsW[1]);
        if (nw >= 20 && nw <= 150) dims.nW = nsW[1];
      }
    }
  }
  if (!dims.nW) {
    const nsFull = desc.match(/(?:\u0643\u0645\u0648\u062f)[^.\n]*?(\d+)\s*\u0633\u0645/);
    if (nsFull) {
      const nw = parseInt(nsFull[1]);
      if (nw >= 20 && nw <= 150) dims.nW = nsFull[1];
    }
  }

  // Vanity: "التسريحة\n• العرض: 120 سم" or "تسريحة 120 سم"
  const vanityBlock = desc.match(/(?:\u0627\u0644\u062a\u0633\u0631\u064a\u062d\u0629|\u062a\u0633\u0631\u064a\u062d\u0629)[\s\S]*?(?:\u0627\u0644\u0639\u0631\u0636|\u0639\u0631\u0636)[:\s]*(\d+)\s*\u0633\u0645/);
  if (vanityBlock) dims.vW = vanityBlock[1];
  if (!dims.vW) {
    const v2 = desc.match(/(?:\u062a\u0633\u0631\u064a\u062d\u0629)[^.\n]*?(\d+)\s*\u0633\u0645/);
    if (v2) dims.vW = v2[1];
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

  if (dims.wW) add("\u0627\u0644\u062f\u0648\u0644\u0627\u0628 - \u0627\u0644\u0639\u0631\u0636", "Wardrobe - Width", `${dims.wW} \u0633\u0645`, `${dims.wW} cm`);
  if (dims.wH) add("\u0627\u0644\u062f\u0648\u0644\u0627\u0628 - \u0627\u0644\u0627\u0631\u062a\u0641\u0627\u0639", "Wardrobe - Height", `${dims.wH} \u0633\u0645`, `${dims.wH} cm`);
  if (dims.wD) add("\u0627\u0644\u062f\u0648\u0644\u0627\u0628 - \u0627\u0644\u0639\u0645\u0642", "Wardrobe - Depth", `${dims.wD} \u0633\u0645`, `${dims.wD} cm`);
  if (dims.bW) add("\u0627\u0644\u0633\u0631\u064a\u0631 - \u0627\u0644\u0639\u0631\u0636", "Bed - Width", `${dims.bW} \u0633\u0645`, `${dims.bW} cm`);
  if (dims.bL) add("\u0627\u0644\u0645\u0631\u062a\u0628\u0629 - \u0627\u0644\u0639\u0631\u0636", "Mattress - Width", `${dims.bL} \u0633\u0645`, `${dims.bL} cm`);
  if (dims.bW) add("\u0627\u0644\u0645\u0631\u062a\u0628\u0629 - \u0627\u0644\u0639\u0645\u0642", "Mattress - Depth", `${dims.bW} \u0633\u0645`, `${dims.bW} cm`);
  add("\u0627\u0644\u0643\u0645\u0648\u062f\u064a\u0646\u0648 - \u0627\u0644\u0639\u062f\u062f", "Nightstand - Count", dims.nC || "2", dims.nC || "2");
  if (dims.nW) add("\u0627\u0644\u0643\u0645\u0648\u062f\u064a\u0646\u0648 - \u0627\u0644\u0639\u0631\u0636", "Nightstand - Width", `${dims.nW} \u0633\u0645`, `${dims.nW} cm`);
  if (dims.vW) add("\u0627\u0644\u062a\u0633\u0631\u064a\u062d\u0629 - \u0627\u0644\u0639\u0631\u0636", "Vanity - Width", `${dims.vW} \u0633\u0645`, `${dims.vW} cm`);

  return specs;
}

async function main() {
  // Test with neithhatab
  const testSlug = "bedroom-neithhatab";
  console.log(`Testing ${testSlug}...`);
  const desc = await fetchDescription(testSlug);
  if (desc) {
    console.log("Description (" + desc.length + " chars):");
    const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach((l, i) => console.log(`  ${i}: ${l.substring(0, 150)}`));
    const dims = extractDimsFromDescription(desc);
    console.log("\nDims:", JSON.stringify(dims));
  } else {
    console.log("No description!");
    return;
  }

  // Test with aria
  console.log("\n---\nTesting bedroom-aria...");
  const desc2 = await fetchDescription("bedroom-aria");
  if (desc2) {
    console.log("Description (" + desc2.length + " chars):");
    const lines2 = desc2.split('\n').map(l => l.trim()).filter(Boolean);
    lines2.forEach((l, i) => console.log(`  ${i}: ${l.substring(0, 150)}`));
    const dims2 = extractDimsFromDescription(desc2);
    console.log("\nDims:", JSON.stringify(dims2));
  } else {
    console.log("No description!");
  }

  console.log("\n--- Starting FULL recovery (all products) ---\n");

  const products = await query(
    "SELECT id, slug FROM products WHERE category_id='cat_bedrooms' ORDER BY slug"
  );
  console.log("Found " + products.length + " bedroom products\n");

  let updated = 0, skipped = 0, errors = 0;
  const BATCH = 5;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    console.log(`Batch ${Math.floor(i/BATCH)+1}/${Math.ceil(products.length/BATCH)}...`);

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
        console.log(`  SKIP ${product.slug}`);
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
        console.log(`  OK ${product.slug} | W:${dims.wW||'?'} H:${dims.wH||'?'} D:${dims.wD||'?'} BW:${dims.bW||'?'} BL:${dims.bL||'?'} NW:${dims.nW||'?'} VW:${dims.vW||'?'}`);
        updated++;
      } catch (e) {
        console.error(`  DB_ERR ${product.slug}: ${e.message}`);
        errors++;
      }
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${errors} errors`);
}

main().catch(console.error);
