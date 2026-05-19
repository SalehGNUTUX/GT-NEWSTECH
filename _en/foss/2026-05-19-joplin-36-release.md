---
layout: post
title: >-
  Joplin 3.6: Live Markdown Editing, Improved OneNote Import, and Embedded Video
  Support
category: foss
author: GNUTUX
excerpt: >-
  Version 3.6 of the Joplin note-taking application adds a live Markdown editor
  with real-time formatting, improved OneNote import on Linux and macOS,
  embedded video support, and synchronization and mobile enhancements.
image: joplinapp-gnutux.png
tags:
  - Joplin
  - Note Taking
  - Open Source
  - Productivity
  - Markdown
  - OneNote
  - Electron
date: 2026-05-19T10:14:00.000Z
lang: en
slug: joplin-36-release
---

## The Problem of Cross-Platform Note Taking

Most note-taking applications suffer from two basic problems. Either they are too simple and lack advanced features, or they are complex and lock your data into a closed system. Joplin was built to solve this dilemma years ago, and version 3.6 takes the next step in making the application more powerful and easier to use.

🔗 **Official Website:** [joplinapp.org](https://joplinapp.org)

## What Is Joplin?

Joplin is an open source application for note taking and task management, available on Windows, macOS, Linux, Android, and iOS. It supports Markdown text files, and can handle images, videos, audio files, and PDFs. Notes are saved in open formats, and can be synchronized through Nextcloud, Dropbox, OneDrive, and Joplin Cloud with full end-to-end encryption.

## What Is New in Version 3.6?

Version 3.6 is a major update, numbered 3.6.13 at the time of writing. It focuses on improving the editing experience, simplifying synchronization, and providing better OneNote import.

The image below shows the main Joplin interface with the new editor and side-by-side preview:

![Joplin 3.6 interface with editor and preview](https://raw.githubusercontent.com/laurent22/joplin/dev/Assets/WebsiteAssets/images/screenshots/desktop-1.jpg)

## Improvements Common to Desktop and Mobile

### Live Markdown Editor

The biggest improvement in this release is the Markdown editor that displays formatting directly while writing. You no longer see raw Markdown symbols like asterisks and hash marks. Instead, text appears with headings, bold, italics, links, and images as they will appear in the final result. This brings the editing experience much closer to the preview experience, while maintaining the speed and reliability of pure Markdown.

Inline HTML elements such as colored text, superscript and subscript, and strikethrough now appear in real time. YAML frontmatter blocks appear as formatted blocks instead of raw text. Code block highlighting is now consistent between the editor and the viewer.

Also, Markdown formatting commands like bold and italic are now applied correctly to multi-line selections, formatting each line individually rather than formatting the entire block at once.

### Embedded Video and Media Time Ranges

External content can now be embedded directly in notes. The most notable example is YouTube links. Paste the link, and the video appears directly in the note and can be played from there.

For audio, video, and PDF files, you can now link to a specific section using start and end times. This is very useful for pointing to a particular part of a long file, instead of referring the reader to the entire file.

### Significantly Improved OneNote Import

Importing OneNote files was a weakness in previous versions. In version 3.6, the importer was completely rewritten:

Importing .onepkg files now works not only on Windows but also on Linux and macOS. Large .one files with many attachments are now processed correctly. Handwriting and ink import has been significantly improved in terms of positioning, scaling, and support for nested ink containers.

Many display bugs have been fixed. Bold and italic text are now correctly converted to Markdown. Fonts are handled better when Calibri is not available. PDF printouts import correctly. Cross-page links remain intact. Notebooks with non-Latin titles such as Arabic and Chinese can now be imported without issues.

The image below shows the OneNote import interface within Joplin:

![OneNote import in Joplin 3.6](https://joplinapp.org/images/news/20231223-155221_0.png)

### Fewer Unexpected Synchronization Conflicts

Several long-known causes of unexpected conflicts have been fixed. These include conflicts that could occur during synchronization, after a full synchronization, or due to duplicate resources. Resource handling in read-only shared notebooks has also become more reliable.

## Desktop-Specific Improvements

### Clearer Synchronization Status

The sidebar now contains a synchronization status icon and a collapsible synchronization report. You can now see what Joplin is doing at a glance without opening the log. A new toggle button allows you to collapse or expand the sync window at any time. Together, these changes make synchronization activity much more transparent in daily use.

### Zoom, Keyboard Shortcuts, and Copying in the Viewer

A number of small improvements make the desktop experience more comfortable:

A keyboard shortcut for full screen mode (Ctrl+Cmd+F) has been added, along with a global shortcut to show and hide Joplin. On Windows and Linux, a keyboard shortcut and a menu option to close the window are now available. Toolbar button tooltips now contain keyboard shortcuts.

The Copy and Select All commands in the Edit menu now work inside the note viewer and in read-only mode. The detailed note list now shows the percentage completion for checkbox lists. Editor settings have been moved to their own section in the settings screen to make them easier to find.

### Accessible PDF Export and OCR Improvements

Exported PDF files now contain accessibility information. PDFs processed with OCR now have a text layer, making them searchable and screen-reader friendly. The OCR feature now supports Chinese and Norwegian as well.

## Mobile-Specific Improvements

### Sort by Notebook

On mobile devices, you can now set a different sort order for each notebook, just like has been possible on desktop for a long time. This is very useful when different notebooks need different sorting methods. A journal notebook might be sorted by date, while a reference notebook is sorted alphabetically.

### Dedicated Attachment Management Screen

A new screen lists all attachments in your notes, making it much easier to review what is saved, find a specific file, or delete attachments you no longer need. It is available under Configuration, Tools, and Note Attachments.

### More Flexible Editor Toolbar

Two improvements make the mobile editor toolbar more flexible:

New buttons have been added to jump to the beginning of the note and to the end of the note, significantly speeding up navigation in long notes. Toolbar buttons can now be rearranged using up and down arrows, allowing you to place the functions you use most within easy reach.

### Other Mobile Improvements

Joplin now remembers whether you were viewing or editing a note, instead of always opening it in view mode. A new Show in Notebook option helps you find a note from a search result or another view within the sidebar. Plain text .txt files can now be imported directly on mobile devices.

The image below shows the Joplin mobile app with the new attachment management screen:

![Joplin mobile attachment screen](https://joplinapp.org/images/news/20250215-attachment-screen.jpg)

## Security and Bug Fixes

Version 3.6 includes numerous bug fixes across desktop and mobile, addressing issues in editing, synchronization, import, display, and general stability. Several security improvements have also been made, including a stricter Content Security Policy on desktop.

## Installation on Linux

The official package format for Joplin is AppImage. The file size is approximately 156 megabytes. Cold start time from launch to interface display was approximately 31 seconds in one user's test, with 33.63 seconds user time and 31.02 seconds total. This is slow compared to other applications. ZIM took 10.8 seconds, and LibreOffice took 4.8 seconds.

If speed is important to you, this is a point worth considering. But if features and flexibility are more important, Joplin remains an excellent choice.

Joplin can also be installed via Flatpak from Flathub, which is the recommended method for faster updates and better desktop integration. At the time of writing, version 3.6 was not yet available on Flathub, but it should arrive within days.

## Summary

Joplin 3.6 is an important update for those who rely on the application for note taking and knowledge management. The Markdown editor improvements make writing smoother. OneNote import has become truly usable on all platforms. Embedded video support and time-based links open new use cases. The attachment management screen on mobile makes cleaning up space much easier.

The only notable drawback is the slow startup time, especially on Linux. If you can tolerate it, or keep the application always open, Joplin is worth trying.

## Quick Links

[https://joplinapp.org](https://joplinapp.org)

[https://joplinapp.org/download](https://joplinapp.org/download)

[https://github.com/laurent22/joplin](https://github.com/laurent22/joplin)

[https://flathub.org/apps/org.joplin.Joplin](https://flathub.org/apps/org.joplin.Joplin)

[https://forum.joplinapp.org](https://forum.joplinapp.org)
