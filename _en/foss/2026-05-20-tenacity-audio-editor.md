---
layout: post
title: >-
  Tenacity: Open Source Multi-Track Audio Editor That Competes Confidently with
  Audacity
category: foss
author: GNUTUX
excerpt: >-
  Tenacity is a cross-platform, open-source multi-track audio editor available
  on Windows, Linux, and macOS, supporting VST, LV2, and AU plugins, scripting
  in Nyquist or Python, and advanced signal analysis tools.
image: tenacityaudio.png
tags:
  - Tenacity
  - Audio Editing
  - Open Source
  - Sound
  - Audacity
  - Open Source Alternatives
date: 2026-05-20T18:06:00.000Z
lang: en
slug: tenacity-audio-editor
---

## The Story of Tenacity: A Fork from Audacity

In 2021, Muse Group announced its acquisition of the open-source Audacity project. The company soon raised community concerns after proposing to add user data collection features and changing the terms of service. This fear drove a group of developers to create a new fork called Tenacity.

The goal was clear. Maintain the pure free software spirit, remove any data collection code, and return to the classic interface version that users loved. The team declared that Tenacity would be "Audacity as it was before the company ruined it."

🔗 **Official Website:** [tenacityaudio.org](https://tenacityaudio.org)
🔗 **Main Repository:** [codeberg.org/tenacityteam/tenacity](https://codeberg.org/tenacityteam/tenacity)

## What Is Tenacity Today?

Tenacity is a cross-platform, multi-track audio editor running on Windows, Linux, and macOS. It can record from audio devices, both real and virtual, edit multiple audio files simultaneously, apply effects, and analyze frequencies.

Tenacity differs from Audacity in several key ways.

First, it contains no user tracking or data collection code. This was the original reason for the fork, and the team remains committed to this principle.

Second, the user interface is traditional and not unnecessarily modern. Tenacity maintains the classic Audacity look from before version 3.0, which is still preferred by many engineers who value speed over appearance.

Third, Tenacity supports additional plugin formats: VST2, VST3, LV2, and Audio Units. Here, Tenacity surpasses original Audacity, which requires a separate package to support LV2.

Fourth, Tenacity aims to replace the Nyquist language, which is old and slow, with something more modern in the future, while maintaining current support for Nyquist and Python through named pipes.

## Key Features

### Recording
You can record from multiple sources, including microphones, system output, virtual sound cards, or a combination of them. It supports multi-channel recording up to 32 channels and sample rates up to 384 kilohertz.

### Export and Import of Multiple Formats
Through FFmpeg, it can import and export MP3, WAV, FLAC, OGG, AAC, M4A, WMA, AIFF, and others. Export supports quality up to 32-bit floating point. It also supports video import to extract the audio track.

### High Quality
It supports up to 32-bit floating point, meaning very quiet signals can be amplified or loud signals reduced without quality loss. This prevents clipping and distortion.

### Plug-Ins
It supports several plugin types: VST2, VST3, LV2, which is the preferred standard on Linux, and Audio Units on macOS. External effects such as reverb, compression, and EQ can be applied.

### Scripting
It has a built-in language called Nyquist, derived from Lisp, suitable for writing custom effects. Tenacity can also be controlled from other programs through named pipes using any language that supports text files, such as Python or Perl.

### Arbitrary Sample Editing
You can cut, trim, paste, mix, and apply effects to a specific selection with sample-level precision. It supports multiple synchronized tracks.

### Accessibility
It supports keyboard-only editing, screen readers, and has narration support for blind users. This makes it suitable for users with special needs.

### Signal Analysis Tools
It includes a spectrogram, frequency analysis, signal generators such as sine waves, noise, and pulses, as well as RMS and peak audio level measurement tools.

## Installation

### On Linux
Packages are not yet available in the official repositories of major distributions. Tenacity can be installed via:

The AppImage file, downloaded from the releases page. Download the file, grant execute permission with chmod +x, then run it directly. This method works on any distribution.

The Flatpak package is available on Flathub. It should appear within days of the release.

Deb packages for Ubuntu or Debian and RPM packages for Fedora or openSUSE are sometimes released but require building from source.

### On Windows
A standard installer .exe is available, along with a portable version that requires no installation.

### On macOS
A DMG package is available for both Intel and Apple Silicon processors.

## Tenacity vs Audacity

Audacity is currently the most widely used application. It supports more features, including new AI features such as track separation and automatic transcription. Data collection is optional rather than mandatory.

Tenacity is still smaller and has fewer features, but it makes a clear promise. No tracking code, no automatic background updates, no data collection, and an interface that does not change every six months.

If you trust the Muse Group and do not mind optional analytic data collection, stay with Audacity. If you want completely free software, faithful to the traditional meaning of free software, try Tenacity.

## Summary

Tenacity is a project born from necessity and sustained by persistence. The goal is not to technically surpass Audacity in every way, but to preserve a certain philosophy. The team works slowly but steadily, relying on donations and volunteer efforts.

If you are interested in audio editing and want to support uncompromising free software, Tenacity deserves your support and attention.

## Quick Links

[https://tenacityaudio.org](https://tenacityaudio.org)

[https://codeberg.org/tenacityteam/tenacity](https://codeberg.org/tenacityteam/tenacity)

[https://tenacityaudio.org/getting-help](https://tenacityaudio.org/getting-help)

[https://matrix.to/#/#tenacity:matrix.org](https://matrix.to/#/#tenacity:matrix.org)

[https://mastodon.social/@tenacity](https://mastodon.social/@tenacity)

[https://lemmy.world/c/tenacity](https://lemmy.world/c/tenacity)
