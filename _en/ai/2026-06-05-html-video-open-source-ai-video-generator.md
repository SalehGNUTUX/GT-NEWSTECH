---
layout: post
title: >-
  html-video: Open Source Project That Turns Any Article or Link into
  Professional AI Video
category: ai
author: GNUTUX
excerpt: >-
  html-video is an open source project from the Open Design team that lets you
  turn any article, link, or GitHub repository into a professional
  ready-to-publish video. It works with AI agents like Claude Code, Cursor, and
  Codex, supports 21 ready-made templates, and generates background music using
  MiniMax.
image: html-video.png
tags:
  - html-video
  - AI
  - Video
  - Open Source
  - HyperFrames
  - Remotion
  - Open Design
also_in:
  - tech-news
date: 2026-06-05T20:19:00.000Z
lang: en
slug: html-video-open-source-ai-video-generator
---

## From "Readable Text" to "Watchable Video"

Imagine writing a long article, finding an interesting link, or discovering a promising GitHub project, and wanting to turn it into an engaging video to share on social media. The traditional process is complex. Writing a script, designing scenes, recording voiceover, editing, adding music, exporting. It takes hours if not days.

What if you could give this task to an AI agent and get a complete video within minutes? This is exactly what the open source **html-video** project offers.

🔗 **Official Repository:** [github.com/nexu-io/html-video](https://github.com/nexu-io/html-video)

## What Is html-video?

html-video is an open source project from the **Open Design** team, licensed under **Apache-2.0**, and is a complete system for converting text content into video. It works through AI agents that you interact with, such as Claude Code, Cursor, Codex, Gemini CLI, and others.

The idea is simple but its impact is large. Instead of learning complex editing tools, you talk to an AI agent in natural language. The agent reads the content, whether it is an article link, a GitHub repository, or just an idea, analyzes it, breaks it into sequenced scenes, turns each scene into animated HTML, and finally exports a finished MP4 video. All of this works **locally on your machine**, with no subscriptions, no limits, and no data sent to external servers.

## How It Works: From Link to Video

The process is organized into six steps that the agent can execute automatically based on your description.

### Step 1: Fetch the Source
When you give the agent a link, such as a web article or a GitHub project, html-video fetches the content from the server, supporting regular web pages and even WeChat articles. It converts the content into clean Markdown.

### Step 2: Agent Loop
The agent reads the source material, selects the appropriate template from the library, and decides how many scenes are needed based on content length.

### Step 3: Build the Content Graph
This is the intelligent stage. The agent converts the content into a knowledge graph with nodes representing key ideas and edges representing relationships such as sequence, contrast, and dependency to determine the order and timing of scenes.

### Step 4: Generate HTML for Each Scene
For each node in the graph, the agent creates an independent HTML file containing the design and animations for that scene using GSAP, CSS Animations, or other libraries.

### Step 5: Export via HyperFrames
This is the actual rendering engine. It uses a headless Chromium browser to record each HTML scene as a temporary video, then combines them all using FFmpeg.

### Step 6: Final Mixing
The clips are merged, background music and optional voiceover are added through MiniMax, and a single MP4 file is exported ready for publishing.

## Why This Project Matters

First, it opens the door for content creators to turn their writing into videos at scale. A blogger could turn their past twenty articles into twenty videos within a single day.

Second, it removes the technical barrier to video production. You do not need to learn After Effects, Premiere, or even DaVinci Resolve. You just write what you want, and the agent executes.

Third, it gives developers the ability to automate video production completely. html-video can be integrated into CI/CD pipelines or into web applications that need to generate dynamic videos based on user data.

## Templates: 21 Ready-Made Video Styles

The project comes with a library of 21 ready-to-use templates. The styles are designed for different purposes:

**frame-data-chart-nyt:** An animated line chart with New York Times-like design, perfect for displaying statistics and data with titles, data labels, and key points.

**frame-glitch-title:** A title card with a glitch effect and scan lines, suitable for cinematic introductions.

**frame-liquid-bg-hero:** A liquid aurora gradient background with a centered title, ideal for product promotions.

**frame-light-leak-cinema:** A cinema film effect with film grain and light leaks, suitable for emotional storytelling.

**vfx-text-cursor:** Typewriter text with a blinking terminal cursor, perfect for technical explanations.

**frame-logo-outro:** A clean closing card for brand logos.

Fifteen additional styles cover data charts, kinetic typography, decision explanations, and more. You can preview all of them directly in the local studio before choosing the appropriate one.

## Supported AI Agents (13)

html-video supports a wide range of AI agents, automatically detected from your `PATH`:

| Agent | Detection Command |
|-------|-------------------|
| **Open Design (Vela)** | `vela` |
| **Trae CLI** | `traecli` |
| **Claude Code** | `claude` |
| **Cursor Agent** | `cursor-agent` |
| **Codex CLI** | `codex` |
| **Gemini CLI** | `gemini` |
| **Grok Build** | `grok` |
| **Qwen Code** | `qwen` |
| **OpenCode** | `opencode` |
| **GitHub Copilot CLI** | `copilot` |
| **Aider** | `aider` |
| **Hermes** | `hermes` |
| **Anthropic Messages API** | (API key) |

You can switch between active agents from the top bar in the studio.

## HyperFrames: The Core Rendering Engine

Before html-video, there was HyperFrames from HeyGen. HyperFrames is an open source framework under Apache-2.0 that allows you to define a video as an HTML file with custom data attributes, then convert it to video using a Chromium browser and FFmpeg. html-video builds on top of HyperFrames and adds an intelligent agent layer that writes the HTML on your behalf.

The image below shows the difference between html-video and HyperFrames:

![html-video vs HyperFrames Comparison](https://opengraph.githubassets.com/1/nexu-io/html-video)

### HyperFrames Strengths:

Native to HTML: You do not need to learn React like in Remotion or custom languages. The video is a regular HTML file you can open in any browser.

Deterministic: The same input produces exactly the same output. This is important for automated pipelines.

Rich Effect Library: Supports GSAP, Lottie, Three.js, and CSS Animations through the Frame Adapter pattern.

Comparison with Remotion: HyperFrames and Remotion are similar in purpose, but Remotion's source is available under a custom license that requires a paid license for companies even with up to 4 developers, while HyperFrames is fully Apache-2.0.

## Installation and Quick Start

### Prerequisites:
- Node.js >= 22
- FFmpeg installed on your system

### Installation:

```bash
# Clone the repository
git clone https://github.com/nexu-io/html-video.git
cd html-video

# Install dependencies and build the project
pnpm install
pnpm -r build
```

### Run the Local Studio:

```bash
node packages/cli/dist/bin.js studio
```

This opens a web interface at `http://127.0.0.1:3071` where you can:

- Choose a template
- Write a video description or paste an article or GitHub project link
- Chat with the agent to refine the result
- Edit the text for each scene individually
- Add background music or voiceover through MiniMax
- Export the final video as MP4

### Helper Command-Line Tools:

```bash
# Check environment: detect installed agents and requirements
node packages/cli/dist/bin.js doctor

# Search for a suitable template for a specific purpose
node packages/cli/dist/bin.js search-templates --intent "github stars race" --top 3
```

## Practical Use Cases

### Create an Introductory Video for a GitHub Project

Give the agent a repository link. It will read the README, understand the project structure, and produce a video explaining what the project does and how to use it, with scenes for each major feature.

### Turn a Long Article into an Educational Video

Paste an article link, including supported WeChat articles. The agent will break the article into its introduction, sections, and conclusion, producing a video with multiple scenes and readable text.

### Generate a Video from a Simple Idea

Write "Promotional video for a music album product for an independent band, 30 seconds." The agent writes the script from scratch, designs the scenes, and adds appropriate music.

### Automate Social Media Video Production

html-video can be integrated with automation tools like n8n, which has a dedicated Video Api Hub node, to automatically create videos from spreadsheets or RSS feeds.

## Transparency and Alpha Channel Support

The HyperFrames engine supports exporting with an alpha channel for videos that need to be composited over other backgrounds:

WebM with VP9 and yuva420p offers true transparency support, suitable for browsers.

MOV ProRes 4444 with yuva444p10le offers 10-bit, suitable for editing software like Premiere and Final Cut Pro.

PNG sequence exports separate PNG frames with full transparency, suitable for After Effects.

This is not green screen or chroma key. When the background is transparent in the browser, it is transparent in the final video.

## How Does html-video Compare to Ralphy?

Ralphy is another open source project under Apache-2.0 that performs a similar task: creating videos through AI agents. However, Ralphy relies on OpenRouter for generation and ElevenLabs for audio, and is oriented toward fast production at roughly $8 to $12 per 30 seconds, with an approximate production time of 8 minutes.

html-video relies on HTML, GSAP, and HyperFrames for generation, and is oriented toward content creators who want full control over every frame. It also offers 21 ready-made templates and optional music generation tools. Ralphy focuses more on automation and low cost, while html-video focuses on visual quality and flexibility.

## Summary

html-video is not just a video generation tool. It is a shift in content creation philosophy from video editing to video description. If you are a blogger, teacher, marketer, developer wanting to automate social media content, or anyone who publishes content and is looking for a faster way to produce videos, html-video is worth trying.

The project is still in its early stages, but it promises to reshape how we think about video production. There is very promising news on the horizon. Remotion and Motion Canvas are on the map and under planning, meaning that content produced through html-video will become manually editable in the future in professional tools.

## Quick Links

[https://github.com/nexu-io/html-video](https://github.com/nexu-io/html-video)

[https://github.com/heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)

[https://hyperframes.heygen.com](https://hyperframes.heygen.com)
