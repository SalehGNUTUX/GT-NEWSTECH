---
layout: post
title: >-
  Internet Monitor: Open Source Tool That Tracks Your Connection 24/7 and Logs
  Every Outage
category: foss
author: GNUTUX
excerpt: >-
  Internet Monitor is a free and open source application that runs silently in
  the background, monitors your internet connection with three simultaneous
  checks (TCP Ping, HTTP, and DNS), and provides a live dashboard, instant
  notifications, and structured logs you can export to present to your ISP.
image: internet-monitor-dashboard-ar.png
tags:
  - Internet Monitor
  - Network Monitoring
  - Internet Speed
  - Open Source
  - Go
  - Tools
date: 2026-05-17T09:35:00.000Z
lang: en
slug: internet-monitor-tool
---

## The Problem of Internet Outages Without Evidence

How many times have you felt that your internet connection is dropping or slowing down for short periods, but you cannot prove it? Your internet service provider asks you to document timings, durations, and causes, but you only have an uncertain feeling that something is wrong.

This gap is exactly what Internet Monitor addresses.

🔗 **Official Website:** [github.com/FutureSolutionDev/internet-monitor](https://github.com/FutureSolutionDev/internet-monitor)

## What Is Internet Monitor?

Internet Monitor is a free and open source application, developed by FutureSolutionDev in Go, that runs in the background of your operating system and monitors your internet connection around the clock. It uses three simultaneous checking mechanisms: TCP Ping, HTTP, and DNS. When any connection issue occurs, the application logs the event with timestamp, duration, and cause, displays an immediate notification, and sends an alert to Discord or Slack if you configure it to do so.

The current version is v0.8.1, released on May 12, 2026.

## Who Benefits From This Tool?

Three main categories of users benefit from this application.

The regular user who suffers from frequent internet disconnections and has no way to prove them to the service provider. The application gives them a detailed log with timings, durations, and packet loss percentages.

The technical support team in companies or internet service providers who need clear data to diagnose problems. They can export logs in CSV or JSONL format and present them to the relevant parties.

The developer who wants to integrate connection monitoring into their own systems via webhooks, as the application sends structured data for every event.

## How It Works

The application performs three simultaneous checks at the same time.

The TCP Ping check attempts to connect to specific servers such as 8.8.8.8:53. This verifies that data packets reach their destination at the transport level.

The HTTP check sends a request to a URL that returns a 200 or 204 response. This verifies that web services are functioning correctly.

The DNS check attempts to resolve domain names such as google.com. This verifies that the domain name resolution service is working.

All these targets can be configured through the settings file. The application considers the connection disconnected only after a specified number of consecutive failures (three attempts by default), to avoid false notifications from transient fluctuations.

When a genuine disconnection occurs, the application logs the packet loss percentage, the average latency, and the total duration of the outage. All this data is saved in separate daily JSONL files for connectivity and speed test results.

## The Live Dashboard

The application provides a dashboard accessible through a web browser on port 8765. It contains:

A live latency chart that updates automatically every five seconds.

Instant statistics about the current connection status and the number of recorded outages.

A chronological event log.

A table of recent checks with results for each layer (TCP, HTTP, DNS).

A button to run a download speed test directly.

The ability to export connectivity logs and speed test history to CSV files.

Settings organized into four tabs: Monitoring, Targets, Notifications, and Speed Test.

The interface is fully bilingual: Arabic and English, with complete right-to-left layout support.

## The Built-in Speed Test

The application contains an adaptive download speed test. It starts with small payloads and increases chunk size gradually over the specified duration (10 seconds by default). It uses multiple parallel connections (four by default) to saturate modern high-speed links. It relies on Cloudflare speed endpoint by default and does not require an account.

Speed test results are saved in a separate file from the connection log, and can be viewed and exported from the dashboard. You can also configure an alert when the speed drops below a certain threshold.

## Instant Notifications

When the connection status changes (connected, degraded, disconnected), the application performs several actions:

It displays a native Windows Toast notification.

It sends a formatted webhook to Discord or Slack containing details of each layer, packet loss percentage, and duration.

It plays a custom alert sound.

You can leave the webhook URL empty to disable remote notifications entirely.

## Privacy and Security

The application does not send any data to external servers unless you configure a webhook yourself. Speed tests send requests only to the endpoint you specify (Cloudflare by default). The payloads contain no device identifiers. Everything runs locally.

The application is fully open source under the MIT license. You can review the source code yourself, or build the application from source if you do not trust the pre-built binaries.

## Installation and Running

For Windows 10 or 11, download the file internet-monitor-windows.exe from the releases page. Run it once, an icon will appear in the system tray. Right-click it and select Open Dashboard. Your browser will open automatically to localhost:8765.

To make it run automatically when Windows starts, run the following command in an administrator command prompt:

scripts\install.cmd

For macOS on M1, M2, or M3 processors, download the file internet-monitor-macos-arm64, make it executable with chmod +x, then run it.

For Linux on Ubuntu or Debian, download the file internet-monitor-linux, make it executable, then run it.

In all cases, the dashboard is available at localhost:8765.

## Building From Source

If you prefer to build the application yourself, you need Go 1.21 or later. For the system tray version (without a graphical window), you do not need any additional requirements:

git clone https://github.com/FutureSolutionDev/internet-monitor.git
cd internet-monitor
go mod tidy
CGO_ENABLED=0 go build -ldflags="-H=windowsgui -s -w" -o internet-monitor.exe .

For the standalone window version, you need GCC. On Windows, the scripts handle the installation automatically. On macOS or Linux, GCC is typically pre-installed.

## Log Format

The connectivity log connectivity_YYYY-MM-DD.jsonl contains one JSON line per event:

{
  "timestamp": "2026-05-11T14:30:00Z",
  "event": "disconnected",
  "duration_seconds": 45.2,
  "reason": {
    "tcp_ping_failed": true,
    "http_failed": true,
    "dns_failed": false,
    "packet_loss_pct": 80.0,
    "avg_latency_ms": 0
  }
}

The speed test log speedtest_YYYY-MM-DD.jsonl contains:

{
  "timestamp": "2026-05-11T14:35:00Z",
  "event": "speed_test",
  "download_mbps": 94.3,
  "latency_ms": 12,
  "duration_seconds": 9.8,
  "parallel_connections": 4,
  "triggered_by": "user"
}

## Discord Webhook Format

When a disconnection occurs, the application sends a formatted message like this:

{
  "username": "Internet Monitor",
  "embeds": [{
    "title": "❌ Internet Disconnected",
    "color": 16007988,
    "fields": [
      {"name": "🔌 TCP Ping", "value": "❌ Failed", "inline": true},
      {"name": "🌐 HTTP", "value": "❌ Failed", "inline": true},
      {"name": "🔍 DNS", "value": "✅ OK", "inline": true},
      {"name": "📉 Packet Loss", "value": "85.0%", "inline": true},
      {"name": "⏱️ Duration", "value": "2m 15s", "inline": true}
    ],
    "timestamp": "2026-05-11T14:30:00Z"
  }]
}

When a speed test completes:

{
  "username": "Internet Monitor",
  "embeds": [{
    "title": "🚀 Speed Test Completed",
    "color": 2278718,
    "fields": [
      {"name": "📥 Download", "value": "94.3 Mbps", "inline": true},
      {"name": "⏱️ Duration", "value": "10.0s", "inline": true},
      {"name": "📡 Latency", "value": "12ms", "inline": true}
    ]
  }]
}

## Future Roadmap

According to the repository, planned features include:

Upload speed measurement in version 2.

Telegram webhook support.

Scheduled automatic speed tests.

Mobile-responsive dashboard improvements.

Windows ARM64 build.

Per-ISP analytics and weekly reports.

PDF report export for ISP complaints.

## Contributing to the Project

The project welcomes contributions in several areas: bug fixes, new features, improving the Arabic translation or adding other languages, and code documentation.

Commit messages follow the Conventional Commits specification: feat: for minor releases, fix: for patch releases, and BREAKING CHANGE for major releases.

## Quick Comparison With Other Tools

PingPlotter is a commercial tool that offers advanced graphs, but it is not open source and does not provide fully structured outage logs.

SmokePing is open source but requires a web server and Perl installation, and only runs on Linux.

Internet Monitor stands out as a standalone application that runs on Windows, macOS, and Linux, with a modern graphical user interface, instant notifications, a browser-based dashboard, and formatted logs ready to present to your service provider.

## Summary

If you suffer from frequent internet disconnections and your service provider asks for evidence, or if you are a system administrator wanting to monitor connection stability in your office or home, or if you are a developer wanting a simple and customizable monitoring tool, then Internet Monitor is the right solution.

The application is free, open source, respects your privacy, and runs silently in the background without consuming significant resources. Try it today, and the next time your service provider calls to say the problem is on your end, send them the log.

## Quick Links

GitHub Repository: github.com/FutureSolutionDev/internet-monitor
Releases Page: github.com/FutureSolutionDev/internet-monitor/releases
Example Configuration File: github.com/FutureSolutionDev/internet-monitor/blob/master/config.json.example
Webhook Documentation: github.com/FutureSolutionDev/internet-monitor#webhooks
