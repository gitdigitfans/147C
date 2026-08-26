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

async function fetchPage(slug) {
  const res = await fetch(`${BASE}/shop/${slug}`, {
    headers: { "Accept-Language": "ar" },
  });
  return await res.text();
}

function extractDimsFromHTML(html) {
  const dims = {};

  const descMatch = html.match(/<div[^>]*class="[^"]*prose[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");

  const wardrobeMatch = text.match(/(?:الدولاب\s*(?:الخشبي)?[^\.]*?(\d+)\s*سم[^\.]*?(\d+)\s*سم[^\.]*?(\d+)\s*سم)/i);
  if (wardrobeMatch) {
    dims.wW = wardrobeMatch[1];
    dims.wH = wardrobeMatch[2];
    dims.wD = wardrobeMatch[3];
  }

  if (!dims.wW) {
    const altMatch = text.match(/(?:العرض[:\s]*(\d+)\s*سم|(\d+)\s*سم\s*عرض)/i);
    if (altMatch) dims.wW = altMatch[1] || altMatch[2];
  }

  const bedSizeMatch = text.match(/(?:السرير[^\.]*?(\d+)\s*(?:x|X|\u00d7|\u00d7|×)\s*(\d+))/i) ||
    text.match(/(?:سرير[^\.]*?(\d+)\s*[xX×]\s*(\d+))/i);
  if (bedSizeMatch) {
    dims.bW = bedSizeMatch[1];
    dims.bL = bedSizeMatch[2];
  }

  if (!dims.bW) {
    const bedCmMatch = text.match(/(?:السرير[^\.]*?(\d+)\s*سم)/i);
    if (bedCmMatch) dims.bW = bedCmMatch[1];
  }

  const nsMatch = text.match(/(\d+)\s*(?:كمودينو|كومود)/i) ||
    text.match(/(?:كمودينو|كومود)[^\.]*?(\d+)\s*سم/i);
  if (nsMatch) dims.nW = nsMatch[1];

  const vMatch = text.match(/التسريحة[^\.]*?(\d+)\s*سم/i);
  if (vMatch) dims.vW = vMatch[1];

  return dims;
}

function extractDimsFromNumbersOnly(text) {
  const dims = {};
  const allCmNums = [];
  const re = /(\d+)\s*سم/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1]);
    if (n >= 30 && n <= 300) allCmNums.push({ val: n, idx: m.index });
  }

  const xPattern = /(\d+)\s*[xX×]\s*(\d+)/gi;
  const xMatches = [];
  while ((m = xPattern.exec(text)) !== null) {
    const a = parseInt(m[1]), b = parseInt(m[2]);
    if (a >= 30 && a <= 300 && b >= 30 && b <= 300) {
      xMatches.push({ a: Math.min(a, b), b: Math.max(a, b), idx: m.index });
    }
  }

  const furnitureOrder = ["الدولاب", "السرير", "المرتبة", "الكمودينو", "التسريحة"];
  const furniturePositions = [];
  for (const f of furnitureOrder) {
    const idx = text.indexOf(f);
    if (idx >= 0) furniturePositions.push({ name: f, idx });
  }
  furniturePositions.sort((a, b) => a.idx - b.idx);

  const wardrobeCms = allCmNums.filter(cm => {
    return furniturePositions.length < 2 || cm.idx < furniturePositions[1].idx;
  });

  if (wardrobeCms.length >= 3) {
    dims.wW = String(wardrobeCms[0].val);
    dims.wH = String(wardrobeCms[1].val);
    dims.wD = String(wardrobeCms[2].val);
  }

  for (const xm of xMatches) {
    if (!dims.bW && xm.b >= 150) {
      dims.bW = String(xm.a);
      dims.bL = String(xm.b);
    }
  }

  return dims;
}

function mergeDims(existing, newDims) {
  const result = { ...existing };
  for (const [k, v] of Object.entries(newDims)) {
    if (!result[k] || result[k] === "undefined" || result[k] === "null") {
      if (v && v !== "undefined" && v !== "null") result[k] = v;
    }
  }
  return result;
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
  const products = await query(
    "SELECT id, slug FROM products WHERE category_id='cat_bedrooms' ORDER BY slug"
  );
  console.log("Found " + products.length + " bedroom products");

  let updated = 0, skipped = 0, errors = 0;
  const BATCH = 5;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    console.log(`\nFetching batch ${Math.floor(i/BATCH)+1}/${Math.ceil(products.length/BATCH)}...`);

    const results = await Promise.allSettled(
      batch.map(async (product) => {
        const html = await fetchPage(product.slug);
        const dimsFromHTML = extractDimsFromHTML(html);
        const dimsFromNumbers = extractDimsFromNumbersOnly(
          html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ")
        );

        let dims = mergeDims({}, dimsFromHTML);
        dims = mergeDims(dims, dimsFromNumbers);

        if (!dims.nW) dims.nW = "50";
        if (!dims.nC) dims.nC = "2";
        if (!dims.vW) dims.vW = "120";

        if (!dims.wW && !dims.bW) {
          console.log(`SKIP ${product.slug} - no dims from HTML`);
          return { product, skip: true };
        }

        return { product, dims, skip: false };
      })
    );

    for (const r of results) {
      if (r.status === "rejected") {
        console.error(`FETCH ERR: ${r.reason}`);
        errors++;
        continue;
      }
      const { product, dims, skip } = r.value;
      if (skip) { skipped++; continue; }

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
        console.error(`DB ERR ${product.slug}: ${e.message}`);
        errors++;
      }
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${errors} errors`);
}

main().catch(console.error);
