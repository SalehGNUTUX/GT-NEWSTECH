---
layout: post
title: >-
  Linux 7.1 Released: New NTFS Driver and Major Improvements for Intel and AMD
  Processors
category: gnulinux
author: GNUTUX
excerpt: >-
  Linus Torvalds announced the stable release of Linux kernel 7.1, which arrived
  after a development cycle challenged by unprecedented AI-generated bug
  reports. The new kernel features a completely rewritten NTFS driver, default
  activation of Intel FRED, significant improvements for older AMD cards, and
  the final removal of i486 processor support.
image: linux-7.1-gnutux.webp
tags:
  - Linux Kernel
  - NTFS
  - Intel FRED
  - AMDGPU
  - i486
also_in:
  - tech-news
date: 2026-06-15T12:15:00.000Z
lang: en
slug: linux-7-1-kernel-release
---

## A New Kernel at an Unusual Time

On June 14, 2026, Linus Torvalds announced the stable release of Linux kernel 7.1. The announcement came half a day earlier than usual due to Torvalds travel plans, as he was writing from a different time zone. This release is the first in the 7.x series following the major 7.0 release in April.

The Linux 7.1 development cycle was exceptional by any measure. The kernel mailing list experienced an unprecedented flood of AI-generated bug reports, increasing from 5 to 10 reports per month to many times that number. Linus himself described the situation as unmanageable. Despite these challenges, the kernel was released on schedule with a large set of improvements and changes.

🔗 **Official Source:** [kernel.org](https://kernel.org)

## A New NTFS Driver After Four Years of Development

The biggest change in Linux 7.1 is the replacement of the old NTFS driver with a completely new one, after four years of development. The new driver is built on the iomap infrastructure in the kernel and supports folio and delayed allocation. Linus Torvalds described this merge as an "ntfs resurrection."

The practical benefits are substantial. The old driver had limited write capabilities and was prone to corruption when handling large files. The new driver provides:

Full write support with much better performance.

Support for large files and concurrent operations.

A new command-line tool called `ntfsprogs-plus` for managing NTFS filesystems.

However, the old NTFS3 driver remains available as a fallback option for users who prefer it.

## Intel FRED Enabled by Default for Panther Lake Processors

Intel FRED technology, which stands for Flexible Return and Event Delivery, has been enabled by default in Linux 7.1. Previously, users needed to add the boot parameter `fred=on` to activate it.

FRED redesigns how the processor handles interrupts and system calls, reducing latency and improving performance in I/O-heavy applications such as databases, network applications, and audio processing. This technology is particularly beneficial for upcoming Intel Panther Lake processors, which are expected to benefit significantly from this improvement.

## AMD Improvements: Older Cards Get Better Performance

Owners of older AMD cards receive a gift in this release. Many older APU processors such as Kaveri, Kabini, and Mullins have been migrated from the legacy Radeon driver to the modern AMDGPU driver. This means:

Out-of-the-box Vulkan support through the RADV driver.

Performance improvements of up to 30 percent in some cases.

Improved compatibility with modern applications.

Additionally, the amd-pstate driver for the power management subsystem received further improvements, including CPPC Performance Priority, Dynamic EPP, and Raw EPP for fine-grained control over power consumption and performance on modern AMD Ryzen and EPYC processors.

## Farewell to i486 Processors

After 37 years since the launch of the Intel 80486 processor in 1989, Linux kernel 7.1 has finally removed support for this architecture. This decision was expected after years of indications that maintaining i486 compatibility had become a burden with no real benefit. Removing legacy i486 code simplifies the codebase and improves performance on modern processors.

## New Hardware Support and Security Improvements

### Gaming Devices and Controllers

The kernel added two new drivers for Lenovo Legion Go devices and Lenovo Yoga devices, improving fan speed monitoring and overall integration. Support for controllers such as the ASUS ROG RAIKIRI II and GameSir Nova 2 Lite has also been improved.

### New SoCs

Linux 7.1 now supports 12 new system-on-chips, including Qualcomm Glymur, Mahua, and Eliza, Axis ARTPEC-9, Rockchip RV1103B, and ARM Zena.

### RISC-V Improvements

Support for the open RISC-V architecture has been improved, with HDMI support for boards such as the BeagleV Ahead and Lichee Pi 4A.

### Additional Security

The kernel added support for Landlock to protect UNIX domain sockets, and support for generating and verifying T10 protection information at the filesystem level.

## How to Obtain the Kernel

For rolling release distribution users such as Arch Linux, the kernel will arrive in repositories within days. For Fedora users, it will also be available shortly. Users of stable distributions such as Debian or Ubuntu will need to wait until distribution teams integrate the kernel into their upcoming releases.

For developers and advanced users, the source code can be downloaded from kernel.org or Git, and the kernel can be built manually.

## Summary

Linux 7.1 is not just a point release. It is a version carrying substantial changes that affect millions of users. The new NTFS driver ends years of struggle with poor Windows filesystem compatibility. FRED activation prepares the kernel for upcoming Intel processors. AMD improvements give new life to older devices still widely used. And the removal of i486 frees the kernel from a three-decade-old legacy.

Despite the challenges posed by AI-generated reports on the development process, the community once again proved its ability to overcome obstacles and deliver a stable and powerful kernel on time.

## Quick Links

[https://kernel.org](https://kernel.org)

[https://git.kernel.org](https://git.kernel.org)

[https://www.phoronix.com/news/Linux-7.1-Released](https://www.phoronix.com/news/Linux-7.1-Released)

Published in the GNU/Linux section – Kernel News
