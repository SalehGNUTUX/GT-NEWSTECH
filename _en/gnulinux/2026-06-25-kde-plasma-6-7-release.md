---
layout: post
title: 'KDE Plasma 6.7 Released: BigScreen, Union Theming, and a Monster Update'
category: gnulinux
author: GNUTUX
excerpt: >-
  The KDE community has released Plasma 6.7, a feature-packed update bringing
  long-awaited per-screen virtual desktops, the return of the classic Oxygen and
  Air themes from the KDE 4 era, a tech preview of the new Union CSS-based
  theming system, the revival of the Plasma BigScreen TV interface, and numerous
  performance and usability improvements.
image: plasma67-gnutux.jpg
tags:
  - KDE Plasma
  - Desktop
  - Wayland
  - Linux
  - Qt
  - Oxygen
  - Union
  - BigScreen
also_in:
  - foss
date: 2026-06-25T20:59:00.000Z
lang: en
slug: kde-plasma-6-7-release
---

## A Release Worthy of a 30th Anniversary

On June 16, 2026, the KDE community released Plasma 6.7, a major update that arrives just ahead of KDE's 30th anniversary in October [citation:1][citation:7]. This release is not a minor point update. It brings features that users have requested for years, revives the project's classic heritage with modernized versions of beloved themes, and provides a glimpse into the future of theming with a new CSS-based system [citation:7][citation:9].

The release is dedicated to Eric Laffoon, an early KDE supporter who passed away in May 2026.

🔗 **Official Source:** [kde.org/announcements/plasma/6/6.7.0/](https://kde.org/announcements/plasma/6/6.7.0/)

## Headline Features

### Per-Screen Virtual Desktops

After 21 years of requests, virtual desktops are finally independent for each connected screen [citation:1][citation:5]. Laptops and external monitors no longer share the same set of virtual desktops. Each display can have its own layout, fundamentally changing the workflow on multi-monitor setups [citation:7].

This feature is particularly valuable for developers and designers working on multiple projects simultaneously, allowing each screen to be customized for specific work needs.

### The Return of Oxygen and Air

To celebrate KDE's 30-year legacy, the classic Oxygen theme, default in KDE 4, and the Air theme, which succeeded it in KDE 4.3, have been restored and modernized [citation:1][citation:9]. Both themes have been updated to be compatible with the modern Breeze framework, featuring adaptive opacity and support for light, dark, and twilight modes as part of Global Themes [citation:9][citation:10].

The restoration effort, led by KDE contributor Filip Fila alongside Oxygen's original designer Nuno Pinheiro, involved significant technical work to ensure compatibility with modern standards like Wayland and fractional scaling [citation:9][citation:10]. The classic KDE 4 Air and Horos wallpapers also make a return [citation:1].

### The New Union Theming System

In an effort to unify theming across Plasma, QtQuick, and QtWidgets, KDE introduced Union, a CSS-based theming system [citation:1][citation:8]. Currently available as a tech preview and disabled by default, Union aims to allow designers to use a single, easy-to-write set of CSS to style the entire desktop [citation:1].

To test Union, users can install the `union` package and select it from System Settings > Colors & Themes > Application Style [citation:13][citation:14].

### Plasma BigScreen: The TV Interface Returns

After being removed from the release schedule in 2024, the Plasma BigScreen interface has returned in version 6.7 [citation:4][citation:15]. This interface is designed for computers connected to televisions (HTPCs), offering a console-like experience similar to SteamOS, with full integration into the Plasma desktop [citation:15].

## Productivity and Daily Use Improvements

- **Test Your Microphone Volume**: A new tool allows users to record and play back audio to test volume levels before calls [citation:1].
- **Global Mute Shortcut**: A keyboard shortcut to globally mute the microphone from anywhere [citation:1].
- **Press-and-Hold for Special Characters**: Using the virtual keyboard, pressing and holding a key allows selection of related special characters [citation:1].
- **Light/Dark Mode Toggle**: A quick toggle is now available in the brightness and color settings to switch between light and dark Global Themes [citation:1][citation:8].
- **Improved Printer Management**: The printer system tray icon shows the number of active jobs, and a new print queue management tool offers easier connection to shared printers on Windows networks [citation:1][citation:8].
- **Discover Improvements**: The software center now features a more prominent "Install" button, redesigned app cards with more information, and grouping of installed software by type [citation:1].

## Performance and Wayland Enhancements

- Reduced power consumption and improved performance for CPU-bound applications, full-screen displays, and Intel integrated GPUs.
- Simultaneous support for HDR and ICC profiles without needing to choose between them [citation:8].
- Significant Wayland improvements in preparation for version 6.8, which will be X11-free.

## Sub-Releases and Fixes

A week after the main release, the team issued update 6.7.1 on June 23, 2026, which includes bug fixes and new translations [citation:3].

## Summary

KDE Plasma 6.7 is a release that bridges the past and the future, bringing back the classic Oxygen and Air themes while introducing the forward-looking Union theming system. It enhances the productivity of experienced users with the long-awaited per-screen virtual desktops and offers tangible improvements for everyone. If you use Plasma on a rolling release distribution, this update will arrive soon. If you want to try it now, you can use KDE Neon or build it from source.

## Quick Links

[https://kde.org/announcements/plasma/6/6.7.0/](https://kde.org/announcements/plasma/6/6.7.0/)

[https://kde.org/announcements/plasma/6/6.7.1/](https://kde.org/announcements/plasma/6/6.7.1/)

[https://community.kde.org/Plasma/Plasma_6](https://community.kde.org/Plasma/Plasma_6)

Published in the GNU/Linux section – Desktop Environments
