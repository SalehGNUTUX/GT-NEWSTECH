---
layout: post
title: >-
  SpoofDPI: Open Source Tool to Bypass Censorship by Fragmented TLS Packets
  Without Slowdown
category: foss
author: GNUTUX
excerpt: >-
  SpoofDPI is a simple, fast proxy tool, written in Go, that neutralizes Deep
  Packet Inspection (DPI) systems by fragmenting TLS ClientHello packets. Unlike
  VPNs, it works locally without external servers and maintains full internet
  speed. Inspired by Green Tunnel and GoodbyeDPI, it is available on GitHub and
  package managers.
image: spoofdpi-gnutux.jpg
tags:
  - SpoofDPI
  - Bypass Censorship
  - DPI
  - Network Tool
  - Open Source
  - Go
  - Free Software
also_in:
  - tech-news
date: 2026-06-17T17:01:00.000Z
lang: en
slug: spoofdpi-anti-censorship-tool
---

# The Problem of Digital Censorship and Deep Packet Inspection

Internet censorship and blocking systems rely on a technology known as Deep Packet Inspection (DPI) . These systems analyze the content of data packets passing through the network, not just their headers. In the case of encrypted HTTPS connections, the vulnerability lies in the initial handshake process, the TLS Handshake. During this handshake, the ClientHello packet, which contains the domain name you want to visit (SNI), must be sent in plaintext . This is enough for DPI systems to know the destination and make a blocking decision before the connection is encrypted.

SpoofDPI was created as a lightweight and effective solution to this dilemma. It acts as a local proxy server and manipulates these initial packets to trick the inspection systems, without the need for traditional VPNs or external servers .

🔗 **Official Repository:** [github.com/xvzc/spoofdpi](https://github.com/xvzc/spoofdpi)

## What is SpoofDPI?

SpoofDPI is a free and open-source tool, written in Go, specifically designed to neutralize Deep Packet Inspection (DPI) techniques used by ISPs to enforce censorship or block websites . The idea is inspired by popular tools like Green Tunnel and GoodbyeDPI.

The tool acts as a local proxy server, typically listening on port 8080 . When an attempt is made to connect to a blocked site, SpoofDPI handles the TLS handshake packets and modifies how they are sent. The clever mechanism it uses is fragmenting the ClientHello packet. It sends the first byte of the request separately, then sends the rest of the packet . The goal of this technique is to make the DPI system unable to read the domain name (SNI) from the first packet, while the destination server can naturally reassemble these parts. As a result, the request bypasses the block.

## Key Features

### High Efficiency Without Slowdown
Unlike a VPN, which routes all traffic through a remote server and can significantly slow down the internet, SpoofDPI works locally. It only intercepts the initial TLS packets (ClientHello) and modifies them, while the rest of the browsing data, such as video streaming and downloads, passes through without any additional processing. This preserves maximum internet speed .

### Easy Installation and Use
SpoofDPI is fully available through its official GitHub repository and can be installed in several simple ways:

Via the official install script:
```bash
curl -fsSL https://raw.githubusercontent.com/xvzc/SpoofDPI/main/install.sh | bash -s linux-amd64
```
Via the Go package manager:
```bash
go install github.com/xvzc/SpoofDPI/cmd/spoof-dpi@latest
```
On macOS, it can be installed via Homebrew .

For use on Linux, run the tool and then open your browser with the proxy option:
```bash
google-chrome --proxy-server="http://127.0.0.1:8080"
```
On macOS, the tool sets the proxy automatically .

### Active and Evolving Project
The project has seen continuous development, reaching version **1.5.3** in May 2026. Recent updates include support for new modes like SOCKS5 and TUN, improvements to the rules system for defining domains and IP addresses to which modifications will be applied, and multiple fixes to increase stability and performance.

## Related Tools: DPIBreak

The repository also mentions a related project called **DPIBreak**, aimed at those seeking a deeper and more robust solution in heavily censored environments .

### The Difference Between SpoofDPI and DPIBreak
**SpoofDPI** works as a proxy server, intercepting TLS packets at the application level (in userspace) and redirecting them. This may require configuring applications to use the proxy.

**DPIBreak** works at the kernel level . It uses technologies like nftables/iptables on Linux to intercept TLS packets directly from the kernel. This allows it to operate system-wide without needing to configure each application individually, and with very high performance because it only intercepts the necessary packets . DPIBreak is considered a more advanced alternative for power users or in environments with complex censorship.

## Summary

In a world where digital censorship is becoming increasingly complex, SpoofDPI offers an elegant, open-source solution for both casual users and developers. It is a simple, fast, and effective tool for bypassing local restrictions without sacrificing internet speed or privacy. For users facing stricter firewalls, DPIBreak provides an advanced option for dealing with challenges at the system level.

## Quick Links

[https://github.com/xvzc/spoofdpi](https://github.com/xvzc/spoofdpi)

[https://github.com/xvzc/spoofdpi/releases](https://github.com/xvzc/spoofdpi/releases)

[https://github.com/dilluti0n/dpibreak](https://github.com/dilluti0n/dpibreak)

Published in the Free and Open Source Software section – Networking and Security Tools
```
