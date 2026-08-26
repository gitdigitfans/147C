async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();

  const pushRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let m;
  while ((m = pushRegex.exec(html)) !== null) {
    const chunk = m[1];
    const descIdx = chunk.indexOf('description');
    if (descIdx >= 0 && chunk.includes('"ar":"')) {
      const descChunk = chunk.substring(descIdx, descIdx + 10000);
      const arIdx = descChunk.indexOf('"ar":"');
      if (arIdx >= 0) {
        const arEnd = descChunk.indexOf('","en"', arIdx);
        if (arEnd >= 0) {
          const arText = descChunk.substring(arIdx + 6, arEnd)
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\u[\da-f]{4}/gi, (mm) => String.fromCharCode(parseInt(mm.substr(2), 16)));
          if (arText.includes("\u0633\u0645") || arText.includes("cm")) {
            console.log("=== DESCRIPTION ===");
            console.log(arText);
            
            console.log("\n=== PARSING ===");
            
            // Wardrobe
            const wardrobeMatch = arText.match(/(?:\u0627\u0644\u062f\u0648\u0644\u0627\u0628|Daulab)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
            console.log("Wardrobe match:", wardrobeMatch ? [wardrobeMatch[1], wardrobeMatch[2], wardrobeMatch[3]] : "null");

            // Bed X
            const bedXMatch = arText.match(/(\d+)\s*[xX\u00d7\u00d7\u00d7]\s*(\d+)\s*(?:\u0633\u0645|cm)/i);
            console.log("Bed X match:", bedXMatch ? [bedXMatch[1], bedXMatch[2]] : "null");

            // Nightstand
            const nsMatch = arText.match(/(\d+)\s*(?:\u0643\u0645\u0648\u062f\u064a\u0646\u0648|\u0643\u0648\u0645\u0648\u062f)/i);
            console.log("Nightstand count:", nsMatch ? nsMatch[1] : "null");

            const nsWidth = arText.match(/(?:\u0643\u0645\u0648\u062f\u064a\u0646\u0648|\u0643\u0648\u0645\u0648\u062f)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
            console.log("Nightstand width:", nsWidth ? nsWidth[1] : "null");

            // Vanity
            const vMatch = arText.match(/(?:\u062a\u0633\u0631\u064a\u062d\u0629|\u062a\u0633\u0631\u064a\u062d\u0629)[^.\n]*?(\d+)\s*(?:\u0633\u0645|cm)/i);
            console.log("Vanity:", vMatch ? vMatch[1] : "null");
            
            return;
          }
        }
      }
    }
  }
  console.log("No description found");
}
main();
