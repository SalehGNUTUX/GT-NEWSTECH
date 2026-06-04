---
layout: post
title: >-
  GT-TAHAKOM v1.0.0: Universal Remote Control for TVs and Home Devices via WiFi
  and Infrared
category: gnutux-projects
author: GNUTUX
excerpt: >-
  GT-TAHAKOM is an open source Android application that unifies control of smart
  and traditional TVs and set-top boxes through three methods: WiFi for smart
  TVs, infrared for traditional devices, and WiFi-IR bridges for Broadlink
  devices, with automatic discovery and smart tuning.
image: gt-tahakom-en.png
tags:
  - GT-TAHAKOM
  - Remote Control
  - Android Apps
  - IoT
  - IR
  - WiFi
  - LG webOS
  - Samsung
  - Android TV
  - Roku
also_in:
  - foss
date: 2026-06-04T19:30:00.000Z
lang: en
slug: gt-tahakom-universal-remote-control
---

## The Chaos of Multiple Remotes

Who among us does not suffer from the chaos of multiple remote controls? One remote for the TV, another for the set-top box, a third for the media player, and a fourth for the air conditioner. On the coffee table, devices accumulate and get lost between couch cushions. Worse, when you want to turn on the TV on Friday night, you discover the remote's battery has died.

GT-TAHAKOM is an attempt to end this chaos. A single Android application that combines control of three types of devices through three different transmission methods. All in one open source application, working offline, with no ads or tracking.

🔗 **Official Website:** [salehgnutux.github.io/GT-TAHAKOM](https://salehgnutux.github.io/GT-TAHAKOM)
🔗 **GitHub Repository:** [github.com/SalehGNUTUX/GT-TAHAKOM](https://github.com/SalehGNUTUX/GT-TAHAKOM)

## Three Transmission Methods in One Application

What distinguishes GT-TAHAKOM from any other remote control application is its support for multiple transmission methods. It does not rely solely on infrared which requires a receiver on the device and direct line of sight, nor solely on WiFi which requires a network connection. It combines both along with a third method: the WiFi-IR bridge.

### Method One: WiFi Control for Smart TVs

The application supports automatic discovery of smart TVs connected to the same WiFi network. Currently, it supports four major platforms:

LG webOS: LG TVs can be discovered and controlled through webOS protocols. You can adjust volume, change channels, launch installed apps such as YouTube, Netflix, and others, and power on and off.

Samsung: Supports modern Samsung TVs running Tizen OS. Basic control is fully available.

Android TV: For TVs running Android TV such as Sony, TCL, and Philips, discovery and control work through standard Android TV protocols.

Roku TV: Supports Roku-enabled TVs or standalone Roku Stick devices.

When a TV is discovered, it appears in "My Devices" list with its name and IP address. The active transmission method will be WiFi. All you need is for your phone and TV to be on the same network.

### Method Two: Infrared for Traditional Devices

For traditional non-smart TVs, set-top boxes, and disc players, infrared is the only solution. GT-TAHAKOM uses your phone's built-in IR blaster if available. Most Xiaomi, Huawei, and Samsung flagship phones support IR blasters, but Google Pixel phones do not.

The application includes a built-in database of dozens of devices: LG, Samsung, Sony, TCL, and Philips TVs, Strong, OSN, and beIN set-top boxes, and DVD and Blu-ray players. This database works offline. If your device is not listed, you can manually teach the application. Point the original remote at your phone, press a button in the app, and let it learn the signal.

### Method Three: WiFi-IR Bridge (Broadlink)

If your phone lacks an IR blaster, or you are in another room with no direct line of sight to the TV, you can use an external device like Broadlink RM, including the RM Mini and RM Pro series. These devices connect to WiFi, receive commands from the app over the network, and transmit them as IR signals to the target device.

This feature is currently experimental and supports only Broadlink devices. Future versions may support other bridge devices.

## User Interface and Customization

### Full Arabic and English Support

The application fully supports Arabic with RTL layout for all interfaces. You can switch between Arabic and English from the settings menu at any time.

The image below shows the main application interface in Arabic:

![GT-TAHAKOM Arabic interface](https://salehgnutux.github.io/GT-TAHAKOM/screenshot-ar.png)

### Light and Dark Themes

You can choose between light and dark themes according to your preference or room lighting. Dark theme is gentler on the eyes when using the application in a dark room.

### Multiple Devices

You can add multiple devices to your "My Devices" list. For each device, you can set a preferred transmission method. If the preferred method is unavailable, such as the TV not being connected to the network, the application attempts to automatically switch to an alternative method if available.

## Smart Tuning and Learning New Devices

One of the most innovative features of GT-TAHAKOM is its ability to test device status and choose the appropriate signal.

When adding a new device not in the database, the application asks you to point the original remote at your phone. You select a button such as Power, and the app captures and saves the signal. After saving the basic buttons, the device becomes ready for use.

But the smarter feature is automatic testing. Before sending a Power command, the app asks whether the device is currently on. If you do not know, the app can try a Volume Up signal. If the volume changes, the device is on. If not, the device is off. This way, the app knows when to send Power on and when to send Power off. This prevents sending a Power on signal to an already-on device, which would turn it off instead.

## Sharing and Packages

You can share a device's configuration with someone else through a .tahakom file. This file contains the device definition, including its type, supported transmission methods, and learned IR signals, compressed and encrypted. The recipient opens the file directly in GT-TAHAKOM, and the device appears in their list without needing to relearn.

This feature is useful if you have multiple TVs of the same model at home, or if you want to help a friend set up their application without manually teaching each button.

## Privacy and Security

The application contains no ads and no user tracking or data collection code. Everything works locally on your phone. Discovered devices, learned signals, and settings all remain on your device. Nothing is sent to external servers.

The application is fully open source under the GPLv3 license. You can review the code to ensure nothing is hidden, or modify it and distribute your own version.

The application requires certain permissions to function: WiFi access to discover devices on the network and send commands, infrared access to transmit IR signals, and basic storage permissions to save settings.

## Compatibility and Requirements

The application requires Android 8.0 or later. It is built with Kotlin and Jetpack Compose, modern technologies ensuring smooth performance and low battery consumption.

To use IR control, your phone must have an IR blaster. Most Samsung flagship phones, Xiaomi phones, and Huawei phones support it. Google Pixel and most OnePlus phones do not.

To use WiFi control, your phone and TV must be on the same local network. The application uses multicast for device discovery, so your router must support multicast, which most modern routers do.

To use the WiFi-IR bridge, you need a Broadlink RM device configured on the same network.

## Installation

### From F-Droid Store (Coming Soon)

The application is currently being submitted to F-Droid. Once approved, it can be installed directly from the store.

### Direct APK Download

You can download the APK file from the releases page on GitHub. You must enable "Install from unknown sources" in your phone settings.

Download the file, tap it, and follow the instructions.

### Building from Source

For developers who want to build the application themselves:

```bash
git clone https://github.com/SalehGNUTUX/GT-TAHAKOM.git
cd GT-TAHAKOM
# Open the project in Android Studio
# Or use Gradle from the command line
./gradlew assembleRelease
```

## Future Releases (Roadmap)

Version 1.1 will include:

Support for additional bridge devices such as Bond and manually programmed ESP8266.

Rooms mode to group devices by room: living room, bedroom, kitchen, and so on.

Voice notifications when sending commands.

All-in-one button to turn off all devices at once, such as when leaving home.

Version 2.0 will include:

A desktop application for Linux using the same codebase through Compose Multiplatform.

Integration with voice assistants such as Google Assistant and Alexa through web services.

## Summary

GT-TAHAKOM is not just another remote control application. It is an attempt to unify the chaos caused by multiple remote controls in the modern home. With support for three different transmission methods, it can control smart TVs via WiFi, traditional TVs and set-top boxes via IR, and distant devices via bridges. All from a single application, offline, with no ads.

If you are tired of searching for the right remote every time, or of batteries dying at the worst moments, or of having three devices on the coffee table, try GT-TAHAKOM. It is free, open source, and will cost you nothing but a few minutes of setup.

## Quick Links

[https://salehgnutux.github.io/GT-TAHAKOM](https://salehgnutux.github.io/GT-TAHAKOM)

[https://github.com/SalehGNUTUX/GT-TAHAKOM](https://github.com/SalehGNUTUX/GT-TAHAKOM)

[https://github.com/SalehGNUTUX/GT-TAHAKOM/releases](https://github.com/SalehGNUTUX/GT-TAHAKOM/releases)
