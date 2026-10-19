---
layout: post
title: >-
  Friction: An Open Source Motion Graphics Application Offering a Real
  Alternative to After Effects
category: foss
author: GNUTUX
excerpt: >-
  Friction is an open source (GPL-3.0) motion graphics application that lets you
  create vector and raster animations for the web and video. Built on Qt, Skia,
  and FFmpeg, it features multi-scene editing, an ECMAScript expression editor,
  and SVG export via the SMIL standard. It is a real alternative to Adobe After
  Effects, with a clear stance against AI-generated code.
image: friction-gnutux-en.png
tags:
  - Friction
  - Motion Graphics
  - After Effects
  - SVG
  - SMIL
  - C++
  - Qt
  - Skia
  - GPLv3
also_in:
  - tech-news
date: 2026-10-19T06:50:00.000Z
lang: en
slug: friction-motion-graphics-editor
---

## Open Source Motion Graphics Within Everyone's Reach

For decades, Adobe After Effects has been the first and last choice for motion graphics artists. Its power is unquestionable, but it comes with a high monthly cost and a complete lock-in to a proprietary ecosystem. Open source alternatives were either feature-limited, abandoned, or restricted to a single platform.

Friction came to change this equation. It is an open source (GPL-3.0) motion graphics application that aims to be a real and practical alternative to After Effects on GNU/Linux, Windows, and macOS.

🔗 **Official Website:** [friction.graphics](https://friction.graphics)
🔗 **Official Repository:** [github.com/friction2d/friction](https://github.com/friction2d/friction)
🔗 **Documentation:** [friction.graphics/documentation](https://friction.graphics/documentation)

## What Is Friction?

Friction is a complete motion graphics application built in **C++**, using the **Qt** framework for the interface, the **Skia** engine for rendering, **FFmpeg** for media handling, and **OpenGL** for graphics acceleration. It allows you to create vector and raster animations for the web and video.

The project began as a development of **enve** (by Maurycy Liebner), then forked under the name Friction by Ole-André Rodlie, maintaining the open spirit and focus on performance.

## Key Features

### High Performance
Friction relies on a scalable, high-performance vector and raster pipeline, using GPU and CPU acceleration, built on Skia. This makes it capable of handling complex projects without noticeable slowdown.

### Web Animations via SVG and SMIL
One of Friction's most notable features is its ability to export vector animations that play directly in the browser, using the **SMIL** (Synchronized Multimedia Integration Language) standard recommended by the W3C. This means you can create lightweight interactive animations that work on the web without needing video or complex JavaScript.

### Multiple Scenes and Timelines
Unlike applications that allow only one scene, Friction lets you work on multiple scenes at once, with multiple viewers and timelines. You can arrange them according to your needs and screen real estate.

### Powerful Expression Editor
For advanced users, Friction supports **ECMAScript** expressions in parameters and effects. It includes a complete code editor with autocompletion, syntax highlighting, custom functions, and more. This opens the door to precise programmatic control over every aspect of the animation.

### Text and Path Effects
Friction includes a diverse range of effects for enhancing vector graphics and text, with more coming in future releases.

### Shader Effects (Experimental)
Friction experimentally supports user-customizable shader effects, with a limited set included. This allows developers to create custom visual effects.

## A Clear Stance: No to AI-Generated Code

In an era where projects are racing to integrate AI, the Friction team has taken a clear principled stance. The contribution guide states that **all contributions must be original work**. AI-generated code is considered "tainted" and will not be accepted directly. Non-developers may submit generated drafts strictly to illustrate features or concepts, but a maintainer or contributor must rewrite the code before it can be merged.

This stance reflects a commitment to quality and transparency, and rejects the idea that AI can replace a deep human understanding of code.

## Technologies Used

| Component | Description |
|-----------|-------------|
| **Qt** | Cross-platform framework for building user interfaces |
| **Skia** | Open source 2D graphics library from Google |
| **FFmpeg** | Multimedia framework for decoding, encoding, and converting media |
| **OpenGL** | API for high-performance graphics |

## License

Friction is licensed under **GPL-3.0-only**, a free license that guarantees users the freedom to use, study, modify, and distribute. Copyright is held by Ole-André Rodlie and contributors, with attribution to enve (copyright Maurycy Liebner).

## Download and Installation

Friction can be downloaded from the official website or from the releases page on GitHub. It is available in several formats:

- **Linux:** AppImage, or DEB/RPM packages.
- **Windows:** EXE installer.
- **macOS:** DMG file.

The application can also be built from source, with detailed instructions for each platform.

## Summary

Friction is one of the most important open source motion graphics projects in recent years. It combines high performance, advanced features like SMIL and ECMAScript, and a principled stance on generative AI. It may still be less mature than After Effects in some aspects, but it offers a real and free alternative for professionals and hobbyists alike, proving that motion graphics does not necessarily require expensive monthly subscriptions.

## Quick Links

[https://friction.graphics](https://friction.graphics)

[https://github.com/friction2d/friction](https://github.com/friction2d/friction)

[https://friction.graphics/documentation](https://friction.graphics/documentation)

Published in the Free and Open Source Software section – Graphics and Media
