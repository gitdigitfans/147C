const API = "https://pharaoh-furniture.pharaoh-furniture.workers.dev/api/pftool";
const TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";

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

function extractDimsFromDescription(desc) {
  if (!desc) return null;
  const dims = {};

  const sizeMatch = desc.match(/(\d+)\s*(?:A\?|x|X|\u00d7)\s*(\d+)/gi);
  if (sizeMatch) {
    for (const m of sizeMatch) {
      const parts = m.match(/(\d+)\s*(?:A\?|x|X|\u00d7)\s*(\d+)/i);
      if (parts) {
        const a = parseInt(parts[1]);
        const b = parseInt(parts[2]);
        if (a >= 30 && a <= 300 && b >= 30 && b <= 300) {
          if (!dims.wD) {
            dims.bW = String(Math.min(a, b));
            dims.bL = String(Math.max(a, b));
          }
        }
      }
    }
  }

  const allNums = [];
  const re = /(\d+)/g;
  let m;
  while ((m = re.exec(desc)) !== null) {
    const n = parseInt(m[1]);
    if (n >= 20 && n <= 300) allNums.push({ val: n, idx: m.index });
  }

  const cmPattern = /(\d+)\s*(?:O3U\??)/g;
  const cmNums = [];
  while ((m = cmPattern.exec(desc)) !== null) {
    const n = parseInt(m[1]);
    if (n >= 20 && n <= 300) cmNums.push(n);
  }

  if (cmNums.length >= 3) {
    dims.wW = String(cmNums[0]);
    dims.wH = String(cmNums[1]);
    dims.wD = String(cmNums[2]);
  } else if (cmNums.length >= 1 && !dims.wW) {
    dims.wW = String(cmNums[0]);
    if (cmNums.length >= 2) dims.wH = String(cmNums[1]);
    if (cmNums.length >= 3) dims.wD = String(cmNums[2]);
  }

  const nightstandMatch = desc.match(/(?:2|U?\?2)\s*(?:U?U?U?_U?U?U?|O_U?U?U?)/);
  if (nightstandMatch) {
    const afterNs = desc.substring(nightstandMatch.index);
    const nsWidth = afterNs.match(/(\d+)\s*(?:O3U)/);
    if (nsWidth) dims.nW = nsWidth[1];
  }

  if (!dims.nW) {
    const allCmNums = [];
    const re2 = /(\d+)\s*O3U/g;
    while ((m = re2.exec(desc)) !== null) {
      const n = parseInt(m[1]);
      if (n >= 20 && n <= 200) allCmNums.push({ val: n, idx: m.index });
    }
    for (const cn of allCmNums) {
      if (cn.val === 50 || (cn.val >= 30 && cn.val <= 80 && cn.val !== dims.wW && cn.val !== dims.wH && cn.val !== dims.wD)) {
        if (!dims.nW) dims.nW = String(cn.val);
      }
    }
  }

  const vanityMatch = desc.match(/(?:120|O-O3O)/);
  if (vanityMatch) {
    const vNum = desc.substring(vanityMatch.index).match(/(\d+)/);
    if (vNum) dims.vW = vNum[1];
  } else {
    for (const cn of allNums) {
      if (cn.val === 120) {
        dims.vW = "120";
        break;
      }
    }
  }

  return dims;
}

function extractDimsFromSpecs(specs) {
  const dims = {};
  const groups = {};

  for (const s of specs) {
    const key = s.spec_key_en || "";
    const val = (s.spec_value_en || "").replace(/\s*cm\s*$/i, "").trim();
    if (val === "undefined" || val === "null") continue;
    const dashIdx = key.lastIndexOf(" - ");
    if (dashIdx > 0) {
      const prefix = key.substring(0, dashIdx).trim();
      const dim = key.substring(dashIdx + 3).trim();
      if (!groups[prefix]) groups[prefix] = {};
      groups[prefix][dim] = val;
    } else {
      if (key === "Width" && !dims.wW) dims.wW = val;
      if (key === "Height" && !dims.wH) dims.wH = val;
      if (key === "Depth" && !dims.wD) dims.wD = val;
    }
  }

  for (const [prefix, dimMap] of Object.entries(groups)) {
    const keys = Object.keys(dimMap);
    const hasWidth = keys.includes("Width");
    const hasHeight = keys.includes("Height");
    const hasDepth = keys.includes("Depth");
    const hasSize = keys.includes("Size");
    const hasCount = keys.includes("Count");

    if (hasWidth && hasHeight && hasDepth) {
      if (!dims.wW) dims.wW = dimMap["Width"];
      if (!dims.wH) dims.wH = dimMap["Height"];
      if (!dims.wD) dims.wD = dimMap["Depth"];
    } else if (hasSize) {
      const m = dimMap["Size"].match(/(\d+)\s*(?:A\?|x|X|\u00d7)\s*(\d+)/i);
      if (m) {
        dims.bW = m[1];
        dims.bL = m[2];
      }
    } else if (hasWidth && hasCount) {
      dims.nW = dimMap["Width"];
      dims.nC = dimMap["Count"];
    } else if (hasWidth) {
      if (!dims.vW) dims.vW = dimMap["Width"];
    }
  }

  return dims;
}

function buildSpecs(dims) {
  const specs = [];
  const add = (keyAr, keyEn, valAr, valEn) => {
    if (valAr && valAr !== "undefined" && valAr !== "null" && valAr !== "undefined cm") {
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

  const allSpecs = await query(
    "SELECT ps.product_id, ps.spec_key_en, ps.spec_value_en, ps.sort_order FROM product_specs ps JOIN products p ON ps.product_id=p.id WHERE p.category_id='cat_bedrooms' ORDER BY ps.product_id, ps.sort_order"
  );

  const specsByProduct = {};
  for (const s of allSpecs) {
    if (!specsByProduct[s.product_id]) specsByProduct[s.product_id] = [];
    specsByProduct[s.product_id].push(s);
  }

  const allDescs = await query(
    "SELECT id, slug, description_ar FROM products WHERE category_id='cat_bedrooms' ORDER BY slug"
  );
  const descBySlug = {};
  for (const d of allDescs) {
    descBySlug[d.slug] = d.description_ar;
  }

  let updated = 0, skipped = 0, errors = 0;

  for (const product of products) {
    const existing = specsByProduct[product.id] || [];
    let dims = extractDimsFromSpecs(existing);

    const hasUndefined = Object.values(dims).some(v => !v || v === "undefined");

    if (hasUndefined || !dims.wW || !dims.bW || !dims.nW || !dims.vW) {
      const desc = descBySlug[product.slug];
      const descDims = extractDimsFromDescription(desc);
      if (descDims) {
        if (!dims.wW || dims.wW === "undefined") dims.wW = descDims.wW;
        if (!dims.wH || dims.wH === "undefined") dims.wH = descDims.wH;
        if (!dims.wD || dims.wD === "undefined") dims.wD = descDims.wD;
        if (!dims.bW || dims.bW === "undefined") dims.bW = descDims.bW;
        if (!dims.bL || dims.bL === "undefined") dims.bL = descDims.bL;
        if (!dims.nW || dims.nW === "undefined") dims.nW = descDims.nW;
        if (!dims.vW || dims.vW === "undefined") dims.vW = descDims.vW;
      }
    }

    const hasAnyUndefined = Object.values(dims).some(v => !v || v === "undefined");

    if (!dims.wW && !dims.bW && !dims.nW && !dims.vW) {
      console.log("SKIP " + product.slug + " - no dims at all");
      skipped++;
      continue;
    }

    if (hasAnyUndefined) {
      console.log("PARTIAL " + product.slug + " - " + JSON.stringify(dims));
    }

    const newSpecs = buildSpecs(dims);
    if (newSpecs.length === 0) {
      console.log("SKIP " + product.slug + " - no specs generated");
      skipped++;
      continue;
    }

    try {
      await query("DELETE FROM product_specs WHERE product_id='" + product.id + "'");

      for (let i = 0; i < newSpecs.length; i++) {
        const s = newSpecs[i];
        const esc = (v) => v.replace(/'/g, "''");
        await query(
          "INSERT INTO product_specs (product_id, spec_key_ar, spec_key_en, spec_value_ar, spec_value_en, sort_order) VALUES ('" +
          product.id + "', '" + esc(s.keyAr) + "', '" + esc(s.keyEn) + "', '" +
          esc(s.valAr) + "', '" + esc(s.valEn) + "', " + i + ")"
        );
      }

      console.log("OK " + product.slug + " - " + newSpecs.length + " specs | W:" + dims.wW + " H:" + dims.wH + " D:" + dims.wD + " BW:" + dims.bW + " BL:" + dims.bL + " NW:" + dims.nW + " VW:" + dims.vW);
      updated++;
    } catch (e) {
      console.error("ERR " + product.slug + ": " + e.message);
      errors++;
    }
  }

  console.log("\nDone: " + updated + " updated, " + skipped + " skipped, " + errors + " errors");
}

main().catch(console.error);
