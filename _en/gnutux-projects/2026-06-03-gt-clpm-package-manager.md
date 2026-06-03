---
layout: post
title: >-
  GT-CLPM 1.4.0: Universal Package Manager for Linux with Unified GUI for 13+
  Managers
category: gnutux-projects
author: GNUTUX
excerpt: >-
  GT-CLPM is a comprehensive package manager for GNU/Linux systems, providing a
  unified graphical interface for over 13 package managers, with Zenity and
  KDialog support, graphical password prompt, repository management, and
  programming language package managers. Version 1.4.0 adds KDialog support,
  dist-upgrade, and automatic system theme application.
image: gt_clpm_gnutux_en.png
tags:
  - GT-CLPM
  - Package Manager
  - Linux
  - APT
  - DNF
  - Pacman
  - Zypper
  - Flatpak
  - Snap
  - Development Tools
also_in:
  - gnulinux
date: 2026-06-03T18:22:00.000Z
lang: en
slug: gt-clpm-package-manager
---

## The Problem of Multiple Package Managers in Linux

One of Linux's strengths is the diversity of distributions, but this strength comes with complexity. Each distribution has its own package manager. A user moving from Ubuntu using APT to Fedora using DNF or to Arch using Pacman faces a learning curve for each set of commands. Additionally, there are universal packages like Flatpak and Snap, and programming language package managers like pip, npm, and cargo. Remembering all these commands and their specific syntax becomes tedious.

GT-CLPM, the GNUTUX Command Line Package Manager, is a solution to this problem. It provides a unified interface, both through the command line and through a graphical interface, to handle all these package managers from one place.

🔗 **Official Website:** [salehgnutux.github.io/GT-CLPM](https://salehgnutux.github.io/GT-CLPM)
🔗 **GitHub Repository:** [github.com/SalehGNUTUX/GT-CLPM](https://github.com/SalehGNUTUX/GT-CLPM)

## What Is New in Version 1.4.0?

Version 1.4.0 is a major update focusing on improving user experience across different desktop environments and adding advanced system management features.

### KDialog Support and Automatic Desktop Detection

Before this version, GT-CLPM relied only on Zenity, the graphical dialog tool for the GTK environment. This worked excellently on environments like GNOME, Xfce, and Cinnamon, but was not ideal on KDE Plasma environments which prefer Qt-based tools. Version 1.4.0 automatically detects your desktop environment type:
- If KDE or any Qt-based environment is detected, it uses KDialog
- If GNOME, Xfce, or any GTK environment is detected, it uses Zenity
- You can manually switch the UI tool from the settings menu at any time

This integration makes the graphical interface feel like a native part of your desktop environment rather than an alien application.

### Graphical Password Prompt Without Terminal

One issue in previous versions was that requesting root privileges would open a terminal window for password entry. In version 1.4.0, GT-CLPM uses `pkexec` (Polkit tool) or `SUDO_ASKPASS` to display an elegant graphical window asking for the password. No terminal window appears at all, making the experience smoother for users who prefer graphical interfaces.

### Dist Upgrade

The new version adds a separate option for full system upgrade under the update menu. This option:
- Works with APT (`dist-upgrade`) to upgrade core packages and resolve conflicts
- Works with DNF (`distro-sync`) to synchronize the system with repositories
- Works with Pacman (`-Syyu`) for forced database refresh and upgrade
- Works with Zypper (`dup`) for full system upgrade on openSUSE
- For other package managers, an informational message appears explaining that the option is not supported, with alternative suggestions

### Automatic System Theme Application

GT-CLPM now reads your system theme settings from `gsettings` and applies them to its graphical interface automatically. If your system uses dark mode, GT-CLPM windows will appear in dark mode. No manual theme selection is needed.

### Automatic Dependency Installation

When running for the first time, GT-CLPM checks for the presence of Zenity or KDialog depending on your desktop environment. If the required tool is missing, it attempts to install it automatically through the appropriate package manager. If installation fails, a graphical error message appears listing the required dependency names and the commands to install them manually.

## Supported Package Managers (13+)

GT-CLPM supports the following system package managers:

APT for Ubuntu, Debian, Linux Mint, and all derivatives.

DNF/YUM for Fedora, RHEL, CentOS, Rocky Linux, AlmaLinux.

Pacman for Arch Linux, Manjaro, EndeavourOS.

Zypper for openSUSE.

Eopkg for Solus.

XBPS for Void Linux.

Emerge for Gentoo.

PKG for FreeBSD.

APK for Alpine Linux.

Nix for NixOS (displays installed packages only, installation requires Flakes enabled).

Homebrew for Linux and macOS.

Flatpak for universal applications via Flathub.

Snap for Canonical packages.

In addition to programming language package managers:

Python via pip, pip --user, pipx, and virtual environments.

Node.js via npm, yarn, pnpm, npx.

Ruby via gem and bundler.

Rust via cargo and rustup.

Go via go install (automatically installs Go if missing).

Java via maven, gradle, SDKMAN, and JDK version switching.

PHP via composer and PHP extensions.

Haskell via cabal, stack, ghcup.

Scientific via Spack, Conda/Miniconda, Mamba.

## Key Features

### Dual Interface

GT-CLPM is available in two versions:

The Command Line Interface (CLI) version for advanced users who prefer working in the terminal, with paginated search results navigable by pressing n for the next page and p for the previous page.

The Graphical User Interface (GUI) version for regular users, with intuitive popup menus and dialogs.

Both versions support Arabic and English languages, with the ability to switch between them from the settings.

### Smart Removal

Instead of typing package names manually, you can browse installed packages and select what you want to remove from an interactive list. This prevents typing errors and makes the process faster.

### Repository and PPA Management

You can add or remove software repositories from within the tool, depending on the package manager:
- On APT: Manage PPAs
- On DNF: Manage COPR repositories
- On Pacman: Manage AUR repositories via yay or paru if installed

### Correct Flatpak and Snap Search

Previous versions had issues searching for Flatpak packages. Version 1.4.0 uses the correct commands (`flatpak search` and `snap find`) with organized results displaying package name, description, and ID.

### System Maintenance Tools

GT-CLPM includes tools to automatically fix broken packages, create backups of installed package lists for later reinstallation, and restore the list from backup.

## Version Comparison

| Feature | v1.0 | v1.1 | v1.2.2 | v1.4.0 |
|---------|------|------|--------|--------|
| Smart removal | ❌ | ✅ | ✅ | ✅ |
| Install from search results | ❌ | ✅ | ✅ | ✅ |
| Correct Flatpak search | ❌ | Partial | ✅ | ✅ |
| Complete language tools | ❌ | Partial | ✅ | ✅ |
| Repository management | ❌ | ❌ | ✅ | ✅ |
| Spack / Conda / Mamba | ❌ | ❌ | ✅ | ✅ |
| KDialog support (KDE/Qt) | ❌ | ❌ | ❌ | ✅ |
| Automatic desktop detection | ❌ | ❌ | ❌ | ✅ |
| Graphical password prompt | ❌ | ❌ | ❌ | ✅ |
| Dist Upgrade | ❌ | ❌ | ❌ | ✅ |
| Zenity/KDialog switching from settings | ❌ | ❌ | ❌ | ✅ |

## Installation

### Automatic Installation (GUI Version)
```bash
curl -fsSL https://raw.githubusercontent.com/SalehGNUTUX/GT-CLPM/main/install-gui.sh | bash
```

### Automatic Installation (CLI Version)
```bash
curl -fsSL https://raw.githubusercontent.com/SalehGNUTUX/GT-CLPM/main/install.sh | bash
```

### Manual Installation
```bash
git clone https://github.com/SalehGNUTUX/GT-CLPM.git
cd GT-CLPM
chmod +x install-gui.sh && ./install-gui.sh
```

### AppImage (No Installation Required)
```bash
# Download and run GUI version
chmod +x GT-CLPM-GUI-x86_64.AppImage
./GT-CLPM-GUI-x86_64.AppImage

# Or CLI version
chmod +x GT-CLPM.CLI.-x86_64.AppImage
./GT-CLPM.CLI.-x86_64.AppImage
```

## Usage

After installation, run the tool using:
```bash
# For GUI
gt-clpm-gui

# For CLI
gt-clpm
```

The main menu will appear with options: Install new package, Remove installed package, Search for package, Update system, Manage repositories, Maintenance tools, Language and theme settings, and Exit.

## Uninstallation

### Uninstall GUI Version
```bash
curl -fsSL https://raw.githubusercontent.com/SalehGNUTUX/GT-CLPM/main/uninstall-gui.sh | bash
```

### Uninstall CLI Version
```bash
curl -fsSL https://raw.githubusercontent.com/SalehGNUTUX/GT-CLPM/main/uninstall.sh | bash
```

## Summary

GT-CLPM is not a tool only for professionals. It is a project aimed at making software management on Linux accessible to regular users, without needing to memorize dozens of different commands. With version 1.4.0, it has become more integrated with different desktop environments, and more powerful in system management. If you have difficulty remembering APT, DNF, or Pacman commands, or want a single tool that handles everything including Flatpak, Snap, pip, and npm, this project is worth trying.

## Quick Links

[https://salehgnutux.github.io/GT-CLPM](https://salehgnutux.github.io/GT-CLPM)

[https://github.com/SalehGNUTUX/GT-CLPM](https://github.com/SalehGNUTUX/GT-CLPM)

[https://github.com/SalehGNUTUX/GT-CLPM/releases](https://github.com/SalehGNUTUX/GT-CLPM/releases)
