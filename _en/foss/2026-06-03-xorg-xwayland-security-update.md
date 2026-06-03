---
layout: post
title: >-
  X.Org Server 21.1.23 and Xwayland 24.1.12 Patch 9 Critical Security
  Vulnerabilities
category: foss
author: GNUTUX
excerpt: >-
  The X.Org project has released two emergency security updates for X.Org Server
  21.1.23 and Xwayland 24.1.12, addressing 9 critical security vulnerabilities,
  8 of which were discovered by AI. The flaws include buffer overflows and
  use-after-free issues in Font Alias, XKB, GLX, and DRI2 components.
image: xorgfix.jpeg
tags:
  - X.Org
  - Xwayland
  - Security
  - Security Update
  - Linux
  - Free Software
also_in:
  - gnulinux
  - tech-news
date: 2026-06-03T12:46:00.000Z
lang: en
slug: xorg-xwayland-security-update
---

## Another Security Crisis in the X Server

More than a decade of repeated warnings about X.Org Server security, and the project continues to face critical vulnerabilities. On June 2, 2026, Peter Hutterer, X.Org developer at Red Hat, announced the release of two emergency security updates: X.Org Server 21.1.23 and Xwayland 24.1.12.

These releases address 9 new security vulnerabilities, eight of which were discovered by artificial intelligence tools from Trend Micro's Zero Day Initiative. Some of these vulnerabilities can lead to privilege escalation if the server is running with root privileges, and in certain configurations may allow remote code execution when X11 session forwarding is used over SSH.

🔗 **X.org Announcement List:** [lists.x.org/archives/xorg-announce/2026-June/003703.html](https://lists.x.org/archives/xorg-announce/2026-June/003703.html)

## What Are X.Org Server and Xwayland?

Before analyzing the vulnerabilities, it is important to understand the difference between the two updated components.

X.Org Server is the reference implementation of the X11 protocol, the traditional window system that has powered most graphical desktop applications on Linux for decades. Although most distributions have switched to Wayland as the default display server, X.Org Server is still installed on nearly every system as a fallback or to run legacy X11 applications that do not work well on Wayland.

Xwayland is an X11 server that runs as a client within a Wayland session. Its role is to allow legacy X11 applications to run on a modern Wayland desktop without modification. It translates X11 requests into commands that Wayland understands. Xwayland is the critical compatibility bridge that makes the transition to Wayland smooth for users.

Both components share a large codebase, so vulnerabilities discovered in X.Org Server often affect Xwayland as well.

## List of Patched Vulnerabilities (9 Flaws)

All of the following vulnerabilities have been fixed in both versions 21.1.23 and 24.1.12. No CVE numbers had been assigned at the time of the announcement.

### 1. Font Alias Stack-based Buffer Overflow

When processing font aliases, there is a mismatch between the maximum font name length in the X server (256 bytes) and in the libXfont2 library (1024 bytes). A font alias name between 257 and 1023 bytes will be copied into a smaller stack-based buffer without additional checks, causing an overflow. This vulnerability is serious because it allows data to flow into sensitive areas of memory.

### 2. Use-After-Free in miSyncDestroyFence()

A client setting up multiple fence triggers can call a function after memory has been freed. Attack scenario: the attacker connects to the server, sets up a fence and waits for it, then a second X connection destroys the fence, leading to use-after-free.

### 3. XKB Key Types Stack-based Buffer Overflow

The CheckKeyTypes() function does not validate non-standard key types or limit shift levels. A malicious client can change key types to excessive shift levels and trigger three separate stack-based buffer overflows. This vulnerability results from incomplete fixes for a previous vulnerability, CVE-2025-26597.

### 4. XKB SetMap Request Stack-based Buffer Overflow

The helper function CheckKeyTypes() writes to a fixed-size mapWidths[256] array on the stack at a client-controlled location. This allows the client to write outside the array boundaries, causing a buffer overflow.

### 5. XSYNC Use-After-Free in FreeCounter()

A client sets up multiple SyncCounters and waits for their triggers, then a second X connection destroys these counters. This leads to an attempt to access memory after it has been freed.

### 6. XSYNC Use-After-Free in SyncChangeCounter()

A similar scenario to the previous vulnerability, but occurs during counter changes. A client sets up multiple counters, then a second connection destroys them while their values are being changed.

### 7. GLX ChangeDrawableAttributes Out-Of-Bounds Read/Write

An incorrect size check in the __glXDisp_ChangeDrawableAttributes() function can lead to reading or writing a client-controlled number of bytes beyond the request buffer's boundaries. The write path requires byte-swapped clients, which is disabled by default. Reading could lead to sensitive information disclosure, and writing could be used to crash the server or escalate privileges if it is running as root.

### 8. CreateSaverWindow Use-After-Free Information Disclosure

A client can trigger a use-after-free read after changing window attributes and forcing the screen saver. This could lead to information disclosure, potentially including sensitive data from other processes.

### 9. DRI2 DRIGetBuffers/DRIGetBuffersWithFormat Out-Of-Bounds Write

A client requesting multiple DRI2BufferBackLeft attachments but only one DRI2BufferFrontLeft attachment can trigger a write beyond the boundaries of heap-allocated memory. This vulnerability was discovered by Peter Hutterer himself, not by artificial intelligence.

## Artificial Intelligence as a Vulnerability Discovery Tool

Notable in this announcement is that 8 out of 9 vulnerabilities were discovered by the "TrendAI Zero Day Initiative," a Trend Micro initiative that uses advanced artificial intelligence techniques to analyze code and identify vulnerabilities. This reflects a growing trend in the cybersecurity industry where AI tools are becoming capable of analyzing massive codebases and identifying dangerous patterns that might escape traditional human review. As Michael Larabel from Phoronix commented, "with the increased use of AI in security research, it will be interesting to see how many more issues get discovered this summer."

## Upgrading: A Mandatory Step for All Users

Given the severity of the vulnerabilities and the classification of some as allowing remote code execution and privilege escalation, updating X.Org Server and Xwayland is mandatory for all users, especially those using:

- Multi-user systems such as university servers or shared office workstations
- Desktop machines running the X11 server instead of Wayland
- Any system that forwards X11 sessions over SSH, which is common in remote development

### How to Update on Linux

On modern distributions, updates should arrive through the usual package manager.

```bash
# On Ubuntu/Debian and derivatives
sudo apt update
sudo apt upgrade xserver-xorg xwayland

# On Fedora
sudo dnf upgrade xorg-x11-server-Xorg xorg-x11-server-Xwayland

# On Arch Linux
sudo pacman -Syu xorg-server xorg-server-xwayland

# On openSUSE
sudo zypper update xorg-x11-server xorg-x11-server-Xwayland
```

If the updates are not yet available in your distribution's repositories, you can track X.Org releases via GitLab or wait a few days for distribution teams to include the patched packages. In the meantime, it is advisable to avoid running untrusted X11 applications or connecting to X servers over SSH unless absolutely necessary.

## Why Do These Vulnerabilities Keep Appearing?

It is no secret that the X.Org codebase is old and complex. The famous statement "It's a disaster, and it's worse than it looks" still echoes in developer circles. The massive codebase that has evolved over decades, with many contributors and under various pressures, has led to a "death zone" for security vulnerabilities. As the industry shifts toward Wayland, attention and development focus on the newer, more secure display protocol, while X.Org is left in maintenance mode, which explains the continued discovery of new vulnerabilities.

## Summary

X.Org Server 21.1.23 and Xwayland 24.1.12 are non-negotiable updates. If you use any system that relies on X11 or Xwayland to run X11 applications on Wayland, you must update your packages immediately. The 9 patched vulnerabilities, most discovered by artificial intelligence, remind us of the importance of continuously updating legacy infrastructure and gradually transitioning to more secure systems such as Wayland.

## Quick Links

[https://lists.x.org/archives/xorg-announce/2026-June/003702.html](https://lists.x.org/archives/xorg-announce/2026-June/003702.html)

[https://gitlab.freedesktop.org/xorg/xserver](https://gitlab.freedesktop.org/xorg/xserver)

[https://www.phoronix.com/news/X.Org-9-Vulnerabilities-AI](https://www.phoronix.com/news/X.Org-9-Vulnerabilities-AI)
