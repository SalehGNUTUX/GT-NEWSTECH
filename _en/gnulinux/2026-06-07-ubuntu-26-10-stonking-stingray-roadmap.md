---
layout: post
title: >-
  Ubuntu 26.10 Stonking Stingray: GNOME 51, GStreamer 1.30, and RISC-V Coming in
  October
category: gnulinux
author: GNUTUX
excerpt: >-
  Canonical has revealed the roadmap for Ubuntu 26.10 Stonking Stingray,
  scheduled for release on October 15, 2026. The release will feature GNOME 51,
  Linux kernel 7.2, GStreamer 1.30 with Rust plugins, a package-agnostic App
  Center, full RISC-V support, and migration to dbus-broker.
image: ubuntu2610.jpg
tags:
  - Ubuntu
  - '26.10'
  - Stonking Stingray
  - GNOME 51
  - GStreamer
  - RISC-V
  - dbus-broker
  - App Center
date: 2026-06-07T19:37:00.000Z
lang: en
slug: ubuntu-26-10-stonking-stingray-roadmap
---

## Preparing for 28.04 LTS

With the release and stabilization of Ubuntu 26.04 LTS "Resolute Raccoon", Canonical has already turned its attention to the next development cycle. The October 2026 release, codenamed "Stonking Stingray", is not just an ordinary interim release. It serves as the actual foundation for the upcoming 28.04 LTS, where technologies that will later be inherited by the stable distribution will be tested and prepared.

🔗 **Official Source:** [discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751](https://discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751)
🔗 **Kernel Roadmap:** [discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393](https://discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393)

## Release Date and New Kernel

According to the announced timeline, Ubuntu 26.10 is expected to arrive on **October 15, 2026**. Key development milestones include feature freeze on August 20 and the beta release on September 24.

On the kernel front, Canonical has officially selected **Linux Kernel 7.2** as the target kernel for this release. Expectations indicate that the upstream kernel 7.2 will be released on August 30, 2026, which aligns perfectly with the development schedule. This follows Canonical's new policy of providing each release with the latest major kernel version available at that time.

## Desktop Environment: GNOME 51

Ubuntu 26.10 will come with the latest version of the desktop environment, **GNOME 51**. This release is expected to be published in September 2026 and will be integrated directly into the distribution. This update aims to improve user experience with a cleaner interface and better performance. This step allows developers to test the latest GNOME improvements and ensure their stability before they are integrated into the upcoming 28.04 LTS.

The image below shows the Ubuntu 26.10 Stonking Stingray logo:

![Ubuntu 26.10 Stonking Stingray Logo](https://discourse.ubuntu.com/uploads/default/original/1X/8b1f5c0b3e2d4f6a7c8d9e0f1a2b3c4d5e6f7a8b.png)

## GStreamer 1.30 and Rust Plugins

One of the fundamental improvements in this release is the transition to **GStreamer 1.30**, the core multimedia framework in Ubuntu. This step comes to address obstacles users previously faced with media playback.

GStreamer 1.30 brings a set of new plugins written in the **Rust** language. Using Rust enhances the security and efficiency of these components and provides improved support for HDR10+ and AV1 technologies. Also, the codec detection and installation mechanism has been improved, with clearer user messages when proprietary codecs need to be installed to play certain formats.

## App Center: Package Agnostic

One of the most anticipated features is the update to the **App Center** to become independent of package type. The unified interface will integrate search across **DEB**, **Snap**, and **Flatpak** formats in one place. This finally gives users the freedom to choose their preferred package format without needing separate tools or terminal commands, while maintaining a smooth search and installation experience.

## Migration to dbus-broker

As part of updating the core infrastructure, Canonical will migrate from the traditional `dbus-daemon` to **dbus-broker**. This change, which may not be visible to the average user, aims to improve system performance, reliability, and security in managing inter-process communication. It is a fundamental upgrade that makes the system more efficient at handling tasks.

## RISC-V Architecture Support

Canonical appears serious about supporting the open RISC-V architecture. With the 26.10 release, Ubuntu will deliver a **complete** desktop experience on hardware compliant with the **RVA23** standard. This marks a milestone for early adopters of this architecture, as it will enable them to use Ubuntu as a primary work environment on their devices, strengthening Ubuntu's position as a leading platform for open source computing.

## Additional Improvements

Other improvements coming in this release include:

Simplified installation and initial setup with a new installation experience that reduces complexity during disk partitioning and storage setup, along with onboarding to help new users customize their system.

Improved driver management interface providing more detailed information about status and compatibility.

Accessibility improvements continuing work toward WCAG 2.2 AA compliance, with improvements in the Flutter ecosystem.

## Summary

Ubuntu 26.10 "Stonking Stingray" is not just a passing interim release. With the adoption of GNOME 51, kernel 7.2, GStreamer 1.30, the transition to dbus-broker, and a major step toward RISC-V support, this release represents a significant stage of maturity. It serves as a direct testing ground for the technologies that will form the foundation of Ubuntu 28.04 LTS. If you are an Ubuntu user who likes to stay informed about the latest Canonical developments, this release is worth following closely.

## Quick Links

[https://discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751](https://discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751)

[https://discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393](https://discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393)

[https://ubuntu.com/download](https://ubuntu.com/download)
