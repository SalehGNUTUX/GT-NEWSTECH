---
layout: post
title: >-
  GT-QuranReader Version 4: Multi-Platform Quran Reader with 4 Riwayahs, 13+
  Reciters, and Synchronized Highlighting
category: gnutux-projects
author: GNUTUX
excerpt: >-
  GT-QuranReader is an open source Quran reading application supporting 4
  riwayahs (Warsh, Hafs, Qalun, Al-Duri) and over 13 reciters, with synchronized
  verse highlighting, smart Arabic search, 5 visual themes, and works on Linux,
  Android, and the web.
image: gt_quranreader.png
tags:
  - GT-QuranReader
  - Quran
  - Islamic Apps
  - Linux
  - Android
  - Web
  - Open Source
  - React
  - Electron
date: 2026-05-24T19:10:00.000Z
lang: en
slug: gt-quranreader-v4-release
---

## The Problem with Traditional Reading Applications

Most Quran reading applications suffer from chronic problems. Either they offer only one riwayah, often Hafs, or they lack synchronization between text and recitation, or they are slow and consume large amounts of memory, or they work on only one platform. Many free applications display intrusive ads, and paid applications charge fees for basic features.

GT-QuranReader was built to be a different solution. A completely open source application, with no ads, no tracking, and no accounts. It works on Linux through AppImage, DEB, RPM, and Flatpak, on Android through APK, and on the web through PWA, all from a single unified codebase.

🔗 **Official Website:** [salehgnutux.github.io/GT-QURANREADER](https://salehgnutux.github.io/GT-QURANREADER)
🔗 **Web App:** [salehgnutux.github.io/GT-QURANREADER/app](https://salehgnutux.github.io/GT-QURANREADER/app)

## What Is New in Version 4?

Version 4 is a complete rewrite of the application from scratch, focusing on three core pillars: expanded support for riwayahs and reciters, improved reading and listening experience, and making the application work completely offline.

### Four Certified Riwayahs in One Core

Version 4 supports four major riwayahs: Warsh an Nafi' as the default, Hafs an Asim, Qalun an Nafi', and Al-Duri an Abi Amr. The text source is api.alquran.cloud, and texts are stored locally after the initial download. Switching between riwayahs takes one click, and the entire text changes without reloading the page.

### Over 13 Reciters with Per-Verse Audio

The reciter list includes: Mishari Al-Afasi, Mahmoud Khalil Al-Husary, Muhammad Siddiq Al-Minshawi, Abdul Basit Abdul Samad, Ibrahim Al-Dosari for Warsh, Yassin Al-Jazairi, and others. Each verse has its own independent audio file, allowing precise playback without downloading the entire surah.

### Synchronized Highlighting with Recitation

When recitation is playing, the currently recited verse is highlighted in a distinctive gold color. Behavior is controllable: a single click on a verse highlights it without playing, and a double click plays the audio and highlights together. Automatic progression between verses and pages occurs with a timing gap of less than 200 milliseconds, providing a smooth and professional feel.

The image below shows the application interface with synchronized verse highlighting:

![Synchronized verse highlighting in GT-QuranReader](https://salehgnutux.github.io/GT-QURANREADER/screenshot-sync.png)

## Smart Search Engine

The search system in version 4 is different from any other Quran application. It performs complete normalization of diacritics, hamzahs, and special marks. This means searching for "Al-Rahman" matches "ٱلرَّحْمَٰنِ", and searching for "Al-Fatiha" matches "الْفَاتِحَة". The search also supports verse references such as "2:255" to go directly to Ayat Al-Kursi, surah names such as "Ya-Seen", and nicknames such as "Al-Kursi" and "The Heart of the Quran".

## Five Complete Visual Themes

Version 4 offers five different themes suitable for different reading times:

The Gold theme is the default, with warm gold colors suitable for daytime reading.

The Night theme uses dark colors with a black background, suitable for reading in darkness with less eye strain.

The Day theme uses light colors with a white background, suitable for bright lighting conditions.

The Sepia theme uses blue and green tones, inspired by e-ink screens.

The Auto theme follows the operating system's light or dark settings and switches automatically.

The image below shows the Gold and Night themes:

![Visual themes in GT-QuranReader](https://salehgnutux.github.io/GT-QURANREADER/screenshot-themes.png)

## Six Quranic Fonts to Choose From

The Uthmani font is the official font used in printed Mushafs.

The Amiri and Colored Amiri fonts are elegant fonts suitable for high-DPI screens.

The ArbFONTS font is lightweight and fast for devices with limited resources.

The System Font uses the operating system's default font and is the fastest of all.

The Lined font displays text with helper lines under words, suitable for beginner readers.

## Complete Offline Mode

The application is built as a PWA with Workbox and uses five different caching strategies. After the initial download of the Mushaf text, reciter audio, and page images, the application works at full capacity without any internet connection. You can download just one riwayah to save space, or download all riwayahs and reciters at once.

The storage management panel displays a table of everything downloaded locally, including texts, audio, and page images, with the approximate size of each section. You can delete any section individually, or clear all storage with one click.

## Advanced Reading Experience

### Reading Bookmark
A smart button that switches between three states depending on context. If there is no bookmark, the button displays "Save" to save the visible verse. If there is a bookmark, the button displays "Go to Bookmark" to jump to it. If the user is already at the bookmark location, the button displays "Delete" to remove it. The bookmark is completely independent from the listening position, meaning you can bookmark one verse while listening to another.

### Resume Listening
The last verse you were listening to is automatically saved in local storage. When returning to the application, a dialog asks whether to continue from where you stopped or start the surah from the beginning. The dialog is designed with the same style and color scheme as the application.

### Separate Last Reading Page
Even if you were listening to a recitation that took you to page 30, when reopening the application you will automatically find yourself at the last page you were reading manually. This separation between reading position and listening position solves a chronic problem in other Quran applications.

### Swipe to Turn Pages on Phones and Tablets
On touch screens, swiping right goes to the previous page, and swiping left goes to the next page. The swipe has a natural tactile feel, and an alternative 📄 button in the floating bar is available for those who prefer buttons.

### Pinch to Adjust Font Size
On touch screens, pinching with two fingers increases or decreases font size. Steps are 5 percent between 80 and 200 percent. An alternative button in the floating bar is available for those who prefer buttons.

### Precise Volume Slider
In the More menu represented by ⋯, there is a precise volume slider from 0 to 100 percent in 5 percent steps, with mute buttons and a visible percentage indicator. Volume level is saved between sessions.

## Cross-Platform Compatibility

The application runs on:

Linux through AppImage for all distributions, DEB package for Ubuntu, Debian, and Linux Mint, RPM package for Fedora, openSUSE, and RHEL, and Flatpak.

Android through APK that can be installed directly or via adb.

Web through PWA that can be installed on any modern browser including Chrome, Edge, Firefox, and Safari.

All versions share the same codebase in React and TypeScript, with different wrappers: Electron for desktop, Capacitor for Android, and PWA for the web.

## Privacy and Security

The application contains no tracking code, no analytics, and no advertisements. It does not require creating an account or logging in. All data is stored locally on the user's device. LocalStorage for simple settings, IndexedDB for large data including texts and audio, and Cache API for static application files. The server knows nothing about the user, and there are no external network requests after downloading the required content.

## License and Open Source

The application is dual-licensed under GPL-3.0 for the desktop core and AGPL-3.0 for the web version. This ensures user freedom on servers as well. The complete source code is available on GitHub, and anyone can contribute, modify, or fork. The project is non-profit and is considered ongoing charity for everyone who participates.

Data sources: texts from api.alquran.cloud, audio from everyayah.com, and Mushaf page images from the Quran-PNG repository.

## Installation and Download

### Linux - AppImage (All Distributions)
```bash
chmod +x GT-QURANREADER-4.0.1-x86_64.AppImage
./GT-QURANREADER-4.0.1-x86_64.AppImage
```

### Linux - DEB (Ubuntu/Debian)
```bash
sudo dpkg -i GT-QURANREADER-4.0.1-amd64.deb
```

### Linux - RPM (Fedora)
```bash
sudo dnf install ./GT-QURANREADER-4.0.1-x86_64.rpm
```

### Linux - Flatpak
```bash
flatpak install --user GT-QURANREADER-4.0.1.flatpak
```

### Android - APK
```bash
adb install -r GT-QURANREADER-4.0.1-release.apk
```
Alternatively, transfer the file to the phone and install it directly.

### Web - PWA
Open the URL salehgnutux.github.io/GT-QURANREADER/app on a modern browser. When the install icon appears in the address bar, click it to install the application on your device as a standalone app.

## Summary

GT-QuranReader version 4 is not just an update to a Quran reading application. It is a complete rebuilding of the concept: one application that runs on Linux, Android, and the web, with multiple riwayahs and numerous reciters, synchronized highlighting and smart search, works offline, and has no ads or tracking. All under an open source license that encourages contribution and continuous development.

If you are looking for a professional Quran reader, free of clutter, respecting your privacy, and working on any device you have, this application is worth trying.

## Quick Links

[https://salehgnutux.github.io/GT-QURANREADER](https://salehgnutux.github.io/GT-QURANREADER)

[https://salehgnutux.github.io/GT-QURANREADER/app](https://salehgnutux.github.io/GT-QURANREADER/app)

[https://github.com/SalehGNUTUX/GT-QURANREADER](https://github.com/SalehGNUTUX/GT-QURANREADER)
