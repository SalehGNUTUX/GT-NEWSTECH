---
layout: post
title: >-
  Blender 5.2 LTS Officially Released: EEVEE Overhaul, Online Asset Libraries,
  and More
category: foss
author: GNUTUX
excerpt: >-
  The Blender Foundation has released version 5.2 LTS, the new long-term support
  release featuring significant improvements in EEVEE performance and lighting,
  a major compositor overhaul with new nodes, support for online asset
  libraries, and enhanced modeling and sculpting tools.
image: blender-5.2lts-gnutux.jpeg
tags:
  - Blender
  - LTS
  - Free Software
  - 3D Modeling
  - EEVEE
  - Graphics
also_in:
  - tech-news
date: 2026-07-14T16:49:00.000Z
lang: en
slug: blender-5-2-lts-release
---

## A New LTS Release After Two Years of Development

On July 14, 2026, the Blender project announced the release of version 5.2 LTS, the new Long-Term Support release that will be supported for two years until July 2028 [citation:3][citation:4]. This release comes after a development cycle that began with Blender 5.0 LTS, combining improvements from the 5.1 interim release with new features developed specifically for 5.2.

🔗 **Official Website:** [blender.org](https://www.blender.org)
🔗 **Release Notes:** [developer.blender.org/docs/release_notes/5.2/](https://developer.blender.org/docs/release_notes/5.2/)

## EEVEE Rendering Engine Improvements

The EEVEE rendering engine received significant improvements in this release [citation:3]:

**Screen Space Raytracing Overhaul:** Long-standing usability issues in the Screen Space Raytracing pipeline have been addressed, improving the accuracy of shadows and reflections.

**Fast GI Fixes and Optimization:** Several critical bugs in the Fast Global Illumination code have been resolved, with a more robust implementation. Fast GI has also been better optimized for speed and noise reduction.

**EEVEE Performance Gains:** EEVEE lights now support camera ray visibility. Additionally, EEVEE now supports the same instancing optimizations as Workbench and Overlay, making CPU-bottlenecked, instancing-heavy scenes up to twice as fast [citation:3].

## Compositor Development

The compositor saw major development in this release, with new nodes and significant performance improvements [citation:6]:

### New Nodes and Features
- **Blank Image:** A new node that generates an image of a specified size and constant color [citation:6].
- **String To Image:** A new node that converts text into an image [citation:6].
- **New Socket Types:** Support has been added for Matrix, Rotation, String, Font, and Object sockets, along with corresponding math and input nodes [citation:6].
- **Frame Input:** The Stabilize 2D node now has a Frame input.
- **Node Analysis:** The Group Output node now displays the total execution time of the node tree.

### Performance Enhancements
- **Lazy Evaluation:** Switch nodes now support static lazy evaluation, meaning nodes that are not connected or used are not executed, saving processing time [citation:6].
- **Dilate/Erode Optimization:** The Distance Threshold mode of the Dilate/Erode node is now orders of magnitude faster for larger sizes, with execution time independent of input size [citation:6].
- **Interactive Compositing:** The interactive compositor now supports animation playback [citation:6].

## Online Asset Libraries

One of the standout features in Blender 5.2 LTS is the ability to register remotely-hosted online asset libraries [citation:3]. Users can browse these libraries within Blender and download assets on an as-needed basis. This feature opens the door to sharing libraries between teams and communities without requiring local downloads of everything.

## Modeling and UV Tools

Several tools previously available as the LoopTools addon have been moved into the core [citation:9]:
- **Circle:** Creates circles from selections.
- **Space:** Distributes points evenly.
- **Flatten:** Flattens selections onto a plane.

Additionally, snapping support has been added to lattice objects [citation:9], and improved support for combining characters in 3D text has been implemented. The UV Editor now includes a new unwrapping option using the Original Bounding Box and island support for overlap selection [citation:9].

## Sculpt and Paint Tools

- **Scene Project Brush:** A new sculpt brush that displaces vertices towards the surface of other objects in the scene, similar to a Shrinkwrap modifier [citation:5].
- **Add Primitive Tools:** Add Cube, Add Cone, and Add Cylinder tools are now available in Sculpt Mode [citation:5].
- **Brush Cursor:** In Vertex Paint and Weight Paint, the brush cursor is now drawn in 3D space when using the Spherical brush falloff [citation:5].

## User Interface and Platform Improvements

- **New Icons:** Icons for status information, download, filters, and more have been added [citation:7].
- **Sidebar:** Sidebar tabs are now always visible and support compact mode [citation:7].
- **Multi-line Text Input:** A new text-box widget allows multi-line text input [citation:7].
- **Linux Wayland Improvements:** Keyboard shortcuts now work with non-Latin layouts (such as Cyrillic) when a fallback Latin layout is available [citation:7].

## Download

Blender 5.2 LTS can be downloaded from the official website on all platforms: Windows, macOS, and Linux. For Linux users, AppImage, Flatpak, and Snap packages are available.

## Summary

Blender 5.2 LTS is an important release for users who rely on Blender for daily work. With two years of support, significant performance and compositing improvements, and new features like online asset libraries, this release offers great value to the community.

## Quick Links

[https://www.blender.org/download](https://www.blender.org/download)

[https://developer.blender.org/docs/release_notes/5.2/](https://developer.blender.org/docs/release_notes/5.2/)

[https://www.blender.org/download/lts/](https://www.blender.org/download/lts/)

Published in the Free and Open Source Software section – 3D Modeling and Graphics
