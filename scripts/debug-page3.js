async function main() {
  const res = await fetch("https://pharaoh-furniture.pharaoh-furniture.workers.dev/shop/bedroom-randy");
  const html = await res.text();

  // Find the embedded JSON data
  const jsonMatch = html.match(/"description":\{"ar":"((?:[^"\\]|\\.)*)"/);
  if (jsonMatch) {
    const desc = jsonMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\u[\da-f]{4}/gi, (m) => String.fromCharCode(parseInt(m.substr(2), 16)));
    console.log("=== Description (ar) ===");
    console.log(desc.substring(0, 2000));
    
    // Extract numbers near keywords
    const lines = desc.split("\n");
    for (const line of lines) {
      if (line.match(/\d/)) {
        console.log("  LINE: " + line.trim().substring(0, 200));
      }
    }
  } else {
    console.log("No description JSON found");
  }

  // Also check for a different pattern with specs in the JSON
  const specsMatch = html.match(/"specs":\[((?:[^\]]*)\])/);
  if (specsMatch) {
    console.log("\n=== Specs in JSON ===");
    console.log(specsMatch[1].substring(0, 1000));
  }
}
main();
