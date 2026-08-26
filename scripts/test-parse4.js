async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();

  // The content from debug showed it's in chunk starting with prd_bed_randy
  // Let me search for the actual text "240" near "الدولاب"
  const idx240 = html.indexOf("240\u0633\u0645");
  console.log("240 سم at:", idx240);
  if (idx240 >= 0) {
    console.log(html.substring(Math.max(0, idx240 - 300), idx240 + 200));
  }

  // Search for 240 without Arabic
  const idx240b = html.indexOf("240");
  let searchFrom = 0;
  let count = 0;
  while (searchFrom < html.length && count < 10) {
    const idx = html.indexOf("240", searchFrom);
    if (idx < 0) break;
    const ctx = html.substring(Math.max(0, idx - 50), idx + 80);
    if (ctx.includes("\u0633\u0645") || ctx.includes("wardrobe") || ctx.includes("\u0627\u0644\u062f\u0648\u0644\u0627\u0628")) {
      console.log("\n=== 240 context at " + idx + " ===");
      console.log(ctx);
    }
    searchFrom = idx + 3;
    count++;
  }

  // Just find the description substring
  const fidx = html.indexOf('\u063a\u0631\u0641\u0629 \u0646\u0648\u0645');
  if (fidx >= 0) {
    console.log("\n=== 'غرفة نوم' found at " + fidx + " ===");
    console.log(html.substring(fidx, fidx + 800));
  }
}
main();
