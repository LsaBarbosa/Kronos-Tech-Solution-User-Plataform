import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const assetsDir = join(process.cwd(), 'dist', 'assets');
const maxChunkKb = Number(process.env.BUNDLE_BUDGET_KB || 500);

const files = readdirSync(assetsDir).filter((file) => file.endsWith('.js'));

if (files.length === 0) {
  console.error('No JS assets found in dist/assets. Run build first.');
  process.exit(1);
}

const chunks = files.map((file) => {
  const path = join(assetsDir, file);
  const sizeBytes = statSync(path).size;
  return { file, sizeKb: sizeBytes / 1024 };
});

chunks.sort((a, b) => b.sizeKb - a.sizeKb);
const largest = chunks[0];

console.log(`Largest chunk: ${largest.file} (${largest.sizeKb.toFixed(2)} KB)`);
console.log(`Budget: ${maxChunkKb} KB`);

if (largest.sizeKb > maxChunkKb) {
  console.error('Bundle budget exceeded.');
  process.exit(1);
}

console.log('Bundle budget check passed.');
