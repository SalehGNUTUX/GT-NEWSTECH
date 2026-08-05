---
layout: post
title: >-
  GT-SALAT 2.0: A Comprehensive Islamic Application for GNU/Linux with Prayer
  Times and Quran
category: gnutux-projects
author: GNUTUX
excerpt: >-
  GT-SALAT is a comprehensive open source Islamic application for GNU/Linux,
  combining prayer times with 22 calculation methods, adhan with adjustable
  notifications, dhikr, the Holy Quran with Tafsir, Hisn Al-Muslim,
  supplications, hadiths, and Quranic radio, along with an Android version.
image: gt-salat-post-gnutux.png
tags:
  - GT-SALAT
  - Prayer Times
  - Adhan
  - Dhikr
  - Quran
  - Islamic Apps
  - Linux
  - Android
date: 2026-08-05T11:50:00.000Z
lang: en
slug: gt-salat-islamic-app
---

## From a Terminal App to a Full Graphical Interface

GT-SALAT is the next generation of the GT-salat-dikr application, which previously only worked through the terminal. Version 2.0 adds a modern graphical interface built with Electron, React, and TypeScript, while retaining all the features of the original version and adding comprehensive Islamic content that works offline.

🔗 **Official Website (Desktop):** [salehgnutux.github.io/GT-SALAT](https://salehgnutux.github.io/GT-SALAT)
🔗 **Official Website (Mobile):** [salehgnutux.github.io/GT-SALAT-PHONE](https://salehgnutux.github.io/GT-SALAT-PHONE)
🔗 **GitHub Repository:** [github.com/SalehGNUTUX/GT-SALAT](https://github.com/SalehGNUTUX/GT-SALAT)

## Prayer Times and Adhan

### Accurate Prayer Time Calculation
The application supports 22 different calculation methods, including Umm Al-Qura, ISNA, Muslim World League, Morocco, Algeria, and others. It uses a dual source: an API first, with a local fallback calculation that works offline.

### Customizable Notifications and Adhan
- Notifications before prayer with adjustable timing.
- Adhan playback at prayer time with two options (full and short).
- Support for custom adhan uploads in OGG, MP3, and WAV formats.
- Supplication after adhan and dhikr after prayer.
- Adhan volume control with preview for each sound.
- Notification style per prayer (adhan, ringtone, or silent).
- Daily reminders and 12/24 hour time format.

## Dhikr and Islamic Content

The application includes 13 sections of Islamic content, all embedded in the package and working offline:

### The Holy Quran and Tafsir
- 114 Surahs in Uthmani script with simplified Tafsir for each verse.
- Comprehensive search across 6236 verses with Arabic normalization that matches "Al-Rahman" regardless of its spelling.
- Bookmarks and reading position tracking.
- Automatic scrolling with a delay proportional to each verse's length.

### Hisn Al-Muslim and Dhikr
- Hisn Al-Muslim categorized into 132 sections with 267 remembrances, with search and a repetition counter.
- Morning and evening dhikr sessions with a progress bar saved for the day.
- A digital tasbih with a target and cumulative total.
- Random dhikr display on the main dashboard.

### Hadiths, Supplications, and Wisdom
- Al-Arba'in Al-Nawawiyyah and selections from Riyadh Al-Saliheen (90 hadiths).
- 28 authentic supplications.
- The 99 names of Allah with meanings and evidence.
- 32 wise sayings and 59 events from Islamic history and biography.

### Radio and Ramadan Timetable
- 36 live Quranic radio stations, editable and expandable.
- A player that continues playing when navigating between sections.
- Complete Ramadan timetable with Imsak, Fajr, and Maghrib times.

## System and Terminal Integration

### Terminal Integration
When opening any new terminal, it automatically displays:
- The "Bismillah" header.
- A random dhikr.
- The next prayer name, its time, and the remaining time.
Supports bash, zsh, and fish.

### System Integration
- Taskbar icon with a context menu.
- Minimize to taskbar instead of closing.
- Automatic startup with the system.
- Open the prayer times folder directly from settings.
- Desktop notifications via libnotify.

## Modern User Interface

- Dark and light modes.
- Ubuntu Arabic and Amiri Quran fonts embedded and working offline.
- Full RTL Arabic interface.
- Step-by-step setup wizard for first-time configuration.
- Advanced settings: Asr calculation school, Hijri date offset, and Maghribi, Shami, and standard month names.

## Android Version

GT-SALAT is also available for Android with the same content, plus additional features:
- Adhan at its time with notifications.
- Qibla direction.
- Home screen widgets.
- A free version without Google services (suitable for devices without Google services).

🔗 **Download the Phone Version:** [salehgnutux.github.io/GT-SALAT-PHONE](https://salehgnutux.github.io/GT-SALAT-PHONE)

## Updates and Backups

### Automatic Updates (Desktop)
- GT-SALAT automatically checks for new updates.
- When an update is available, a notification appears to the user.
- The update can be downloaded and installed directly from within the application (via AppImage, DEB, or RPM packages).

### Backups (Desktop and Phone)
- The application provides a tool to back up settings and data (prayer times, dhikr, Quran bookmarks, etc.).
- Backups can be easily restored.
- Backups work on both versions (desktop and phone) and between versions, allowing synchronization of settings between devices.

## Download and Installation

### Linux - AppImage (All Distributions)
```bash
chmod +x GT-SALAT-2.0.0-x86_64.AppImage
./GT-SALAT-2.0.0-x86_64.AppImage
```

### Linux - DEB (Debian/Ubuntu/Mint)
```bash
sudo dpkg -i GT-SALAT_2.0.0_amd64.deb
sudo apt-get install -f
```

### Linux - RPM (Fedora/RHEL/openSUSE)
```bash
sudo rpm -i gt-salat-2.0.0-2.x86_64.rpm
```

### Android (APK)
Download the APK file from the releases page on GitHub and install it manually.

### System Requirements
- Operating System: Linux (x86_64)
- Memory: 256 MB
- System Libraries: libnotify, GTK3, ALSA
- Audio Player: mpv (recommended), ffplay, cvlc, paplay, or sox

## Summary

GT-SALAT 2.0 is a comprehensive Islamic application covering the daily needs of a Muslim user: prayer times, adhan, dhikr, Quran, hadiths, supplications, and radio. It combines a modern graphical interface with deep system and terminal integration, with support for backups and automatic updates. It is available for both desktop (Linux) and mobile (Android), making it a complete choice for Muslims across multiple platforms.

## Quick Links

[https://salehgnutux.github.io/GT-SALAT](https://salehgnutux.github.io/GT-SALAT)

[https://salehgnutux.github.io/GT-SALAT-PHONE](https://salehgnutux.github.io/GT-SALAT-PHONE)

[https://github.com/SalehGNUTUX/GT-SALAT](https://github.com/SalehGNUTUX/GT-SALAT)

Published in GNUTUX Projects – Islamic Applications
