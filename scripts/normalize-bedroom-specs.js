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

function extractDims(specs) {
  const dims = {};
  const groups = {};

  for (const s of specs) {
    const key = s.spec_key_en || "";
    const val = (s.spec_value_en || "").replace(/\s*cm\s*$/i, "").trim();
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
    } else if (hasWidth) {
      const isNightstand = prefix.toLowerCase().includes("nightstand") || prefix.includes("\u0643\u0645\u0648\u062f\u064a\u0646\u0648") || prefix.includes("\u0643\u0648\u0645\u0648\u062f");
      if (isNightstand) {
        dims.nW = dimMap["Width"];
        const cntMatch = prefix.match(/x\s*(\d+)/i);
        dims.nC = cntMatch ? cntMatch[1] : "2";
      } else {
        dims.vW = dimMap["Width"];
      }
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

  let updated = 0, skipped = 0, errors = 0;

  for (const product of products) {
    const existing = specsByProduct[product.id] || [];
    const dims = extractDims(existing);

    if (!dims.wW && !dims.bW && !dims.nW && !dims.vW) {
      console.log("SKIP " + product.slug + " - no dims found");
      skipped++;
      continue;
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

      console.log("OK " + product.slug + " - " + newSpecs.length + " specs");
      updated++;
    } catch (e) {
      console.error("ERR " + product.slug + ": " + e.message);
      errors++;
    }
  }

  console.log("\nDone: " + updated + " updated, " + skipped + " skipped, " + errors + " errors");
}

main().catch(console.error);
