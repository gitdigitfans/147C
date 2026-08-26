async function main() {
  const skipped = [
    "bedroom-aria", "bedroom-aura", "bedroom-baneith", "bedroom-blanca",
    "bedroom-elena", "bedroom-hatbhor", "bedroom-iah", "bedroom-iahmerit",
    "bedroom-ibra", "bedroom-iza", "bedroom-khnumtamun", "bedroom-meritneith2",
    "bedroom-merittawy", "bedroom-nbtamun", "bedroom-nbtamun-2", "bedroom-nbtisis",
    "bedroom-nbtka", "bedroom-nbtsat", "bedroom-nbttawy", "bedroom-nefertihor",
    "bedroom-neithhatab", "bedroom-noor", "bedroom-satra", "bedroom-sera",
    "bedroom-tahatab", "bedroom-tia", "bedroom-urban", "bedroom-zizinia"
  ];

  // For each skipped product, also look at the English description ref and the spec key/value pairs
  for (const slug of skipped) {
    const res = await fetch(`https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/${slug}`);
    const html = await res.text();

    // Find ALL description-related content
    const marker = '\\"description\\":{\\"ar\\":\\"';
    const idx = html.indexOf(marker);
    let arDesc = "NOT FOUND";
    if (idx >= 0) {
      const start = idx + marker.length;
      let end = start;
      while (end < html.length && end < start + 50000) {
        if (html[end] === '"' && html[end - 1] !== '\\') break;
        end++;
      }
      arDesc = html.substring(start, end);
      // Check if it's a reference like $16
      if (arDesc.startsWith('$')) {
        arDesc = "REF:" + arDesc.substring(0, 20);
      } else {
        arDesc = arDesc.substring(0, 200);
      }
    }

    // Find spec values
    const specMatches = [];
    const specRe = /\\"spec_key_en\\":\\"([^"\\]*)\\"[^}]*?\\"spec_value_en\\":\\"([^"\\]*)\\"/g;
    let m;
    while ((m = specRe.exec(html)) !== null) {
      specMatches.push(`${m[1]}=${m[2]}`);
    }

    // Also look for inline spec data
    const inlineSpecRe = /"key":\{"ar":"([^"]*)","en":"([^"]*)"\},"value":\{"ar":"([^"]*)","en":"([^"]*)"\}/g;
    while ((m = inlineSpecRe.exec(html)) !== null) {
      specMatches.push(`${m[2]}=${m[4]}`);
    }

    console.log(`${slug}: desc=${arDesc} specs=[${specMatches.join(', ')}]`);
  }
}
main();
