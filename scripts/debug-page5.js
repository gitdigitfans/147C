async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();

  // Find the RSC data chunk with the product
  const productIdx = html.indexOf('"prd_bed_randy"');
  if (productIdx < 0) {
    console.log("Product ID not found, trying bedroom-randy slug");
    const slugIdx = html.indexOf('"bedroom-randy"');
    if (slugIdx >= 0) {
      console.log("Found slug at " + slugIdx);
      // Go back to find the containing object
      let start = html.lastIndexOf('{', slugIdx);
      // Look further back
      for (let i = slugIdx; i > slugIdx - 5000 && i > 0; i--) {
        if (html[i] === '[' && html[i+1] === '{') {
          start = i;
          break;
        }
      }
      console.log("Context around product data:");
      console.log(html.substring(start, start + 500));
    }
    return;
  }

  // Extract the product data
  let start = productIdx;
  for (let i = productIdx; i > productIdx - 10000 && i > 0; i--) {
    if (html[i] === '{' || html[i] === '[') {
      // Check if this is the start of the product object
      const ahead = html.substring(i, i + 100);
      if (ahead.includes('"id"') || ahead.includes('"product"')) {
        start = i;
        break;
      }
    }
  }

  // Find the description within the product data
  const chunk = html.substring(start, start + 20000);
  
  // Look for Arabic description
  const descMatch = chunk.match(/"ar":"((?:[^"\\]|\\.)*)","en":"((?:[^"\\]|\\.)*)"/);
  if (descMatch) {
    console.log("=== First ar/en pair ===");
    const ar = descMatch[1].replace(/\\n/g, "\n");
    console.log(ar.substring(0, 1500));
  }

  // Find all description text
  const descStart = chunk.indexOf('"description_ar"');
  const descStart2 = chunk.indexOf('"description"');
  console.log("\ndescription_ar at:", descStart, "description at:", descStart2);
  
  if (descStart2 >= 0) {
    const descChunk = chunk.substring(descStart2, descStart2 + 5000);
    // Find the ar content
    const arStart = descChunk.indexOf('"ar":"');
    if (arStart >= 0) {
      const arEnd = descChunk.indexOf('","en"', arStart);
      if (arEnd >= 0) {
        const arText = descChunk.substring(arStart + 6, arEnd).replace(/\\n/g, "\n").replace(/\\"/g, '"');
        console.log("\n=== Arabic Description ===");
        console.log(arText.substring(0, 3000));
      }
    }
  }
}
main();
