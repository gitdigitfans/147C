async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();

  const descIdx = html.indexOf('description');
  if (descIdx >= 0) {
    const chunk = html.substring(descIdx, descIdx + 500);
    console.log("=== Around 'description' in HTML ===");
    console.log(chunk);
  }

  const idx2 = html.indexOf('\\u');
  if (idx2 >= 0) {
    console.log("\n=== Unicode escape found at ===" + idx2);
    console.log(html.substring(Math.max(0, idx2 - 100), idx2 + 200));
  }

  // Look for the RSC payload
  const rscIdx = html.indexOf('[1,"');
  if (rscIdx >= 0) {
    console.log("\n=== RSC payload ===");
    console.log(html.substring(rscIdx, rscIdx + 2000));
  }
}
main();
