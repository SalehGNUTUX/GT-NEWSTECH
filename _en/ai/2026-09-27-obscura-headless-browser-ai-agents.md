---
layout: post
title: 'Obscura: The Lightweight Stealth Browser Built Specifically for AI Agents'
category: ai
author: GNUTUX
excerpt: >-
  Obscura is an open source headless browser engine written in Rust, built
  specifically for AI agents and web scraping. It uses up to 85% less memory
  than Chrome, starts in under 50 milliseconds, and offers full support for CDP,
  Puppeteer, and Playwright.
image: obscura-browser-gnutux-en.jpg
tags:
  - Obscura
  - Headless Browser
  - AI Agents
  - Web Scraping
  - Rust
  - Open Source
  - Apache-2.0
also_in:
  - tech-news
date: 2026-09-27T08:43:00.000Z
lang: en
slug: obscura-headless-browser-ai-agents
---

## Chrome Is Not the Right Choice for Agents

When an AI agent wants to browse a website or scrape data from it, the default choice is Headless Chrome. But Chrome was not designed for this purpose. It was built as a human desktop browser, and running it in headless mode does not make it lightweight or ideal for automation. Every instance of Headless Chrome consumes over 200 megabytes of memory, takes around two seconds to start, and leaves clear digital fingerprints that make it easy for anti-bot systems to detect.

This gap is what the Obscura project fills.

🔗 **Official Repository:** [github.com/h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura)
🔗 **Official Website:** [obscura.sh](https://obscura.sh)

## What Is Obscura?

Obscura is a **headless browser engine written entirely in Rust from scratch**, not just a fork of Chromium. It was designed specifically for web scraping and AI agent automation. It runs real JavaScript through the V8 engine, supports the Chrome DevTools Protocol (CDP), and acts as a drop-in replacement for Headless Chrome with Puppeteer and Playwright.

The fundamental difference is that Obscura does not try to be a complete browser for human use. It provides only what an automated agent needs: loading pages, executing JavaScript, reading content, and interacting with elements. All the features a human needs, such as a graphical interface, extensions, media playback, and complex visual effects, have been stripped away in favor of performance and efficiency.

## The Technical Difference: Comparison with Headless Chrome

| Metric | Obscura | Headless Chrome | Difference |
|--------|---------|-----------------|------------|
| **Memory per instance** | ~30 MB | 200+ MB | **6-10x less** |
| **Binary size** | ~70 MB | 300+ MB | **4x smaller** |
| **Static page load** | 51 ms | ~500 ms | **10x faster** |
| **Dynamic page load** | 84 ms | ~800 ms | **9x faster** |
| **Startup time** | Instant (<50 ms) | ~2 s | **40x faster** |
| **Anti-detection** | Built-in (`--stealth`) | None | Unique feature |
| **Tracker blocking** | 3,520 domains | None | Unique feature |

These numbers are not just marketing figures. In a real test with 8 concurrent processes, Obscura achieved a throughput of 21 pages per second with a peak memory usage of 132 MB, while Headless Chrome achieved 2.8 pages per second with 7.1 GB of memory usage. This means a single 32 GB server can run **over 1,000 concurrent Obscura instances**, compared to only 160 Chrome instances.

## Key Features

### Built-in Stealth Mode
Unlike Headless Chrome, which leaves obvious fingerprints like `navigator.webdriver = true`, Obscura offers a stealth mode built directly into its engine:

- **Per-session fingerprint randomization:** Including GPU, screen, Canvas, audio, and battery.
- **Hidden `navigator.webdriver`:** It returns `undefined` directly from the engine, not through external plugins.
- **TLS signature spoofing:** Mimics the TLS fingerprint of a real Chrome browser.
- **`event.isTrusted = true`:** For script-dispatched events.
- **Hidden internal properties:** `Object.keys(window)` is safe.
- **3,520 tracker domains blocked:** Complete blocking of analytics, ads, and fingerprinting scripts.

### Full CDP, Puppeteer, and Playwright Support
Obscura speaks the Chrome DevTools Protocol fully, meaning any existing code you have using Puppeteer or Playwright can be pointed at Obscura **without any changes**. Just replace the connection endpoint with Obscura's WebSocket:

```python
from playwright.sync_api import sync_playwright

CDP = "ws://127.0.0.1:9222"
with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(CDP)
    page = browser.new_page()
    page.goto("https://example.com")
    data = page.inner_text("body")
```

### Powerful Command-Line Tools
Obscura provides a complete command-line interface (CLI) for fast extraction operations:

```bash
# Get the page title
obscura fetch https://example.com --eval "document.title"

# Extract all links
obscura fetch https://example.com --dump links

# Convert the page to Markdown
obscura fetch https://example.com --dump markdown

# Capture a screenshot
obscura fetch https://example.com --screenshot page.png

# Parallel scraping of multiple URLs
obscura scrape url1 url2 url3 --concurrency 25 --format json
```

### MCP Service for Agents
Obscura ships with a built-in MCP (Model Context Protocol) server that AI agents like Claude Desktop and Cursor can connect to directly, giving them ready-made tools for browsing and interacting with pages.

### Built-in SSRF Protection
Obscura blocks access to private IP addresses and local networks by default, protecting infrastructure from SSRF attacks. This block can be disabled via `--allow-private-network` for local application development.

## Installation and Getting Started

### Direct Download
```bash
# Linux x86_64
curl -LO https://github.com/h4ckf0r0day/obscura/releases/latest/download/obscura-x86_64-linux.tar.gz
tar xzf obscura-x86_64-linux.tar.gz
./obscura fetch https://example.com --eval "document.title"
```

### Via Docker
```bash
docker run -d --name obscura -p 127.0.0.1:9222:9222 \
  -e OBSCURA_CDP_TOKEN="$(openssl rand -hex 32)" \
  h4ckf0r0day/obscura
```

### System Requirements
- Linux x86_64 / ARM64, macOS Apple Silicon / Intel, or Windows.
- No Node.js, Chrome, or any external dependencies required.

## Who Is This Project For?

**For AI agents:** If you are building an agent that needs to browse the web automatically, Obscura gives it a lightweight browser that can be run in large numbers on a single server.

**For web scraping engineers:** Obscura offers a faster, cheaper, and stealthier alternative to Headless Chrome, with full support for the tools you already know.

**For developers on mobile devices:** If you run Obscura on a laptop, the low memory usage leaves more room for language models and other processes.

## Current Limitations

- **The rendering engine is not complete:** Obscura implements only a subset of CSS specifications. Very complex pages may not render as accurately as in Chromium.
- **PDF output is raster-based:** Text in PDFs is not selectable.
- **Screencast is activity-driven:** Not a fixed-rate video.
- **Infrastructure management is up to you:** There is no managed cloud version yet (Obscura Cloud is on the waitlist).

## Summary

Obscura is not just another Headless Chrome alternative. It is a complete rethinking of what a "browser" means for an AI agent. By stripping away everything the agent does not need, providing built-in stealth at the engine level, and achieving memory and startup efficiency that outperforms Chrome by orders of magnitude, Obscura offers a practical solution to the biggest problem in web automation: current tools were not designed for this task.

If you are building an agent that needs to browse the web, running large-scale scraping operations, or looking for a lighter alternative to Headless Chrome, Obscura is worth a serious look.

## Quick Links

[https://github.com/h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura)

[https://obscura.sh](https://obscura.sh)

[https://hub.docker.com/r/h4ckf0r0day/obscura](https://hub.docker.com/r/h4ckf0r0day/obscura)

[https://github.com/h4ckf0r0day/obscura-benchmark](https://github.com/h4ckf0r0day/obscura-benchmark)
