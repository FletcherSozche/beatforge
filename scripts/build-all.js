#!/usr/bin/env node
/**
 * One-click release build
 * Tum platformlari tek seferde olusturur: web, PWA, Electron, Android AAB, iOS.
 *
 * Kullanim:
 *   node scripts/build-all.js              # sadece web + electron
 *   node scripts/build-all.js --mobile     # + android + ios (cap sync)
 *   node scripts/build-all.js --skip-android
 *   node scripts/build-all.js --skip-ios
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const args = process.argv.slice(2);
const wantMobile = args.includes('--mobile');
const skipAndroid = args.includes('--skip-android');
const skipIos = args.includes('--skip-ios');
const skipElectron = args.includes('--skip-electron');
const skipWeb = args.includes('--skip-web');

function step(msg) { console.log('\n\x1b[36m\x1b[1m▶ ' + msg + '\x1b[0m'); }
function ok(msg) { console.log('\x1b[32m  ✓\x1b[0m ' + msg); }
function warn(msg) { console.log('\x1b[33m  !\x1b[0m ' + msg); }
function err(msg) { console.log('\x1b[31m  ✗\x1b[0m ' + msg); }
function cmd(c) { return c; }

function run(cmdStr, opts = {}) {
  step(cmdStr);
  try {
    execSync(cmdStr, { stdio: 'inherit', cwd: root, ...opts });
    ok('OK');
    return true;
  } catch (e) {
    err('Basarisiz: ' + cmdStr);
    if (opts.required !== false) throw e;
    return false;
  }
}

function checkDist() {
  if (!existsSync(join(root, 'dist'))) {
    err('dist/ yok. Once "npm run build" calistir.');
    process.exit(1);
  }
}

async function main() {
  console.log('\x1b[35m');
  console.log('╔══════════════════════════════════════╗');
  console.log('║   BEATFORGE — ONE-CLICK RELEASE      ║');
  console.log('╚══════════════════════════════════════╝\x1b[0m');

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const releaseDir = join(root, 'release', stamp);
  mkdirSync(releaseDir, { recursive: true });
  console.log('\x1b[36m  Release: ' + releaseDir + '\x1b[0m');

  if (!skipWeb) {
    step('1. Web PWA build');
    run('npm run build');
    copyDir(join(root, 'dist'), join(releaseDir, 'web-pwa'));
    ok('web-pwa/');
  }

  if (!skipElectron) {
    step('2. Electron desktop build');
    const os = platform();
    if (os === 'win32') {
      run('npm run build:win', { required: false });
    } else if (os === 'darwin') {
      run('npm run build:mac', { required: false });
    } else {
      run('npm run build:linux', { required: false });
    }
    const electronOut = join(root, 'dist-electron');
    if (existsSync(electronOut)) {
      copyDir(electronOut, join(releaseDir, 'electron'));
      ok('electron/');
    } else {
      warn('dist-electron/ yok, atlandi');
    }
  }

  if (wantMobile && !skipAndroid) {
    step('3. Android');
    try {
      run('npm run android:build', { required: false });
      const androidOut = join(root, 'android', 'app', 'build', 'outputs');
      if (existsSync(androidOut)) {
        copyDir(androidOut, join(releaseDir, 'android'));
        ok('android/');
      }
    } catch (e) {
      warn('Android build atlandi (Android Studio gerekli)');
    }
  }

  if (wantMobile && !skipIos) {
    step('4. iOS');
    if (platform() === 'darwin') {
      try {
        run('npm run ios:build', { required: false });
        const iosOut = join(root, 'ios', 'build');
        if (existsSync(iosOut)) {
          copyDir(iosOut, join(releaseDir, 'ios'));
          ok('ios/');
        }
      } catch (e) {
        warn('iOS build basarisiz');
      }
    } else {
      warn('iOS build sadece macOS\'ta calisir, atlandi');
    }
  }

  step('5. Manifest');
  const manifest = {
    name: 'BeatForge',
    version: '0.1.0',
    builtAt: new Date().toISOString(),
    platforms: []
  };
  if (!skipWeb) manifest.platforms.push('web-pwa');
  if (!skipElectron) manifest.platforms.push('electron');
  if (wantMobile && !skipAndroid) manifest.platforms.push('android');
  if (wantMobile && !skipIos) manifest.platforms.push('ios');
  require('node:fs').writeFileSync(join(releaseDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  ok('manifest.json');

  console.log('\n\x1b[32m\x1b[1m✓ Release hazir:\x1b[0m\n  ' + releaseDir);
  console.log('\nIcindekiler:');
  for (const item of readdirSync(releaseDir)) {
    const s = statSync(join(releaseDir, item));
    if (s.isDirectory()) {
      console.log('  📁 ' + item + '/');
    } else {
      console.log('  📄 ' + item + ' (' + (s.size / 1024).toFixed(1) + ' KB)');
    }
  }
}

function copyDir(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const item of readdirSync(src)) {
    const s = join(src, item);
    const d = join(dst, item);
    if (statSync(s).isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

main().catch((e) => {
  err(e.message);
  process.exit(1);
});
