# BeatForge - Launch Checklist

> Once yayinlamadan once tamamlanmasi gerekenler. Sira ile git.

---

## Faza 0: Onceki (Zaten Tamam)

- [x] Core sequencer (25 kanal, 128 bar)
- [x] Web Audio engine (Tone.js)
- [x] Mobile-first responsive UI
- [x] Sci-fi tema (Orbitron, neon, scanlines)
- [x] Vokal kayit (3 track)
- [x] 6 master efekt
- [x] 8 tarz + 12 template
- [x] 25 preset icin icon set
- [x] Telegram bot (telefon kontrolu)
- [x] Undo/Redo + A/B compare
- [x] Auto-save (30s)
- [x] Bar kopyalama
- [x] Spectrum analyzer
- [x] Demo .bfp projesi
- [x] Kullanici kilavuzu (TR)
- [x] App Store listing (TR/EN)
- [x] Landing page
- [x] Multi-platform build scripts
- [x] Git: 7+ commit
- [x] Desktop shortcut

---

## Faza 1: Web Launch (1 hafta)

### Teknik
- [ ] `npm run build` basarili, PWA manifest dogru
- [ ] Lighthouse PWA score >= 90
- [ ] Chrome DevTools > Application > Service Worker aktif
- [ ] HTTPS uzerinden calistir (PWA zorunlu)
- [ ] Domain: `beatforge.app` veya GitHub Pages
- [ ] GitHub Pages veya Netlify deploy (otomatik: `.github/workflows/deploy-web.yml`)
- [ ] Custom domain bagla
- [ ] `sitemap.xml` + `robots.txt`
- [ ] Favicon (16, 32, 192, 512 px)
- [ ] Open Graph meta tags (sosyal medya paylasimi)

### Icerik
- [ ] Landing page (`/public/marketing.html`) tamamlandi
- [ ] Privacy policy sayfasi (`/legal/privacy.html`)
- [ ] Terms of service sayfasi (`/legal/terms.html`)
- [ ] About sayfasi (`/about.html`)
- [ ] Demo video 15 sn (YouTube embed)

### Kontrol
- [ ] Chrome, Edge, Firefox, Safari (masaustu) test
- [ ] iOS Safari test (AudioContext baslatma)
- [ ] Android Chrome test
- [ ] PWA install butonu calisiyor
- [ ] Mobilde offline calisma (en az cache)

---

## Faza 2: Apple App Store (2 hafta)

### Hazirlik
- [ ] Apple Developer hesabi ($99/yil) — `developer.apple.com`
- [ ] App ID olustur: `app.beatforge.studio`
- [ ] Bundle ID: `app.beatforge.studio`
- [ ] Provisioning profile
- [ ] Sertifikalar (Apple Distribution)
- [ ] `capacitor.config.ts` bundleId kontrol
- [ ] iOS uygulama ikonu (1024x1024) - `npm run icons:generate`
- [ ] iOS splash screen (her boyut) - `cordova-res`

### Xcode
- [ ] `npm run cap:sync` calistir
- [ ] `npx cap open ios`
- [ ] Signing & Capabilities > Team sec
- [ ] Build Settings > iOS Deployment Target >= 13.0
- [ ] Test: iPhone sim (15 Pro, 14, SE)
- [ ] Test: iPad (varsa)

### App Store Connect
- [ ] Yeni app: BeatForge - Music Studio
- [ ] Kategori: Music
- [ ] Fiyat: $4.99 (Tier 5)
- [ ] Screenshots: 6.7", 6.5", 5.5" + 12.9" iPad
- [ ] Aciklama (EN + TR) → `docs/store-listings.md`
- [ ] Keywords: `drum machine, beat maker, dnb, dubstep, sequencer`
- [ ] Support URL: `https://beatforge.app/support`
- [ ] Privacy URL: `https://beatforge.app/privacy`
- [ ] App Privacy: "Data Not Collected" (sifir veri toplama)
- [ ] Rating: 4+
- [ ] Submit for Review
- [ ] Approve (genelde 24-48 saat)

### Post-Launch
- [ ] App Store URL'sini web'e ekle
- [ ] Reviews monitor (ilk hafta kritik)

---

## Faza 3: Google Play (2 hafta, paralel)

### Hazirlik
- [ ] Google Play Console hesabi ($25 bir kerelik)
- [ ] App signing key (Upload Key + App Signing Key)
- [ ] `capacitor.config.ts` applicationId: `app.beatforge.studio`

### Build
- [ ] `npm run android:build`
- [ ] Android Studio acilir
- [ ] AAB (Android App Bundle) olustur
- [ ] Signing: Upload Key ile imzala
- [ ] `bundleRelease` output: `android/app/build/outputs/bundle/release/app-release.aab`

### Play Console
- [ ] App olustur
- [ ] Internal testing (5 testeci) → Closed testing → Production
- [ ] Store listing:
  - Short description (80 char)
  - Full description (4000 char)
  - Screenshots: telefon + tablet + Feature graphic
  - Icon: 512x512
- [ ] Content rating: PEGI 3 (Everyone)
- [ ] Data safety: "No data collected"
- [ ] Pricing: $4.99 (one-time)
- [ ] Release: "Manual" + start date

### Post-Launch
- [ ] Play Store URL'sini web'e ekle
- [ ] Reviews monitor

---

## Faza 4: Desktop (1 hafta)

### Windows
- [ ] `npm run build:win`
- [ ] Output: `dist-electron/BeatForge Setup 0.1.0.exe`
- [ ] Test: Windows 10, 11
- [ ] Microsoft Store (opsiyonel): Partner Center (ucretsiz), $19 organizasyon
- [ ] Code signing sertifikasi (opsiyonel ama uyariyi kaldirir)

### Mac
- [ ] macOS'ta calistir: `npm run build:mac`
- [ ] Output: `dist-electron/BeatForge-0.1.0.dmg`
- [ ] Apple Developer ID Application sertifikasi
- [ ] Notarize: `xcrun notarytool submit` (online dogrulama)
- [ ] Test: macOS Ventura + Sonoma

### Linux
- [ ] `npm run build:linux`
- [ ] Output: `AppImage`, `.deb`, `.snap`, `.rpm`
- [ ] Test: Ubuntu 22.04, Fedora 39, Arch

---

## Faza 5: Telegram Bot Production (1 hafta)

### VPS Deploy
- [ ] VPS satin al: Hetzner €4/ay, Contabo $5/ay, Vultr $5/ay
- [ ] Domain bagla: `bot.beatforge.app` (opsiyonel)
- [ ] SSL: Let's Encrypt (Certbot)
- [ ] PM2 kur: `npm i -g pm2`
- [ ] `pm2 start src/index.js --name beatforge-bot`
- [ ] `pm2 startup`, `pm2 save` (auto-restart)
- [ ] Log rotation: `pm2 install pm2-logrotate`

### Webhook Mode (Polling yerine)
- [ ] BotFather'dan webhook URL set et
- [ ] `bot.telegram.org` > Bot > Webhook URL
- [ ] HTTPS zorunlu (Let's Encrypt ile)
- [ ] Reverse proxy: nginx + certbot

### Monitoring
- [ ] Uptime monitoring: UptimeRobot (ucretsiz)
- [ ] Error log: Sentry (ucretsiz tier) veya log dosyasi
- [ ] Kullanim analytics (sadece komut sayisi, kisisel veri yok)

### Guvenlik
- [ ] `ALLOWED_CHAT_ID` ile chat restriction (zaten var)
- [ ] Rate limit (spam korumasi): `telegraf-ratelimit`
- [ ] Token rotation proseduru (yil/6 ayda bir)

---

## Faza 6: Monetization (Yayin sonrasi 1-2 hafta)

### Fiyat
- [ ] App Store: $4.99
- [ ] Play Store: $4.99
- [ ] Web: ucretsiz + "Pro" tier $4.99 (ileride)
- [ ] Desktop: ucretsiz + "Pro" tier $4.99 (ileride)

### Odeme Sistemi
- [ ] Apple: App Store IAP
- [ ] Google: Play Billing
- [ ] Web: Stripe (ileride) veya Gumroad

### Vergi
- [ ] TR: Stopaj (yillik Gelir Vergisi beyannamesi)
- [ ] Apple/Google: %30 kesinti (ilk $1M %15)
- [ ] AB VAT (yurtdisi satista)

---

## Faza 7: Marketing (Yayin haftasi)

### Press Kit (`/press/`)
- [ ] Logo (PNG, SVG, monokrom)
- [ ] App screenshots (telefon, tablet, masaustu)
- [ ] Track artwork ornekleri (procedural SVG'ler var)
- [ ] One-pager PDF
- [ ] Basin aciklamasi (TR + EN)
- [ ] Demo video (YouTube 15 sn)
- [ ] Sosyal medya hesaplar:
  - Twitter/X: @beatforgeapp
  - Instagram: @beatforgeapp
  - YouTube: BeatForge Studio
  - TikTok: @beatforgeapp

### Launch Announcement
- [ ] ProductHunt.com (ingilizce, global erisim)
- [ ] Hacker News (Show HN)
- [ ] Reddit: r/WeAreTheMusicMakers, r/DrumAndBass, r/edmproduction
- [ ] Discord: producer community'leri
- [ ] Twitter thread

### Indie Dev Comm.
- [ ] IndieHackers.com
- [ ] BetaList
- [ ] BetaFamily

---

## Faza 8: Post-Launch (surekli)

### Monitor
- [ ] Crashlytics / Sentry
- [ ] App Store reviews (haftalik kontrol)
- [ ] Play Store reviews
- [ ] Web analytics: Plausible veya Umami (GDPR-safe)

### Roadmap
- [ ] MIDI export
- [ ] Daha fazla sablon (v0.2)
- [ ] Cloud sync (Dropbox/Google Drive)
- [ ] Collaboration (cok kullanicili proje)
- [ ] Plugin sistemi (LFO, sampler)
- [ ] iPad optimization (daha genis alan)

### Support
- [ ] Discord sunucusu
- [ ] Email support
- [ ] FAQ sayfasi

---

## Tahmini Zaman ve Butce

| Faza | Sure | Maliyet |
|------|------|---------|
| Web | 1 hafta | $0 |
| Apple | 2 hafta | $99/yil |
| Google | 2 hafta | $25 (bir kere) |
| Desktop | 1 hafta | $0 (Win) / $99 (Mac) |
| Bot VPS | 1 hafta | €4/ay |
| Marketing | 1 hafta | $0-200 |
| **Toplam** | **~2 ay** | **~$250** + VPS |

---

## Beklenen Gelir (1. Yil - Optimistik)

| Platform | Indirme | Fiyat | Gelir (70% pay) |
|----------|---------|-------|-----------------|
| iOS | 500 | $4.99 | $1,747 |
| Android | 1500 | $4.99 | $5,242 |
| Web | 3000 | $0 (free) | $0 (funnel) |
| **Toplam** | **5000** | - | **$6,989** |

*Gerçekçi senaryo: 1000-3000 toplam ilk yil = $1500-4500.*

**Hedef:** "pasif gelir" = $500/ay 6. ayda, $2000/ay 12. ayda.

---

## Kritik Basari Metrikleri (KPI)

- [ ] **DAU/MAU** orani >= %20
- [ ] **Retention Day-7** >= %15
- [ ] **Crash-free users** >= %99
- [ ] **App Store rating** >= 4.2
- [ ] **Average session** >= 10 dk
- [ ] **Proje/yeni kullanici** >= 3
- [ ] **Telegram bot weekly active** >= 100

---

## Durum Ozeti

```
Faza 0:  ████████████████████ 100% ✅
Faza 1:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Faza 2:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Faza 3:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Faza 4:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Faza 5:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Faza 6:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Faza 7:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Faza 8:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

> Faza 0 tamamlandi. Faza 1-7 icin gereken butce, zaman ve erisim hazir.
> Sadece "start" komutu bekleniyor.
