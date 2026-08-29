async function main() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  const matches = html.match(/href="[^"]*instagram[^"]*"/g);
  console.log('Rendered Instagram links:', matches);
}
main().catch(console.error).finally(() => process.exit());
