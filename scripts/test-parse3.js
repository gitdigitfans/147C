async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();

  // The description is in a push that spans two calls. Let me just search the entire html
  // for the description.ar content
  const wardMatch = html.indexOf('\u0627\u0644\u062c\u0645\u064a\u0639 \u063a\u0646\u0648\u0627\u0646\u064B');
  console.log("Match at:", wardMatch);
  if (wardMatch >= 0) {
    console.log(html.substring(Math.max(0, wardMatch - 20), wardMatch + 500));
  }

  // Try simpler: find the description text between quotes
  // The pattern is: "description":{"ar":"...content...","en":"..."}
  // But it's split across push boundaries
  
  // Find the START of the description
  const descStart = html.indexOf('"description":{"ar":"');
  console.log("\ndescription start:", descStart);
  if (descStart >= 0) {
    // Extract from there until we find the matching end
    const fromDesc = html.substring(descStart + 21);
    // Find ",\"en\":\"" to mark end of Arabic text
    const enIdx = fromDesc.indexOf('","en"');
    console.log("en index:", enIdx);
    if (enIdx >= 0) {
      const arText = fromDesc.substring(0, enIdx)
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\u[\da-f]{4}/gi, (mm) => String.fromCharCode(parseInt(mm.substr(2), 16)));
      console.log("\n=== DESCRIPTION AR ===");
      console.log(arText.substring(0, 2000));
      
      // Now parse dimensions
      const wMatch = arText.match(/(\d+)\s*(?:\u0633\u0645)\s*(?:\u0648\u0627\u0631\u062a\u0641\u0627\u0639)\s*(\d+)\s*(?:\u0633\u0645)\s*(?:\u0648\u0639\u0645\u0642)\s*(\d+)/i);
      console.log("\nWardrobe:", wMatch ? [wMatch[1], wMatch[2], wMatch[3]] : "null");

      const bedXMatch = arText.match(/(\d+)\s*\u00d7\s*(\d+)\s*\u0633\u0645/);
      console.log("Bed X:", bedXMatch ? [bedXMatch[1], bedXMatch[2]] : "null");

      const nsCount = arText.match(/(\d+)\s*\u0643\u0645\u0648\u062f/);
      console.log("Nightstand count:", nsCount ? nsCount[1] : "null");

      const vanityMatch = arText.match(/(\d+)\s*\u0633\u0645\s*\u0645\u0639/);
      console.log("Vanity:", vanityMatch ? vanityMatch[1] : "null");
    }
  }
}
main();
