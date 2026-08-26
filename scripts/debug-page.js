const BASE = "https://pharaoh-furniture.pharaoh-furniture.workers.dev";

async function main() {
  const res = await fetch(`${BASE}/shop/bedroom-randy`);
  const html = await res.text();

  const descIdx = html.indexOf("الوصف");
  if (descIdx >= 0) {
    const chunk = html.substring(descIdx, descIdx + 5000);
    const text = chunk.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
    console.log("=== Around الوصف ===");
    console.log(text.substring(0, 2000));
  }

  const specsIdx = html.indexOf("المواصفات");
  if (specsIdx >= 0) {
    const chunk = html.substring(specsIdx, specsIdx + 3000);
    const text = chunk.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
    console.log("\n=== Around المواصفات ===");
    console.log(text.substring(0, 1000));
  }

  const wardrobeIdx = html.indexOf("الدولاب الخشبي");
  if (wardrobeIdx >= 0) {
    const chunk = html.substring(wardrobeIdx, wardrobeIdx + 2000);
    console.log("\n=== Around الدولاب الخشبي ===");
    console.log(chunk.substring(0, 1000));
  } else {
    console.log("\n=== الدولاب الخشبي NOT in HTML ===");
    const altIdx = html.indexOf("الدولاب");
    if (altIdx >= 0) {
      console.log("Found الدولاب at " + altIdx);
      const chunk = html.substring(altIdx, altIdx + 500);
      console.log(chunk.substring(0, 500));
    }
  }
}

main().catch(console.error);
