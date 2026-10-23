---
layout: post
title: >-
  Dux Labs: The Desktop Suite That Turns Raw Wayland into a Complete Work
  Environment
category: gnulinux
author: GNUTUX
excerpt: >-
  DankMaterialShell has become Dux Shell with the release of DMS 2.0, bringing a
  complete desktop suite including a shell, file manager, calendar, and system
  monitor, designed to run on Niri, Hyprland, Sway, and other Wayland
  compositors. Learn about its components, installation, and who it's for.
image: duxlabs-gnutux-en.png
tags:
  - Dux Labs
  - Dux Shell
  - Wayland
  - Niri
  - Hyprland
  - Desktop Environment
  - Quickshell
  - Open Source
also_in:
  - foss
date: 2026-10-23T07:04:00.000Z
lang: en
slug: dux-shell-wayland-desktop-suite
---

## From a Simple Shell to a Complete Suite

Years ago, Wayland desktop environments suffered from a severe shortage of ready-made tools. A user choosing Niri, Hyprland, or Sway found themselves forced to assemble their environment manually from dozens of small programs: a status bar, a launcher, a notification daemon, a lock screen, a file manager. Each tool with a different language and design.

**Dux Labs** (formerly Dank Linux) came to fill this gap. What started as a hobby project last December has now become a **complete desktop suite** called **DMS 2.0** (codename Heisenberg), running on over ten different Wayland compositors.

🔗 **Official Website:** [duxlabs.dev](https://duxlabs.dev)
🔗 **GitHub Repository:** [github.com/duxlabs-dev/dux-shell](https://github.com/duxlabs-dev/dux-shell)

## Why the Name Change?

In October 2026, the team announced a radical identity change. **DankMaterialShell** became **Dux Shell**, and **Dank Linux** became **Dux Labs**. The reason is simple: the old name referred to a single shell, while the project has become a complete suite of independent applications.

The new name "Dux" is inspired by the team mascot (a penguin wearing a hat) and echoes "Tux," the Linux penguin. More practically, the initial letters of the old tools like `dms`, `dcal`, and `dgop` remain the same, so there is no need to change terminal habits.

## What Does DMS 2.0 Offer?

The suite consists of seven main components, each performing a function that previously required a separate tool:

### Dux Shell (The Shell)
It is the heart. It runs on **Niri, Hyprland, Sway, MangoWC, LabWC, Miracle, Aqueous, Scroll, and Umbriel**. It provides a status bar, launcher, control center, notifications, and lock screen. The new design relies on **Material 3 Expressive**, with support for **Dux Dot** (a floating element that transforms into a player, control center, or dashboard).

### Dux Files (File Manager)
This is the only new component. A standalone file manager (no need for the shell to run) supporting **tabs, split view, trash, space preview, ZIP/TAR/7z/RAR archiving, and network browsing via SFTP, SMB, and WebDAV**. It works entirely from the keyboard.

### Dux Calendar (Calendar)
A calendar supporting Google, Microsoft, CalDAV, and iCloud, with tasks and events in a single interface.

### Dux GOP (System Monitor)
Monitoring CPU, memory, GPU, disks, and network status. Lightweight and independent.

### Dux Greeter (Login Screen)
A greetd login interface, visually consistent with the shell.

### Dux Search (Search)
A fast filesystem search tool.

### Dux Lyrical Engine (Lyrics)
A synchronized lyrics engine inside the media player, supporting word-level or syllable-level synchronization, with sources like Better Lyrics, Unison, LRCLIB, and YouTube Music.

## Customization: One Color for Everything

One of Dux's strongest features is **automatic theming**. The shell generates a complete color palette (16 colors) from the desktop wallpaper (via `matugen`) and applies it to **GTK3, GTK4, and Qt** applications, as well as terminal and editor color schemes. This means everything looks consistent without manual configuration.

## Installation: How to Get It

### Arch Linux
The package is available in the `extra-testing` repository as `dux-shell`:
```bash
# After enabling extra-testing
sudo pacman -S dux-shell
```

### Ubuntu / Debian
An official PPA exists:
```bash
sudo add-apt-repository ppa:duxlabs/dms-git
sudo apt update
sudo apt install dux-shell
```

### Solus
Available in the official repositories after the latest update.

### FreeBSD and RHEL
Version 2.0 adds support for **FreeBSD** and **Enterprise Linux 10** (RHEL, Rocky, AlmaLinux).

### Manual Installation (Any Distro)
If your distribution is not supported, you can use the official installation script or build from source via `go`, `git`, and `quickshell`.

## Important Note for Existing Users

If you previously used DankMaterialShell, updating to 2.0 requires changing the **application ID** from `com.danklinux.dms` to `dev.duxlabs.shell`. This affects custom window rules in Niri or Hyprland. Package names have also changed (e.g., `dms` to `dux-shell`), but the commands (`dms`) remain the same.

## Who Is This Suite For?

**Suitable for:** Advanced Wayland users who want an integrated and consistent environment without assembling tools manually. Customization enthusiasts who want precise control over colors and layout. Niri and Hyprland users looking for a ready-made shell.

**Not suitable for:** New users who want a traditional desktop environment (GNOME or KDE). Those seeking long-term stability without frequent updates. X11 users (the suite is Wayland-only).

## Summary

Dux Labs has delivered what was missing from Wayland environments built on compositors: **one suite, consistent, and open source**, covering everything from the shell to the file manager. The rebranding was not just cosmetic. It expressed the project's maturity from a "shell" to a "complete desktop platform." If you are a Wayland user who wants a modern and integrated work environment, DMS 2.0 is worth trying.

## Quick Links

[Dux Labs Official Website](https://duxlabs.dev)

[DMS 2.0 Release Announcement (Blog)](https://duxlabs.dev/blog/v2-0-release)

[v2.0.0 Release Page on GitHub](https://github.com/duxlabs-dev/dux-shell/releases/tag/v2.0.0)

[Rebranding Guide on It's FOSS](https://itsfoss.com/news/dank-linux-dux-labs-rebrand/)

Published in the GNU/Linux section – Desktop Environments
```
