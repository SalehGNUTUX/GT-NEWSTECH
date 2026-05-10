---
layout: post
title: 'GT-IPNET Project: Integrated Graphical Interface for Linux Networking Tools'
slug: gt-ipnet-v2
lang: en
category: gnutux-projects
date: 2026-05-09T01:00:00.000Z
author: GNUTUX
excerpt: >-
  GT-IPNET v2.0 is an open-source desktop application that brings the most
  popular networking tools into an elegant graphical interface, featuring an
  advanced network controller, tray icon, and app lock.
image: screenshot_dashboard.png
tags:
  - GNUTUX
  - Networking
  - Linux
  - Electron
  - React
  - GT-IPNET v2
---

## What is GT-IPNET?

GT-IPNET is a GNUTUX project aimed at providing a unified graphical interface for common Linux networking tools such as `ping`, `traceroute`, `nmap`, `whois`, `dig`, and others, without needing the command line. Version **2.0.0** adds an advanced **Network Controller** (blocking and bandwidth limiting) with background process persistence.

**Official Website:** [https://salehgnutux.github.io/GT-IpNet/](https://salehgnutux.github.io/GT-IpNet/)

## Key Features (v2.0)

- **Modern interface** built with React + TypeScript + Tailwind CSS v4
- **IPC communication** with the system via Electron for secure command execution
- **Network Controller:** Block internet access and limit bandwidth (128Kbit–10Mbit) with timers and delayed unblocking
- **Background persistence:** Processes continue after app closes, with auto-stop for timers
- **App Lock:** SHA-256, lock screen, and auto-lock after idle time
- **Smart discovery:** Random MAC detection (iOS 14+ / Android 10+), real device names via mDNS and NetBIOS, and neighboring network discovery
- **Tray Icon:** Show/hide the app with a single click
- **RTL/LTR support** for bilingual display (Arabic/English)
- **Dark and light mode** fully integrated

## Technologies Used

| Technology | Version |
|------------|---------|
| Electron | 31+ |
| React | 18+ |
| TypeScript | 5+ |
| Tailwind CSS | 4+ |
| Zustand | (State management) |

## Installation & Download

### Version 2.0.0 Packages

| Type | Distributions | Size |
|------|---------------|------|
| AppImage | All distributions | 105 MB |
| DEB | Debian / Ubuntu | 72.3 MB |
| RPM | Fedora / RHEL | 103 MB |

**Direct Download:** [https://salehgnutux.github.io/GT-IpNet/](https://salehgnutux.github.io/GT-IpNet/)

### Build from Source

```bash
git clone https://github.com/SalehGNUTUX/GT-IPNET.git
cd GT-IPNET
npm install
npm run dev
```

### CLI Version

For command-line enthusiasts:
```bash
git clone https://github.com/gnutux/GT-IpNet.git
cd GT-IpNet && chmod +x gtipnet.sh
sudo ./gtipnet.sh --scan   # Quick scan
```

## License

This project is released under the **GNU GPL v3** license, ensuring your freedom to use, modify, and share.

---

**References:**  
- Official Website: [https://salehgnutux.github.io/GT-IpNet/](https://salehgnutux.github.io/GT-IpNet/)  
- GitHub Repository: [https://github.com/SalehGNUTUX/GT-IpNet](https://github.com/SalehGNUTUX/GT-IpNet)
