---
layout: post
title: >-
  Linux 7.2 Adds OPENAT2_REGULAR to Prevent Programs from Opening Special Files
  by Mistake
category: gnulinux
author: GNUTUX
excerpt: >-
  The upcoming Linux 7.2 kernel introduces a new flag called OPENAT2_REGULAR
  within the Virtual File System (VFS). Its purpose is to prevent applications
  from accidentally opening special files like pipes and devices, thereby
  protecting the system from hangs and security vulnerabilities.
image: linux-vfs-gnutux.jpg
tags:
  - Linux Kernel
  - Security
  - Filesystem
  - VFS
  - Special Files
  - Programming
also_in:
  - foss
date: 2026-06-17T12:05:00.000Z
lang: en
slug: linux-7-2-openat2-regular-security
---

## The Problem of Applications Opening Special Files by Mistake

In the Linux environment, not all files are equal. There are regular files containing data, such as text and images, and special files, such as pipes, character devices, and sockets. In the past, some applications and scripts could be tricked into opening special files, thinking they were regular data files. This behavior often led to the program freezing or opening a window to an unexpected security vulnerability [citation:1][citation:4].

In the upcoming Linux 7.2 kernel (scheduled for release in August 2026), a new flag has been added to the Virtual File System (VFS) called `OPENAT2_REGULAR`. This acts as a strict security filter to prevent this type of attack and error [citation:4][citation:6].

🔗 **Source:** [lore.kernel.org/linux-fsdevel/20260615213417.22302-1-aleksandr.mikhalitsyn@canonical.com](https://lore.kernel.org/linux-fsdevel/20260615213417.22302-1-aleksandr.mikhalitsyn@canonical.com)

## What is OPENAT2_REGULAR?

Simply put, when a program tries to open a specific path using the `openat2` system call with this flag enabled, the system ensures the path points to a regular file 100% of the time [citation:1][citation:4][citation:6]. If the system detects that the path leads to a special file such as a pipe, device, or socket, the operation is immediately rejected, and an `-EFTYPE` error is returned, instead of attempting to open the file and potentially causing the program to crash or exposing the system to risk [citation:1][citation:2][citation:5].

This action relieves developers of the burden of writing extra code to verify the file type before opening it and assigns this task directly to the kernel, making applications more secure and reliable.

## The Motivating Factor: Accessing a Special File Behind a Path

This flag was introduced to address a specific security vulnerability where an attacker could exploit a kernel mechanism to force an application to open a special file, such as a character device that causes the application to hang, behind a path that appears normal, like a ".git" file in an insecure environment [citation:4].

For example, imagine a Git repository containing a normal `config` file. An attacker could replace this file with a symbolic link to a special device like `/dev/null`. If a program tries to read this file thinking it is a normal configuration file, it might hang or crash, or behave in unexpected ways. The new flag prevents this scenario entirely [citation:4].

## Current Status: A Proposed Patch, Not Yet Final

It is important to clarify that `OPENAT2_REGULAR` is still a proposed patch under development and has not yet been merged into the main kernel [citation:4][citation:5][citation:7]. However, it has been queued in the public kernel repository (linux-next) in preparation for version 7.2, meaning it is expected to be part of the final release [citation:4].

Discussions around this flag indicate it is part of a larger effort to improve filesystem security and may expand in the future to cover other types of special files, such as directories.

## What Types of Special Files Will the Flag Prevent Opening?

Pipes used for inter-process communication.

Character devices like `/dev/null`, `/dev/random`, and `/dev/tty`.

Block devices like system disks.

Sockets used for network communication.

FIFOs.

Symbolic links.

Anything that is not a regular file will be rejected.

## Who Benefits?

Application developers: They will no longer need to manually check `S_ISREG()` every time they open a file, reducing programming errors and saving time.

System administrators: The system will become more stable, as cases of hangs and crashes caused by accidentally opening special files will decrease.

Desktop users: These changes are invisible to the average user, but they mean applications will be more secure and stable.

## Backward Compatibility

The new flag is optional. Existing applications that do not use `openat2` with this flag will not be affected. Applications that use the new flag will need to handle the `-EFTYPE` error message appropriately. Most applications that handle files correctly will not need to change, as they already only deal with regular files.

## Summary

The addition of `OPENAT2_REGULAR` is a small change in code but a significant one for security. It embodies the principle of "trust but verify," where the responsibility for verification is moved to a lower level in the kernel, making the entire system more resilient against programming errors and malicious attacks. These small security changes accumulate to create a reliable system.

## Quick Links

[https://www.kernel.org](https://www.kernel.org)

[https://lore.kernel.org/linux-fsdevel/20260615213417.22302-1-aleksandr.mikhalitsyn@canonical.com](https://lore.kernel.org/linux-fsdevel/20260615213417.22302-1-aleksandr.mikhalitsyn@canonical.com)

[https://www.phoronix.com/news/Linux-7.2-OPENAT2_REGULAR](https://www.phoronix.com/news/Linux-7.2-OPENAT2_REGULAR)

Published in the GNU/Linux section – Kernel and Security News
