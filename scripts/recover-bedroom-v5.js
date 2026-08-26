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

  const marker = '\\"description\\":{\\"ar\\":\\"';
  const idx = html.indexOf(marker);
  if (idx < 0) return null;

  const start = idx + marker.length;
  let end = start;
  while (end < html.length && end < start + 50000) {
    if (html[end] === '"' && html[end - 1] !== '\\') break;
    end++;
  }

  let arText = html.substring(start, end);

  // Fix escape order: handle double-backslash BEFORE single-backslash sequences
  arText = arText.replace(/\\\\/g, '\x00');       // \\\\ -> placeholder
  arText = arText.replace(/\\n/g, '\n');           // \\n -> newline
  arText = arText.replace(/\\"/g, '"');            // \\" -> quote
  arText = arText.replace(/\x00/g, '\\');          // placeholder -> \

  return arText;
}

function extractDimsFromDescription(desc) {
  if (!desc) return null;
  const dims = {};
  const lines = desc.split('\n').map(l => l.replace(/^[🪟🛌🪞🪑🌟✨💡✔️🎯]+/g, '').trim()).filter(Boolean);

  for (const line of lines) {
    // Wardrobe line: "دولاب فخم بعرض 240سم وارتفاع 235 سم وعمق 60 سم"
    const wardMatch = line.match(/(\d+)\s*\u0633\u0645\s*\u0648\u0627\u0631\u062a\u0641\u0627\u0639\s*(\d+)\s*\u0633\u0645\s*\u0648\u0639\u0645\u0642\s*(\d+)/i);
    if (wardMatch) {
      dims.wW = wardMatch[1];
      dims.wH = wardMatch[2];
      dims.wD = wardMatch[3];
      continue;
    }

    // Alt wardrobe: "عرض 240 سم, ارتفاع 235 سم, عمق 60 سم" in same line
    if (!dims.wW) {
      const wLine = line.match(/\u0639\u0631\u0636[:\s]*(\d+)\s*\u0633\u0645/);
      const hLine = line.match(/\u0627\u0631\u062a\u0641\u0627\u0639[:\s]*(\d+)\s*\u0633\u0645/);
      const dLine = line.match(/\u0639\u0645\u0642[:\s]*(\d+)\s*\u0633\u0645/);
      if (wLine && hLine && dLine) {
        dims.wW = wLine[1];
        dims.wH = hLine[1];
        dims.wD = dLine[1];
        continue;
      }
    }

    // Wardrobe line with different format: "عرض 240 سم وارتفاع 235 سم وعمق 60 سم"
    if (!dims.wW) {
      const allWard = line.match(/(\d+)\s*\u0633\u0645/g);
      if (allWard && allWard.length >= 3 && /[\u0639\u0631\u0636\u0627\u0631\u062a\u0641\u0627\u0639\u0639\u0645\u0642]/.test(line)) {
        const nums = allWard.map(m => m.match(/(\d+)/)[1]);
        dims.wW = nums[0];
        dims.wH = nums[1];
        dims.wD = nums[2];
        continue;
      }
    }

    // English wardrobe: "240cm wide, 235cm high and 60cm deep"
    if (!dims.wW) {
      const w3 = line.match(/(\d+)\s*cm\s*(?:wide|width)[^.\n]*?(\d+)\s*cm\s*(?:high|height)[^.\n]*?(\d+)\s*cm\s*(?:deep|depth)/i);
      if (w3) {
        dims.wW = w3[1];
        dims.wH = w3[2];
        dims.wD = w3[3];
        continue;
      }
    }

    // Bed: "160 × 210 سم" or "160 x 210 سم" in same line
    const bedXMatch = line.match(/(\d+)\s*[\u00d7xX\u00d7]\s*(\d+)\s*\u0633\u0645/);
    if (bedXMatch && !dims.bW) {
      const a = parseInt(bedXMatch[1]);
      const b = parseInt(bedXMatch[2]);
      if (Math.min(a, b) >= 100) {
        dims.bW = String(Math.min(a, b));
        dims.bL = String(Math.max(a, b));
      }
      continue;
    }

    // Nightstand count: "2 كمودينو" (number BEFORE the word)
    const nsCountLine = line.match(/(\d+)\s*\u0643\u0645\u0648\u062f/);
    if (nsCountLine && !dims.nC) {
      dims.nC = nsCountLine[1];
    }

    // Nightstand width: "كمودينو ... 50 سم" (number AFTER the word on same line)
    const nsWidthLine = line.match(/(?:\u0643\u0645\u0648\u062f)[^.\n]*?(\d+)\s*\u0633\u0645/);
    if (nsWidthLine && !dims.nW) {
      const nw = parseInt(nsWidthLine[1]);
      if (nw >= 20 && nw <= 150) {
        dims.nW = nsWidthLine[1];
      }
    }

    // Vanity: "تسريحة 120 سم" on same line
    const vLine = line.match(/(?:\u062a\u0633\u0631\u064a\u062d\u0629)[^.\n]*?(\d+)\s*\u0633\u0645/);
    if (vLine && !dims.vW) {
      dims.vW = vLine[1];
    }
  }

  // Fallbacks using full text (less specific but helps)
  if (!dims.wW) {
    const wardFull = desc.match(/(\d+)\s*\u0633\u0645\s*\u0648\u0627\u0631\u062a\u0641\u0627\u0639\s*(\d+)\s*\u0633\u0645\s*\u0648\u0639\u0645\u0642\s*(\d+)/i);
    if (wardFull) {
      dims.wW = wardFull[1];
      dims.wH = wardFull[2];
      dims.wD = wardFull[3];
    }
  }

  if (!dims.bW) {
    const bedFull = desc.match(/(\d+)\s*[\u00d7xX]\s*(\d+)\s*\u0633\u0645/);
    if (bedFull) {
      const a = parseInt(bedFull[1]);
      const b = parseInt(bedFull[2]);
      if (Math.min(a, b) >= 100) {
        dims.bW = String(Math.min(a, b));
        dims.bL = String(Math.max(a, b));
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

  if (!dims.vW) {
    const vFull = desc.match(/(?:\u062a\u0633\u0631\u064a\u062d\u0629)[^.\n]*?(\d+)\s*\u0633\u0645/);
    if (vFull) dims.vW = vFull[1];
  }

  // Last resort for wardrobe: first 3 large numbers followed by سم
  if (!dims.wW) {
    const allCm = [];
    const re = /(\d+)\s*\u0633\u0645/g;
    let m;
    while ((m = re.exec(desc)) !== null) {
      const n = parseInt(m[1]);
      if (n >= 150 && n <= 300) allCm.push(m[1]);
      if (allCm.length === 3) break;
    }
    if (allCm.length >= 3) {
      dims.wW = allCm[0];
      dims.wH = allCm[1];
      dims.wD = allCm[2];
    }
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
  const testSlug = "bedroom-randy";
  console.log(`Testing with ${testSlug}...`);
  const desc = await fetchDescription(testSlug);
  if (desc) {
    const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
    console.log("Lines:", lines.length);
    lines.forEach((l, i) => console.log(`  ${i}: ${l.substring(0, 120)}`));
    const dims = extractDimsFromDescription(desc);
    console.log("\nDims:", JSON.stringify(dims));
  } else {
    console.log("No description found!");
    return;
  }

  console.log("\n--- Starting full recovery ---\n");

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
