---
layout: post
title: >-
  Hyprland 0.55.3: Stability Update with Over 45 Bug Fixes and Improved
  Reliability
category: gnulinux
author: GNUTUX
excerpt: >-
  The Hyprland project has released version 0.55.3, a stability update that
  backports over 45 fixes from the main branch to the 0.55 branch. It includes
  fixes for full config reloads, rendering improvements, monitor fixes, XWayland
  patches, and overall system stability enhancements.
image: hyprland-gnutux.png
tags:
  - Hyprland
  - Wayland
  - Compositor
  - Tiling
  - Linux
  - Update
  - Stability
also_in:
  - foss
date: 2026-06-07T09:23:00.000Z
lang: en
slug: hyprland-0-55-3-stability-release
---

## Stability Arrives in a Maintenance Release

A few days after version 0.55.2, the Hyprland team released version 0.55.3 on June 6, 2026. This release is not large in terms of new features, but it is very important for users who rely on Hyprland in daily work environments. The main goal is to backport over 45 fixes and patches from the main branch to the stable 0.55 branch.

🔗 **Official Repository:** [github.com/hyprwm/Hyprland](https://github.com/hyprwm/Hyprland)

## Key Fixes

### Full Config Reload

The release adds the `hyprctl config full-reload` command, which reloads Hyprland settings from scratch instead of just updating variable values. This feature is useful for users who frequently edit their hyprland.conf file, as it ensures that all changes, including those requiring a full restart, are applied without needing to restart the entire session.

### XWayland Fixes

A bug was fixed in synthetic event comparison in XWayland, improving compatibility with legacy X11 applications running through XWayland. Also, a focus issue was fixed for non-OR X11 windows when a window was held.

### Monitor Fixes

Several issues related to external monitors were fixed. First, a problem where a monitor would not re-enable when reconnected if DPMS power saving mode was previously active was resolved. Second, a bug preventing VRR settings from applying to monitors when changed at runtime was fixed. Third, an issue with moving floating windows when changing monitor layout or ordering was fixed. Fourth, a problem where transient mode selection for new monitors would fail was resolved.

### Rendering Fixes

A bug causing the `cursor:zoom_rigid` setting to be ignored when using a detached camera was fixed. Screenshaders were fixed to work correctly with FP16 precision. File descriptor leaks in several places were also fixed.

### Popups and Groups Fixes

A problem with artifacts when moving popup windows was fixed. Also, a bug causing glow decoration effects to disappear on windows in some cases was resolved.

### Lua and Plugins Fixes

Error handling in Lua scripts was improved so that error messages appear more clearly when a library fails to load. A bug in generating the default config file that incorrectly pointed to hyprlang instead of Lua was fixed.

## Backward Compatibility

Version 0.55.3 contains no breaking changes compared to 0.55.2. Users coming from version 0.53 should be aware of the breaking changes that occurred in that release, such as changes to window rules syntax and the replacement of `new_window_takes_over_fullscreen` with `on_focus_under_fullscreen`.

## Installation and Update

### On Arch Linux and Derivatives
```bash
sudo pacman -Syu hyprland
```

### On Ubuntu/Debian (via Third-Party Repositories)
```bash
# First add the hyprland repository, then:
sudo apt update
sudo apt install hyprland
```

### On Fedora
```bash
sudo dnf copr enable solopasha/hyprland
sudo dnf install hyprland
```

### Building from Source
```bash
git clone https://github.com/hyprwm/Hyprland
cd Hyprland
make all
sudo make install
```

## Warning About Plugins

Some users have noted that plugin versions such as hyprbars and hyprexpo are still not fully compatible with recent Hyprland versions. It is recommended to check the compatibility of the plugins you use before updating, or use the `hyprpm` tool to manage them.

## Summary

Hyprland 0.55.3 is not a revolutionary release, but it delivers what it promises: improved stability and a smoother experience. Over 45 fixes covering multiple aspects of the system make this update worth installing for anyone who relies on Hyprland as their primary desktop environment.

## Quick Links

[https://github.com/hyprwm/Hyprland](https://github.com/hyprwm/Hyprland)

[https://github.com/hyprwm/Hyprland/releases/tag/v0.55.3](https://github.com/hyprwm/Hyprland/releases/tag/v0.55.3)

[https://wiki.hyprland.org](https://wiki.hyprland.org)

Published in the GNU/Linux section – Desktop Environments
```
