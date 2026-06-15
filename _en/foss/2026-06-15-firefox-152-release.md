---
layout: post
title: >-
  Firefox 152 Released: JPEG-XL Support, Modern Settings Interface, and Full
  Video Controls
category: foss
author: GNUTUX
excerpt: >-
  Mozilla has released stable version 152 of the Firefox browser, featuring
  built-in JPEG-XL support, a completely redesigned settings interface, HDR
  video support on Windows, browser muting from the address bar, and full video
  controls via the right-click menu.
image: firefox-152-gnutux.webp
tags:
  - Firefox
  - Mozilla
  - Browser
  - JPEG-XL
  - HDR
  - Security
  - Privacy
also_in:
  - tech-news
date: 2026-06-15T18:55:00.000Z
lang: en
slug: firefox-152-release
---

## An Update Worthy of Its Version Number

After weeks of testing in the Beta and Developer Edition channels, Mozilla released stable version **Firefox 152** on June 14, 2026. This update is not just a bug fix release. It brings a set of features that were previously confined to experimental builds for months, most notably support for the JPEG-XL image format.

🔗 **Official Website:** [mozilla.org/firefox](https://mozilla.org/firefox)

## JPEG-XL: Built-in Support But Still Experimental

After a long period of hesitation, Mozilla has taken a decisive step toward supporting the JPEG-XL format. In version 152, JPEG-XL support code is now **compiled by default** in Beta and stable releases, after being previously confined to Nightly builds only.

JPEG-XL is a modern, royalty-free image format designed to be the natural successor to legacy JPEG, PNG, and GIF. It offers 30 to 40 percent better compression than traditional JPEG at the same quality, and supports transparency like PNG, animation like GIF, and high bit depth.

However, images in this format are still **disabled by default**. To enable them, users need to go to `about:config` or Firefox Labs settings and manually activate the option. This means the format is still in experimental stages, paving the way for full activation in a future release.

## Design: Completely Revamped Settings Interface

If you go to `about:preferences`, you will notice a dramatic change. The Firefox 152 settings interface has been completely redesigned to be more organized and easier to navigate. Categories have been reordered, and menus have become clearer, making it easier to find the options you are looking for without hassle.

## Control: Mute the Browser from the Address Bar

One of the most practical features in this release is the ability to **mute the browser** directly from the address bar. If a tab is playing annoying audio, you can type "mute", "shush", or "sssh" in the address bar and select the quick action. This command **mutes all tabs playing audio across all Firefox windows** at once.

Also, for the first time, **basic video controls** such as play, pause, fullscreen, mute, and restart are now available through the **right-click menu** on any video, even on sites that use custom video players and block this menu, such as Instagram and TikTok.

## Web Development: CSS Support and Deeper Protection

Version 152 adds support for the new **`field-sizing`** CSS feature, which allows form controls to automatically resize to fit their content. This eliminates the need for complex JavaScript or CSS solutions to make input boxes expand as the user types.

In terms of security, **WebAuthn Related Origin Request** is now supported. This simplifies the login process using passkeys across multiple domains, making it easier for large websites to manage sessions securely.

## Hardware: HDR Video Support on Windows

For users with high-quality displays, Firefox 152 now supports **High Dynamic Range video** on Windows 10 and 11, but with two conditions. The display must be connected to an AMD or NVIDIA graphics card, and HDR mode must be enabled in display settings. Support does not currently include laptops with integrated Intel graphics paired with NVIDIA. The feature is still in its early stages, and future improvements may be needed.

## Various Other Improvements

Copy tab links: You can now copy the current tab's link, or multiple selected tab links, through the right-click menu, without needing to open them first. This feature is available on Windows and Linux.

Open downloads in the background: When downloading a PDF or any file that Firefox handles internally, if you switch to another tab or close the original page, the file will automatically open in a background tab, without disrupting your current browsing experience.

Developer improvements: Limited support for `::-webkit-scrollbar` to improve compatibility with sites designed specifically for Chromium browsers, and support for the `unadjustedMovement` option in the Pointer Lock API to obtain raw mouse movement data without operating system acceleration effects.

Privacy in private browsing: If Tracking Protection breaks a site in a private window, Firefox displays an information bar after reloading. Clicking Reload temporarily disables protection for that site and reloads the page.

macOS improvements: Fixed issues with text editing commands using arrow keys in right-to-left languages, and improved reliability when saving images by dragging them to the desktop or Finder windows.

On Android: When sharing a remote PDF file, the file itself will now be shared rather than its URL link.

## Update and Download

You can get Firefox 152 through the automatic update from within the browser. Go to the menu, then Help, then About Firefox. Alternatively, download it manually from the official website.

## Summary

Firefox 152 is an excellent release for both regular users and developers. JPEG-XL support lays the foundation for a faster and more efficient web future, while user interface improvements such as browser muting and full video controls make the daily experience smoother.

## Quick Links

[https://www.mozilla.org/firefox](https://www.mozilla.org/firefox)

[https://www.mozilla.org/firefox/notes](https://www.mozilla.org/firefox/notes)

[https://www.mozilla.org/firefox/android](https://www.mozilla.org/firefox/android)

Published in the Free and Open Source Software section – Web Browsers
