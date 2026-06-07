# BeatForge

Drum n Bass, Dubstep ve daha fazlasi icin tasarlanmis sezgisel mobil + masaustu muzik uretim stüdyosu. Tek kod tabani; Android, iOS, Web (PWA), Windows, macOS, Linux.

## Hakkinda

BeatForge klasik "diger" beat maker'larin aksine **"ac, calma yap"** felsefesiyle cikar. DnB, Dubstep, Trap, House, Techno, Boom Bap tarz onayarlari, profesyonel 16 adimli step sequencer, **25 sentezleyici kanal**, **6 stüdyo kalitesinde efekt**, vokal kayit, 128 bara kadar uzun sarkilar ve **Telegram bot ile uzaktan kontrol** ile anlik uretim yapmanizi saglar.

> **Fiyat Prensibi:** "Bir bira parasi" - Tek seferlik satin alma, abonelik yok, gizli reklam yok.

## Ozellikler (v0.1.0)

### Editor
- 25 kanal step sequencer (kick, sub, snare, clap, tomlar, ride, crash, hat, ohat, shaker, wobble, reese, lead, pad, pluck, 3 vokal)
- 1/2/4/8/16/32/64/128 bar secenekleri (10 dakikaya kadar)
- Per-beat velocity (gorsel + drag ile ayarlama)
- Drag-paint, shift-select, Ctrl+A/C/V, sag tik menusu
- 128 bar'a kadar virtualized grid (DOM performans)

### Ses
- 6 master efekt: Reverb, Delay, Distortion, Filter, Phaser, Compressor
- Per-channel mixer (vol/pan/mute/solo/meter)
- Synth: nota secimi + LFO wobble
- Vokal kayit (3 track, getUserMedia + MediaRecorder)
- Spectrum analyzer (FFT 256, 32 bantli)

### Sablonlar
- 8 tarz (DnB, Neurofunk, Dubstep, Riddim, Trap, House, Techno, Hip-Hop)
- 12 ek pattern template (Amen, Think, Liquid Funk, Breakcore vs.)
- Demo proje: `projects/neon-pulse-demo.bfp`

### Verimlilik
- Undo/Redo (80 adim gecmis)
- Auto-save (30 saniyede bir)
- A/B pattern karsilastirma
- Bar kopyalama (tek tıkla intro→drop)
- Klavye kisayollari (Space, Ctrl+Z/Y, Ctrl+S/N/O/E)

### Dis Aktarma & Paylasim
- WAV export (master mix)
- .bfp proje dosyasi (JSON, insan-okunabilir)
- Telegram bot ile PC kontrolu (Whisper sesli komut)
- Bot senkron (Electron): bot yazarsa BeatForge otomatik reload

## Mimari

```
beatforge/
├── src/                    Web app (Vite + vanilla JS)
│   ├── main.js             Bootstrap ve genel durum
│   ├── audio/              Tone.js ses motoru
│   │   ├── engine.js       Transport, master chain, recorder, FFT
│   │   ├── instruments.js  25 kanal sentzleyici
│   │   ├── effects.js      Master FX chain
│   │   ├── sequencer.js    Pattern playback
│   │   ├── presets.js      8 tarz onayari
│   │   ├── templates.js    12 ek pattern
│   │   ├── history.js      Undo/Redo
│   │   ├── autosave.js     Otomatik kayit
│   │   ├── ab-compare.js   A/B karsilastirma
│   │   ├── bar-ops.js      Bar kopyalama
│   │   ├── vocal.js        Vokal ses motoru
│   │   ├── storage.js      Save/Load/Export
│   │   └── watcher.js      Bot sync dosya izleyici
│   ├── ui/                 UI komponentleri
│   │   ├── grid.js         Virtualized sequencer
│   │   ├── mixer.js        Kanal kontrolleri
│   │   ├── effects-ui.js   Efekt kartlari
│   │   ├── synth.js        Synth panel
│   │   ├── vocal.js        Vokal UI
│   │   ├── templates-ui.js Sablon grid
│   │   ├── spectrum.js     Spectrum canvas
│   │   ├── knob.js         Surukle knob
│   │   └── presets-ui.js   Tarz onayari
│   └── styles/main.css     Sci-fi tema (Orbitron, neon, scanlines)
├── electron/               Desktop wrapper (Windows/Mac/Linux)
├── public/icons/           PWA ikonlari (22 boyut)
├── public/marketing.html   Landing page
├── store-assets/           PlayStore + AppStore + track-art
├── docs/                   Kullanici kilavuzu, launch checklist
├── projects/               Demo .bfp dosyalari
├── scripts/                Build, icon, art uretecleri
├── .github/workflows/      CI/CD (build + release)
└── capacitor.config.ts     iOS/Android ayarlari
```

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

# Tum platform build (release)
node scripts/build-all.js --mobile
```

## Belgeler

- `docs/USER-MANUAL.md` - Kullanici kilavuzu (TR)
- `docs/LAUNCH-CHECKLIST.md` - 8 fazli launch plani
- `docs/store-listings.md` - App Store / Play Store metinleri
- `projects/neon-pulse-demo.bfp` - Demo proje (DnB, 4 bar)

## Telegram Bot

Ayrı repo: `D:\AI\OpenCode\beatforge-bot\`

- `@BotFather`'dan token al
- `npm install && npm run setup` (interaktif kurulum)
- `npm start` (polling modu)
- Veya VPS + webhook (production)

Detay: `beatforge-bot/README.md`
- Android ornek: `beatforge-bot/examples/android-conversation.md`
- iOS ornek: `beatforge-bot/examples/apple-conversation.md`

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
