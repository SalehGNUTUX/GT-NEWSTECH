---
layout: post
title: 'EtchDroid: Create a Bootable USB Drive Directly from Your Android Phone'
category: phone
author: GNUTUX
excerpt: >-
  EtchDroid is an open source Android application (GPLv3+) that allows you to
  write operating system images to USB drives directly from your phone, without
  requiring root access. Perfect for creating a GNU/Linux bootable USB when you
  don't have another computer available.
image: etchdroid-gnutux.jpg
tags:
  - EtchDroid
  - Android
  - Bootable USB
  - Tools
  - Open Source
  - GPLv3
also_in:
  - foss
date: 2026-07-04T22:32:00.000Z
lang: en
slug: etchdroid-bootable-usb-android
---

## The Problem of Creating Bootable USB Drives Without a Computer

Imagine your computer is not working, and you need to reinstall the operating system. The problem is that you need another computer to download the system image and flash it to a USB drive. This dilemma has faced many people, especially when you are in a place where no other computer is available.

This is where EtchDroid comes in. An Android application that turns your smartphone into a tool for creating bootable USB drives.

## What is EtchDroid?

EtchDroid is a free and open source application (licensed under GPLv3+) that allows you to write operating system images (ISO and IMG) to USB storage devices, without needing root access on your Android phone.

The idea is simple. If your computer is not working and you do not have another computer to prepare a bootable USB, you can use your phone and EtchDroid to get the job done. The application works within the boundaries of the Android API, meaning it is safe and does not require disabling system protections.

## What's New in Version 2.0?

The application underwent a complete rewrite in version 2.0, with significant improvements:

- **New Material You interface:** More intuitive and user-friendly design.
- **Recovery from write failure:** In case of an error during writing, the app will ask you to disconnect and reconnect the USB drive to attempt to resume.
- **Data verification:** After writing is complete, the app verifies the data to ensure no corruption, guaranteeing the bootable USB will work correctly.

## Supported Devices

EtchDroid works primarily with:

✅ **USB storage devices:** Such as USB flash drives.
✅ **USB SD card adapters:** For writing system images like Raspberry Pi to memory cards.

**The application does not support:**

❌ External hard drives or SSDs connected via USB.
❌ Internal card readers in the phone.
❌ USB hubs or Thunderbolt-only ports.

## Supported Operating System Image Types

EtchDroid supports writing a wide range of operating system images, but with some important warnings.

**Supported:**
- ✅ All modern GNU/Linux distributions: Arch Linux, Ubuntu, Debian, Fedora, pop!_OS, Linux Mint, FreeBSD, BlissOS, and many others.
- ✅ Raspberry Pi images (after decompressing the file).

**Not Officially Supported:**
- ❌ Official Windows ISO images. The app does not support them, and its developers mentioned that supporting them might require root access in the future.
- ❌ Apple DMG images.
- ❌ Very old distributions (pre-2010) such as Damn Small Linux.

> **Important Note:** There are community-built Windows images specifically for EtchDroid, but using them may be risky as they could contain viruses, so it is advisable to avoid them.

## How to Use EtchDroid

1.  **Installation:** Download the app from the F-Droid store, the recommended source for open source applications, or from GitHub.
2.  **Connect:** Connect the USB drive to your phone using a USB-C or Micro-USB to USB-A adapter.
3.  **Select:** Choose the image file you want to write to the USB drive.
4.  **Start:** Press the write button and wait for the process to complete. This may take a few minutes depending on the file size and drive speed.
5.  **Verify:** Data will be verified after completion to ensure no errors occurred.

## Summary

EtchDroid is a true lifesaver for anyone using GNU/Linux distributions. Being open source, free, and privacy-respecting, with no ads or tracking, makes it an excellent choice compared to closed-source applications. If you are a Linux user with an Android phone, having EtchDroid on your phone could save you in a difficult situation.

## Quick Links

[EtchDroid GitHub Repository](https://github.com/EtchDroid/EtchDroid)

[EtchDroid on F-Droid](https://f-droid.org/packages/eu.depau.etchdroid/)

[Developer Email](mailto:hello@etchdroid.app)

Published in the Phone section – Applications and Tools
