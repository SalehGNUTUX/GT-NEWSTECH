---
layout: post
title: >-
  0 A.D. Release 28: Boiorix – New German Faction and Historical Authenticity
  Revolution for the Most Famous Open-Source RTS
category: gaming
author: GNUTUX
excerpt: >-
  After 22 years of development, 0 A.D. drops the 'Alpha' label and releases
  version 28 Boiorix, adding the Germanic civilization as the 15th faction,
  massive technical improvements, and gameplay changes.
image: 0-ad-featured-800x450.jpeg
tags:
  - 0 A.D.
  - RTS
  - Strategy Games
  - Open Source
  - Linux
  - Windows
  - Mac
  - Ancient History
  - Wildfire Games
also_in:
  - foss
date: 2026-05-12T16:15:00.000Z
lang: en
slug: 0ad-28-boiorix-new-german-faction
---

## A Strategy Game Without Limits – Free Forever

**0 A.D.** is not just a game – it's a **phenomenon in the open-source software world**, a real-time strategy (RTS) game set in ancient times, developed by volunteers from around the world since 2003. **Completely free**, no ads, no "freemium" model, no catch – forever.

🔗 **Official Website:** [play0ad.com](https://play0ad.com)

> "Wildfire Games, an international group of volunteer game developers, proudly announces the release of 0 A.D. Release 28 – the first release without the 'Alpha' label after 22 years."

---

## Release 28 – Boiorix – A Milestone in Development History

The release is named after **Boiorix**, king of the **Cimbri** Germanic tribe that terrorized the Roman Republic in the late 2nd century BC.

**What's new in this release:**

- 🏛️ **New faction:** Germans – the 15th civilization
- 👥 **Gendered Civilians** – male and female models for historical accuracy
- ✍️ **Direct Font Rendering** – full integration for East Asian languages (Chinese, Japanese, Korean) without massive texture atlases
- 🚀 **JavaScript Modules support** in the engine
- ⚙️ **New game-setup options**
- 🖧 **Lobby improvements**
- 🔧 **Engine upgrades and updated platform support**
- 📜 **New quotes and tips**
- ⚖️ **Extensive balancing improvements**
- ... and more

---

## 🏛️ The New Faction: Germans – Teutonic Terror

0 A.D. represents the Germans as a **semi-nomadic coalition** of Cimbri, Teutones, Ambrones, and other Celto-Germanic tribes. Their gameplay focuses on **economic flexibility** through:

| Unit/Feature | Function |
|--------------|----------|
| **Supply Wagons** | Mobile resource source that can turn into a fortified encampment |
| **Wagon Encampments** | Fortifiable semi-permanent bases |
| **Wagon Trains technology** | Reduces dependence on territorial boundaries |
| **Migratory Resettlement technology** | Enhances economic flexibility |
| **Cimbrian Raiders** | Devastating offensive units in early phases |
| **Log Rams** | Siege units – wooden rams that crush buildings |
| **Seeresses** | Priestesses capable of affecting morale |

The Germans also have a **crush-attack unit available in every phase** – making them a formidable siege force.

---

## Top Technical Features in Release 28

### 1. Gendered Civilians

A radical change for historical accuracy:

- Previously called "female citizens" – historically inaccurate, as women didn't hold full citizenship in most ancient civilizations.
- Now called **"Civilians"**, available with both male and female models (representing lower-status followers of armies, not citizens).
- **No gameplay balance change** – only visual appearance and name.
- Citizen-soldiers unchanged – remain as always.

### 2. Direct Font Rendering

- **Before Release 28:** Players needed to load a massive atlas of thousands of characters for East Asian languages, consuming RAM and forcing them to be available only as mods.
- **After Release 28:** Uses the **Freetype** library to render fonts on the fly during gameplay.
- **Results:**
  - Full integration of Chinese, Japanese, Korean directly in the game (no mods needed).
  - Improved text display with GUI scaling – perfect for Hi-DPI screens.
  - Future potential to add ancient scripts like hieroglyphs and cuneiform.

### 3. New Game-Setup Options

- Remove players entirely (with all buildings and units) in Skirmish and Scenario games.
- Set **population limit per team** – available for the first time.

### 4. Lobby Improvements

- TLS certificate verification **enabled by default** – reducing man-in-the-middle attacks.
- Secure connection will become mandatory in future releases.
- Simplified match hosting (no need to manually choose STUN).
- Fixed a bug that caused freezes when joining a match.

### 5. Engine Upgrades & Platform Support

- Upgraded **JavaScript engine (SpiderMonkey)** to version **128**.
- **Operating system support changes:**
  - **Windows:** No longer supports Windows 7 and 8.1 – only Windows 10 and 11. First official **64-bit** build addressing rare out-of-memory errors.
  - **macOS:** No longer supports versions below macOS 10.15.
  - **Linux:** **AppImage** provided in official releases (starting with Release 28), working closely with Snap and Flatpak maintainers for instant updates.

### 6. New Quotes and Tips

Contributor **manowar** added dozens of new historical quotes on loading screens, plus tips for beginners and veteran players in collaboration with **Vantha**.

---

## Gameplay Balancing – Key Changes

| Category | Change |
|----------|--------|
| **Capturing** | Increased capture resistance for structures (Civ Centers, Fortresses). Civilians now have a capture attack of 1.0. |
| **Naval Warfare** | Simplified naval tech tree. Scout ships available from Village phase. Rebalanced ships (ram, fire, arrow ships). |
| **Group Movement** | Destinations distributed around endpoints – units no longer collide or form long lines. |
| **Champion Cavalry** | HP decreased from 300 to 260. Cataphracts: +2 armor, but reduced speed. |
| **Elephants** | +1 pierce armor, +0.5m splash range. |
| **Carthage** | New civ bonus: stone gathering technologies free and instant per phase. Mercenary refactoring. |
| **Han** | Minister rework: no attack, no stackable auras, available from Village phase, much lower cost. |
| **Mauryas** | Maiden archers and swordsmen differentiation. Cost, speed, and power changes. |

---

## How to Play 0 A.D. Today – Download & Installation

### Windows (64-bit now official)
- Download the installer from [play0ad.com/download](https://play0ad.com/download) – Release 28 available as 64-bit .exe.

### Linux (Multiple Options)
| Method | Command |
|--------|---------|
| **AppImage** | Download, make executable `chmod +x`, then run. |
| **Flatpak** | `flatpak install flathub com.play0ad.zeroad` |
| **Snap** | `sudo snap install 0ad` |
| **Distribution packages** | `sudo apt install 0ad` (may be less up-to-date) |

### Mac (macOS 10.15 or newer)
- Download the .dmg from the official website.

### Other Distributions (BSD, etc.)
- Check the [official download guide](https://play0ad.com/download) for source packages or community builds.

> **Important update note:** Before installing Release 28, **disable all mods** to avoid conflicts. Mod creators can check the [mod porting guide](https://gitea.wildfiregames.com/0ad/0ad/wiki/PortingModsToRelease28).

---

## For Developers and Contributors – The Game Needs You Now

Release 28 is the **first release without the 'Alpha' label** after 22 years. Development processes have matured, releases are more frequent. But the team is **in desperate need** of volunteers in:

- Video Editing (produce a trailer for this release)
- Social Media Management
- Website Design

And, of course, classic areas:
- **Quality Assurance** (testing)
- **Translation** (start right away on [Transifex](https://explore.transifex.com/wildfire-games/0ad/))
- **Development** (C++ / JavaScript / SpiderMonkey)
- **Art** (3D models, textures, audio)

You can also **financially support the game** to help pay for multiplayer server hosting, websites, and development environments.

---

## Summary – Why 0 A.D. Deserves Your Time?

0 A.D. is not just an "open-source strategy game" – it's **one of the most successful free software projects in gaming history**, because it:

- Offers **deep strategic gameplay** competing with major commercial RTS titles in mechanics and graphics.
- Is **completely free** with no strings attached, and will remain so forever.
- **You can be its developer** – as a contributor, translator, tester, or even donor.
- **Runs smoothly on Linux** and supports modern hardware (4K, HDR, multiple controllers).

With Release 28 Boiorix, the game sheds the "Alpha" burden and enters a new era of maturity. Whether you're a veteran RTS player or new to the genre, try 0 A.D. today.

---

## Quick Links

- [Official Website](https://play0ad.com)
- [Download Release 28](https://play0ad.com/download)
- [Full Changelog](https://gitea.wildfiregames.com/0ad/0ad/wiki/Release28Changelog)
- [Source Code Repository](https://gitea.wildfiregames.com/0ad/0ad)
- [Forum – Discussions & Strategies](https://wildfiregames.com/forum/)
- [Discord/IRC – Community Channels](https://play0ad.com/community/irc-chat)

---
