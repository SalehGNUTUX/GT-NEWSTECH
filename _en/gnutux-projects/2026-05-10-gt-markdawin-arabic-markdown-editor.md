---
layout: post
title: 'GT-MARKDAWIN: A Complete Offline Arabic Markdown Editor'
slug: gt-markdawin-arabic-markdown-editor
lang: en
category: gnutux-projects
date: '2026-05-10 01:00:00'
author: GNUTUX
excerpt: >-
  GT-MARKDAWIN is a complete standalone Arabic Markdown editor built with
  Electron, React, and TypeScript. It works fully offline on Linux and Android.
image: markdawin-en.jpg
tags:
  - Text Editor
  - Markdown
  - Arabic
  - Linux
  - Android
  - Electron
  - React
  - FOSS
---

## Arabic Writing Deserves Specialized Tools

Arabic writers and developers have long suffered from a lack of specialized tools. Most Markdown editors either lack RTL support, don't include built-in Arabic fonts, or require an internet connection.

**GT-MARKDAWIN** — or "Mark Dawwin" (مارك دَوِّنْ) — was designed specifically to fill this gap.

> 🔗 Official Website: [salehgnutux.github.io/GT-MARKDAWIN](https://salehgnutux.github.io/GT-MARKDAWIN/)
> 🔗 Repository: [github.com/SalehGNUTUX/GT-MARKDAWIN](https://github.com/SalehGNUTUX/GT-MARKDAWIN)

---

## What is GT-MARKDAWIN?

GT-MARKDAWIN is a **complete Arabic Markdown editor**, open source, running as a standalone desktop application on Linux and as a native mobile app on Android. The key feature: **it works entirely offline**.

| Technology | Version | Role |
|------------|---------|------|
| **Electron** | 33 | Standalone desktop window + IPC + PDF |
| **Capacitor** | 8 | Native Android app |
| **React** | 18 | Interactive user interface |
| **TypeScript** | 5.7 | Type safety |
| **Vite** | 6 | Blazing fast builds |
| **marked** | 15 | Markdown parsing |
| **KaTeX** | 0.16 | Math equations |
| **highlight.js** | 11 | Code syntax highlighting |

---

## Key Features

### 📝 Advanced Arabic-First Editor
- **Full RTL/LTR support** — Switch text direction without affecting the interface
- **Fixed-width editor font** (Noto Sans Arabic) for clear Arabic writing
- **Preview and export font** customizable from 8 built-in Arabic fonts + custom font imports
- **Search and replace** with occurrence counting and navigation
- **Emoji panel** — Over 3,600 emojis categorized in Arabic and English
- **Drag and drop** to open files instantly
- **Auto-save** every 30 seconds + undo history retaining 50 states

### 👁️ Professional Live Preview
- **Instant preview updates** while typing
- **Code syntax highlighting** with GitHub colors — supports 20+ programming languages
- **KaTeX math equations**
- **Three view modes**: Split · Editor Only · Preview Only

### 📤 Complete Export

| Format | Desktop (Electron) | Android |
|--------|-------------------|---------|
| **Markdown** `.md` | Native save dialog | Saved in Documents/MARKDAWIN/ |
| **HTML** `.html` | Native save dialog | Saved in Documents/MARKDAWIN/ |
| **PDF** | printToPDF with font embedding | Saved as print-ready HTML |

### 🔒 Complete Privacy
- **No external servers** — Everything runs locally
- **No internet required** — Works fully offline
- **No tracking or analytics** — Your data is yours alone

---

## Download & Installation

| Package | Platform | Link |
|---------|----------|------|
| **AppImage** | All Linux Distributions | [Download](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN-3.0.0-x86_64.AppImage) |
| **DEB** | Ubuntu / Debian / Mint | [Download](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN_3.0.0_amd64.deb) |
| **RPM** | Fedora / RHEL / CentOS | [Download](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN-3.0.0-x86_64.rpm) |
| **Flatpak** | All Linux Distributions | [Download](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN-3.0.0.flatpak) |
| **APK** | Android 7.0+ | [Download](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN-3.0.0.apk) |

> 🔗 All Releases: [github.com/SalehGNUTUX/GT-MARKDAWIN/releases](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases)

---

## Use Directly in Your Browser

Don't want to install anything? You can use the editor directly from your browser:

- **Version 3.0 (Latest)**: [GT-MARKDAWIN-v3.0/dist/index.html](https://salehgnutux.github.io/GT-MARKDAWIN/GT-MARKDAWIN-v3.0/dist/index.html)
- **Version 2.0 (Classic)**: [GT-MARKDAWIN-v2.0/index.html](https://salehgnutux.github.io/GT-MARKDAWIN/GT-MARKDAWIN-v2.0/index.html)

---

## Built-in Arabic Fonts

| Font | Style | Best For |
|------|-------|----------|
| **Ubuntu Arabic** *(default)* | Modern, clear | General writing, documents |
| **Amiri Quran** | Classic script | Quranic texts |
| **Uthmanic Hafs** | Authentic Ottoman | Holy Quran |
| **Arslan Wessam** | Artistic decorative | Headings, logos |
| **Noto Sans Arabic** | Modern multi-weight | Interfaces, code |

> **Editor font is fixed** to Noto Sans Arabic for writing clarity. **Preview and export font** changes according to your selection. You can also **import custom fonts** (TTF/OTF/WOFF/WOFF2).

---

## Comparison with Previous Version

| Feature | v2.0 | v3.0 |
|---------|------|------|
| **Build Technology** | HTML/JS/CSS | Electron + React + TypeScript |
| **Professional PDF Export** | ❌ Limited | ✅ With font embedding |
| **Code Highlighting** | Basic | 20+ programming languages |
| **Auto-Save** | ❌ | ✅ Every 30 seconds |
| **Android App** | ❌ | ✅ Via Capacitor |
| **Font Import** | ❌ | ✅ TTF/OTF/WOFF |
| **Emoji Panel** | Basic | 3,600+ emojis |
| **Undo History** | Limited | 50 states |

---

## Why This Matters for the FOSS Community

> **GT-MARKDAWIN** is not just another text editor — it's a step toward independence for Arabic software tools.

### Key Benefits:
- **Built specifically for Arabic** — Not just a translated interface of an English editor
- **Absolute privacy** — No servers, no tracking, your data stays on your device
- **Fully open source** — GPL-3.0 license, anyone can audit, develop, or distribute
- **Free platform support** — Linux is the primary platform, not an afterthought
- **Arabic-speaking community** — Documentation and support in Arabic

---

## Quick Links

- 🌐 **Official Website**: [salehgnutux.github.io/GT-MARKDAWIN](https://salehgnutux.github.io/GT-MARKDAWIN/)
- 💻 **GitHub Repository**: [github.com/SalehGNUTUX/GT-MARKDAWIN](https://github.com/SalehGNUTUX/GT-MARKDAWIN)
- 📥 **All Releases**: [github.com/SalehGNUTUX/GT-MARKDAWIN/releases](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases)
- 🚀 **Try Online (v3.0)**: [GT-MARKDAWIN-v3.0/dist/index.html](https://salehgnutux.github.io/GT-MARKDAWIN/GT-MARKDAWIN-v3.0/dist/index.html)
- 📰 **GNUTUX Tech News**: [salehgnutux.github.io/GT-NEWSTECH](https://salehgnutux.github.io/GT-NEWSTECH)
- 🌍 **GNUTUX Projects**: [salehgnutux.github.io/gnutux](https://salehgnutux.github.io/gnutux/)
- 🐘 **Mastodon**: [linuxrocks.online/@gnutux](https://linuxrocks.online/@gnutux)
- 📺 **YouTube**: [youtube.com/@gnutux](https://www.youtube.com/@gnutux)
- 🐦 **Twitter/X**: [twitter.com/GnuGnutux](https://twitter.com/GnuGnutux)

---

## Summary

**GT-MARKDAWIN is not just another Markdown editor — it's a rethinking of how Arabic writers and developers interact with text.**

By combining Electron and React with deep Arabic foundations (RTL, built-in fonts, PDF export with embedded fonts), the project delivers an Arabic writing experience unmatched by any other Markdown editor — and most importantly: **everything works offline, and your data stays on your device**.

If you're an Arabic writer or developer looking for an editor that's **truly yours**, this project deserves an immediate download.

---
