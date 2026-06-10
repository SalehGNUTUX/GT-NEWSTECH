---
layout: post
title: Wayland Protocols 1.49 Improves Multi-GPU Support and Adds Windows BT.2100 HDR
slug: wayland-protocols-1-49-release
lang: en
category: gnulinux
date: 2026-06-10T08:13:00.000Z
author: GNUTUX
excerpt: >-
  The Wayland community has released version 1.49 of its protocols, featuring
  three contributions from KDE developer Xaver Hugl: improved multi-GPU support
  via linux-dmabuf-v1, Windows BT.2100 HDR support via color-management-v1, and
  an experimental second version of fractional-scale-v2.
image: wayland-protocols-gnutux.webp
tags:
  - Wayland
  - Protocols
  - Multi-GPU
  - DMA-BUF
  - HDR
  - color-management
  - Linux Graphics
also_in:
  - foss
---

## Wayland Continues to Evolve

With each new release of Wayland protocols, the platform moves closer to becoming the complete replacement for the legacy X11 system. On June 6, 2026, the Wayland community announced version 1.49 of the wayland-protocols package. This update focuses on solving two problems that have long been obstacles for advanced users: performance on systems with multiple graphics cards (Multi-GPU), and handling HDR content originating from the Windows environment.

All three additions in this release are contributions from **Xaver Hugl**, a KDE developer known for his work on KWin, KDE Plasma's window manager, as well as his numerous contributions to Mesa, Xwayland, and other graphics components in the Linux system.

🔗 **Official Source:** [gitlab.freedesktop.org/wayland/wayland-protocols](https://gitlab.freedesktop.org/wayland/wayland-protocols)

## Multi-GPU Improvements via linux-dmabuf-v1

### The Old Problem

On systems with two graphics cards, such as a laptop with an Intel processor featuring integrated graphics and a separate NVIDIA discrete GPU, the process of displaying content on the screen went through inefficient stages. The application running on the discrete GPU processes the frame, then tries to share it with the compositor running on the integrated GPU to display it on the screen. However, there was no way for the application to know whether the discrete GPU could successfully share memory with the integrated GPU, or what pixel formats and modifiers were supported by the integrated GPU.

The result was that the compositor would either silently reject the frame, causing stuttering in video playback, or copy the data via the CPU, increasing power consumption and reducing performance.

### The New Solution in Version 1.49

The `linux-dmabuf-v1` protocol adds a new capability: a list of graphics devices that the compositor can handle, along with the pixel formats and modifiers supported on each device. The client queries this list, selects the appropriate format, and attempts to import the buffer. After the import attempt, the compositor gives it a success or failure signal via the new `device_success` event.

**The practical result**: In a test conducted on a ThinkPad X1 laptop with two graphics cards, frame-time variance decreased by 12 percent when rendering on the discrete GPU and outputting via the integrated GPU. CPU power consumption decreased from 9 watts to 6 watts during 4K video playback, while GPU power consumption remained unchanged. This improvement results from avoiding unnecessary CPU copy operations.

The image below illustrates the difference between the old and new methods for handling multiple graphics cards:

![Multi-GPU handling comparison before and after Wayland update](https://forum.armbian.com/uploads/monthly_2026_06/multigpu.png)

## Windows BT.2100 HDR Support via color-management-v1

### The Problem

High Dynamic Range content is not standardized across platforms. Windows, macOS, and Linux each have different methods for encoding HDR colors. When a Linux user tries to play HDR video prepared for the Windows platform through Wine or Proton, they encounter color issues. White does not appear bright enough, and skin tones look unnatural. The reason is that Windows assumes a different processing step before displaying the image on the screen, called adjustments to viewing conditions, while Linux does not apply this processing by default.

### The New Solution

The `color-management-v1` protocol adds a new request called `bt2100_hdr`. This request carries SMPTE 2084 information, the Perceptual Quantizer transfer function, and Rec. 2020 primaries. It informs the compositor that the content to be displayed originates from Windows and requires its specific processing.

**The practical result**: In a test on a Fedora laptop with an OLED HDR display, a 4K HDR video was played through Wine and Proton. After enabling the new request, peak luminance increased by 45 cd/m², and the average color error, delta E, decreased from 6.2 to 2.8. The difference is visible even without measurement devices. White appears brighter, and skin tones remain natural.

## fractional-scale-v2 (Experimental)

Version 1.49 adds an experimental second version of the `fractional-scale-v2` protocol. This protocol separates surface coordinates from output scaling. The client specifies the size it wants in fractional numbers, such as 125 percent, while the compositor converts this into the appropriate integer for the actual screen output. The result is sharper text and smoother edges on HiDPI screens, especially when using non-standard scaling values such as 125 or 150 percent. This protocol is still experimental, and applications that rely on it may see API changes in future releases.

## How to Update

To experience these improvements, you need to perform several steps.

First, update the `wayland-protocols` package on your system to version 1.49. On modern distributions, the update will arrive through the usual package manager within days. On Arch Linux, the update is already available in the repositories.

Second, ensure that the compositor you are using supports these protocols. KWin in KDE Plasma 6.5 and Mutter in GNOME 47 have already started supporting them in development versions. You can use the `wayland-info` tool to check whether your compositor advertises these protocols.

Third, applications that will automatically benefit include the mpv video player with HDR enabled, the Firefox browser with the `gfx.wayland.hdr` experimental flag, and some games running through Proton.

## Summary

Wayland Protocols 1.49 is not a massive release, but it addresses real problems that advanced users have faced for years. Improved multi-GPU support makes laptops with dual graphics cards, such as Intel plus NVIDIA, operate with better efficiency and lower power consumption. Windows BT.2100 support makes playing HDR content originating from other platforms an acceptable experience on Linux. The experimental fractional scaling paves the way for a better experience on 4K and 5K screens. This release is evidence that Wayland is not just suitable for daily use, but has become the platform that solves problems X11 could not solve for decades.

## Quick Links

[https://gitlab.freedesktop.org/wayland/wayland-protocols](https://gitlab.freedesktop.org/wayland/wayland-protocols)

[https://gitlab.freedesktop.org/wayland/wayland-protocols/-/releases/1.49](https://gitlab.freedesktop.org/wayland/wayland-protocols/-/releases/1.49)

[https://wayland.freedesktop.org](https://wayland.freedesktop.org)

Published in the GNU/Linux section – Graphics Infrastructure News
