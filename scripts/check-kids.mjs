const BASE = "https://pharaoh-furniture.pharaoh-furniture.workers.dev/api/pftool";
const TOKEN = "976252cf37f07bfd34974ff356531d3af07e978c0c082f71";

async function q(sql) {
  const r = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + TOKEN },
    body: JSON.stringify({ sql }),
  });
  const j = await r.json();
  return j.result?.[0]?.results || [];
}

async function main() {
  // Get WP product IDs for kids products
  const prods = await q("SELECT id, name_ar, description_ar FROM products WHERE category_id='cat_kids' ORDER BY name_ar");
  
  // Scrape WP categories to find kids
  const cats = await (await fetch("https://pharaohfurniture.com/wp-json/wc/store/v1/products/categories?per_page=100")).json();
  const kidsCat = cats.find(c => c.name.includes("اطفال") || c.name.includes("أطفال") || c.slug.includes("kids"));
  console.log("Kids category:", kidsCat ? kidsCat.id + " - " + kidsCat.name : "NOT FOUND");
  
  // Show all categories
  console.log("\nAll categories:");
  for (const c of cats) console.log("  " + c.id + " | " + c.slug + " | " + c.name);

  // Scrape first few kids products
  if (kidsCat) {
    const url = "https://pharaohfurniture.com/wp-json/wc/store/v1/products?category=" + kidsCat.id + "&per_page=5";
    console.log("\nFetching: " + url);
    const wpProds = await (await fetch(url)).json();
    for (const p of wpProds) {
      console.log("\n--- " + p.name + " ---");
      console.log("DESC:", (p.short_description || "").substring(0, 300));
      console.log("FULL:", (p.description || "").substring(0, 500));
    }
  }
}

main().catch(console.error);
