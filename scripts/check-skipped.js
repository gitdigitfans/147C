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

  for (const slug of skipped.slice(0, 6)) {
    const res = await fetch(`https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/${slug}`);
    const html = await res.text();

    const marker = '\\"description\\":{\\"ar\\":\\"';
    const idx = html.indexOf(marker);
    if (idx < 0) { console.log(`${slug}: NO MARKER`); continue; }

    const start = idx + marker.length;
    let end = start;
    while (end < html.length && end < start + 50000) {
      if (html[end] === '"' && html[end - 1] !== '\\') break;
      end++;
    }

    let arText = html.substring(start, end);
    arText = arText.replace(/\\\\/g, '\x00');
    arText = arText.replace(/\\n/g, '\n');
    arText = arText.replace(/\\"/g, '"');
    arText = arText.replace(/\x00/g, '\\');

    console.log(`\n=== ${slug} (${arText.length} chars) ===`);
    console.log(arText.substring(0, 800));
  }
}
main();
