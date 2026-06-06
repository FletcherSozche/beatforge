# BeatForge - Play Store Listing

## App Bilgileri

| Alan | Deger |
|---|---|
| Package Name | `app.beatforge.studio` |
| Default Language | Turkce (tr-TR) |
| Application Type | Application |
| Category | Music & Audio |
| Tags | music creation, beat maker, dnb, dubstep, dj |

## Magaza Listesi Metinleri

### Uygulama Adi (max 30 karakter)
```
BeatForge - Beat Stüdyosu
```

### Kisa Aciklama (max 80 karakter)
```
Drum n Bass, Dubstep ve daha fazlasi icin sezgisel beat maker stüdyosu.
```

### Tam Aciklama (max 4000 karakter)
```
BeatForge - Cebinizdeki Profesyonel Beat Stüdyosu

Hayalini kurdugunuz beat'leri saniyeler icinde olusturun! BeatForge, Drum n Bass, Dubstep, Trap, House, Techno ve daha bircok elektronik muzik turune ozel olarak tasarlanmis sezgisel bir mobil muzik prodüksiyon stüdyosudur.

ANA OZELLIKLER

* Profesyonel Step Sequencer - 16/32/64 adimli pattern editor
* 10+ Sentezleyici Kanal - Kick, Snare, Hi-Hat, Clap, Crash, Sub Bass, Wobble Bass, Reese, Lead
* Tarz Onayarlari - DnB, Dubstep, Trap, House, Techno, Boom Bap
* Profesyonel Efektler - Reverb, Delay, Distortion, Filter, Phaser, Compressor
* WAV Disa Aktarma - Yuksek kaliteli ses dosyalari olarak kaydedin
* Modern Dark Tema - Goz yormayan, profesyonel arayuz
* Tek Tikla Rastgele - Anlik ilham icin pattern generator
* Mixer & Master Channel - Profesyonel ses miksaji

NEDEN BEATFORGE?

* Hicbir muzik egitimi gerektirmez
* Stüdyo kalitesinde ses motoru (Web Audio API)
* Offline calisir, bagimsiz
* Cabuk projeleri kaydet ve yukle
* Buyuyen tarz onayarlari kutuphanesi

KIMLER ICIN?

* Bedroom producer'lar
* Profesyonel DJ ve muzisyenler
* Muzik ogrencileri
* Drum n Bass / Dubstep tutkunlari
* Yaraticilik isteyen herkes

Tek bira parasina sahip oldugunuz bu uygulama ile yepyeni bir muzik dunyasinin kapilarini aralayin!

© 2026 BeatForge Studio
```

## Grafikler / Gorseller

| Tur | Boyut | Yer |
|---|---|---|
| Uygulama ikonu | 512x512 PNG (32-bit) | `store-assets/playstore/icon-512.png` |
| Feature graphic | 1024x500 JPG/PNG | `store-assets/playstore/feature-graphic.png` |
| Telefon ekran goruntuleri (min 2, max 8) | 1080x1920 veya 1080x2400 | `store-assets/screenshots/phone-*.png` |
| 7" tablet | 1200x1920 | `store-assets/screenshots/tab7-*.png` |
| 10" tablet | 1920x1200 | `store-assets/screenshots/tab10-*.png` |

## Surum Notlari (max 500 karakter)

```
v0.1.0 - Ilk surum!
- 10+ sentezleyici kanal
- Drum n Bass & Dubstep onayarlari
- 6 profesyonel efekt
- WAV disa aktarma
- Modern dark tema
- Turkce arayuz
```

## Fiyatlandirma

* **One-time purchase**: $4.99 / 89.99 TL (bira parasi prensibi - bolge bazli olcek)
* **Free with limited features** + In-app purchase for full unlock (alternatif strateji)

## Icerik Derecelendirmesi
* Hedef yas: 3+
* Icerik turu: Muzik uygulamasi (siddet/yetiskin icerik yok)

## Gizlilik Politikasi URL
* https://beatforge.app/privacy

## Iletisim
* Web: https://beatforge.app
* E-posta: hello@beatforge.app
* Destek: support@beatforge.app

## Imzalama (Release Build)

Android keystore olusturmak icin:
```
keytool -genkey -v -keystore beatforge-release.keystore \
  -alias beatforge -keyalg RSA -keysize 2048 -validity 10000
```

GitHub Actions secrets:
* `ANDROID_KEYSTORE_B64` - base64 encoded keystore
* `ANDROID_KEYSTORE_PASSWORD`
* `ANDROID_KEY_ALIAS`
* `ANDROID_KEY_PASSWORD`
