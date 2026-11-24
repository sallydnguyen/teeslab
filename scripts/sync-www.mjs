import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'www');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const FILES = ['index.html', 'manifest.json', 'logo.jpg', 'version.json', 'sw.js'];
for (const f of FILES) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUT, f));
  }
}

const assetsSrc = path.join(ROOT, 'assets');
const assetsDst = path.join(OUT, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDst, { recursive: true });
}

console.log('Synced web assets to www/');
