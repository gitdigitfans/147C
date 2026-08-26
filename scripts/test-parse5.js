async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();

  // The content is inside JS strings with escaped quotes
  // Try different patterns
  const patterns = [
    '"description":{"ar":"',
    '\\"description\\":{\\"ar\\":\\"',
    '"description":{"ar":"',
    '\\\"description\\\":{\\\"ar\\\":\\\"',
    'description\\":\\"ar\\":\\"',
    '"ar":"🌟',
    '\\"ar\\":\\"🌟',
  ];

  for (const p of patterns) {
    const idx = html.indexOf(p);
    if (idx >= 0) {
      console.log(`Found "${p}" at ${idx}`);
      console.log(html.substring(idx, idx + 300));
    }
  }

  // Just search for the star emoji
  const starIdx = html.indexOf("\u2b50");
  console.log("\nStar emoji at:", starIdx);
  if (starIdx >= 0) {
    console.log(html.substring(Math.max(0, starIdx - 200), starIdx + 500));
  }
}
main();
