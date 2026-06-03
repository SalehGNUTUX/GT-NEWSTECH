---
layout: post
title: >-
  Transmission 4.1.2: New Bugfix Release Focused on Download Stability and
  Tracker Fixes
category: foss
author: GNUTUX
excerpt: >-
  The Transmission team has released version 4.1.2 of the open source BitTorrent
  client, a bugfix update focused on stability improvements, addressing issues
  like downloads stalling at 99%, weak TCP connections, and multiple fixes for
  the GTK, Qt, and Web interfaces.
image: transmission_gnutux.png
tags:
  - Transmission
  - BitTorrent
  - Torrent
  - Free Software
  - Open Source
  - Linux
date: 2026-06-03T11:56:00.000Z
lang: en
slug: transmission-4-1-2-bugfix-release
---

## A Stability-Focused Update

Three and a half months after version 4.1.1, the Transmission team announced the 4.1.2 update on June 1, 2026. This release is a maintenance update focused primarily on bug fixes and stability improvements for the popular open source BitTorrent client, without introducing major new features. The update is available for Linux, Windows, and macOS.

🔗 **Official Website:** [transmissionbt.com](https://transmissionbt.com)

## Key Download and Tracker Fixes

The new release addresses a frustrating issue that some users experienced: downloads stalling at 99% and failing to complete. This bug occurred infrequently but was highly frustrating for users waiting for large files to finish downloading.

A bug that caused duplicate HTTP announce messages to be sent to trackers has also been fixed, reducing unnecessary data traffic and load on tracker servers. Additionally, a bug that prevented establishing TCP connections with peers on some systems has been resolved.

## Multiple User Interface Fixes

The GTK version, used by users of desktop environments like GNOME and Xfce, received two important fixes. The first prevents incorrectly translated logging level strings from appearing. The second fixes a crash that occurred when toggling the alternative speed limits mode.

The Qt version, preferred by KDE users, has a fix for a crash that occurred when parsing certain RPC responses from older Transmission servers. A bug that caused both old and new setting names to be saved in the settings.json file has also been fixed, which could lead to setting conflicts.

The Web UI received two fixes. The first addresses incorrect timestamp display, such as showing 6.75:45 instead of 6:45 in some dropdown menus. The second fixes a bug that displayed incorrect torrent status when reconnecting to the server after connection loss.

The macOS version received improvements in the interface code to reduce CPU usage, extending battery life on Mac laptops.

## Security and Technical Improvements

Starting with this release, Transmission no longer adds redundant zeros to blocklist files when downloading them from a remote link. This reduces the size of downloaded files without affecting blocking effectiveness.

Sanitization has been added for UTF-8 client names provided by peers during handshake, preventing any attempts to inject malicious data through this field. Additional protections have been added for HTTP responses to prevent clickjacking attacks, adding another security layer for the web interface.

## Under the Hood Fixes

A bug that caused subsequent torrents to fail loading if one torrent failed due to a parsing error has been fixed. An upgrade bug that could overwrite utp_enabled and tcp_enabled settings has been resolved. A crash that occurred when a peer provided a reqq value smaller than 32 during LTEP handshake has been addressed. A problem that caused loss of torrent order when moving a queue position up or down in some edge cases has also been fixed.

A regression has been fixed that caused download and upload statistics to be periodically written to disk even when Transmission has been idle since the last write, which prevented the statistics file disk from entering sleep mode.

## How to Get Transmission 4.1.2

### On Linux
```bash
# Ubuntu/Debian
sudo apt install transmission-gtk

# Fedora
sudo dnf install transmission

# Arch Linux
sudo pacman -S transmission-gtk
```

### On Windows
Download the installer from the official website at [transmissionbt.com/download](https://transmissionbt.com/download)

### On macOS
Download the application from the official website or via Homebrew:
```bash
brew install transmission
```

### AppImage (All Distributions)
An AppImage package for direct execution without installation is available through the GitHub releases page.

## Summary

Transmission 4.1.2 is not a revolutionary release, but it is important for anyone who relies on this client for downloading large files. Fixes such as addressing the 99% stall, improving TCP connection stability, and fixing crashes in the GTK, Qt, and Web interfaces make this update worth installing. If you are still using an older version, especially 4.1.1 or 4.1.0, upgrading is recommended for a more stable experience.

## Quick Links

[https://transmissionbt.com](https://transmissionbt.com)

[https://transmissionbt.com/download](https://transmissionbt.com/download)

[https://github.com/transmission/transmission/releases](https://github.com/transmission/transmission/releases)
