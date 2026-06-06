#!/usr/bin/env node
/**
 * Masaustu kisayolu olusturucu.
 * Her yeni projede / farkli yerde kurulum yapildiginda calistir:
 *   node scripts/create-desktop-shortcut.js
 *
 * Kullanici adi veya proje yolu degisti: scripts/create-desktop-shortcut.js
 * icindeki $USER ve $PROJECT sabitlerini guncelle ve tekrar calistir.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const USER = 'dince';
const DESKTOP_BASE = `C:\\Users\\${USER}\\OneDrive\\Desktop`;
const PROJECT_NAME = 'BeatForge';
const BAT_PATH = join(root, 'start-beatforge.bat');
const ICON_PATH = join(root, 'public', 'icons', 'icon.svg');

function createShortcut() {
  if (!existsSync(DESKTOP_BASE)) {
    console.error(`[hata] Masaustu bulunamadi: ${DESKTOP_BASE}`);
    return false;
  }
  if (!existsSync(BAT_PATH)) {
    console.error(`[hata] Baslat scripti yok: ${BAT_PATH}`);
    return false;
  }

  mkdirSync(DESKTOP_BASE, { recursive: true });
  const lnkPath = join(DESKTOP_BASE, `${PROJECT_NAME}.lnk`);

  const psScript = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("${lnkPath.replace(/\\/g, '\\\\')}")
$Shortcut.TargetPath = "${BAT_PATH.replace(/\\/g, '\\\\')}"
$Shortcut.WorkingDirectory = "${root.replace(/\\/g, '\\\\')}"
$Shortcut.WindowStyle = 7
$Shortcut.Description = "BeatForge - Drum n Bass & Dubsep Beat Studio"
$Shortcut.IconLocation = "${ICON_PATH.replace(/\\/g, '\\\\')}, 0"
$Shortcut.Save()
Write-Host "[ok] Kisayol olusturuldu: $Shortcut.FullName"
`;

  const tmpPs = join(root, '.tmp-create-shortcut.ps1');
  writeFileSync(tmpPs, psScript);

  try {
    execSync(`powershell -ExecutionPolicy Bypass -File "${tmpPs}"`, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error('[hata] Kisayol olusturulamadi:', err.message);
    return false;
  } finally {
    try { execSync(`del /f /q "${tmpPs}"`, { stdio: 'ignore' }); } catch {}
  }
}

console.log('BeatForge masaustu kisayolu olusturuluyor...');
console.log('  Hedef: ' + DESKTOP_BASE);
const ok = createShortcut();
if (ok) {
  console.log('\nTamamlandi! Artik masaustundeki "BeatForge" simgesine cift tikla.');
} else {
  console.log('\nBasarisiz. Lutfen PowerShell yonetici olarak calistirip tekrar deneyin.');
  process.exit(1);
}
