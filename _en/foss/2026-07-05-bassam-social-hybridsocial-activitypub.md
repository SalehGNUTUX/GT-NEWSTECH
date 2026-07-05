---
layout: post
title: >-
  Bassam Social: A Decentralized Arabic Social Platform Built on HybridSocial
  and ActivityPub
category: foss
author: GNUTUX
excerpt: >-
  Bassam Social is a decentralized Arabic social networking platform, built on
  the open source HybridSocial software, which in turn is based on the
  ActivityPub protocol. The platform offers advanced features such as seven
  reaction types, groups, vertical video streams, and enterprise-grade security.
image: bassam-social-gnutux-en.png
tags:
  - Bassam
  - HybridSocial
  - ActivityPub
  - Decentralized
  - Fediverse
  - Elixir
  - Phoenix
  - SvelteKit
also_in:
  - tech-news
date: 2026-07-05T22:21:00.000Z
lang: en
slug: bassam-social-hybridsocial-activitypub
---

## The Search for an Arabic Alternative to Social Media

In an era dominated by large centralized social media platforms, the search for alternatives that offer users privacy and control is growing. Bassam Social is a serious Arabic attempt to provide a decentralized social networking platform that combines ease of use with powerful customization, while maintaining privacy and data ownership.

🔗 **Official Website:** [bassam.social](https://bassam.social)
🔗 **Core Repository (HybridSocial):** [github.com/qfiber/hybridsocial](https://github.com/qfiber/hybridsocial)

## What Is Bassam Social?

Bassam Social is an Arabic social networking platform that fully relies on the open source software **HybridSocial**, which in turn is built on the **ActivityPub** protocol . This means Bassam Social is not an isolated platform. It is part of the decentralized Fediverse network, where users can interact with users from other platforms such as Mastodon, Pleroma, and Misskey .

GNUTUX's account on the platform can be visited at: [@gnutux_Arabic@bassam.social](https://bassam.social/@gnutux_Arabic)

## What Is HybridSocial?

HybridSocial is the open source software that powers Bassam Social . It is a decentralized social networking platform built entirely using **Elixir** and the **Phoenix** framework for the backend, and **SvelteKit** for the frontend . It was designed to be a modern alternative to platforms like Mastodon, with a focus on high performance, advanced security, and scalability.

## Key Features of HybridSocial Used by Bassam Social

### Social Features

- **Posts:** Support Markdown, media attachments, polls, and content warnings.
- **7 Reaction Types:** Like, Love, Care, Angry, Sad, LOL, WTF.
- **Boosts and Quote Posts:** Share content with your own commentary.
- **Threaded Conversations:** Branching replies in clear discussion threads.
- **Direct Messages:** 1:1 and group chats.
- **Groups:** Public, private, and local-only groups with screening and auto-approval options.
- **Pages and Organizations:** Business profiles with branding options.
- **Lists:** Curated content feeds.
- **Bookmarks, Pinned Posts, and Scheduled Posts.**

### Federation

- **Full ActivityPub Support:** Ensures full compatibility with the Fediverse, allowing communication with users from Mastodon, Pleroma, Akkoma, Misskey, and others .
- **WebFinger:** Discovery mechanism using unified usernames.
- **HTTP Signatures:** For verifying server identity and ensuring secure communication.
- **Actor Migration:** Users can move their accounts between different servers.
- **Instance Policies:** Options to allow, silence, suspend, or block entire domains, with the ability to enforce NSFW on content from specific domains.

### Discovery and Content

- **Full-text Search:** Using PostgreSQL or OpenSearch as a backend.
- **Trending Content:** Posts and hashtags with manipulation resistance.
- **Algorithmic Feed:** For You feed alongside the chronological feed.
- **Vertical Video Streams:** Reels-like video feed.
- **Hashtag Timelines:** Follow specific topics.

### Advanced Security

- **Role-Based Access Control:** 24 granular permissions and 4 system roles.
- **Two-Factor Authentication:** TOTP with QR code setup and recovery codes.
- **OAuth2 + PKCE:** For third-party app authentication.
- **Spam Protection:** Proof of Work challenges and Cloudflare Turnstile.
- **Rate Limiting:** Per-endpoint with configurable limits via admin panel.
- **Content Sanitization:** HTML allowlisting, SSRF prevention, and magic byte validation.
- **Audit Logging:** Immutable logs of all security events.
- **HTTP Security Headers:** CSP, HSTS, X-Frame-Options, and Referrer-Policy.
- **Encrypted Backups:** AES-256-GCM with an admin-provided passphrase.
- **Session Invalidation:** On password change.
- **OWASP Top 10 Compliance.**

### Administration and Control

- **Dashboard:** Instance statistics.
- **User Management:** Suspend, warn, delete.
- **Moderation:** Reports, content filters, banned domains, IP blocks, and webhooks.
- **Federation Dashboard:** Manage connected servers, policies, and delivery queue.
- **Theme Editor:** Live preview with WCAG contrast checking.
- **Role Management:** Create custom roles with specific permissions.
- **Fully Configurable Settings:** All settings editable at runtime via the database without restart.

### Premium Features and Monetization

- **Verification Badges:** Manual, domain-based, or paid.
- **Premium Features:** Extended post length, Markdown support, HD video, and post analytics.
- **Donations:** Support for Stripe, PayPal, Bitcoin, and Ethereum.
- **Data Portability:** Full export/import, GDPR-compliant account deletion.

## Technologies Used in HybridSocial

| Component | Technology |
|-----------|------------|
| **Backend** | Elixir / Phoenix |
| **Frontend** | SvelteKit (Svelte 5) |
| **Database** | PostgreSQL |
| **Cache** | Valkey (Redis-compatible) |
| **Search** | OpenSearch |
| **Message Broker** | NATS JetStream |
| **Media Processing** | libvips (images), ffmpeg (video) |
| **Web Application Firewall** | Caddy + Coraza |
| **Email** | Swoosh (SMTP + Resend) |
| **Mobile** | Flutter (planned) |

## Summary

Bassam Social represents an important step in the world of Arabic decentralized social networking. By relying on the powerful and advanced HybridSocial software, the platform offers a feature-rich environment with a clear focus on privacy and security. Thanks to its support for the ActivityPub protocol, it is not an isolated platform but part of a globally connected network. It is an excellent choice for Arabic users seeking an alternative that gives them control over their data and social experiences.

## Quick Links

[https://bassam.social](https://bassam.social)

[https://bassam.social/@gnutux_Arabic](https://bassam.social/@gnutux_Arabic)

[https://github.com/qfiber/hybridsocial](https://github.com/qfiber/hybridsocial)

Published in the Free and Open Source Software section – Decentralized Social Networks
