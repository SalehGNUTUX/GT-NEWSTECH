---
layout: post
title: >-
  AOMedia Officially Releases AV2 v1.0: Next-Gen Open Video Codec with 30%
  Compression Improvement
category: foss
author: GNUTUX
excerpt: >-
  The Alliance for Open Media has announced the official release of the AV2
  v1.0.0 specification, the next generation of open source video coding
  standard, delivering approximately 30% compression efficiency improvement over
  AV1 with enhanced support for virtual and augmented reality.
image: av2-video-codec-gnutux.jpg
tags:
  - AV2
  - AOMedia
  - Video Codec
  - AV1
  - Free Software
  - Video
  - Data Compression
also_in:
  - tech-news
date: 2026-06-10T10:26:00.000Z
lang: en
slug: aomedia-av2-codec-release
---

## After Five Years of Development

After more than five years of work and development, the Alliance for Open Media announced on June 5, 2026, the official release of the AV2 v1.0.0 specification, the next generation of open source video coding standards. This release marks a milestone in the history of video coding, serving as the direct successor to the AV1 standard released in 2018, which became the backbone of streaming services such as YouTube and Netflix.

🔗 **Official Website:** [av2.aomedia.org](https://av2.aomedia.org)
🔗 **AVM Reference Repository:** [gitlab.com/AOMediaCodec/avm](https://gitlab.com/AOMediaCodec/avm)

## What Is AV2?

AV2 is a next-generation video coding standard developed under the umbrella of the Alliance for Open Media, the same alliance that delivered the successful AV1 standard. Like its predecessor, AV2 is licensed under a **royalty-free license**, ensuring that any person or company can use it without paying expensive licensing fees as required by standards such as H.265 and H.266.

AV2 improves compression efficiency by approximately **30 to 40 percent** compared to AV1. This means you can stream video at the same quality while consuming 30 percent less bandwidth, or stream much higher quality at the same bandwidth. This development is critical as consumption of 4K, 8K, and virtual and augmented reality content continues to grow.

## Key Features of AV2

### Massive Compression Efficiency Improvement

Compression improvement is the cornerstone of AV2. Official tests from AOMedia indicate that AV2 achieves:

A 30 percent improvement in Peak Signal-to-Noise Ratio, a measure of video quality compared to the original uncompressed version.

A 32.6 percent improvement in the Video Multi-Method Assessment Fusion metric, a measure developed by Netflix to evaluate video quality based on how the human eye perceives it.

These numbers translate practically into the ability for streaming services to deliver high-quality 4K and 8K content without doubling bandwidth, or to improve video quality for users with slower connections.

### Enhanced Support for Virtual and Augmented Reality

AV2 is designed to be compatible with spatial computing requirements. The new standard supports advanced features for compressing 360-degree full-sphere video and multi-view scenes. This will facilitate the development of virtual reality and augmented reality applications that require high precision and very low latency.

### Improved Screen Content Coding

Unlike older standards that were ideal for live action video, AV2 excels at compressing screen content such as sharp text, graphical user interfaces, and slideshows. This makes AV2 ideal for cloud gaming applications, video conferencing, and remote desktop sharing.

### Split-Screen Support and Live Streaming Improvements

AV2 features the ability to handle multiple video streams, also known as multi-program streams. This feature is essential for live sports, such as displaying a match from multiple angles simultaneously, or watching Formula 1 racing from different car cameras.

## Development Status and Adoption Timeline

### AVM 1.0.0 Release

Alongside the specification release, the **AOMedia Video Model 1.0.0** was launched as a reference software demonstrating how AV2 works. AVM aims to help chip manufacturers and developers understand the standard and begin the design process. However, this software is not optimized for speed or performance.

### dav2d Effort for Fast Software Decoding

Due to the lack of hardware decoding support initially, VideoLAN developers, responsible for the VLC player, announced the start of the **dav2d** project. This library will provide highly efficient software decoding based on the CPU, ensuring AV2 videos can be played on existing devices without hardware upgrades in the early years.

### How Long Will Full Adoption Take?

Undoubtedly, AV2 adoption will take some time. Looking at the history of AV1, which matured in 2018 and began to see hardware decoding support around 2020 and encoding support around 2022, a similar timeline is expected for AV2. Sources anticipate the first phone processors and GPUs supporting AV2 decoding to appear around 2028, while encoding support may take longer.

## Summary

The release of AV2 v1.0 is the culmination of years of effort from technology giants such as Google, Apple, Netflix, and Meta. The higher the compression efficiency, the better the video quality we see as individuals, while reducing pressure on internet infrastructure. The future holds smooth 8K content, immersive virtual reality, and high-quality cloud gaming, all of which will be built on the free and open source foundation of AV2.

## Quick Links

[https://aomedia.org](https://aomedia.org)

[https://av2.aomedia.org](https://av2.aomedia.org)

[https://gitlab.com/AOMediaCodec/avm](https://gitlab.com/AOMediaCodec/avm)

Published in the Free and Open Source Software section – Video Standards and Technologies
