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

  const pushRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let m;
  while ((m = pushRegex.exec(html)) !== null) {
    const chunk = m[1];
    const descIdx = chunk.indexOf('description');
    if (descIdx >= 0 && chunk.includes('"ar":"')) {
      const descChunk = chunk.substring(descIdx, descIdx + 10000);
      const arIdx = descChunk.indexOf('"ar":"');
      if (arIdx >= 0) {
        const arEnd = descChunk.indexOf('","en"', arIdx);
        if (arEnd >= 0) {
          const arText = descChunk.substring(arIdx + 6, arEnd)
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\u[\da-f]{4}/gi, (mm) => String.fromCharCode(parseInt(mm.substr(2), 16)));
          if (arText.includes("\u0633\u0645") || arText.includes("cm")) {
            return arText;
          }
        }
      }
    }
  }
  return null;
}

function extractDimsFromDescription(desc) {
  if (!desc) return null;
  const dims = {};

  const wardrobeMatch = desc.match(/(?:\u0627\u0644\u062f\u0648\u0644\u0627\u0628|Daulab)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
  if (wardrobeMatch) {
    dims.wW = wardrobeMatch[1];
    dims.wH = wardrobeMatch[2];
    dims.wD = wardrobeMatch[3];
  }

  if (!dims.wW) {
    const altWardrobe = desc.match(/(?:\u0627\u0644\u0639\u0631\u0636|\u0627\u0644\u0627\u0631\u062a\u0641\u0627\u0639|\u0627\u0644\u0639\u0645\u0642)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/gi);
    if (altWardrobe && altWardrobe.length >= 3) {
      const vals = altWardrobe.map(m => {
        const n = m.match(/(\d+)/);
        return n ? n[1] : null;
      }).filter(Boolean);
      if (vals.length >= 3) {
        dims.wW = vals[0];
        dims.wH = vals[1];
        dims.wD = vals[2];
      }
    }
  }

  if (!dims.wW) {
    const wardLine = desc.match(/(?:\u0641\u062e\u0645|breathtaking|magnificent)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm|\u0633\u0645)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
    if (wardLine) {
      dims.wW = wardLine[1];
      dims.wH = wardLine[2];
      dims.wD = wardLine[3];
    }
  }

  if (!dims.wW) {
    const wardDesc = desc.match(/(?:\u0639\u0631\u0636|width)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
    const hDesc = desc.match(/(?:\u0627\u0631\u062a\u0641\u0627\u0639|height|(\u0648\u0627\u0644\u0627\u0631\u062a\u0641\u0627\u0639))[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
    const dDesc = desc.match(/(?:\u0639\u0645\u0642|depth)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
    if (wardDesc) dims.wW = wardDesc[1];
    if (hDesc) dims.wH = hDesc[2] || hDesc[1];
    if (dDesc) dims.wD = dDesc[1];
  }

  if (!dims.wW) {
    const firstThree = [];
    const re = /(\d+)\s*(?:\u0633\u0645|cm)/gi;
    let m;
    while ((m = re.exec(desc)) !== null) {
      const n = parseInt(m[1]);
      if (n >= 100 && n <= 300) firstThree.push(m[1]);
      if (firstThree.length === 3) break;
    }
    if (firstThree.length >= 3) {
      dims.wW = firstThree[0];
      dims.wH = firstThree[1];
      dims.wD = firstThree[2];
    }
  }

  const bedXMatch = desc.match(/(\d+)\s*[xX\u00d7\u00d7\u00d7]\s*(\d+)\s*(?:\u0633\u0645|cm)/i);
  if (bedXMatch) {
    const a = parseInt(bedXMatch[1]);
    const b = parseInt(bedXMatch[2]);
    if (Math.min(a, b) >= 100) {
      dims.bW = String(Math.min(a, b));
      dims.bL = String(Math.max(a, b));
    } else {
      dims.bW = String(a);
      dims.bL = String(b);
    }
  }

  if (!dims.bW) {
    const bedCm = desc.match(/(?:\u0627\u0644\u0633\u0631\u064a\u0631|\u0633\u0631\u064a\u0631)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
    if (bedCm) dims.bW = bedCm[1];
  }

  const nsMatch = desc.match(/(\d+)\s*(?:\u0643\u0645\u0648\u062f\u064a\u0646\u0648|\u0643\u0648\u0645\u0648\u062f)/i);
  if (nsMatch) {
    dims.nC = nsMatch[1];
  }

  const nsWidth = desc.match(/(?:\u0643\u0645\u0648\u062f\u064a\u0646\u0648|\u0643\u0648\u0645\u0648\u062f)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
  if (nsWidth) dims.nW = nsWidth[1];

  const vMatch = desc.match(/(?:\u062a\u0633\u0631\u064a\u062d\u0629|\u062a\u0633\u0631\u064a\u062d\u0629)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
  if (vMatch) dims.vW = vMatch[1];

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
        const desc = await fetchDescription(product.slug);
        if (!desc) {
          console.log(`NO_DESC ${product.slug}`);
          return { product, skip: true };
        }
        const dims = extractDimsFromDescription(desc);
        return { product, dims, skip: !dims };
      })
    );

    for (const r of results) {
      if (r.status === "rejected") {
        console.error(`FETCH_ERR: ${r.reason}`);
        errors++;
        continue;
      }
      const { product, dims, skip } = r.value;
      if (skip) { skipped++; continue; }

      if (!dims.wW && !dims.bW) {
        console.log(`NODIMS ${product.slug}`);
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
