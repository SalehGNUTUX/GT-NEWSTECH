---
layout: post
title: 'HudMod: A Fast, Lightweight Open-Source Video Editor from an Arab Developer'
slug: hudmod-video-editor
lang: en
category: foss
date: '2026-05-10 21:06:00'
author: GNUTUX
excerpt: >-
  HudMod is an open-source video editor under GPLv3, built on the Godot engine,
  focusing on speed and native Linux support, developed by Arab developer Omar
  Balita.
image: hodmod-video-editor.png
tags:
  - Video Editor
  - Godot
  - FFmpeg
  - Open Source
  - Arab Dev
  - GPLv3
---

## A Gap in the Open-Source Video Editor Landscape

If you're a Linux user, you know the struggle of finding a video editor that is both professional and fast. Some options are heavy and complex, others lack essential features, and many don't fully utilize system capabilities.

**HudMod** was created to fill this gap.

---

## What is HudMod?

**HudMod** is an **open-source** video editor released under the **GNU GPLv3** license. Development began on **June 17, 2025**, by Arab developer **Omar Balita (Omar TOP)**.

> "Hello, I am Omar, a game and application developer on Godot, and a designer and artist on Blender" — Omar Balita

HudMod uses the **Godot engine** in the background, along with **FFmpeg** for media decoding and processing.

🔗 **Official Repository:** [github.com/OmarBalita/HudMod-Public](https://github.com/OmarBalita/HudMod-Public)

---

## Why HudMod?

The developer clearly states the vision:

> "I started working on this project to fill a void in current video editors, especially among free or open-source options. Furthermore, it aims to run natively on Linux without complex technical hurdles."

### Main Goals:
- ✅ **Focus on Linux** and fast workflow
- ✅ **Build the first stable version** and present it to all users
- ✅ **Build a community of supporters** to ensure sustainability (providing a modest monthly salary for everyone working on it)

---

## Current Features

HudMod offers a range of competitive features:

| Feature | Description |
|---------|-------------|
| **Real-time playback** | Instant preview in real time |
| **Components-based effects** | Flexible component-based effect system |
| **Animation for all properties** | Any property can be animated |
| **Custom interface** | Multi-monitor support |

---

## Development Status (May 2026)

HudMod is currently in **Alpha** stage. You can try it from the **Releases** section on GitHub.

The **first Alpha version** was launched alongside this article's publication. Version **1.0.0** is expected to be completed by **early 2027**.

### Planned Features (Next Seven Months):

#### Core Structure & Effects
- Build integrated core structure for **Transitions**
- Design various transition effects
- Add **Render-Pass Object** (crucial for complex effects)
- Support **Polygon drawing** (essential for Masking)

#### Performance Improvements
- **Hardware Acceleration** support for video decoding
- **Hardware Acceleration** support for video encoding/exporting
- **Pooling system** for reusing previously opened videos
- Improve **Video Caching** system to avoid errors
- Batch audio decoding (instead of all at once)

#### UI & Workflow
- **Drag and Drop** for files from outside the app
- Zoom in-out and navigation for the **Viewport**
- Select and modify basic properties (position, rotation, scale) directly through the Viewport interface
- Adjust video and audio speed with **Curve** support
- Separate audio from video
- Capture a frame from video as a standalone image

#### Color Grading & Output
- Build **Color Grading** interface with LGG controls
- Add **Rendering Presets** and **Project Settings Presets**
- Support **up to 12-bit color depth** for media at Shaders/Effects level

---

## Setup Guide

### Requirements
- **Godot 4.6+ (Mono Version)**

### Installation Steps
```bash
# 1. Download HudMod files from the repository
git clone https://github.com/OmarBalita/HudMod-Public.git
cd HudMod-Public

# 2. Download the appropriate VideoCodec release for your system from:
# https://github.com/OmarBalita/HudMod-Public/releases

# 3. Place the VideoCodec binary along with its associated FFmpeg libraries (.dlls or .sos) into:
# addons/ffmpeg_codec/

# 4. Open HudMod using Godot 4.6+ (Mono Version)
```

---

## Why This Matters for FOSS and Arab Development

**HudMod** represents more than just a video editor:

- 🇲🇦 **An Arab developer** leading an ambitious project competing globally
- 🎯 **Focuses on Linux** — a platform neglected by many video application developers
- 📖 **Fully open source** under GPLv3 — anyone can contribute or fork
- 🧠 **Uses Godot** — the open-source game engine, opening doors for Godot developers to contribute

> The project is still in its early stages, but the vision is clear and the roadmap is defined. This is exactly the time to contribute and support.

---

## Quick Comparison with Open-Source Alternatives

| Feature | HudMod | Shotcut | Olive | Kdenlive |
|---------|--------|---------|-------|----------|
| **Godot Engine** | ✅ | ❌ | ❌ | ❌ |
| **Hardware Acceleration (planned)** | ✅ | Partial | ❌ | ✅ |
| **Fully Custom UI** | ✅ | ❌ | ✅ | ❌ |
| **Components Effect System** | ✅ | ❌ | ❌ | ❌ |
| **Animation for all properties** | ✅ | ❌ | ❌ | Partial |
| **Linux Focus** | ✅ | ✅ | ✅ | ✅ |

---

## Summary

**HudMod isn't just another video editor — it's an ambitious Arab-led project rethinking how open-source video editors should be built.**

By using Godot as a foundation, HudMod offers tremendous flexibility and a modern workflow. It's still in Alpha, but the roadmap is clear, and developer Omar Balita is looking for a supportive community to achieve the dream: **a professional, fast, lightweight video editor that runs natively on Linux and is owned by the community.**

If you're interested in video editing, Godot development, or supporting Arab open-source projects, this project deserves your attention.

---

## Quick Links

- [GitHub Repository (HudMod-Public)](https://github.com/OmarBalita/HudMod-Public)
- [Releases Page](https://github.com/OmarBalita/HudMod-Public/releases)
- [Support on Patreon](https://patreon.com/OmarBalita)
- [Discord Server](https://discord.gg/8wA3DrMqC3)
- [Download from Itch.io](https://omarbalita.itch.io/hudmod)

---
