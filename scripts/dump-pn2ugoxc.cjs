const fs = require("fs");

async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/api/pftool", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sql: "SELECT pi.id, pi.url, pi.product_id, p.slug FROM product_images pi JOIN products p ON p.id = pi.product_id WHERE pi.url LIKE '%pn2ugoxc%' AND p.category_id = (SELECT id FROM categories WHERE slug='bedrooms') ORDER BY p.slug",
      token: "976252cf37f07bfd34974ff356531d3af07e978c0c082f71"
    })
  });
  const json = await res.json();
  const rows = json.result[0].results;
  fs.writeFileSync("scripts/pn2ugoxc-bedrooms.json", JSON.stringify(rows, null, 2));
  console.log("Saved", rows.length, "rows");
}

main();
