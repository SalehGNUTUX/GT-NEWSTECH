---
layout: post
title: >-
  GT-SIRM v1.2.0: Complete Islamic Reels Maker with 6 Content Modules and
  Advanced Clip Controls
category: gnutux-projects
author: GNUTUX
excerpt: >-
  GT-SIRM is an open source (GPLv3) application for creating professional
  Islamic reels, featuring 6 content modules (Quran, Hadith, Dhikr, Allah's
  Names, Supplications, Wisdom) with a deterministic rendering engine,
  multi-background clips, and a comprehensive Undo/Redo system. Available on
  Linux (AppImage, DEB, RPM), Web (PWA), and Android (APK).
image: gt-sirm-1.2-gnutux.jpeg
tags:
  - GT-SIRM
  - Islamic Reels
  - Dawah Tools
  - Islamic Content
  - Linux
  - PWA
  - Open Source
also_in:
  - foss
date: 2026-07-15T18:25:00.000Z
lang: en
slug: gt-sirm-islamic-reels-maker
---

## A Complete Open Source Islamic Content Creator

Creating Islamic content in the age of short reels requires tools that combine ease of use with professionalism, along with reliable and diverse content. GT-SIRM was built to meet this need through a single open source application that brings together six core content modules, an integrated video editor, and a deterministic rendering engine that ensures high quality without glitches.

🔗 **Official Website:** [salehgnutux.github.io/GT-SIRM](https://salehgnutux.github.io/GT-SIRM)
🔗 **Web App:** [salehgnutux.github.io/GT-SIRM/GT-SIRM-WEB](https://salehgnutux.github.io/GT-SIRM/GT-SIRM-WEB/)
🔗 **GitHub Repository:** [github.com/SalehGNUTUX/GT-SIRM](https://github.com/SalehGNUTUX/GT-SIRM)

## Islamic Content Modules (6 Modules, 6557+ Items)

GT-SIRM includes six integrated content modules, each can be enabled or disabled as needed:

**Quran Module:** 114 Surahs and 6236 verses with multiple reciters and 60 translations.

**Hadith Module:** 90 hadiths from Al-Arba'in Al-Nawawiyyah and Riyadh Al-Saliheen with authentication status.

**Dhikr Module:** 267 remembrances across 132 categories, adapted from the GT-HISNMUSLIM project (Hisn Al-Muslim).

**Allah's Beautiful Names Module:** 100 names with meanings and Quranic evidence.

**Authentic Supplications Module:** 32 supplications from the Quran and Sunnah with source and occasion.

**Wisdom and Admonitions Module:** 32 sayings from the Salaf, including Companions, Followers, and Imams.

Additionally, a **Free Text Editor** allows inputting any external text.

## Version 1.2.0 Features

### Multi-Background Clips with Full Control

Version 1.2.0 introduces a set of advanced features for managing background clips:

- **Hidden for each clip:** Hides a clip without deleting it, skipping it in preview and export.
- **Per-clip trimming:** Set start and end points for each clip independently.
- **11 transition styles:** fade, wipe, slide (4 directions), circle (open+close), radial, dissolve.
- **Edge smoothness:** 0-100% through a true gradient mask for geometric transitions.
- **Per-clip transition override:** Global option plus per-clip customization.
- **Golden flash:** Visual tracking with automatic scrolling.

### Comprehensive Undo/Redo System

- Undo/Redo for deletion and move operations.
- Immediate restoration of deleted items.
- Shortcuts: Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z.

### Watermark

- Toggle on/off to hide without deleting the text.
- Slider for adjusting edge offset.

### Full Save and Restore

- Complete snapshot of all content modules.
- Preserves collapsible section states.
- Preserves clip order and settings.

### Critical Bug Fixes (12+)

- Fixed deterministic seek in web export.
- Fixed old clip flash after crossfade.
- Fixed audio continuing throughout exported video.
- Fixed random restoration order.
- Fixed WebM trim not respected in preview.
- Fixed audio not working after project restore.
- Fixed playback starting from active clip instead of first.
- Fixed resume from stop position instead of beginning.
- 4 additional fixes.

## Core Technical Features

### Deterministic Rendering Engine
Inherited from GT-SQRM v3.0. Uses ffmpeg on desktop and WebCodecs on the web, rendering frame by frame with no glitches.

### Chromakey
Removes green/black backgrounds using YCbCr with spill suppression, working in both preview and export.

### Audio and Visual Effects
Audio: Reverb, Echo, 3-band EQ. Visual: Vignette, Grain, Stars, Rays, Bokeh, Pixelate, Mosaic, Ripple, Wave, Swirl, Kaleidoscope, Glitch, Old Film.

### 16 Local Arabic Fonts
Amiri Quran, Scheherazade, Lateef, Harmattan, Reem Kufi, Aref Ruqaa, Cairo, Tajawal, and more, all embedded without internet connection.

### 100% Offline Capable
Quran stored locally, all modules in classic scripts, fonts local, PWA with Service Worker.

### .gtsirm Format + Auto-Save
Auto-save for every project, missing resource recovery, system file association.

## Cross-Platform Compatibility

GT-SIRM is available in three feature-identical versions:

| Version | Packages |
|---------|----------|
| **Desktop (Linux)** | AppImage (182 MB), DEB (137 MB), RPM (180 MB) |
| **Web (PWA)** | Runs directly in the browser |
| **Android** | APK (13 MB) |

## Download

### Linux - AppImage (All Distributions)
```bash
chmod +x GT-SIRM-1.2.0.AppImage
./GT-SIRM-1.2.0.AppImage
```

### Linux - DEB (Debian/Ubuntu/Mint)
```bash
sudo dpkg -i gt-sirm_1.2.0_amd64.deb
```

### Linux - RPM (Fedora/RHEL/openSUSE)
```bash
sudo dnf install ./gt-sirm-1.2.0-2.x86_64.rpm
```

### Android (APK)
Download the APK file and install manually.

### Web (PWA)
Open the link in a modern browser. Can be installed as a standalone app via the install icon in the address bar.

## Summary

GT-SIRM is not just a reels-making tool. It is a complete ecosystem for creating Islamic content. It combines six reliable content modules, a professional video editor, and a deterministic rendering engine, with full Arabic support and local fonts, working completely offline. It is an ideal tool for preachers, teachers, and Islamic content creators.

## Quick Links

[https://salehgnutux.github.io/GT-SIRM](https://salehgnutux.github.io/GT-SIRM)

[https://salehgnutux.github.io/GT-SIRM/GT-SIRM-WEB](https://salehgnutux.github.io/GT-SIRM/GT-SIRM-WEB/)

[https://github.com/SalehGNUTUX/GT-SIRM](https://github.com/SalehGNUTUX/GT-SIRM)

[https://github.com/SalehGNUTUX/GT-SIRM/releases](https://github.com/SalehGNUTUX/GT-SIRM/releases)

Published in GNUTUX Projects – Open Source Islamic Tools
