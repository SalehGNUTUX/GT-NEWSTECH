---
layout: post
title: 'Nostr Mail: An Open Source Decentralized Email That Redefines Privacy'
slug: nostr-mail-decentralized-email
lang: en
category: foss
date: '2026-05-10'
author: GNUTUX
excerpt: >-
  Nostr Mail is a decentralized email protocol built on the Nostr network,
  giving you full ownership of your identity and inbox without any central
  authority.
image: nostr-mail-protocol.jpeg
tags:
  - Email
  - Decentralized
  - Nostr
  - Privacy
  - FOSS
  - Flutter
---

## Email Needs a Revolution

For decades, big tech companies have dominated email. Your email address isn't truly yours — it's borrowed from Gmail, Outlook, or Yahoo. These companies can read your messages, show you ads, or even shut down your account at any moment.

**Nostr Mail** changes everything.

---

## What is Nostr Mail?

Nostr Mail is an **open source, decentralized email protocol** built on the **Nostr** network (typically used for decentralized social platforms). The protocol gives you:

- **Full ownership** of your identity and data
- **Automatic privacy** through encryption of every message (NIP-44)
- **Metadata hiding** using NIP-59 Gift Wraps
- **Compatibility with traditional email** via bridges to SMTP

> 🔗 Official Website: [nostrmail.org](https://nostrmail.org)

---

## How It Works

| Component | Description |
|-----------|-------------|
| **Kind 1301** | Unified event type carrying RFC 2822 email content over the Nostr network |
| **NIP-44** | Encrypts messages so only sender and recipient can read them |
| **NIP-59 Gift Wraps** | Hides metadata (sender, recipient, timing) from relays |
| **Blossom** | Handles large attachments by encrypting and storing them on Blossom servers |
| **NIP-32 / NIP-78** | Syncs folders, read states, and settings across devices |

---

## Nmail — The Reference Client

**Nmail** is the official open source client application, built with **Flutter**, available on:

- ✅ **Web** – [app.nostrmail.org](https://app.nostrmail.org)
- ✅ **Android** – via ZapStore
- ✅ **Linux**
- ✅ **macOS** (in development)
- ✅ **Windows**

### Nmail Features

- **Full sync** of folders and settings across all devices
- **Offline-first support**
- **Send and receive** with Nostr users or traditional email addresses (via bridges)
- **No ads, tracking, or data collection**
- **Clean interface** like any modern email client

> 🔗 GitHub Repository: [github.com/nogringo/nostr-mail-client](https://github.com/nogringo/nostr-mail-client)
> Latest Release: **v0.11.0** (May 8, 2026)

---

## Developer SDKs

To integrate the Nostr Mail protocol into your own applications:

| Language | Package | Link |
|----------|---------|------|
| **Dart / Flutter** | `nostr_mail` | [pub.dev](https://pub.dev/packages/nostr_mail) |
| **TypeScript / JavaScript** | `nostr-mail` | [npm](https://www.npmjs.com/package/nostr-mail) |

---

## Why This Matters for the FOSS Community

> **Decentralized email infrastructure** means every individual and organization can run their own mail server — or rely on the relay network — without being beholden to Google or Microsoft.

### Key Benefits:
- **No single point of failure** — no account shutdowns or censorship
- **Encryption by default** — not an optional add-on
- **Your data is yours** — no message scanning for ads
- **Fully open source** — transparent community auditing

---

## Remaining Challenges

- **Relay network dependency** — requires robust distributed infrastructure
- **Attachment size** — despite Blossom support, large files remain a challenge
- **Traditional email access** — SMTP bridges work but require trust
- **Awareness and adoption** — the project is still relatively new

---

## Quick Comparison

| Feature | Nostr Mail | Gmail / Outlook | Proton Mail |
|---------|------------|-----------------|-------------|
| **Fully Decentralized** | ✅ | ❌ | ❌ |
| **Open Source** | ✅ | ❌ | Partially |
| **Encryption by Default** | ✅ | ❌ | ✅ |
| **Metadata Hiding** | ✅ (Gift Wraps) | ❌ | ❌ |
| **Identity Ownership** | ✅ (private keys) | ❌ | ❌ |
| **No Intermediaries** | ✅ | ❌ | ❌ |
| **SMTP Compatibility** | ✅ (bridges) | ✅ | ❌ |

---

## Summary

**Nostr Mail isn't just another email application — it's a complete rethinking of how email should work.**

By combining the power of the Nostr network with modern encryption and metadata hiding, the project offers a genuine alternative to traditional email, fully aligned with the values of the free and open source software movement.

If you're looking for your next email system that is **truly yours**, this project deserves close attention.

## Quick Links

- [Official Website](https://nostrmail.org)
- [Nmail Web App](https://app.nostrmail.org)
- [GitHub Repository (Client)](https://github.com/nogringo/nostr-mail-client)
- [Dart/Flutter Package](https://pub.dev/packages/nostr_mail)
- [TypeScript/JavaScript Package](https://www.npmjs.com/package/nostr-mail)
- [Nostr Protocol Specifications](https://github.com/nostr-protocol/nostr)

---
