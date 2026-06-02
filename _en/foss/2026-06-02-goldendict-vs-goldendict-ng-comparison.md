---
layout: post
title: >-
  GoldenDict vs GoldenDict-ng: Complete Comparison of Open Source Dictionary
  Versions
category: foss
author: GNUTUX
excerpt: >-
  A comprehensive comparison between classic GoldenDict (version 1.0.1) and
  GoldenDict-ng (modern version 26.5.6-1), focusing on improvements in format
  support, interface, and performance, with direct download links for Linux
  systems.
image: goldendictvsgoldendict-ng-en.png
tags:
  - GoldenDict
  - GoldenDict-ng
  - Dictionaries
  - Translation
  - Free Software
  - Linux
date: 2026-06-02T19:32:00.000Z
lang: en
slug: goldendict-vs-goldendict-ng-comparison
---

## The Evolution of Open Source Dictionaries

GoldenDict is one of the most powerful open source dictionary applications on the Linux platform. For years, it has been the top choice for translators, linguists, students, and researchers who need access to multiple dictionaries in various formats, including Babylon, StarDict, Lingvo, and Dictd. However, the original project effectively stopped development at version 1.0.1, with only minor updates through the Git branch. This created the need for a new fork that continues development and adds modern improvements. That fork is GoldenDict-ng, which stands for Next Generation.

🔗 **Original Official Website:** [goldendict.org](http://goldendict.org)
🔗 **GoldenDict-ng-AppImage Repository:** [github.com/pkgforge-dev/GoldenDict-ng-AppImage](https://github.com/pkgforge-dev/GoldenDict-ng-AppImage)

## What Is Original GoldenDict?

Original GoldenDict, stable version 1.0.1, is a cross-platform dictionary application that uses the WebKit engine to display articles accurately while preserving all formatting, colors, images, and links. It supports multiple dictionary file formats: Babylon .BGL, StarDict .ifo/.dict/.idx/.syn, Dictd .index/.dict, and ABBYY Lingvo .dsl. It also supports audio playback from forvo.com, includes a Hunspell-based morphology system for spelling suggestions, supports searching while ignoring diacritics, case, and spaces, and provides a scan popup window for quick translation from any other application. The application is licensed under GNU GPLv3+.

The main drawback of original GoldenDict is the lack of active development. The last stable release, 1.0.1, was published years ago around 2015, and it does not include improvements for modern libraries such as Qt6 or WebEngine instead of the outdated WebKit.

## What Is GoldenDict-ng?

GoldenDict-ng is an unofficial fork that aims to update GoldenDict and make it compatible with modern technologies. The ng stands for Next Generation. GoldenDict-ng builds on the same original codebase but adds fundamental improvements. It uses Qt6 instead of Qt4, and WebEngine instead of WebKit, improving page rendering performance and compatibility with modern websites. It includes improved support for large dictionaries and fixes for memory issues that caused the application to crash when loading huge dictionaries such as illustrated Wikipedia. The interface is more responsive, and support for Wayland is better thanks to Qt6. Regular updates are released, with the latest version being 26.5.6-1 from June 1, 2026.

## Quick Comparison Between the Two Versions

| Feature | Original GoldenDict (1.0.1) | GoldenDict-ng (26.5.6-1) |
|---------|------------------------------|---------------------------|
| **Last update** | ~2015 (effectively stopped) | June 1, 2026 (active) |
| **Framework** | Qt4 | Qt6 |
| **Rendering engine** | WebKit (legacy) | WebEngine (modern) |
| **Wayland support** | Limited / runs via XWayland | Full (Qt6) |
| **Dictionary formats** | BGL, StarDict, DSL, Dictd | Same formats + DSL improvements |
| **Scan Popup** | Yes (via X11) | Yes (partial on Wayland) |
| **Memory usage** | High with large dictionaries | Optimized, lower consumption |
| **Security updates** | None | Yes (through library updates) |
| **Availability on Linux** | Legacy packages on old Debian/Ubuntu, or manual build | Modern AppImage (all distributions) |
| **GitHub repository** | goldendict/goldendict (inactive) | pkgforge-dev/GoldenDict-ng-AppImage (active) |

## How to Get GoldenDict-ng on Linux

GoldenDict-ng is available as an AppImage package from the pkgforge-dev repository. This is the recommended method because AppImage works on any Linux distribution, old or new, and requires no installation. The package includes a self-updater, so you will receive a notification when a new version is available.

To download and run GoldenDict-ng:

1. Go to the releases page at [github.com/pkgforge-dev/GoldenDict-ng-AppImage/releases](https://github.com/pkgforge-dev/GoldenDict-ng-AppImage/releases)
2. Download the latest release, for example GoldenDict-ng-26.5.6-1-x86_64.AppImage.
3. Make the file executable:
   ```bash
   chmod +x GoldenDict-ng-26.5.6-1-x86_64.AppImage
   ```
4. Run the application:
   ```bash
   ./GoldenDict-ng-26.5.6-1-x86_64.AppImage
   ```

If you prefer installation through a package manager, GoldenDict-ng is not yet available in the official repositories of major distributions. Some distributions have unofficial packages in the AUR on Arch Linux, but their maintenance depends on the community.

Note that GoldenDict-ng does not require root privileges to run. Everything works from the user's home folder.

## What Has Not Changed?

GoldenDict-ng maintains compatibility with the original dictionary formats, so all .bgl, .dsl, and .dict files that worked on original GoldenDict will also work on GoldenDict-ng. Core features such as diacritic-insensitive search, forvo.com support, audio playback from local files, the Hunspell morphology system, and tabbed browsing are all present and unchanged.

## Is Original GoldenDict Still Worth Using?

If you are on a very old system such as Ubuntu 18.04 or versions older than Fedora 30, modern AppImage packages may not work due to old glibc libraries. In this case, original GoldenDict from your distribution's repositories might be your only option. However, it will be limited to the available version, and you may face compatibility issues with modern HTTPS websites through the old WebKit engine.

For anyone using a modern distribution from the last two years, GoldenDict-ng is the best choice by far. Performance is better, security is better, and updates are continuous.

## Summary

GoldenDict-ng is not just a simple update. It is a revival of a project that had effectively died. By adopting Qt6 and WebEngine, the application is once again able to compete with commercial dictionaries on Linux, while maintaining the same open source spirit. If you are still using original GoldenDict and experiencing slowness or compatibility issues with some modern dictionaries, it is time to upgrade to GoldenDict-ng.

## Quick Links

[http://goldendict.org](http://goldendict.org)

[https://github.com/pkgforge-dev/GoldenDict-ng-AppImage](https://github.com/pkgforge-dev/GoldenDict-ng-AppImage)

[https://github.com/pkgforge-dev/GoldenDict-ng-AppImage/releases](https://github.com/pkgforge-dev/GoldenDict-ng-AppImage/releases)
