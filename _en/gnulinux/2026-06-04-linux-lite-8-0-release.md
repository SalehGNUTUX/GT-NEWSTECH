---
layout: post
title: 'Linux Lite 8.0 ''Hematite'': A Major Leap for the Beginner-Friendly Distribution'
category: gnulinux
author: GNUTUX
excerpt: >-
  The Linux Lite team has released version 8.0 'Hematite' based on Ubuntu 26.04
  LTS, featuring Linux kernel 7.0, the new Calamares installer, custom gaming
  kernels, and exclusive tools like Lite Distro Builder and MyAI. A foundational
  update after fourteen years of development.
image: linux-lite.jpg
tags:
  - Linux Lite
  - Linux Distributions
  - Xfce
  - Ubuntu 26.04
  - Linux Gaming
  - Tools
date: 2026-06-04T20:46:00.000Z
lang: en
slug: linux-lite-8-0-release
---

## The Beginner-Friendly Distribution Returns Stronger

After a fourteen-year journey, the Linux Lite team has announced version 8.0 "Hematite", representing the largest development cycle in the project's history. This release is not just a cumulative update, but a complete rebuild of the codebase, with radical changes spanning from the kernel to the user interface, through system tools and installation.

🔗 **Official Website:** [linuxliteos.com](https://www.linuxliteos.com)
🔗 **Download Version 8.0:** [linuxliteos.com/download.php](https://www.linuxliteos.com/download.php)

## System Foundation and High-Performance Kernels

Linux Lite 8.0 is fully based on Ubuntu 26.04 LTS "Resolute". This means users will receive long-term support until 2031, with continuous security updates. The new codename "Hematite", an iron oxide mineral, replaces the previous name "Galena".

The beating heart of the system is Linux kernel 7.0. However, the Linux Lite team did not stop at the standard Ubuntu kernel. They developed two custom kernels under the name "Linux Lite Advanced Performance Kernels":

**linuxlite (Desktop Kernel):** The default desktop kernel. It uses dynamic preemption, balancing responsiveness and throughput.

**linuxlite-gaming (Gaming Kernel):** An optional kernel for users who play games or work with audio and video software. It features full preemption, allowing the kernel to immediately interrupt running tasks to reduce latency. The kernel includes full BORE scheduling adjustments, giving priority to short-burst interactive tasks. It can be installed alongside the base kernel without removing it.

Additionally, all GUI applications have been migrated from GTK3 and WebKit2 to GTK4. This gives the distribution a modern appearance and improves graphical interface performance.

The image below shows the Linux Lite 8.0 logo and the new GTK4-based visual style:

![Linux Lite 8.0 Logo](https://www.linuxliteos.com/images/linux-lite-8-0.png)

## New and Improved Exclusive Applications

This release introduces 14 new or rewritten exclusive applications, including:

**Lite Distro Builder:** A revolutionary tool that allows users to build, customize, and share their own version of Linux Lite. It supports Squashfs compression with zstd option, BIOS and UEFI bootable ISO creation, and MD5 and SHA256 checksum generation.

**Lite About:** A GTK4-based system information application displaying processor, graphics card, memory, storage, network, and audio details.

**Lite System Monitor:** A real-time system resource monitoring tool for CPU, memory, storage, and network, built on System Monitoring Center.

**Lite Game Center:** A central application helping users quickly prepare their system for gaming.

**Lite Kernel Manager:** A tool for managing and updating the two custom kernels, including benchmarking features to measure system performance.

**Lite Core:** A tool for reducing Linux Lite to its minimum and building it according to user preference.

**MyAI:** A local AI assistant that works offline, without requiring an account or sending data to external servers.

Firefox has also returned as the default web browser.

## Key Technical Changes

**Calamares Installer:** Replaced the old Ubiquity installer with Calamares, a more modern and flexible multi-distribution installer. It supports normal and OEM installation for manufacturers, with interface translated into 25 languages. Installation does not require an internet connection.

**DEB822 .sources Format:** APT sources have been migrated from traditional .list files to the DEB822 .sources format.

**Dirty Frag Vulnerability Fix:** The Dirty Frag security vulnerability affecting the Linux kernel has been patched.

**Btop and Fastfetch:** Replaced Htop with Btop and Neofetch with Fastfetch.

**Modern Format Support:** JPEG-XL and HEIC work out of the box without additional installation.

**Additional Filesystems:** Added BTRFS and XFS support during installation, in addition to the default EXT4.

## Compatibility and Requirements

**Size:** The ISO file size has shrunk from 2.77 GB in the previous series to 2.36 GB in version 8.0.

**Requirements:** 1.5 GHz dual-core processor, 4 GB RAM, 40 GB storage, 1366×768 pixel display resolution.

**Upgrade:** The distribution provides the Lite Series Upgrade tool for upgrading from older versions.

## Summary

Linux Lite 8.0 represents a major leap in the world of beginner-friendly distributions and casual users. With the robust Ubuntu 26.04 LTS base, two custom kernels for performance and gaming, and exclusive tools like Lite Distro Builder and MyAI, the project proves it is not just a "lightweight distribution" but a complete platform for users with varying experience levels.

If you are looking for a stable Linux distribution that is easy to use, supports gaming well, and comes with the latest kernel and applications, Linux Lite 8.0 is worth trying.

## Quick Links

[https://www.linuxliteos.com](https://www.linuxliteos.com)

[https://www.linuxliteos.com/download.php](https://www.linuxliteos.com/download.php)

[https://www.linuxliteos.com/linux-lite-kernel.html](https://www.linuxliteos.com/linux-lite-kernel.html)

[https://www.linuxliteos.com/linux-lite-kernel-comparison.html](https://www.linuxliteos.com/linux-lite-kernel-comparison.html)
