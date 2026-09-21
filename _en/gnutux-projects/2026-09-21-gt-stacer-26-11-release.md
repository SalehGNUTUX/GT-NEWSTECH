---
layout: post
title: >-
  GT-STACER 26.11.3: A Stable Release That Turns the Tool into a Complete Linux
  Control Center
category: gnutux-projects
author: GNUTUX
excerpt: >-
  The GT-STACER project has released stable version 26.11.3, an updated fork of
  Stacer built with C++17 and Qt6. This release adds a full package and software
  manager, system backup and snapshots, a firewall, live connection monitoring,
  power tools, in-app self-update, and fixes a command-injection security
  vulnerability.
image: gt-stacer-26.11-en.png
tags:
  - GT-STACER
  - System Monitoring
  - Performance Optimization
  - Tools
  - Linux
  - Qt6
  - C++17
  - Backup
  - Firewall
also_in:
  - foss
date: 2026-09-21T21:01:00.000Z
lang: en
slug: gt-stacer-26-11-release
---

## From System Monitor to Complete Control Center

GT-STACER is a modern fork of the well-known Stacer tool, rebuilt for modern technologies: Qt6 and C++17. It began as a system optimizer and monitor, but has evolved over recent releases into a complete control center that manages packages, services, backups, firewalls, connections, and power.

Version 26.11.3 is the latest stable release, published on September 17, 2026, following a series of stable releases (26.06, 26.07, 26.08, 26.09, 26.10, 26.11) that continuously added new features.

🔗 **Official Website:** [salehgnutux.github.io/GT-STACER](https://salehgnutux.github.io/GT-STACER)
🔗 **GitHub Repository:** [github.com/SalehGNUTUX/GT-STACER](https://github.com/SalehGNUTUX/GT-STACER)

## Package and Software Manager (New in 26.11)

The former Uninstaller has become a full Package and Software Manager, with three tabs:

- **Installed:** Browse and remove software across every detected package manager.
- **Search & Install:** Search and install via the system manager, Flatpak, or Snap.
- **Upgrades:** List and apply available updates.

This means GT-STACER can now manage the complete software lifecycle, from installation to upgrade to removal, across more than 28 package managers.

## Store Add-ons and AppImage Integration

- **Store Add-ons:** Manage opendesktop.org and KNewStuff content (Plasma themes, icons, cursors, wallpapers, color schemes), with guarded removal and installation via ocs-url links.
- **GearLever-Compatible AppImage Integration:** Integrate and remove AppImages using the same folder and launcher format as GearLever, reading metadata without executing the file (ELF-offset unsquashfs read).

## Backup and Recovery (New in 26.09)

- **System Backup:** Snapshots via Timeshift, Snapper, or ZFS, with automatic detection of the ideal engine for your filesystem.
- **Home Backup:** Mirror your home directory to another disk using rsync, with live progress and skipping caches and trash.
- **File Recovery:** A PhotoRec front-end that carves lost or deleted files from a disk, partition, or image, with file type selection and per-type sorting.
- **Restore Point:** System Cleaner offers a Timeshift restore point before irreversible root-level cleanups.

## Network and Power Tools (New in 26.08)

- **Live Connections:** View all active TCP/UDP sockets and the owning process (from `ss`), with a text filter, sortable columns, and auto-refresh.
- **Power:** Switch the power profile (power-profiles-daemon or cpufreq), and cap the laptop battery charge to extend its lifespan.
- **Keep Awake:** Block automatic sleep and screen locking via D-Bus interfaces, detecting blocks set elsewhere, such as KDE's.
- **Firewall:** Enable or disable ufw or firewalld, and add or remove port rules, with one authorization per action.

## In-App Self-Update (New in 26.11)

GT-STACER checks GitHub for a newer version on startup (enabled by default) and can download, verify (SHA-256), and install it itself: self-replacing the AppImage, or handing the .deb/.rpm to the package manager via pkexec.

## Security Fixes

Version 26.11 fixes a **Command Injection** vulnerability in package search: the search was passing the query to a shell (`sh -c`), and now passes it as arguments (argv) without a shell, with validation. All new install, upgrade, and remove paths use `execProgram` with validated names.

## Core Features

- **Dashboard:** Animated circular gauges for CPU, RAM, Disk, and Swap.
- **GPU and Sensors:** Auto-detects Intel, AMD, and NVIDIA GPUs, and monitors temperatures.
- **Battery Monitor:** A circular gauge with estimated time remaining.
- **28+ Package Managers:** APT, DNF, Pacman, Zypper, Flatpak, Snap, XBPS, APK, Portage, Nix, and more.
- **Service Management:** systemd, OpenRC, runit, s6, and SysV.
- **System Cleaner:** Async scan with an animated spinner and color-coded sizes.
- **19 Languages:** Arabic (complete with RTL), English, and 17 others.
- **Catppuccin Themes:** Dark and light.
- **System Tray:** Shows CPU%, RAM%, and temperature, updated every 3 seconds.
- **System Relief:** Temporarily freeze idle apps (SIGSTOP) to relieve RAM and CPU pressure, with disk pressure (PSI) awareness, ionice, and BFQ tools.
- **Power Timer:** Schedule shutdown, restart, suspend, or hibernate after a set time with a live countdown.

## Download

| Format | Size | SHA-256 |
|--------|------|---------|
| **AppImage** | 52 MB | `f261e5be8041186bc37cd7834cfc80c078efe552d68cd380d0cfe74d79e5eddc` |
| **DEB** | 2.1 MB | `e23c3e61e245baa1b953ac4e7a23015b6c7395b4393273b6f24376fec87522f0` |
| **RPM** | 2.5 MB | `9aeba8dcb95c67a375310c876e808fd1e595d1886e5d9845523fb5cb2ce32fd7` |
| **Flatpak** | 2.2 MB | `cae91ac04d80fce7b66514ec8164464f0c496c67aa0b32a7ecd3da13c0ba0860` |

### Quick Installation
```bash
# AppImage
chmod +x GT-STACER-26.11.3-x86_64.AppImage
./GT-STACER-26.11.3-x86_64.AppImage

# DEB
sudo dpkg -i GT-STACER_26.11.3_amd64.deb

# RPM
sudo rpm -i gt-stacer-26.11.3-2.x86_64.rpm

# Flatpak
flatpak install --user GT-STACER-26.11.3-x86_64.flatpak
```

## Summary

GT-STACER 26.11.3 is a mature release that combines monitoring, optimization, package management, backup, security, and power into a single tool. What began as a Stacer fork has become an integrated control center for GNU/Linux systems, with a modern interface and full Arabic support.

## Quick Links

[https://salehgnutux.github.io/GT-STACER](https://salehgnutux.github.io/GT-STACER)

[https://github.com/SalehGNUTUX/GT-STACER](https://github.com/SalehGNUTUX/GT-STACER)

[https://github.com/SalehGNUTUX/GT-STACER/releases](https://github.com/SalehGNUTUX/GT-STACER/releases)

Published in GNUTUX Projects – System Tools
```
