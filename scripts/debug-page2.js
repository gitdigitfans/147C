async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");

  const cmBlocks = [];
  const re = /([^.]*\u0633\u0645[^.]*)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    cmBlocks.push(m[1].trim());
  }
  console.log("=== All blocks with cm (" + cmBlocks.length + ") ===");
  for (let i = 0; i < Math.min(30, cmBlocks.length); i++) {
    console.log(i + ": " + cmBlocks[i].substring(0, 200));
  }

  const descIdx = html.indexOf("\u0627\u0644\u0648\u0635\u0641");
  console.log("\n=== Description tab HTML ===");
  if (descIdx >= 0) {
    const chunk = html.substring(descIdx, descIdx + 3000);
    const t = chunk.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
    console.log(t.substring(0, 2000));
  }

  // Look for data attributes or hidden content
  const specTableEnd = html.indexOf("</table>");
  if (specTableEnd >= 0) {
    const afterTable = html.substring(specTableEnd, specTableEnd + 3000);
    const t = afterTable.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
    console.log("\n=== After spec table ===");
    console.log(t.substring(0, 2000));
  }
}
main();
