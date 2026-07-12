---
layout: post
title: >-
  GT-STACER 26.07: A New Stable Release for the GNU/Linux System Monitor and
  Optimizer
slug: gt-stacer-26-07-release
lang: en
category: gnutux-projects
date: 2026-07-12T21:20:00.000Z
author: GNUTUX
excerpt: >-
  The GT-STACER project has released stable version 26.07, an updated fork of
  the popular Stacer system monitor and optimization tool, built with C++17 and
  Qt6. The release introduces two new tools (System Relief and Power Timer),
  fixes for autostart management, a rebuilt light theme, and detection of
  externally installed applications.
image: gt-stacer-en-gnutux.png
tags:
  - GT-STACER
  - System Monitoring
  - Performance Optimization
  - Tools
  - Linux
  - Qt6
  - C++17
also_in:
  - foss
  - gnulinux
---

## Evolution of a System Monitoring Tool

GT-STACER is a modern fork of the well-known Stacer system monitoring and optimization tool for GNU/Linux. While the original Stacer development stopped at version 1.1.0 in 2019, GT-STACER has continued development, adding modern features and broader hardware and software support.

Version 26.07 is a new stable release, published on July 12, 2026, bringing significant improvements over previous versions.

🔗 **Official Website:** [salehgnutux.github.io/GT-STACER](https://salehgnutux.github.io/GT-STACER)
🔗 **GitHub Repository:** [github.com/SalehGNUTUX/GT-STACER](https://github.com/SalehGNUTUX/GT-STACER)

## What's New in Version 26.07?

### System Relief

A new tool that allows temporarily freezing idle, non-critical applications using the SIGSTOP signal to relieve memory and CPU pressure. Applications can be resumed later using SIGCONT without any data loss. It can be triggered manually or automatically. It is designed to be safe: it never freezes the terminal, shell, or the process that launched the program, excluding the entire parent chain, terminal session, and a list of specific names.

### Power Timer

A new feature that allows scheduling shutdown, restart, suspend, or hibernate after a specified number of minutes, with a live countdown timer showing the remaining time. It works through `systemctl` and leverages logind permissions granted to the active session, meaning it does not require a password. A bug was fixed where hibernation availability is now queried from logind, so the tool no longer schedules hibernation on systems where it would silently fail.

### Autostart Fixes

The method for writing `.desktop` files has been fixed to be fully compliant with the freedesktop standard (previously `QSettings` was corrupting them). Flatpak and Snap applications are now properly listed, and an optional startup delay can be added. The list now also refreshes automatically when the page is opened.

### External Application Detection

The release adds the ability to detect applications installed via custom scripts (e.g., `megacubo` via `wget | bash`), packages in `/opt`, or AppImages that are not known to any package manager. The removal process is comprehensive, covering launchers, files, and leftovers, while respecting shared dependencies. Ownership is queried in batches to prevent deleting a browser behind a PWA shortcut, for example.

### Light Theme Rebuild

The light theme has been completely rebuilt using a central color scheme that drives every widget. The modern Catppuccin Latte theme is now fully on par with the dark theme, which remains unchanged.

### Arabic UI 100%

The Arabic translation is now 100% complete (486/486 strings), with full right-to-left support and Western numerals.

## Other Core Features

- **Dashboard:** Animated circular gauges for CPU, RAM, Disk, and Swap usage with color-coded thresholds and sub-text labels.
- **GPU & Sensor Monitoring:** Auto-detects Intel, AMD, and NVIDIA GPUs, and monitors temperatures via hwmon and thermal zones.
- **Battery Monitor:** A circular charge gauge with estimated time remaining, perfect for laptop users.
- **28+ Package Managers:** Auto-detects APT, DNF, Pacman, Zypper, Flatpak, Snap, XBPS, APK, Portage, Nix, and more.
- **Service Management:** Supports systemd, OpenRC, runit, s6, and SysV init systems.
- **System Cleaner:** Async scan with an animated spinner, expandable columns, and color-coded sizes.
- **19 Languages:** Arabic (complete with RTL), English, and 17 other languages.
- **Catppuccin Themes:** Beautiful dark and light themes based on the Catppuccin color palette, with configurable close behavior.
- **System Tray:** Displays CPU and RAM usage percentages in the tooltip, updated every 3 seconds.

## Comparison with Original Stacer

| Aspect | Stacer 1.1.0 (2019) | GT-STACER 26.07 (2026) |
|--------|---------------------|------------------------|
| Framework | Qt5 (EOL) | Qt6 ≥ 6.2 |
| C++ Standard | C++11 | C++17 |
| Dashboard | Linear progress | Animated circular gauges |
| Sidebar | Text only | SVG icons + collapsible (220↔64 px) |
| GPU Monitoring | Not supported | Intel · AMD · NVIDIA |
| Temperatures | Not supported | hwmon · thermal zones |
| Battery | Not supported | Circular gauge + time remaining |
| Flatpak Support | Not supported | Fully supported |
| Package Managers | APT · Snap | 28+ managers |
| Init Systems | systemd only | systemd · OpenRC · runit · s6 · SysV |
| Loading Indicators | Not supported | Animated spinner overlay |
| System Tray | Tray icon | Tray + live CPU% / RAM% tooltip |
| Welcome Screen | Not supported | 6 onboarding slides |
| Wayland | Partial | Full |
| Arabic / RTL | Supported | Supported (ar_MA, Western numerals) |
| Close Behavior | Tray / quit | Tray / quit + confirm dialog |
| Theme | Simple QSS | Catppuccin dark/light |

## Download

GT-STACER 26.07 is available in several formats:

| Format | Size | Description |
|--------|------|-------------|
| **AppImage** | 54 MB | Portable, no installation required |
| **DEB** | 1.8 MB | For Debian, Ubuntu, Mint, Kali, Trixie+ |
| **RPM** | 8.2 MB | For Fedora, RHEL, AlmaLinux, Rocky, openSUSE |
| **Flatpak** | 2.0 MB | Sandboxed, runs on any distribution with Flatpak |

```bash
# AppImage
chmod +x GT-STACER-26.07-x86_64.AppImage
./GT-STACER-26.07-x86_64.AppImage

# DEB
sudo dpkg -i GT-STACER_26.07_amd64.deb

# RPM
sudo rpm -i gt-stacer-26.07-2.x86_64.rpm

# Flatpak
flatpak install --user GT-STACER-26.07-x86_64.flatpak
```

## Future Roadmap

Upcoming releases (26.08, 26.09, 26.10) will add network tools (live connections, TLP interface), backup tools (Btrfs/ZFS snapshot manager), and a plugin system using Lua and Python.

## Summary

GT-STACER 26.07 is a stable release that adds practical features such as System Relief and Power Timer, rebuilds the light theme, and completes full Arabic language support. It is an excellent choice for any Linux user seeking a modern and powerful system monitoring and optimization tool.

## Quick Links

[https://salehgnutux.github.io/GT-STACER](https://salehgnutux.github.io/GT-STACER)

[https://github.com/SalehGNUTUX/GT-STACER](https://github.com/SalehGNUTUX/GT-STACER)

[https://github.com/SalehGNUTUX/GT-STACER/releases](https://github.com/SalehGNUTUX/GT-STACER/releases)

Published in GNUTUX Projects – System Tools
