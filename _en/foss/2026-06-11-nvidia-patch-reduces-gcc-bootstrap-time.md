---
layout: post
title: >-
  NVIDIA Engineer Proposes Patch to Reduce GCC Build Time by 15% via Cached
  Configure Results
category: foss
author: GNUTUX
excerpt: >-
  NVIDIA engineer Kyrylo Tkachov proposed a patch for the GCC compiler that
  reduces configure script runtime by 43 percent and total bootstrap time by 15
  percent by caching probe results across the three build stages, with improved
  multi-core utilization.
image: gcc-bootstrap-gnutux.jpg
tags:
  - GCC
  - Compiler
  - NVIDIA
  - Development Tools
  - Free Software
  - Performance Optimization
also_in:
  - gnulinux
  - tech-news
date: 2026-06-11T22:38:00.000Z
lang: en
slug: nvidia-patch-reduces-gcc-bootstrap-time
---

## The Problem of Slow GCC Bootstrapping

Building the GCC compiler from source is a notoriously heavy and time-consuming process. But few developers dig into the root causes of this slowness. NVIDIA engineer Kyrylo Tkachov conducted a detailed analysis of the build process on a massive multi-core AArch64 machine, believed to be running on an NVIDIA Vera processor, and made a surprising discovery. Approximately 30 percent of the wall-clock time spent building the compiler is wasted running configure scripts. These scripts run sequentially and do not utilize multiple processors at all. Worse, the system was utilizing less than 15 percent of its computational capacity for nearly half of the build duration.

🔗 **Discussion on GCC Mailing List:** [gcc.gnu.org/pipermail/gcc-patches/2026-June/719831.html](https://gcc.gnu.org/pipermail/gcc-patches/2026-June/719831.html)

## What Is GCC Bootstrap?

To understand the problem, the bootstrap process in GCC must be explained. It is a process of building the compiler in three successive stages to ensure its correctness and freedom from bugs:

Stage 1 builds an initial version of GCC using the system compiler already installed, such as an older GCC or Clang. This version is built without optimizations to be simple and stable.

Stage 2 rebuilds the compiler from scratch, but this time using the compiler built in Stage 1. Optimizations are enabled to achieve better performance.

Stage 3 performs a third build of the compiler using the output of Stage 2. After completion, the outputs of Stage 2 and Stage 3 are compared byte by byte to ensure the compiler produces the same code when compiling itself, proving it is reliable and bug-free.

The problem is that each of these three stages runs the configure scripts from scratch. These scripts perform hundreds or thousands of checks, looking for header files, type sizes, library behavior, linker capabilities, and more. In a native bootstrap rather than cross-compilation, the results of these checks do not change between the three stages. This means you are performing the same expensive work three times in a row unnecessarily, a long-known issue in the GCC build system.

## The Proposed Solution: Caching Configure Results

The solution proposed by Kyrylo Tkachov is both clever and simple. Cache the results of configure checks in each stage and automatically reuse them in subsequent stages. The idea relies on the existing Site Cache mechanism in Autoconf, which is used to store check results for a specific environment.

Results of the proposal: After applying the patch, initial tests on both AArch64 and x86_64 architectures showed very promising results:

A 43 percent reduction in time spent on configure.

A 15 percent reduction in total bootstrap time.

Guarantee of correct output. The developer confirmed that the generated config headers were identical to the non-cached version, and the Stage 2 and Stage 3 comparison passed without issues.

This means that if a GCC build takes 30 minutes, this patch would save approximately 4 to 5 minutes of waiting time. This is a significant improvement for developers, especially in continuous integration systems.

## Initial Criticism: Hack or Real Solution?

The proposal did not pass without discussion. One commentator on the mailing list considered the patch a hack and suggested instead cleaning up the configure scripts themselves, removing old obsolete checks, supporting legacy GNU Gold linker leftovers, and other accumulated cruft. Cleaning up the scripts would also benefit cross-compilation builds, not just native builds, while the caching solution only applies to native builds.

However, as developers noted, the two solutions are not contradictory. Caching provides immediate and guaranteed benefit, while script cleanup is a larger and longer task that will pay off in the long run. Currently, the patch is being tested, and we await a decision on its integration into the main GCC branches.

## Summary

Kyrylo Tkachov's proposal to cache configure results is excellent news for anyone who has to build GCC from source, whether they are an embedded systems developer, a package maintainer in a Linux distribution, or a security researcher needing a customized compiler. As the number of cores in modern processors increases to 64, 128, or 256 cores, sequential tasks like these become the main bottleneck preventing full utilization of hardware power. This patch removes that bottleneck for the configure phase and makes the bootstrap process more efficient.

## Quick Links

[https://gcc.gnu.org](https://gcc.gnu.org)

[https://www.phoronix.com/news/NVIDIA-Reduce-GCC-Bootstrap](https://www.phoronix.com/news/NVIDIA-Reduce-GCC-Bootstrap)

[https://news.ycombinator.com/item?id=43202552](https://news.ycombinator.com/item?id=43202552)

Published in the Free and Open Source Software section – Development Tools and Compilers
