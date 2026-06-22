---
layout: post
title: >-
  GT-MISHKATKIDS v1.0: Educational App for Kids with a Child-as-Teacher,
  Robot-as-Learner Concept
category: gnutux-projects
author: GNUTUX
excerpt: >-
  GT-MISHKATKIDS (Mishkat) is an open source educational application for
  children aged 4 to 10, built on the concept that the child is the teacher and
  the robot is the learner. It includes Arabic letters, numbers, Quran, stories,
  and puzzles, works offline, and is available for Linux and Android.
image: screenshot_20260622_184416.jpg
tags:
  - GT-MISHKATKIDS
  - Education
  - Kids
  - Islamic
  - Apps
  - Linux
  - Android
  - PWA
also_in:
  - foss
date: 2026-06-23T18:18:00.000Z
lang: en
slug: gt-mishkatkids-release
---

## The Concept of Reverse Teaching

Traditional children's educational apps follow a single pattern. The app is the teacher, and the child is the learner. The app presents information, tests the child, and corrects mistakes. This model is effective, but it lacks a key element of deep learning: teaching someone who does not know.

The GT-MISHKATKIDS project, meaning the Child and the Robot, turns this model upside down. In this application, the child is the teacher and the friendly robot is the learner who has lost his memory. The child's mission is to re-educate the robot through real-world activities. Each time the child successfully teaches the robot a new memory, a part of the robot lights up and its energy returns. It is as if the child is lighting the lamp of knowledge.

🔗 **Official Website:** [salehgnutux.github.io/GT-MISHKATKIDS](https://salehgnutux.github.io/GT-MISHKATKIDS)
🔗 **GitHub Repository:** [github.com/SalehGNUTUX/GT-MISHKATKIDS](https://github.com/SalehGNUTUX/GT-MISHKATKIDS)

## Core Principles

First, the learner's impact. We learn more deeply when we teach others. The child gains confidence and knowledge by explaining concepts to the robot.

Second, role reversal. In this system, the child is the confident expert, and the robot is the one who makes mistakes. This creates complete emotional safety for the child, as there is no fear of failure because failure is not their fault.

Third, the hybrid approach. The application is digital, but it encourages the child to perform real-world activities at home before using the screen. Printables and cards are an essential part of the experience.

Fourth, absolute privacy. Everything runs locally on the device. No account, no tracking, no cloud, and no internet required after the initial download.

## What Does the Application Include?

The image below shows the main screen of the application:

![Main screen of Mishkat](https://github.com/SalehGNUTUX/GT-MISHKATKIDS/blob/main/%D9%84%D9%82%D8%B7%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B4%D8%A7%D8%B4%D8%A9/%D8%A7%D9%84%D8%B4%D8%A7%D8%B4%D8%A9-%D8%A7%D9%84%D8%B1%D8%A6%D9%8A%D8%B3%D9%8A%D8%A9.png?raw=true)

### The Core Loop
This is the heart of the application. It starts with a spark, a memory fragment flickering in the robot. Then the child goes out to perform a real-world task, such as drawing a circle or counting objects in the room. The child returns to tell the robot what they did. Parents decide whether the task was successful or not. Upon success, a part of the robot lights up and progress increases. The robot regains its smile after restoring 8 rewards.

### The Holy Quran
It contains Surah Al-Fatihah and Juz Amma with the recitation of Sheikh Mahmoud Khalil Al-Husary, which is local and does not require internet. It includes verse highlighting during recitation, verse or surah repetition for memorization, audio recordings by the child, and multiple Quranic fonts.

### Basics and Reading
It includes teaching Arabic letters with cards and a find-the-letter game, numbers and counting, and diacritical marks such as fatha, damma, and kasra. Then the reading ladder progresses from syllables to words to sentences, with audio pronunciation.

### Stories, Puzzles, and Quizzes
It contains 8 original illustrated stories with different values such as perseverance, patience, courage, honesty, cooperation, curiosity, compassion for animals, and cleanliness. In addition to 51 short stories adapted from the GT-SARARIM project, 61 puzzles with different levels including hints and solutions, and 94 multiple-choice questions across categories and ages with immediate results.

The image below shows the dashboard interface:

![Mishkat Dashboard](https://github.com/SalehGNUTUX/GT-MISHKATKIDS/blob/main/%D9%84%D9%82%D8%B7%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B4%D8%A7%D8%B4%D8%A9/%D9%84%D9%88%D8%AD%D8%A9-%D8%A7%D9%84%D8%AA%D8%AD%D9%83%D9%85.png?raw=true)

### Games and Activities
It includes a comprehensive game center: a memory game, and 7 games for combining letters such as train, clothespins, cubes, fishing, cards, maze, and wheel. In addition to printable activities for off-screen use.

### Progress and Achievements
The application tracks the child's stars and achievements, consecutive days, the daily task, and provides a printable certificate of completion. All of this works entirely locally.

### Parents' Dashboard
A protected gateway with a password that allows parents to review the child's progress in each area, adjust application settings, and manage multiple children's accounts. Parents can also document the child's progress with local audio recordings or images.

The image below shows the login screen:

![Mishkat Login Screen](https://github.com/SalehGNUTUX/GT-MISHKATKIDS/blob/main/%D9%84%D9%82%D8%B7%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B4%D8%A7%D8%B4%D8%A9/%D8%B4%D8%A7%D8%B4%D8%A9-%D8%A7%D9%84%D8%AF%D8%AE%D9%88%D9%84.png?raw=true)

## Original and Imported Content

The application contains entirely original content in the core loop, graphics, the original library of 71 memories across 5 areas, illustrated stories, and games. This content was designed specifically for the Mishkat project.

It also imports content from the GT-SARARIM project, which is licensed under GPL-3.0. The imported content includes 51 short stories with comprehension questions, 61 puzzles, and 94 quiz questions. All this content is taken verbatim from GT-SARARIM and is subject to GPL-3.0 with attribution to the original developer.

## Cross-Platform Compatibility

The application works in four different ways:

Through the browser as a PWA. It runs directly from the browser on any device, such as a computer, tablet, or phone. It can be installed as a standalone application and works offline after the initial download. This is the fastest and easiest way to try the application.

On Linux via AppImage. A portable package that works on any Linux distribution without installation. Download the file, make it executable, and run it.

On Linux via DEB and RPM packages. Official packages for Debian or Ubuntu and Fedora or openSUSE distributions. They can be installed through the package manager and appear in the application menu.

On Android via APK. The application can be installed directly through the APK file by enabling installation from unknown sources. The version is compatible with Android 8 or later.

All versions share the same codebase with different packaging depending on the platform.

## Technology Used

The application is built using Vite and vite-plugin-pwa to generate a Service Worker that enables offline functionality. It uses HTML and JavaScript with ES modules, with fully local SVG graphics embedded in the code, eliminating the need for external images. Storage is handled through localStorage for progress and settings, and IndexedDB for audio and image recordings. There is no backend server, no API keys, and no AI at runtime.

## Download

### Linux AppImage
```bash
chmod +x GT-MISHKATKIDS-1.0.0.AppImage
./GT-MISHKATKIDS-1.0.0.AppImage
```

### Linux DEB for Ubuntu and Debian
```bash
sudo dpkg -i gt-mishkatkids_1.0.0_amd64.deb
```

### Linux RPM for Fedora and openSUSE
```bash
sudo rpm -i gt-mishkatkids-1.0.0-1.x86_64.rpm
```

### Android APK
Download the APK file from the GitHub releases page, transfer it to your phone, and install it by enabling installation from unknown sources.

### Web PWA
Open the link at [salehgnutux.github.io/GT-MISHKATKIDS/app/home.html](https://salehgnutux.github.io/GT-MISHKATKIDS/app/home.html) in a modern browser. An install icon will appear in the address bar. Click it to install the application as a standalone app.

## Future Roadmap

According to the roadmap documented in the repository, upcoming versions will include:

Full desktop application support through Electron to bypass browser limitations.

Additional memories and activities.

Enhanced parents' dashboard with more analytics.

iOS support through Capacitor.

## Summary

GT-MISHKATKIDS is not just another educational application. It is a unique learning experience based on the concept of learning by teaching. The child does not only receive information but teaches it to a friendly robot, reinforcing their understanding and self-confidence. With its rich content covering Quran, reading, math, stories, puzzles, and games, and its clear Islamic framework, this project is a valuable addition to the open source educational software library.

## Quick Links

[https://salehgnutux.github.io/GT-MISHKATKIDS](https://salehgnutux.github.io/GT-MISHKATKIDS)

[https://salehgnutux.github.io/GT-MISHKATKIDS/app/home.html](https://salehgnutux.github.io/GT-MISHKATKIDS/app/home.html)

[https://github.com/SalehGNUTUX/GT-MISHKATKIDS](https://github.com/SalehGNUTUX/GT-MISHKATKIDS)

[https://github.com/SalehGNUTUX/GT-MISHKATKIDS/releases](https://github.com/SalehGNUTUX/GT-MISHKATKIDS/releases)

Published in GNUTUX Projects – Educational Applications
```
