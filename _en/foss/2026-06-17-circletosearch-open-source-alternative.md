---
layout: post
title: >-
  CircleToSearch: Open Source Alternative to Google's Circle to Search with Full
  Control and Privacy
category: foss
author: GNUTUX
excerpt: >-
  CircleToSearch is an open source Android application that offers the popular
  Circle to Search experience to all devices, with support for multiple search
  engines (Google, Bing, Yandex, TinEye, ChatGPT) and offline OCR, while
  maintaining privacy with no tracking.
image: circletosearch-gnutux.jpg
tags:
  - CircleToSearch
  - Circle to Search
  - Reverse Image Search
  - OCR
  - Android
  - Open Source
  - Privacy
also_in:
  - tech-news
date: 2026-06-17T18:54:00.000Z
lang: en
slug: circletosearch-open-source-alternative
---

## The Problem of Circle to Search Monopoly

Google's Circle to Search feature, which allows users to select any part of the screen and search instantly, was restricted to flagship devices such as the Pixel 6 and later and Galaxy S23 and later, with specific requirements like Android 13 and Google set as the default assistant. This monopoly prevented users on older devices or those who prefer alternative search engines from accessing the feature.

🔗 **Official Repository:** [github.com/AKS-Labs/CircleToSearch](https://github.com/AKS-Labs/CircleToSearch)

## What Is CircleToSearch?

CircleToSearch is an open source Android application from AKS-Labs, built in Kotlin, licensed under GPL-3.0-or-later, that provides a Circle to Search experience very similar to Google's, but with crucial advantages that the original version lacks.

According to the developers, the application was designed to be independent of Google services and runs on any device running Android 10 or later, bypassing the restrictions imposed on the original feature.

## What Does It Do Differently?

Freedom to choose a search engine: Instead of being tied to Google Search, the app supports multiple engines such as Google Lens, Bing Visual Search, Yandex, TinEye, ChatGPT, and Perplexity.

Complete local privacy: The most important feature is the Optical Character Recognition system, which works entirely locally on the device using Tesseract. This means extracting text from images or screens is done without sending any data to the internet.

Advanced display controls: Additional features include a desktop mode for viewing search results, sharing and saving selections, and customizable user interface.

## Key Features in Detail

### Flexible Selection
The tool can be activated via a double-tap on the status bar, a long press on the home button after setting the app as the default assistant, through a floating bubble, or via a Quick Settings Tile. After activation, you can draw a circle, rectangle, or scribble to select the desired area.

### Local OCR
The built-in optical character recognition engine works offline. It allows copying text from anywhere on the screen quickly and without privacy concerns. You can even import high-accuracy Tesseract models for other languages.

### Multi-Engine Search
After selection, the search can be directed to any of the supported engines. In desktop mode, search results appear in full as they would on a computer, a very useful feature for developers and researchers.

### Smart Scan and Entity Detection
The SmartScan feature detects QR codes, links, phone numbers, and email addresses, with direct actions available from them.

## Privacy and Security

Being open source, the code can be reviewed to ensure it does not track or collect data. It works independently of Google Play Services or manufacturer-specific software. The application is available on F-Droid, a trusted store for open source applications.

## Installation

The application can be downloaded from the releases page on GitHub or from F-Droid.

## Summary

CircleToSearch is not just an imitation of Google's Circle to Search feature. It is a genuine improvement upon it. It gives users the freedom to choose their search engine, provides unparalleled privacy through local OCR processing, and breaks the monopoly of the feature on expensive devices. If you are an Android user looking for a visual search tool that puts privacy and choice first, this project is worth trying.

## Quick Links

[https://github.com/AKS-Labs/CircleToSearch](https://github.com/AKS-Labs/CircleToSearch)

[https://f-droid.org/en/packages/com.akslabs.circletosearch/](https://f-droid.org/en/packages/com.akslabs.circletosearch/)

[https://github.com/AKS-Labs/CircleToSearch/releases](https://github.com/AKS-Labs/CircleToSearch/releases)

Published in the Free and Open Source Software section – Android Applications and Productivity
