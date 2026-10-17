---
layout: post
title: >-
  Audacity 4: The Biggest Update in the History of the Beloved Open Source Audio
  Editor
category: foss
author: GNUTUX
excerpt: >-
  The Audacity team has released version 4, the biggest update in the program's
  26-year history. The application moves to a Qt6-based interface, introduces
  non-destructive clip editing, customizable workspaces, a new .aup4 project
  format, and broader plugin support.
image: audacity-4-future-open-source-audio-en.png
tags:
  - Audacity
  - Audio Editor
  - Open Source
  - Qt6
  - Non-Destructive Editing
  - Muse Group
  - GPLv3
date: 2026-10-11T06:45:00.000Z
lang: en
slug: audacity-4-release
---

## The Biggest Leap in Audacity's History

Since its launch in 2000, Audacity has become one of the most famous audio editors in the world, with hundreds of millions of downloads. But for years, the application remained attached to its old interface, adding features on top of a design that had not changed in two decades. On September 2, 2026, Muse Group released version 4, which the team describes as **"the biggest update in the program's history"**.

The new release does not just polish the interface. It rebuilds the application from the inside to be ready for the coming decades. In this article, we look at the highlights of Audacity 4 and how it changes the way you work with audio.

🔗 **Official Website:** [audacityteam.org/audacity-4](https://www.audacityteam.org/audacity-4/)
🔗 **Download Page:** [audacityteam.org/download](https://www.audacityteam.org/download/)
🔗 **Release Notes:** [audacityteam.org/changelog](https://www.audacityteam.org/changelog/)

## A New Interface Built on Qt6

The biggest technical change in Audacity 4 is the move from the old wxWidgets framework to **Qt6**. This change is not merely cosmetic. It gives the application a modern foundation for native rendering on high-DPI screens and improves performance across all platforms.

The new interface looks more modern, with the ability to drag panels and toolbars, rearrange them, turn them into floating windows, or hide them. Key interface features include:

- **Workspaces:** Switch between different toolbar layouts depending on the task. The **Modern** layout is the default, while **Classic** mimics the Audacity 3 arrangement for those who want to stay with the familiar. You can also build your own workspace.
- **Themes:** Light and dark modes, each with high-contrast variants for accessibility.
- **Accent Color:** Choose an accent color and apply it throughout the application.
- **Clip Colors:** Give each clip its own color, or keep the classic look from Audacity 3.

## Non-Destructive Editing: A Revolution in Workflow

The biggest shift in the user experience is the **Non-Destructive Editing** model. In previous versions, cutting a clip meant permanently deleting the cut portion. In Audacity 4, you can cut a clip and then restore the audio simply by dragging its edge back out.

Clips have also become **overlappable** on the timeline. Previously, if you tried to move a clip over another, it would stop in place. Now you can move it freely over other clips, and the clip underneath is "eaten" where they overlap.

### New Editing Tools

- **Trim and Stretch Handles:** Each clip has two handles: the top one trims, the bottom one stretches. This simple feature makes precise editing much faster.
- **Split Tool:** A new tool that lets you cut a clip into two parts easily, by pressing `S` and clicking.
- **Direct Sample Editing:** No need to switch to "Draw" or "Multi-tool" mode anymore. Zoom in to individual samples, and the cursor turns into a pencil you can drag directly.

## Editing Effects and Project Management

### Redesigned Effects

Every effect window has been rebuilt, inside and out. Core effects such as **Compressor**, **Filter Curve**, **Graphic EQ**, **Limiter**, and **Reverb** are now easier to use and visually clearer.

More importantly, effects can now work as **Realtime Effects**. Instead of applying an effect and waiting for the audio to be rewritten, you can add it as a layer on the track, adjust it during playback, and remove it at any time. No change is written to the actual audio until you export.

### New Project Format: .aup4

Projects in Audacity 4 are saved in the new **.aup4** format. The good news is that all **.aup3** files from version 3 open directly in version 4 without any conversion or data loss.

### audio.com Integration

Audacity 4 integrates with the **audio.com** platform, allowing you to save your projects to the cloud and access them from any device, or publish audio directly to your profile on the platform.

## Plugins and Platforms

Audacity 4 supports the following plugin formats:
- **VST3** and **VST** on Windows, macOS, and Linux
- **LV2**, an open standard that loads directly without wrappers
- **Audio Units** on macOS only
- **LADSPA**

**Nyquist** and **VAMP** plugins from Audacity 3 are no longer supported, but the team leaves the door open to adding them later, along with new formats like CLAP.

You can also browse thousands of plugins, samples, and effects from **MuseHub** directly inside the application, via the "Get Effects" button.

## What Has Changed in the Workflow?

### Per-Track Metering

Every track now has its own **Per-track Metering**. While recording, the meter shows input levels; the rest of the time, it shows playback levels. This gives you more precise control over your mix.

The main playback meter can now be **positioned vertically**, making use of the application's full height.

### Markers and Regions

You can place **Markers** on specific points in the timeline, or **Regions** to define entire sections. These labels can be used to export audio based on your naming, making it easy to split a podcast or album into separate segments.

### Tool Modes

The old tool modes (Select, Envelope, Draw, Multi-tool) are gone. Instead:
- **Envelopes** have become a visible layer that can be shown or hidden with the "Automation" button.
- **Draw** activates automatically when you zoom in deeply.
- **Split** is a new standalone tool.

## What Was Lost?

It is important to note that Audacity 4.0 is not fully compatible with all features from version 3. The following features are **currently unavailable** in version 4:
- Time Tracks
- Note/MIDI Tracks
- Mixer and Macro Manager
- Scripting pipe
- VAMP and LADSPA support
- Play-at-Speed

These features may return in future updates, but they are absent for now.

## Download and Installation

### Supported Platforms
Audacity 4 is available for **Windows**, **macOS**, and **Linux**, under the free and open source **GPLv3** license.

### On Linux
The application is available as an **AppImage** for x86_64 and ARM64 architectures. It can also be installed via the package manager in most distributions, or via a PPA for Ubuntu users.

```bash
# AppImage
chmod +x audacity-linux-4.0.1-x86_64.AppImage
./audacity-linux-4.0.1-x86_64.AppImage
```

### On Windows
An MSI installer is available for x86_64 and ARM64, along with a portable version. It can also be installed via the Microsoft Store or MuseHub.

### On macOS
A universal DMG file is available for both Intel and Apple Silicon processors, along with separate builds for each architecture.

### First Launch
When you open Audacity 4 for the first time, you will go through a five-page setup wizard: choosing the theme, clip style, workspace, signing in to audio.com (optional), and update and privacy settings. All of these can be changed later from the preferences.

## Summary

Audacity 4 is not just a numerical update. It is a re-founding of the world's most popular audio editor. The move to Qt6, non-destructive editing, redesigned effects, and workspaces are all changes that place Audacity among modern audio tools, without giving up being free and open source. Some long-time users may miss certain features, but the direction is clear: Audacity is crossing into a new era.

## Quick Links

[https://www.audacityteam.org/audacity-4/](https://www.audacityteam.org/audacity-4/)

[https://www.audacityteam.org/download/](https://www.audacityteam.org/download/)

[https://www.audacityteam.org/changelog/](https://www.audacityteam.org/changelog/)

[https://github.com/audacity/audacity/releases](https://github.com/audacity/audacity/releases)

Published in the Free and Open Source Software section – Audio Tools
```
