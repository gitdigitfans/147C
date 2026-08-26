async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();

  // Find ALL occurrences of "pr" or "prd" in the HTML
  const prdIdx = html.indexOf("prd_");
  console.log("prd_ found at:", prdIdx);
  if (prdIdx >= 0) {
    console.log(html.substring(Math.max(0, prdIdx - 200), prdIdx + 200));
  }

  // Search for " Wardrobe" or "الدولاب" in script tags
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  let scriptIdx = 0;
  while ((m = scriptRegex.exec(html)) !== null) {
    if (m[1].includes("\u0627\u0644\u062f\u0648\u0644\u0627\u0628") || m[1].includes("Wardrobe")) {
      console.log("\n=== Script " + scriptIdx + " contains wardrobe ===");
      // Find the description in this script
      const descIdx = m[1].indexOf("description");
      if (descIdx >= 0) {
        const descChunk = m[1].substring(descIdx, descIdx + 5000);
        const arIdx = descChunk.indexOf('"ar"');
        if (arIdx >= 0) {
          const arEnd = descChunk.indexOf('","en"', arIdx);
          if (arEnd >= 0) {
            const text = descChunk.substring(arIdx + 6, arEnd).replace(/\\n/g, "\n").replace(/\\"/g, '"');
            console.log(text.substring(0, 2000));
          }
        }
      } else {
        // Show context around wardrobe
        const wardIdx = m[1].indexOf("Wardrobe");
        if (wardIdx >= 0) {
          console.log(m[1].substring(Math.max(0, wardIdx - 200), wardIdx + 500));
        }
        const wardArIdx = m[1].indexOf("\u0627\u0644\u062f\u0648\u0644\u0627\u0628");
        if (wardArIdx >= 0) {
          console.log(m[1].substring(Math.max(0, wardArIdx - 200), wardArIdx + 500));
        }
      }
    }
    scriptIdx++;
  }

  // Also try to find the product data in __next_f push calls
  const pushRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let pushIdx = 0;
  while ((m = pushRegex.exec(html)) !== null) {
    if (m[1].includes("description") || m[1].includes("Wardrobe") || m[1].includes("\u0627\u0644\u062f\u0648\u0644\u0627\u0628")) {
      console.log("\n=== push[" + pushIdx + "] contains relevant data ===");
      const chunk = m[1];
      const descIdx = chunk.indexOf("description");
      if (descIdx >= 0) {
        const descChunk = chunk.substring(descIdx, Math.min(descIdx + 5000, chunk.length));
        console.log(descChunk.substring(0, 2000));
      } else {
        console.log(chunk.substring(0, 500));
      }
    }
    pushIdx++;
  }
}
main();
