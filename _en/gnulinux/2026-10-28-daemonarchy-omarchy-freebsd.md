---
layout: post
title: 'Daemonarchy: When Omarchy Moves from Linux to FreeBSD with the Help of AI'
category: gnulinux
author: GNUTUX
excerpt: >-
  After Omarchy's success on Arch Linux, one of FreeBSD's founders, Jordan
  Hubbard, decided to bring the same experience to FreeBSD in a project called
  Daemonarchy. Learn about both projects, their differences, what has been
  accomplished, and what users can expect.
image: daemonarchy-omarchy-freebsd-gnutux-en.jpg
tags:
  - Daemonarchy
  - Omarchy
  - FreeBSD
  - Hyprland
  - Jordan Hubbard
  - DHH
  - Wayland
  - BSD
also_in:
  - foss
date: 2026-10-28T09:12:00.000Z
lang: en
slug: daemonarchy-omarchy-freebsd
---

## From Arch to FreeBSD: The Same Experience, a Different Foundation

In the free software world, it is rare to see a project decide to port an entire desktop experience from one operating system to another. But that is exactly what happened when **Jordan Hubbard**, one of the three founders of FreeBSD in 1993, decided to take the **Omarchy** experience that became famous on Arch Linux and rebuild it to run on FreeBSD.

The result is **Daemonarchy**, a completely independent project, not officially affiliated with Omarchy or the FreeBSD project.

🔗 **Omarchy (Original):** [omarchy.org](https://omarchy.org)
🔗 **Daemonarchy (Port):** [github.com/jordanhubbard/daemonarchy](https://github.com/jordanhubbard/daemonarchy)

## What Is Omarchy?

Before diving into Daemonarchy, it is essential to understand the original. **Omarchy** is a project by **David Heinemeier Hansson (DHH)**, the creator of Ruby on Rails and Basecamp. The idea is inspired by the Japanese concept of "Omakase" (entrusting the chef with the choice), but here the chef is DHH, and the meal is a complete, ready-to-work development environment.

Omarchy is not a standalone distribution. It is a **collection of configurations and tools** that transforms a vanilla Arch Linux installation into a ready-to-work environment based on **Hyprland** (a Wayland compositor) and **Neovim**, with a focus on keyboard-driven workflows. It includes tools like Alacritty (terminal), Waybar (status bar), and a set of unified visual themes. The idea is to eliminate hours of manual configuration and start working immediately.

## What Is Daemonarchy?

**Daemonarchy** is Jordan Hubbard's attempt to bring the Omarchy experience to FreeBSD. The name itself plays on "Omarchy" and "Daemon" (the little devil, FreeBSD's mascot).

### How Did the Project Start?
The story began with a discussion on LinkedIn. Some users complained about the difficulty of setting up FreeBSD on modern hardware, and one suggested that FreeBSD needed its own "Omarchy." Jordan Hubbard, who was testing OpenAI's **GPT Astra 6** model at the time, decided to try it himself. The result: the initial version of the project was completed in **under two hours** (excluding build and package testing time). Even the project's name was suggested by the AI.

### What Does It Offer?
Daemonarchy is not a new distribution. It is a **bootable ISO image** (approximately 2 GB in size) containing FreeBSD 16.0-CURRENT with the Omarchy desktop (Hyprland) adapted to run on FreeBSD.

### Technical Differences Between the Two Versions

| Aspect | Omarchy (Linux) | Daemonarchy (FreeBSD) |
|--------|-----------------|------------------------|
| **Base** | Arch Linux | FreeBSD 16.0-CURRENT |
| **Package Manager** | pacman | pkg (with OctoPkg as a GUI) |
| **Wi-Fi Management** | NetworkManager | wpa_supplicant |
| **Audio** | PipeWire | PipeWire |
| **Bluetooth** | via BlueZ | via FreeBSD Bluetooth Stack |
| **Installation** | Script on existing Arch | Standalone ISO with graphical installer |
| **Snapshots** | Snapper (Btrfs) | ZFS Boot Environments |
| **Isolation** | Containers (Docker/Podman) | Jails |
| **Virtualization** | QEMU/KVM | bhyve |
| **Requirements** | 40 GB disk space | 40 GB disk space + internet during install |

Additionally, Daemonarchy adds native FreeBSD tools to the system lineup: Jails (isolated environments), bhyve (virtualization), and DTrace (system monitoring).

### What Has Been Accomplished So Far?
The project is still in its very early stages, but it is progressing at an astonishing pace. From version 1.0.0 on October 9 to version **1.3.1** on October 25, that is 10 releases in less than a month. The necessary packages have been added to the official FreeBSD Ports tree (though some are still under review).

### What Are Users Waiting For?
There are several challenges and ambitions:
- **Stability:** FreeBSD 16.0-CURRENT is a development branch (not a stable release). Each ISO image is tied to a specific snapshot of this branch. This means the system may not be stable enough for daily use yet.
- **Hardware Support:** Some graphics cards (especially NVIDIA in early versions), enterprise Wi-Fi, and Bluetooth audio still need testing.
- **Linux Applications:** Some Linux-exclusive applications need to be tested via **Linuxulator** (FreeBSD's compatibility layer) before they work.
- **The Future:** Jordan Hubbard is working to integrate the project more deeply into FreeBSD, and there is collaboration with the **HyprBSD** project (which offers a similar Hyprland experience) to exchange technical fixes.

## Summary

Daemonarchy is an interesting project, not only because it brings the Omarchy experience to FreeBSD, but because it shows how AI can radically accelerate free software development. Jordan Hubbard, combining his long experience with FreeBSD and modern AI tools, managed to build something that seemed impossible months ago: a modern, easy-to-install Wayland desktop on a BSD system.

But it is still an experimental project. Those who want to try Omarchy on FreeBSD can follow it with enthusiasm, but with the awareness that full stability has not yet arrived. And those who want the original Omarchy on Arch Linux have a mature and stable option.

## Quick Links

[Omarchy — Official Website](https://omarchy.org)

[Daemonarchy — GitHub Repository](https://github.com/jordanhubbard/daemonarchy)

[Daemonarchy — Installation Guide (It's FOSS)](https://itsfoss.com/news/daemonarchy-overview/)

[HyprBSD — Sister Project on FreeBSD](https://linuxgratis.com/en/articles/hyprbsd-daemonarchy-virtio-graphics-freebsd)

Published in the GNU/Linux section – Distributions and News
