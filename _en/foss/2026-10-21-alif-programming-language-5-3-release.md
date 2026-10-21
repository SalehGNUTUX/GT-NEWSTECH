---
layout: post
title: >-
  Alif 5.3.0: A Release Marking the Maturity of the First True Arabic
  Programming Language
category: foss
author: GNUTUX
excerpt: >-
  The Alif community has announced version 5.3.0 of the Arabic programming
  language Alif, focusing on enhancing system stability and improving data
  processing efficiency, marking a new step in building an Arabic programming
  language that competes with global languages.
image: alif-gnutux-en.jpg
tags:
  - Alif
  - Arabic Programming Language
  - Free Software
  - Interpreter
  - C++
  - Alif Community
also_in:
  - tech-news
date: 2026-10-21T09:50:00.000Z
lang: en
slug: alif-programming-language-5-3-release
---

## Alif: When Arabic Leads the World of Programming

In an era dominated by English programming languages, an ambitious project stands out aiming to change this equation. **Alif** is a modern, interpreted, clear, and easy-to-learn Arabic programming language, multi-purpose and cross-platform. It was built from scratch using C++, giving it its own API and allowing control over any part of the language's program due to its independence from external libraries, which enables developers to extend it and link it with external libraries easily.

The language's philosophy is inspired by Python: "The time spent understanding code should be less than the time spent writing it." Hence, it adopts three core principles: starting where others left off, slow but organized yet fruitful development, and initiative and adventure. It also commits to three conditions in every development: intuitiveness (closeness to natural Arabic), execution speed, and writing speed.

🔗 **Official Website:** [aliflang.org](https://aliflang.org)
🔗 **GitHub Repository:** [github.com/alifcommunity/Alif](https://github.com/alifcommunity/Alif)
🔗 **Telegram Channel:** [t.me/aliflang](https://t.me/aliflang)

## What's New in Version 5.3.0

On May 5, 2026 (corresponding to 1/12/1447 AH), the Alif community announced version **5.3.0**, describing it as "a more powerful, bolder, and more stable release." This version focuses on:

- **Strengthening the system architecture** to ensure optimal stability in complex software projects.
- **Improving language responsiveness and data processing efficiency.**
- **Elevating the experience** to be a professional tool that gives Arab developers full confidence in building integrated software solutions with global standards.

This release follows a series of updates the language has seen, including improvements to functions like `اطبع` (print) to support direct formatting and instant printing, the addition of a random library, and improved error handling in the "try" (حاول) case.

## Language History: From Education to Competition

Alif is not a new project. The idea began in 2010 with Hassan Drakah and went through multiple stages:

- **2018:** First version (1.0) released.
- **2019:** Second version (2.0) released.
- **2020:** Third experimental version (3.0) released, development stopped in 2022.
- **2022:** Development of the interpreted version (version 5) began by Mohammed and Abdulrahman Al-Khatib, continuing to this day.

The fundamental difference between previous versions and version 5 is that the former had **educational goals**, while version 5 aims to **compete with global languages**. Sub-versions of version 5 are compatible and complementary to each other.

## Practical Example: Tic-Tac-Toe in Alif

To understand the language's simplicity and closeness to Arabic, here is a snippet of a Tic-Tac-Toe game written in Alif:

```alif
اللوح = [" " لاجل _ في مدى(9)]

دالة عرض_اللوح():
    اطبع(م"{اللوح[0]} | {اللوح[1]} | {اللوح[2]}")
    اطبع("--+---+--")
    اطبع(م"{اللوح[3]} | {اللوح[4]} | {اللوح[5]}")
    اطبع("--+---+--")
    اطبع(م"{اللوح[6]} | {اللوح[7]} | {اللوح[8]}")

دالة هل_رابح(لاعب):
    تشكيلات_الفوز = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6] ]

    لاجل تشكيل في تشكيلات_الفوز:
        اذا اللوح[تشكيل[0]] == اللوح[تشكيل[1]] == اللوح[تشكيل[2]] == لاعب:
            ارجع صح
    ارجع خطأ
```

This example shows how Alif uses clear Arabic words like `دالة` (function), `لاجل` (for), `اذا` (if), `ارجع` (return), `صح` (true), `خطأ` (false), making code much easier to read and understand for native Arabic speakers.

## Requirements and Building

Alif is available for Windows, Linux, and macOS. To build the language from source on Linux or macOS, you need a C++ compiler (installable on Ubuntu via `sudo apt install build-essential`). After cloning the repository, enter the `linuxBuild` directory and run `make`. The language will be built in the `build` folder, and you can run files using `./alif filename.alif`.

## The Alif Community

Alif is not just a technical project. It is a **community**. You can join the [Telegram group](https://t.me/aliflang), which has hundreds of members (697 members, 22 online at the time of writing), to contribute, ask questions, and follow the latest developments.

## Summary

Alif 5.3.0 is a new step on a long journey that began over a decade ago. From an educational project to a language aiming to compete with global languages, Alif has proven that programming in Arabic is not a distant dream. The new release strengthens stability and efficiency and lays the foundation for a future where Arabic is a producer of technical knowledge, not just a consumer.

## Quick Links

[Alif Official Website](https://aliflang.org)

[Changes between 5.2 and 5.3 on GitHub](https://github.com/alifcommunity/Alif/compare/Alif5.2...Alif5.3)

[Release 5.3.0 on GitHub](https://github.com/alifcommunity/Alif/releases/tag/v5.3.0)

[Alif Official Documentation](https://aliflang.org/docs/whatsnew/)

[Telegram group](https://t.me/aliflang)
