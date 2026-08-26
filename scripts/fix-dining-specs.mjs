const TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";
const PFTOOL = "https://pharaoh-furniture.pharaoh-furniture.workers.dev/api/pftool";

async function q(sql) {
  const r = await fetch(`${PFTOOL}?token=${TOKEN}&sql=${encodeURIComponent(sql)}`);
  const j = await r.json();
  if (!j.success) throw new Error(JSON.stringify(j));
  return j.result?.[0]?.results ?? [];
}

async function main() {
  // 1. Get all dining specs
  const rows = await q(`
    SELECT s.id, s.product_id, s.spec_key_ar, s.spec_value_ar, s.spec_key_en, s.spec_value_en, s.sort_order
    FROM product_specs s
    JOIN products p ON s.product_id = p.id
    WHERE p.category_id = (SELECT id FROM categories WHERE slug = 'dining')
    ORDER BY p.id, s.sort_order
  `);
  console.log(`Total specs: ${rows.length}`);

  // 2. Parse into items per product
  const products = {};
  for (const r of rows) {
    if (!products[r.product_id]) products[r.product_id] = [];
    products[r.product_id].push(r);
  }

  // Name normalization map
  const nameMap = {
    "ترابيزة سفرة": "ترابيزة السفرة",
    "ترابيزة السفرة": "ترابيزة السفرة",
    "بوفيه عملي": "البوفيه",
    "البوفيه": "البوفيه",
    "نيش أنيق": "النيش",
    "النيش": "النيش",
    "مرآة البوفيه": "مرآة البوفيه",
  };

  const countNameMap = {
    "عدد الكراسي": "كراسي السفرة",
    "عدد المرآة": "مرآة البوفيه",
  };

  const enNameMap = {
    "ترابيزة السفرة": "Dining Table",
    "البوفيه": "Buffet",
    "النيش": "Niche",
    "كراسي السفرة": "Chairs",
    "مرآة البوفيه": "Buffet Mirror",
  };

  // 3. Transform each product
  let totalNew = 0;
  let totalDeleted = 0;

  for (const [pid, specs] of Object.entries(products)) {
    const items = {}; // itemName -> { العرض, الارتفاع, الطول/العمق, العدد }

    for (const s of specs) {
      const key = s.spec_key_ar;
      const val = s.spec_value_ar;

      // Check if it's a grouped spec (has " - ")
      if (key.includes(" - ")) {
        const [rawItem, dim] = key.split(" - ").map(x => x.trim());
        const itemName = nameMap[rawItem] || rawItem;

        if (!items[itemName]) items[itemName] = {};

        if (dim === "العرض" || dim === "Width") items[itemName]["العرض"] = val;
        else if (dim === "الارتفاع" || dim === "Height") items[itemName]["الارتفاع"] = val;
        else if (dim === "العمق" || dim === "الطول" || dim === "Depth" || dim === "Length") items[itemName]["الطويل/العمق"] = val;
      } else {
        // Ungrouped spec - count type
        // "عدد الكراسي" -> "كراسي السفرة", العدد = 6
        const itemName = countNameMap[key] || key;
        if (!items[itemName]) items[itemName] = {};
        items[itemName]["العدد"] = val;
      }
    }

    // For items that have dimensions but no count, add العدد = 1
    for (const [name, dims] of Object.entries(items)) {
      if (!dims["العدد"] && (dims["العرض"] || dims["الارتفاع"] || dims["الطويل/العمق"])) {
        dims["العدد"] = "1";
      }
    }

    // 4. Delete old specs for this product
    const delResult = await q(`DELETE FROM product_specs WHERE product_id = '${pid}'`);
    totalDeleted++;

    // 5. Insert new specs
    let order = 0;
    for (const [name, dims] of Object.entries(items)) {
      const enName = enNameMap[name] || name;
      const specs = [
        { ar: "العرض", en: "Width", val: dims["العرض"] },
        { ar: "الارتفاع", en: "Height", val: dims["الارتفاع"] },
        { ar: "الطويل/العمق", en: "Length/Depth", val: dims["الطويل/العمق"] },
        { ar: "العدد", en: "Count", val: dims["العدد"] },
      ];

      for (const sp of specs) {
        if (!sp.val) continue;
        const key = `${name} - ${sp.ar}`;
        const enKey = `${enName} - ${sp.en}`;
      const specId = `sp_${pid}_${order}_${Math.random().toString(36).slice(2,8)}`;
        await q(`INSERT INTO product_specs (id, product_id, spec_key_ar, spec_key_en, spec_value_ar, spec_value_en, sort_order)
          VALUES ('${specId}', '${pid}', '${key.replace(/'/g, "''")}', '${enKey.replace(/'/g, "''")}', '${sp.val.replace(/'/g, "''")}', '${sp.val.replace(/'/g, "''")}', ${order})`);
        totalNew++;
        order++;
      }

      console.log(`  ${pid}: ${name} -> العرض=${dims["العرض"]||"—"} الارتفاع=${dims["الارتفاع"]||"—"} الطول/العمق=${dims["الطويل/العمق"]||"—"} العدد=${dims["العدد"]||"—"}`);
    }
  }

  console.log(`\nDone: deleted ${totalDeleted} products, inserted ${totalNew} specs`);
}

main().catch(e => { console.error(e); process.exit(1); });
