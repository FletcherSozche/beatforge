# BeatForge

Drum n Bass, Dubstep ve daha fazlasi icin tasarlanmis sezgisel mobil + masaustu muzik uretim stüdyosu. Tek kod tabani; Android, iOS, Web (PWA), Windows, macOS, Linux.

## Hakkinda

BeatForge klasik "diger" beat maker'larin aksine **"ac, calma yap"** felsefesiyle cikar. DnB, Dubstep, Trap, House, Techno, Boom Bap tarz onayarlari, profesyonel 16 adimli step sequencer, 10+ sentezleyici kanal ve 6 stüdyo kalitesinde efekt ile anlik uretim yapmanizi saglar.

> **Fiyat Prensibi:** "Bir bira parasi" - Tek seferlik satin alma, abonelik yok, icki reklam yok.

## Mimari

```
beatforge/
├── src/                    Web app (Vite + vanilla JS)
│   ├── main.js             Bootstrap ve genel durum
│   ├── audio/              Tone.js ses motoru
│   │   ├── engine.js       Transport, master chain, recorder
│   │   ├── instruments.js  Drum, bass, lead, wobble synth
│   │   ├── effects.js      Master FX chain
│   │   ├── sequencer.js    Pattern playback
│   │   ├── presets.js      Tarz onayarlari
│   │   └── storage.js      Save/Load/Export
│   ├── ui/                 UI komponentleri
│   └── styles/main.css     Modern dark tema
├── electron/               Desktop wrapper (Windows/Mac/Linux)
├── public/icons/           PWA ikonlari
├── store-assets/           PlayStore + AppStore listesi
├── .github/workflows/      CI/CD (build + release)
└── capacitor.config.ts     iOS/Android ayarlari
```

## Hizli Baslangic (Gelistirme)

```bash
# Bagimliliklari kur
npm install

# Web icin gelistirme (localhost:5173)
npm run dev

# Web build (PWA)
npm run build
npm run preview  # build'i test et
```

## Multi-Platform Build

### Web (PWA - Tum platformlar)
```bash
npm run build
# dist/ klasoru herhangi bir statik host'a yuklenebilir
# Netlify, Vercel, GitHub Pages, S3 + CloudFront, vs.
```

### Android (Play Store)
```bash
# Ilk seferinde
npm install
npx cap add android
npm run icons:generate

# Gelistirme (cihazda calistir)
npm run android:dev

# Release build
npm run android:build
# Android Studio acilir, signed AAB uret
```

### iOS (App Store)
```bash
# Ilk seferinde (macOS zorunlu)
npx cap add ios
npm run icons:generate

# Gelistirme (Mac'te calistir)
npm run ios:dev

# Release build
npm run ios:build
# Xcode acilir, App Store'a yukle
```

### Windows (NSIS Installer, Portable, MSIX)
```bash
npm run build:win
# dist-electron/ altinda .exe, portable, MSIX
```

### macOS (DMG, Mac App Store, ZIP)
```bash
npm run build:mac
# dist-electron/ altinda .dmg, .app, .zip
# Mac App Store icin: dist-electron/ altinda .pkg
```

### Linux (AppImage, DEB, RPM, Snap, Flatpak)
```bash
npm run build:linux
# dist-electron/ altinda her format
```

### Tum Desktop Tek Seferde
```bash
npm run build:all-desktop
```

## CI/CD

`.github/workflows/build.yml` - push'ta otomatik build:
- Web PWA build
- Windows/Mac/Linux desktop build
- GitHub Releases'e otomatik yukleme (tag'li push'ta)

`.github/workflows/deploy-web.yml` - main branch'e her push'ta GitHub Pages'a otomatik deploy.

### Release Workflow

```bash
# Yeni versiyon
npm version patch  # 0.1.0 -> 0.1.1
git push --tags
# GitHub Actions otomatik olarak tum platformlar icin build alir
# ve GitHub Releases'e yukler
```

## Imzalama (Production)

### Android Keystore
```bash
keytool -genkey -v -keystore beatforge-release.keystore \
  -alias beatforge -keyalg RSA -keysize 2048 -validity 10000

# base64'e cevir (GitHub secret icin)
base64 beatforge-release.keystore > keystore.b64
```

GitHub Secrets'a ekle:
- `ANDROID_KEYSTORE_B64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

### iOS Certificate
1. Apple Developer Portal'da Distribution Certificate olustur
2. App Store Provisioning Profile indir
3. `.p12`'ye export et, base64'e cevir

GitHub Secrets:
- `APPLE_ID`
- `APPLE_ID_PASSWORD` (app-specific)
- `APPLE_TEAM_ID`
- `CSC_LINK` (base64 .p12)
- `CSC_KEY_PASSWORD`

## Store Yayin Sureci

**Google Play Store** - Detaylar: `store-assets/playstore/LISTING.md`
1. Google Play Console hesabi ($25 tek seferlik)
2. AAB dosyasini uret: `npm run android:build`
3. Store listing metinlerini, gorselleri, iconu yukle
4. Review'a gonder (genelde 1-3 gun)

**Apple App Store** - Detaylar: `store-assets/appstore/LISTING.md`
1. Apple Developer Program ($99/yil)
2. App Store Connect'te app olustur
3. IPA'yi Transporter/Xcode ile yukle
4. Review'a gonder (genelde 1-2 gun)

**Microsoft Store (MSIX)**
1. Partner Center hesabi (ucretsiz bireysel, $19 kurumsal)
2. MSIX paketi otomatik uretiliyor: `dist-electron/*.appx`
3. Partner Center'a yukle

**Mac App Store (MAS)**
1. Apple Developer Program uyeligi
2. `npm run build:mac` -> `dist-electron/*.pkg`
3. App Store Connect'e yukle

**Snap Store (Linux)**
1. `snapcraft` hesabi
2. `dist-electron/*.snap` dosyasini `snapcraft upload` ile yukle

## Test

```bash
# Web
npm run dev
# Tarayicida http://localhost:5173 ac, AudioContext'i etkinlestirmek icin sayfaya tikla

# Electron
npm run electron:dev

# Capacitor
npm run android:dev  # veya ios:dev
```

## Mimari Detaylari

### Audio Engine
- Tone.js (Web Audio API ustune insa edilmis)
- Polifonik synth'ler icin `Tone.PolySynth`
- Drum sesleri icin `Tone.MembraneSynth` (kick) ve `Tone.NoiseSynth` (snare/hat)
- Wobble bass icin `Tone.LFO` ile `Tone.Filter.frequency` modülasyonu
- Reverb algoritmasi `Tone.Reverb` (algorithmic convolution)
- Master limiter: `Tone.Limiter`

### Multi-Platform Tricks
- **Vite** - Web tek build'i Capacitor ve Electron'a ayni baglanti
- **Capacitor** - Web'i WebView icinde native shell olarak paketler
- **PWA** - Web build'i direk "Add to Home Screen" ile yuklenebilir
- **Electron** - Web'i native window'da calistirir
- **vite-plugin-pwa** - Service worker + manifest otomatik uretir
- **electron-builder** - Tum platformlar icin tek komut paketleme

## Lisans

Tescilli yazilim. Tum haklari BeatForge Studio'ya aittir.

## Iletisim

- Web: https://beatforge.app
- E-posta: hello@beatforge.app
- Destek: support@beatforge.app
