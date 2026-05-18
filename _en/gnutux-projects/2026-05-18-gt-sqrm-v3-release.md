---
layout: post
title: >-
  GT-SQRM v3.0: New Release of Quran Reels Maker with Deterministic Engine and
  Multiple Appearance Modes
category: gnutux-projects
author: GNUTUX
excerpt: >-
  GT-SQRM and GT-SQR are two applications (desktop and web) for creating short
  Quran reels, featuring a deterministic rendering engine that ensures no
  glitches between verses, along with 10 appearance modes, 9 color styles, and 9
  waveform shapes.
image: screenshot_gt-sqrm_v3.png
tags:
  - GT-SQRM
  - GT-SQR
  - Quran
  - Reels
  - Tools
  - Linux
  - Web
  - Open Source
date: 2026-05-18T09:40:00.000Z
lang: en
slug: gt-sqrm-v3-release
---

## The Problem of Glitchy Quran Clips

Anyone who has tried to create short video clips (reels, shorts, TikTok) for Quran verses has faced one annoying issue: glitching between verses. Regular applications export video based on approximate timings, resulting in unwanted gaps or overlaps between clips.

GT-SQRM (GnuTux Short Quran Reels Maker) was built to solve exactly this problem, with version v3.0 introducing a deterministic rendering engine that ensures every frame is exported at its exact designated time.

🔗 **Official Website:** [salehgnutux.github.io/GT-SQRM/](https://salehgnutux.github.io/GT-SQRM/)

## What Are GT-SQRM and GT-SQR?

These are two applications with identical core features, but each runs in a different environment:

GT-SQRM is the desktop version for GNU/Linux systems, available in AppImage, DEB, and RPM formats. It uses ffmpeg in the background for rendering, offering higher performance and advanced options such as manual selection of CRF, preset, and codec type.

GT-SQR is the web version (PWA) that runs directly in the browser and can be installed as an application on mobile phones or computers. It uses the WebCodecs engine with automatic fallback when appropriate codecs are not available.

The two versions have been identical in all major features since version v3.0, with only a few differences stemming from their respective environments. The web version does not support yt-dlp import or batch export, while the desktop version does not support the three mobile display modes.

## What's New in Version v3.0?

### Deterministic Rendering Engine
The most important feature in this release. The engine renders video frame by frame at t = i/FPS exactly, not by estimating time between frames. This ensures no glitches between verses regardless of surah length or effect complexity. On desktop, the engine uses ffmpeg with precise timing commands. On the web, it uses WebCodecs with an automatic fallback system.

### Surah Name at the Top
A dedicated section at the top of the text tab for displaying the surah name. You can control its position, size, and color. Three prefix formats are available: "سُورَةُ [name]" (Surah [name]), "حِزْبُ [name]" (Hizb [name]), or the name alone.

### Ten Verse Appearance Modes
Verses do not appear abruptly. There are ten different transition modes: direct, fade, slide, zoom, drop, rise, blur, rotate, bounce, and left-right. The mixed mode cycles through modes in a fixed order based on the verse number, providing automatic variety without manual intervention.

### Nine Color Styles
Normal, warm, cool, night, desert, cinematic, black-white, sepia, and Ramadan purple. The application works at the pixel level within the unified rendering pipeline, meaning the text remains clearly readable regardless of the selected style.

### Nine Waveform Shapes
To add a visual touch during recitation, you can choose the audio waveform shape from: bars, line, area, dots, mirror, radial, blocks, pulse, and wave3D. The waveform intensity can be multiplied up to 300% for a clearer response.

### Multiple Backgrounds with Crossfade Transition
You can add a playlist of backgrounds (videos or images) and reorder them as desired. The transition between backgrounds is a smooth 500ms crossfade. For each background video clip, you can control its audio independently: play, mute, or specific volume level.

### Search with Diacritic Normalization
The complete Quran (6,236 verses) is stored locally without requiring an internet connection. The search system normalizes diacritics, meaning typing "alfatiha" will find "al-fatiha", and typing "alrahman" will find "al-rahman". Results appear instantly with a gold highlight.

### Word-by-Word Display
During export, you can enable sequential word highlighting that follows the recitation. The current word is highlighted and shaded. There are three different speeds for the sequence, adjustable fade duration, and wrapText layout preservation without jumping.

### YouTube Import (Desktop Only)
Using yt-dlp, you can download videos from YouTube and hundreds of other sites directly within the application. It also supports wget and aria2c for direct links. You can trim videos by time during download to save time and space.

### Platform Templates
Pre-configured templates for video dimensions suitable for each platform: Instagram Reels, YouTube Shorts, TikTok, standard YouTube, Instagram Square, Instagram Portrait, and Cinema. User-defined templates can be saved in localStorage and retrieved with one click.

## Differences Between Versions (Desktop vs Web)

The two versions are identical in core features since v3.0, but there are minor differences arising from the nature of each environment:

GT-SQR (web) runs immediately in the browser without installation, supports PWA and can be installed as an application on mobile phones, and supports three display modes for different phones. However, it does not support yt-dlp or wget import, nor batch export for a list of surahs.

GT-SQRM (desktop) is dedicated to Linux systems, relies on ffmpeg which offers higher performance, and allows the user to manually select CRF, preset, and codec type. It supports importing from YouTube via yt-dlp, downloading direct links via wget and aria2c, batch exporting an entire list of surahs, and displays ffmpeg logs in the interface to monitor the export process.

## Installation

GT-SQRM is available in three formats for Linux systems:

AppImage: A single executable file that requires no installation. Suitable for any modern distribution. Download it, make it executable with chmod +x, then run it directly.

Debian, Ubuntu, and Linux Mint: An official DEB package. Install it with sudo dpkg -i gt-sqrm_3.0.0_amd64.deb followed by sudo apt --fix-broken install.

Fedora, RHEL, and openSUSE: An official RPM package. Install it with sudo dnf install ./gt-sqrm-3.0.0-2.x86_64.rpm.

Before running, it is advisable to verify the file's integrity by comparing the SHA-256 checksum with the one published on the official website.

GT-SQR (web) requires no installation. Simply open the website on any modern browser (Chrome or Edge preferred for full WebCodecs support), and you can install it as a PWA via the browser's install button.

## Building from Source

For developers who want to build the application themselves, they need Node.js 18 or later. Clone the repository, install dependencies with npm install, then build the packages with npm run build:all to produce AppImage, DEB, and RPM in one go. Alternatively, build separately with build, build:deb, and build:rpm.

## Integrating AppImage into the Applications Menu

Using GearLever, available via Flatpak, you can drag the AppImage file into the GearLever window, and it will be automatically integrated into the applications menu with its own icon. DEB and RPM packages handle this task automatically without additional tools.

## Summary

GT-SQRM v3.0 is not just a regular update. It is a fundamental rewrite of the rendering engine to be 100% deterministic, solving the core problem faced by those who create Quran clips. Adding ten appearance modes, nine color styles, and nine waveform shapes provides creative flexibility that was not present in previous versions.

If you are a Quran content creator, a mosque administration wanting to publish daily verses, or an Islamic applications developer, this project is worth trying.

## Quick Links

Official Website: salehgnutux.github.io/GT-SQRM
GT-SQRM Repository (Desktop): github.com/SalehGNUTUX/GT-SQRM
GT-SQR Repository (Web): github.com/SalehGNUTUX/GT-SQR
Live Update Feed (HTMX): salehgnutux.github.io/GT-SQRM/updates.html
GearLever for AppImage Integration: flathub.org/apps/it.mijorus.gearlever
