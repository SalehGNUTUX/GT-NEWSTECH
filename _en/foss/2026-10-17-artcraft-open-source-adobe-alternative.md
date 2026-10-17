---
layout: post
title: >-
  ArtCraft: An Open Source Project Building Native Alternatives to Adobe,
  Office, and AutoCAD
category: foss
author: GNUTUX
excerpt: >-
  ArtCraft is an open source project developed by Brandon Thomas with the help
  of AI, offering over 12 native applications written in Rust as alternatives to
  Adobe, Microsoft Office, and AutoCAD. The applications are lightweight, run on
  Linux, Windows, and macOS, and some can even open real PSD files while
  preserving layers.
image: artcraft-gnutux-en.png
tags:
  - ArtCraft
  - PhotoCraft
  - VectorCraft
  - FilmCraft
  - Rust
  - Adobe Alternatives
  - Free Software
  - Linux
also_in:
  - tech-news
date: 2026-10-17T07:25:00.000Z
lang: en
slug: artcraft-open-source-adobe-alternative
---

## A Project Born from Frustration... and Grown into a Revolution

On September 30 and October 1, 2026, software developer Brandon Thomas, known by his Reddit handle "ai_art_is_art", published a collection of seven applications on GitHub under the name **ArtCraft**. The stated reason was simple: frustration with Adobe's authoritarian policies and the cancellation fees it imposes on users. But what began as a personal reaction quickly grew into one of the largest free software projects in recent years.

🔗 **Official Repository:** [github.com/storytold](https://github.com/storytold)
🔗 **Official Website:** [getartcraft.com](https://getartcraft.com)

## What Is ArtCraft?

ArtCraft is an open source project that aims to build **native** alternatives to famous proprietary creative software, using the **Rust** language from scratch. The applications are **not wrappers** around Adobe software, nor are they copies of its code. They are **clean-room reimplementations**: reading public specifications, observing behavior, and then writing the code entirely independently.

The result is **extremely lightweight** applications that start **instantly**, run natively on Linux, Windows, and macOS, and support WebAssembly for running some of them in the browser.

## The Applications It Offers

### The Adobe Creative Cloud Family

| Application | Alternative to | Status | Key Features |
|-------------|----------------|--------|--------------|
| **PhotoCraft** | Photoshop | Early Alpha | Layers, masks, adjustment layers, text, vectors, brushes, reading and writing real PSD files while preserving layers |
| **VectorCraft** | Illustrator | In Development | Pen tool, direct selection, boolean operations, pathfinding, mesh gradients, image tracing, SVG and PDF export |
| **FilmCraft** | Premiere Pro | In Development | Multi-track editing, 3-point editing, color grading, ~55 video effects, 30 transitions, built-in H.264, HEVC, and ProRes encoders |
| **LightCraft** | Lightroom | In Development | Non-destructive editing, exposure curve, 8-band color mixer, sky/subject/background masks, RAW support (DNG, CR2, ARW, NEF) |
| **PdfCraft** | Acrobat Pro | Early Alpha | Read, organize, and protect PDFs, lightweight (100 MB) and fast |
| **EffectCraft** | After Effects | In Development | Animation and visual effects |
| **DesignCraft** | InDesign | In Development | Page layout and publishing |

### The Microsoft Office Family

| Application | Alternative to | Key Features |
|-------------|----------------|--------------|
| **WordCraft** | Word | Word-like toolbar with Mailings tabs, text processing, tables |
| **GridCraft** | Excel | Automatic recalculation of SUM, AVERAGE, and MAX formulas, spreadsheets |
| **DeckCraft** | PowerPoint | Slide shows and presentations |

### Additional Applications

| Application | Alternative to |
|-------------|----------------|
| **SoundCraft** | Avid Pro Tools (audio editing) |
| **CADCraft** | AutoCAD (computer-aided design) |
| **FigCraft** | Figma / Adobe XD (interface design) |

## Supported Platforms

All applications are written in Rust and designed to run **natively** on:
- **Linux** (x86_64 and ARM64) — available as AppImage, DEB, RPM, and Flatpak
- **Windows** (x64 and ARM64) — MSI installers
- **macOS** (Universal, Intel and Apple Silicon)
- **WebAssembly** — some applications can run directly in the browser

The project comes with the **ArtCraft Launcher**, which installs all applications in one place, with SHA-256 checksum verification for each release.

## How to Build and Contribute

The project is fully open source under the **MIT / Apache-2.0** dual license, allowing free use, modification, and distribution.

To build any application from source:
```bash
git clone https://github.com/storytold/photocraft
cd photocraft
cargo build --release
```

To contribute, developers can:
- Submit pull requests to improve features
- Report bugs on GitHub Issues
- Help with translation and documentation
- Join the project's Discord community

## Will This Contribute to More Adoption of GNU/Linux?

This is the most important question. **Yes, it is likely to contribute significantly.**

The reason is simple: one of the biggest obstacles preventing users from moving from Windows or macOS to Linux is **the absence of native Adobe applications**. Users of Photoshop, Illustrator, and Premiere Pro find strong alternatives in GIMP, Inkscape, and Kdenlive, but they are not identical in interface or workflow. This means a new learning curve, which is a real psychological barrier.

**ArtCraft addresses this problem directly.** PhotoCraft, according to tests, opens real PSD files with their layers and masks, in an interface that closely resembles Photoshop. For a user who has been using Photoshop for ten years, this means that moving to Linux no longer means "learning a new program," but using a program that **knows how it works**.

In addition, the applications are written in Rust, which makes them **extremely lightweight** and consume far fewer resources than Electron applications. On an older machine, this means better performance than Windows itself.

## Challenges and Criticisms

The project is not without challenges:
- **Application maturity:** Most are in "Early Alpha" or "In Development" stages. They may not yet be suitable for daily professional work.
- **Use of AI:** The applications were written with the help of Claude Opus, which sparked discussions about code quality and security.
- **Format limitations:** The applications open public formats like PSD and SVG, but do not yet open proprietary projects like `.aep` (After Effects) or `.prproj` (Premiere).

## Summary

ArtCraft is not just a software project. It is a **statement** that professional software can be free, lightweight, fast, and free of monthly subscriptions or vendor lock-in. For users who have considered moving to Linux but hesitated because of Adobe software, ArtCraft offers a **real reason** to try it. The project is still in its early days, but its rapid development pace and community interest (over 13,000 stars on PhotoCraft alone) indicate that this trend will continue.

## Quick Links

[https://github.com/storytold](https://github.com/storytold)

[https://getartcraft.com](https://getartcraft.com)

[https://getartcraft.com/apps](https://getartcraft.com/apps)

[https://github.com/storytold/craft-launcher](https://github.com/storytold/craft-launcher)

Published in the Free and Open Source Software section – Creative Tools
```
