---
layout: post
title: >-
  LordOS: A Linux Distribution Built from Scratch with a React UI and a C
  Display Server
category: gnulinux
author: GNUTUX
excerpt: >-
  LordOS is a new Linux distribution based on Debian, but it differs from almost
  everything else: a display server and Wayland compositor written in C from
  scratch, a React UI engine running on QuickJS, and lightweight native apps. It
  uses only 465 MB of RAM and boots in 16 seconds.
image: lordos-gnutux-en.png
tags:
  - LordOS
  - Linux Distributions
  - Wayland
  - C
  - React
  - QuickJS
  - Raspberry Pi
  - Debian
date: 2026-11-01T10:55:00.000Z
lang: en
slug: lordos-custom-linux-desktop
---

## A Distribution Unlike Any Other

Most Linux distributions today are built by combining an existing desktop environment (GNOME, KDE, XFCE) on top of another distribution's foundation. The result is a system that works, but is not fully designed as an integrated experience. **LordOS** takes a completely different path: it is a Debian-based distribution, but it has developed its **own desktop environment from scratch**, including a display server and Wayland compositor, written in **C**.

The idea is bold: instead of relying on X11 or a ready-made Wayland compositor, the team wrote its own display server (`lord-server`) that talks directly to the kernel (DRM/KMS and evdev) without libdrm or libinput. The result, according to the developers, is a lightweight, fast system designed to feel "calm, clear, and private."

🔗 **Official Website:** [lordos.org](https://lordos.org)
🔗 **Official Repository:** [github.com/lordbasex/LordOS](https://github.com/lordbasex/LordOS)

## What Makes LordOS Different?

### A Display Server and Wayland Compositor Written in C
This is the fundamental difference. LordOS does not use Mutter, KWin, or Sway. It has its own display server, `lord-server`, written in C, which works directly with the kernel. This gives it complete control over everything, from window management to rendering, and reduces dependencies and intermediate layers.

### A React UI Engine on QuickJS
The graphical interface (windows, buttons, applications) is built using **React**, running on the **QuickJS** engine (a very lightweight JavaScript engine). This means developers can build interfaces using familiar web technologies, without the heavy weight of Chromium or Electron.

### Performance: Numbers That Speak
- **465-487 MB** of RAM at idle (for the entire system), of which only **32-36 MB** is the display server with the entire desktop.
- **16 seconds** to boot.

These figures are impressive, especially compared to traditional desktop distributions that consume 1.5-2 GB at idle.

### Native Applications
LordOS comes with a set of native applications designed to be visually and functionally consistent:
- **Mail, Calendar, and Contacts:** Native apps for your accounts, with remote images blocked until you allow them.
- **Passwords:** A vault for passwords, 2FA codes, and cards, unlocked with a password or a USB key.
- **Files, Photos, Player, and Notes:** Essential applications.
- **Monitor:** Monitoring CPU, memory, network, and disks, with temperatures and fans.

### Privacy and Security
- **Application isolation:** Installable apps run isolated and ask for permission before using the camera, microphone, files, or network.
- **A visible firewall:** Watch every connection on a live world map, allow or block it per app, or subscribe to blocklists for ads, trackers, and malware.
- **Signed releases:** Every release is signed with an Ed25519 key.

### Compatibility with Linux Apps
Although LordOS has its own native apps, it does not isolate itself. You can run Chromium, Firefox, and GTK and Qt apps, and they will appear with the same window frame and dark mode, looking like part of the system.

## Supported Platforms

| Platform | Format |
|----------|--------|
| **PC (x86_64)** | Live and installable ISO (`lordos-live-0.8.6-amd64.iso`) |
| **Raspberry Pi 5 (arm64)** | Ready-to-flash image for SD or NVMe (`lordos-0.8.6-rpi5-arm64.img.xz`), with fan control and a custom kernel |
| **Existing Debian 13** | Install LordOS on top of your current system with one command |

## Installation

### On PC (64-bit)
Download the ISO from the official website, then write it to a USB stick using **LordOS Imager** (an open source tool that comes with the system), or any other writing tool like `dd`.

### On Raspberry Pi 5
Download the image, decompress it, and write it to an SD card or NVMe. You can use LordOS Imager to set up the first boot (name, account, Wi-Fi, remote access, appearance, and cooling).

### On Existing Debian 13
If you are already running Debian 13, you can add LordOS with one command:
```bash
curl -fsSL https://lordos.org/install.sh | sh
```
On a headless server, add `--remote-desktop` and use it from your browser.

## Verifying Your Download

Every release is signed with the LordOS key (Ed25519). Key fingerprint (SHA-256):
```
c7155b8e6bbbb180f907381994d06af76d333016cd6f3facf67cadd053ea108e
```
It is advisable to verify the signature before installing.

## Who Is This System For?

**Suitable for:**
- Those who want a very lightweight and fast system, especially on Raspberry Pi 5.
- Those who want a different desktop experience, built from scratch, not just an installation of an existing environment.
- Those who care about precise control over privacy and security (visible firewall, app isolation).
- Developers who want to experiment with building React interfaces on a lightweight engine (QuickJS).

**Not suitable for:**
- Those who want complete stability (the system is still in **Beta**, version 0.8.6).
- Those who need broad hardware support (the system only supports Raspberry Pi 5 as an ARM platform).
- Those who want a mature desktop environment with all expected applications (LordOS has essential apps, but not the maturity of GNOME or KDE).

## Summary

LordOS is a bold and interesting experiment. Instead of following the familiar path (a distribution + a ready-made desktop environment), the team chose to build everything from scratch: the display server, the interface engine, and the applications. The result is an exceptionally lightweight, fast, and carefully designed system. But it is still in beta, and needs more time and maturity before it becomes a daily option for everyone. If you are an enthusiast of new experiments, or a Raspberry Pi 5 user looking for a lightweight and fast system, LordOS is worth following and trying.

## Quick Links

[LordOS — Official Website](https://lordos.org)

[LordOS — Official GitHub Repository](https://github.com/lordbasex/LordOS)

[LordOS — Download Page](https://lordos.org/#download)

[LordOS Imager — Official Writing Tool](https://lordos.org/imager)
