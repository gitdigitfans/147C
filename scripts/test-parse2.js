async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();

  // Find all push calls
  const pushStarts = [];
  let searchIdx = 0;
  while (true) {
    const idx = html.indexOf("self.__next_f.push(", searchIdx);
    if (idx < 0) break;
    pushStarts.push(idx);
    searchIdx = idx + 1;
  }
  console.log("Found " + pushStarts.length + " push calls");

  for (let i = 0; i < pushStarts.length; i++) {
    const start = pushStarts[i];
    const chunk = html.substring(start, start + 200);
    if (chunk.includes("description") || chunk.includes("\u0627\u0644\u062f\u0648\u0644\u0627\u0628") || chunk.includes("Wardrobe")) {
      console.log("\n=== Push " + i + " (at " + start + ") ===");
      console.log(chunk);
    }
  }

  // Also find the description directly
  const descIdx = html.indexOf('\u0644\u0627\u0645 \u0633\u062a\u062d\u0628');
  if (descIdx >= 0) {
    console.log("\n=== Found 'ستحب' context ===");
    const ctx = html.substring(Math.max(0, descIdx - 500), descIdx + 200);
    console.log(ctx.substring(0, 700));
  }

  const wardIdx = html.indexOf("\u0641\u062e\u0645 \u0628\u0639\u0631\u0636");
  if (wardIdx >= 0) {
    console.log("\n=== Found 'فخم بعرض' ===");
    const ctx = html.substring(Math.max(0, wardIdx - 200), wardIdx + 300);
    console.log(ctx);
  }
}
main();
