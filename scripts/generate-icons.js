#!/usr/bin/env node
/**
 * Icon generator - tum platformlar icin gerekli PNG ikonlari uretir.
 * Calistirmadan once: npm install sharp
 * Kullanim: node scripts/generate-icons.js
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'icons', 'icon.svg');
const svgBuffer = readFileSync(svgPath);

const targets = [
  { dir: 'public/icons', sizes: [72, 96, 128, 144, 152, 192, 384, 512], prefix: 'icon-' },
  { dir: 'public/icons', sizes: [192, 512], prefix: 'icon-maskable-', maskable: true },
  { dir: 'resources/icons', sizes: [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024], suffix: 'x' },
  { dir: 'store-assets/playstore', sizes: [512], prefix: 'icon-' },
  { dir: 'store-assets/appstore', sizes: [1024], prefix: 'icon-' }
];

async function generate() {
  console.log('Ikonlar uretiliyor...');
  for (const t of targets) {
    const dirPath = join(root, t.dir);
    if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });

    for (const size of t.sizes) {
      let name;
      if (t.suffix === 'x') {
        name = `${size}x${size}.png`;
      } else if (t.maskable) {
        name = `${t.prefix}${size}.png`;
      } else {
        name = `${t.prefix}${size}.png`;
      }
      const out = join(dirPath, name);

      let img = sharp(svgBuffer).resize(size, size);
      if (t.maskable) {
        const pad = Math.round(size * 0.1);
        img = sharp(svgBuffer).resize(size - pad * 2, size - pad * 2).extend({
          top: pad, bottom: pad, left: pad, right: pad,
          background: { r: 10, g: 14, b: 26, alpha: 1 }
        });
      }
      await img.png({ compressionLevel: 9 }).toFile(out);
      console.log(`  ✓ ${t.dir}/${name}`);
    }
  }

  const favPath = join(root, 'public', 'favicon.svg');
  writeFileSync(favPath, svgBuffer);
  console.log('  ✓ public/favicon.svg');

  console.log('\nBitti! Sonra calistirin:');
  console.log('  - Windows .ico icin: png-to-ico veya electron-icon-builder');
  console.log('  - macOS .icns icin: iconutil veya electron-icon-builder');
  console.log('  - Android/iOS icin: cap sync (ikonlar otomatik kopyalanir)');
}

generate().catch((err) => {
  console.error('Ikon uretimi basarisiz:', err);
  process.exit(1);
});
