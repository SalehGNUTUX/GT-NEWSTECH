---
layout: post
title: >-
  COSMIC Desktop 1.0.15: Major Gaming Improvements and Multi-Window Fullscreen
  Support
category: gnulinux
author: GNUTUX
excerpt: >-
  System76 released version 1.0.15 of the COSMIC desktop environment built in
  Rust, featuring multi-window fullscreen support within a single workspace,
  implementation of the pointer constraints protocol to improve gaming
  experience, RPM package support in COSMIC Store, and multiple improvements
  across companion applications.
image: cosmic_desktop.jpg
tags:
  - COSMIC
  - System76
  - Pop!_OS
  - Wayland
  - Desktop
  - Linux
  - Rust
also_in:
  - foss
date: 2026-06-03T20:23:00.000Z
lang: en
slug: cosmic-desktop-1-0-15
---

## The Desktop Environment Redefining Customization

After years of development, System76 launched the COSMIC desktop environment as an open source alternative written entirely in Rust, aiming to deliver a modern desktop experience focused on customization and performance. COSMIC relies completely on the Wayland protocol and ships as the default desktop environment in Pop!_OS 24.04 LTS, which was released in December 2025. With version 1.0.15, System76 continues to improve the environment's stability and add important features for both home users and developers.

On June 2, 2026, System76 announced COSMIC 1.0.15, arriving just one week after version 1.0.14. This update focuses primarily on improving the gaming experience, fixing tray icon issues, supporting RPM packages, and multiple improvements across companion applications.

🔗 **Official Website:** [system76.com/cosmic](https://system76.com/cosmic)
🔗 **GitHub Repository:** [github.com/pop-os/cosmic-epoch](https://github.com/pop-os/cosmic-epoch)

## Core Gaming Improvements

Gaming on Wayland has been challenging for some applications due to the absence of the `pointer constraints` protocol. This protocol is essential for first-person shooter games and 3D games where the player needs to "lock" the mouse pointer inside the game window to prevent it from escaping when turning or aiming.

Version 1.0.15 implements this protocol for the first time in COSMIC. This means the gaming experience is now on par with pure Wayland without needing helper tools like Gamescope. Users who previously experienced the cursor disappearing or escaping from the game window will notice significant improvement.

COSMIC also added support for multiple fullscreen windows within a single workspace. This fix addresses an annoying issue affecting Steam Big Picture Mode users, which turns Steam into a console-like interface. Previously, opening one fullscreen window such as a game would hide other windows, and switching between Steam Big Picture and the game caused confusion. Now, multiple windows can be in fullscreen state within the same workspace, with smooth switching between them.

![COSMIC Gaming](https://www.phoronix.com/assets/categories/gaming.jpg)

## COSMIC Applications and Improvements

### COSMIC Store

The COSMIC Store adds support for opening RPM packages. This expands beyond traditional DEB formats, allowing installation of packages from distributions like Fedora and openSUSE directly from the store. This step makes COSMIC more attractive to users who move between multiple distributions or need specific software packaged as RPM.

### COSMIC Terminal

The terminal receives a set of major updates in this release:

- Option to open new windows in the current directory, saving time when navigating between folders.
- Support for more named key names for shortcuts, enabling deeper keyboard customization.
- Fixed scrolling issues in some programs such as terminal fallback tools.
- Avoid unnecessary text shaping at startup, speeding up launch time.
- Increased default scrollback history to 100,000 lines. This is important for developers working with long build outputs or server logs, as the log no longer cuts off when reaching the previous limit.
- Fixed Ctrl+Shift+_ key mapping which was previously broken.

### COSMIC Files

The file manager receives improvements to the Wayland context menu. Previously, item highlighting on mouse hover did not work correctly in some cases. This is now fixed. MIME type association detection has also been improved, ensuring files open with the correct application.

### COSMIC Player

The media player gains the ability to adjust playback speed. Podcasts, lectures, and educational videos can be sped up or slowed down directly from the application without needing external tools.

### COSMIC Settings

Fixed issues with default application association. Previously, some applications might not appear in the list or were associated incorrectly. Settings are now more accurate.

### COSMIC Screenshot

Fixed a bug that caused screenshots not to be saved in the specified folder when using interactive mode. This was a frustrating issue for users who take multiple screenshots and find them scattered in default folders.

## Applet Improvements

### Tray Icons

Fixed the disappearing tray icon issue for many applications, including Dropbox. This was one of the most common complaints among Wayland users in general, as applications handle tray icons differently on Wayland compared to X11. The fix makes COSMIC more suitable for daily use that relies on background applications like Dropbox, Nextcloud, and Telegram.

### Bluetooth

Fixed a bug causing the Bluetooth applet to display as "off" even when a Bluetooth device was connected and working. This was confusing for users checking Bluetooth status quickly through the applet.

### Battery

Fixed a panic in the battery applet that occurred in rare conditions when reading battery status. This makes the system more stable on laptops.

### VPN

The VPN list now skips unsaved connections, making the list cleaner and more focused on networks already in use.

## Compositor and Window Management Improvements

Version 1.0.15 integrates several improvements into `cosmic-comp`, the core compositor:

- It now maintains focus after switching between windows via Alt+Tab to another output. Previously, focus could be lost when switching between multiple screens.
- Added a configuration option for `xdg activation` behavior, which controls how windows "steal" focus when opened. This prevents applications from suddenly jumping to the front.
- During session lock, keyboard layout switching shortcuts and brightness and volume controls still work. This is a notable usability improvement, as you no longer need to unlock to lower volume or switch language.

## libcosmic and Core Component Improvements

`libcosmic` is the core toolkit library on which COSMIC applications are built. It received a fix for keyboard shortcut matching when using layout variants such as Dvorak. The COSMIC launcher was also improved by reusing loaded fonts within the SVG engine, speeding up icon and vector graphics rendering.

## Translations and Updates

This release includes updates to translations and dependencies across multiple COSMIC components, improving language support and compatibility with modern libraries.

## Installation

### On Pop!_OS 24.04 LTS

For Pop!_OS 24.04 LTS users, the update is already available through the regular package manager. Run:

```bash
sudo apt update
sudo apt upgrade
```

### On Other Distributions

For rolling release distribution users such as Arch Linux and openSUSE Tumbleweed, packages are expected to reach repositories soon.

For those wanting to try COSMIC on Ubuntu 24.04 LTS, there is an unofficial community PPA containing COSMIC and required dependencies:

```bash
sudo add-apt-repository ppa:hepp3n/cosmic-epoch
sudo apt update
sudo apt install cosmic-session
```

**Warning:** This PPA is unofficial and may update sensitive components such as Mesa, Wayland, Xwayland, and the Rust compiler. It is strongly recommended to take a full system backup using Timeshift before installation.

## Summary

COSMIC Desktop 1.0.15 is an important maintenance update focusing on addressing real issues users faced in previous versions. Fixing gaming issues through `pointer constraints` removes a major barrier for gamers. Multi-window fullscreen support improves the Steam Big Picture Mode experience. Fixing tray icons and Bluetooth makes daily use smoother. RPM store support and terminal improvements serve professional users. This upward trajectory indicates that COSMIC is maturing rapidly and becoming a viable alternative not only for Pop!_OS users but for anyone seeking a modern desktop environment in the Wayland world.

## Quick Links

[https://system76.com/cosmic](https://system76.com/cosmic)

[https://github.com/pop-os/cosmic-epoch](https://github.com/pop-os/cosmic-epoch)

[https://github.com/pop-os/cosmic-epoch/releases/tag/epoch-1.0.15](https://github.com/pop-os/cosmic-epoch/releases/tag/epoch-1.0.15)
