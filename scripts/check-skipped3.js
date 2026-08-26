async function main() {
  const slug = "bedroom-neithhatab";
  const res = await fetch(`https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/${slug}`);
  const html = await res.text();

  // Find ALL push chunks and look for the actual description text
  const pushStarts = [];
  let si = 0;
  while (true) {
    const idx = html.indexOf('self.__next_f.push([1,"', si);
    if (idx < 0) break;
    pushStarts.push(idx);
    si = idx + 1;
  }

  console.log(`Found ${pushStarts.length} push calls`);

  for (let i = 0; i < pushStarts.length; i++) {
    const start = pushStarts[i];
    const nextStart = i + 1 < pushStarts.length ? pushStarts[i + 1] : html.length;
    const chunk = html.substring(start, nextStart);
    
    // Look for the description reference resolution
    if (chunk.includes('$16') && chunk.includes('ar')) {
      console.log(`\nPush ${i} contains $16 reference resolution:`);
      console.log(chunk.substring(0, 1000));
    }
    
    // Also look for inline descriptions with numbers
    if (chunk.includes('\u0633\u0645') && (chunk.includes('\u0627\u0644\u062f\u0648\u0644\u0627\u0628') || chunk.includes('\u0639\u0631\u0636'))) {
      console.log(`\nPush ${i} contains Arabic specs:`);
      console.log(chunk.substring(0, 1500));
    }
  }

  // Also try looking for the English description which may have dimensions
  const enIdx = html.indexOf('Wardrobe');
  if (enIdx >= 0) {
    console.log(`\n=== "Wardrobe" at ${enIdx} ===`);
    console.log(html.substring(Math.max(0, enIdx - 200), enIdx + 500));
  }

  // Try neithhatab description which has bullet points
  const descMarker = '\\"description\\":{';
  let searchFrom = 0;
  while (true) {
    const didx = html.indexOf(descMarker, searchFrom);
    if (didx < 0) break;
    const ctx = html.substring(didx, didx + 3000);
    if (ctx.includes('\u0627\u0644\u0639\u0631\u0636') || ctx.includes('\u0627\u0644\u0627\u0631\u062a\u0641\u0627\u0639')) {
      console.log(`\n=== Description block at ${didx} ===`);
      const t = ctx.replace(/\\n/g, '\n').replace(/\\"/g, '"');
      console.log(t.substring(0, 2000));
    }
    searchFrom = didx + 1;
  }
}
main();
