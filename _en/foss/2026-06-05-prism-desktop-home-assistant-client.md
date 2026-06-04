---
layout: post
title: >-
  Prism Desktop: An Elegant Desktop Interface for Home Assistant on Windows and
  Linux
slug: prism-desktop-home-assistant-client
lang: en
category: foss
date: 2026-06-04T22:02:00.000Z
author: GNUTUX
excerpt: >-
  Prism Desktop is a lightweight desktop application for Windows and Linux,
  serving as a Home Assistant client via WebSocket API, featuring system tray
  integration, desktop notifications, morphing controls, a drag-and-drop
  dashboard, and keyboard shortcuts.
image: prismdesktop.png
tags:
  - Prism Desktop
  - Home Assistant
  - Home Automation
  - IoT
  - Python
  - Windows
  - Linux
also_in:
  - tech-news
---

## The Problem of Smart Home Browsers

Home automation has become part of our daily lives, but accessing Home Assistant through a browser is not ideal. You need to open a new tab, remember the IP address or hostname, deal with page reloads, and waste screen space on browser buttons instead of home controls. Official apps exist on phones, but on the desktop, the browser was the only solution.

Prism Desktop came to fill this gap. An independent, lightweight desktop application that lives in your system tray, giving you instant access to your smart home without opening a single browser tab.

🔗 **Official Repository:** [github.com/lasselian/Prism-Desktop](https://github.com/lasselian/Prism-Desktop)
🔗 **Releases Page:** [github.com/lasselian/Prism-Desktop/releases](https://github.com/lasselian/Prism-Desktop/releases)

## What Is Prism Desktop?

Prism Desktop is a Home Assistant client built on the WebSocket API, meaning it stays in real-time sync with your state without delay. When you turn on a light from your phone, it appears immediately in the application on your computer. When you change the thermostat temperature from the app, you see the update instantly. No manual page refresh is ever needed.

The application lives in the system tray on both Windows and Linux with AppIndicator support on GNOME. You can show it when needed and hide it when you do not. It does not take space on the taskbar, and does not appear in Alt+Tab unless you want it to.

## Key Features

### System Tray and Notifications

The application does not appear as a regular desktop window unless you call it. The rest of the time, it is a small icon in the system tray. When Home Assistant sends a notification, such as the refrigerator door being open or a motion sensor detecting movement, a real desktop notification appears on your operating system.

### Morphing Controls

One of Prism Desktop's smartest features is morphing controls. When you click and hold on a simple tile such as a light switch, it expands into granular controls. You can adjust brightness if the light is dimmable, or adjust temperature if the entity is a thermostat.

### Drag-and-Drop Dashboard

You can freely rearrange tiles by dragging and dropping them across the grid. No need to go into Home Assistant settings and edit YAML files. Everything is done with the mouse.

### Resizable Dashboard

You can resize the application window, and the grid inside adapts automatically. Whether you want a small dashboard floating above other windows or a large window covering half the screen, the choice is yours.

### Customizable Appearance

The application supports border effects such as Rainbow and Aurora. You can customize button colors to match your home decor or your mood.

### Keyboard Shortcuts

You can bind a global shortcut to show or hide the application window from anywhere, even when the application is in the background. Individual shortcuts can also be bound to any button tile on the dashboard.

## Supported Entities

Prism Desktop supports a wide range of Home Assistant entities:

| Category | Entities |
|----------|----------|
| Lighting and Power | Light, Switch |
| Climate | Climate (thermostat), Fan |
| Media | Media Controller |
| Covers | Curtain, Cover |
| Outdoor | Lawn Mower, Vacuum |
| Monitoring | Sensor, Sun, Weather, Camera |
| Automation | Automation, Scene, Script |

### Dedicated 3D Printer Tile

To support the 3D printing community, the application includes a dedicated tile for printer monitoring. It displays a live camera feed if connected, nozzle temperature and target, bed temperature and target, and print state.

## Installation

### On Windows

Download the `PrismDesktopSetup.exe` file from the releases page. Run the installer, and you can enable startup with Windows. If you prefer a portable version, download the standalone `.exe` file and place it in any folder. All settings are saved in the same folder.

### On Linux

Download the `.AppImage` file from the releases page.

```bash
chmod +x PrismDesktop-x86_64.AppImage
./PrismDesktop-x86_64.AppImage
```

On Ubuntu 22.04 or later, you may need to install `libfuse2`:
```bash
sudo apt install libfuse2
```

On the GNOME desktop environment, you need to install the "AppIndicator and KStatusNotifierItem Support" extension through Extension Manager for system tray icon support. On Wayland, you can bind a custom shortcut in system settings to toggle the application:
```bash
/path/to/PrismDesktop-x86_64.AppImage --toggle
```
Per-entity shortcuts are not supported on GNOME Wayland.

On KDE Plasma, everything works out of the box without extensions.

### Via Nix (using flakes)

Run directly without installation:
```bash
nix run github:lasselian/prism-desktop
```
Add to your profile:
```bash
nix profile add github:lasselian/prism-desktop#default
```

## Initial Setup

On first launch, the application will ask for:

Your Home Assistant URL, for example `http://homeassistant.local:8123`. A Long-Lived Access Token, which you can generate from your Home Assistant account under Security → Long-Lived Access Tokens.

After entering these two pieces of information, the application connects to your Home Assistant server and begins loading entities and displaying them on the dashboard.

## Building from Source

For developers who want to build the application themselves:

```bash
git clone https://github.com/lasselian/prism-desktop.git
cd prism-desktop
pip install -r requirements.txt
python main.py
```

To build a distributable Windows package:
```bash
python build_exe.py
```
To build an AppImage for Linux:
```bash
python3 build_linux.py
```

## Troubleshooting

If you see the error `WS Error: 400 – Duplicate 'Server' header found`, this means your reverse proxy in front of Home Assistant is adding a duplicate `Server` header. The fix depends on the proxy type:

For Caddy, add `header_up -Server` to your `reverse_proxy` block.
For other proxies, look for a "remove upstream header" option.

## Summary

Prism Desktop is not a revolutionary application in terms of features, but it solves a real problem with simplicity and professionalism. If you use Home Assistant and spend a lot of time in front of your computer, having a dedicated desktop application is much better than a browser tab. The application is lightweight, fast, compatible with Windows and Linux, and fully open source under the MIT license.

If you are looking for a more elegant way to control your smart home from your computer, try Prism Desktop.

## Quick Links

[https://github.com/lasselian/Prism-Desktop](https://github.com/lasselian/Prism-Desktop)

[https://github.com/lasselian/Prism-Desktop/releases](https://github.com/lasselian/Prism-Desktop/releases)

[https://www.home-assistant.io](https://www.home-assistant.io)
