---
layout: post
title: How AI Developers Are Saving Millions with the 'Caveman' Approach
category: ai
author: GNUTUX
excerpt: >-
  Major tech companies and developers are using the Caveman plugin to reduce the
  cost of running AI models like Claude Code and Codex, forcing them to respond
  in a terse style that cuts token consumption by up to 75%.
image: caveman-gnutux.jpg
tags:
  - Caveman
  - AI
  - Cost
  - Tokens
  - Codex
  - Claude Code
  - Gemini
  - Engineer
also_in:
  - tech-news
date: 2026-07-01T18:52:00.000Z
lang: en
slug: caveman-prompt-ai-cost-reduction
---

## The Problem of AI Model Usage Costs

With the increasing use of AI models such as Claude Code, Codex, and Gemini, cost has become a major obstacle for developers and companies. These models are priced based on the number of tokens consumed, and every extra word or symbol in the response means higher costs [citation:4][citation:5]. Long, polite responses containing pleasantries, apologies, and lengthy explanations significantly inflate usage bills.

## The Solution: Caveman Plugin

A new plugin called **Caveman** emerged to solve this problem by changing the models' response style. The plugin removes pleasantries, apologies, and lengthy explanations, keeping only the essential and concise information [citation:5].

Instead of an AI responding with:
> "You're right, there's a bug in the code, I apologize for not noticing it earlier, and I have now fixed it."

The response becomes simply:
> "Bug exist. Bug fix. Code good."

This approach, resembling "caveman" communication, focuses on conveying meaning with the fewest possible words [citation:1][citation:2].

## Cost Savings

According to initial tests, this approach reduces token consumption by **65% to 75%** [citation:1][citation:3][citation:5]. This significant saving translates directly to a sharp drop in model operating costs, especially in development environments that rely heavily on frequent and numerous queries.

For example, if using a particular model costs $10 per million tokens, reducing consumption by 70% means the same task would cost only $3. On the scale of large companies using these models daily, this can save millions annually.

## Caveman Usage in Major Companies

Reports indicate that the Caveman plugin is already being used inside major tech companies such as **OpenAI**, **NVIDIA**, and **GitHub** [citation:5][citation:7]. **Shayne Sweeney**, Director of Engineering at OpenAI, has contributed to its development by adding support for **Codex**, demonstrating the organization's confidence in this technology and its effectiveness [citation:4][citation:5].

Uber reportedly burned through its entire annual AI budget in four months, and companies like Walmart have introduced usage caps. An internal memo from electrical and digital infrastructure giant Legrand explicitly lists "use 'caveman skill' to reduce output consumption" as one of four high-impact practices to control costs [citation:5].

## How Caveman Works

The plugin works by either modifying the prompt sent to the model or by processing the received response. It adds clear instructions for the model to respond in a direct and concise style, avoiding any unnecessary words, reminding the model to focus only on the essence [citation:3].

Key features include [citation:1][citation:2][citation:3]:

| Skill | What It Does |
|-------|---------------|
| `/caveman [lite\|full\|ultra\|wenyan]` | Compresses every reply. Levels stick until session end. |
| `/caveman-commit` | Generates Conventional Commit messages with ≤50 character subject. |
| `/caveman-review` | Produces one-line PR comments. |
| `/caveman-stats` | Shows real session token usage + lifetime savings + USD. |
| `/caveman-compress <file>` | Rewrites memory files into caveman-speak, cutting ~46% input tokens every session. |

The plugin offers multiple levels of "grunt": **Lite** (drop filler), **Full** (default caveman), **Ultra** (telegraphic), or **Wenyan** (classical Chinese, even shorter) [citation:1][citation:3]. It also preserves technical accuracy, compressing only surrounding language while keeping code, commands, URLs, paths, and numbers intact [citation:5].

## Benchmarks

Real token counts from the Claude API confirm the effectiveness [citation:1][citation:3]:

| Task | Normal | Caveman | Saved |
|------|--------|---------|-------|
| Explain React re-render bug | 1180 | 159 | 87% |
| Fix auth middleware token expiry | 704 | 121 | 83% |
| Set up PostgreSQL connection pool | 2347 | 380 | 84% |
| Explain git rebase vs merge | 702 | 292 | 58% |
| Refactor callback to async/await | 387 | 301 | 22% |
| Architecture: microservices vs monolith | 446 | 310 | 30% |
| Review PR for security issues | 678 | 398 | 41% |
| Docker multi-stage build | 1042 | 290 | 72% |
| Debug PostgreSQL race condition | 1200 | 232 | 81% |
| Implement React error boundary | 3454 | 456 | 87% |
| **Average** | **1214** | **294** | **65%** |

A separate test by 404 Media with Claude Code logged a 5,800-token, 65% saving on one session [citation:5]. Elastic Labs independently measured 63.6% average reduction across eight Elasticsearch scenarios with zero accuracy loss [citation:4].

## Other Cost-Saving Considerations

Critics rightly point out that output tokens are often the smaller cost driver. Long input contexts, bloated prompt histories, and agent loops burning tokens in the background do more damage. Structural fixes matter more [citation:4][citation:12]:

- Prompt pruning
- RAG (injecting only relevant data instead of entire databases)
- Small-model routing for intake tasks
- Token caching at roughly 10% of standard input price

However, Caveman remains a useful, cheap intervention worth trying first before downgrading to a smaller model. Prompt engineering is now partly a budget tool, not just a quality tool [citation:9].

## Conclusion

The Caveman plugin represents a shift in how developers handle AI costs. Instead of treating pleasantries and apologies as part of the response, developers and companies can rely on the "caveman" approach to save time and money, making AI more efficient and cost-effective. As the use of AI models continues to rise, these tools are expected to become a core part of any developer's toolkit.

## Quick Links

[https://github.com/juliusbrussee/caveman](https://github.com/juliusbrussee/caveman)

[https://www.404media.co/companies-are-making-claude-and-codex-talk-like-cavemen-to-stop-ais-soaring-costs/](https://www.404media.co/companies-are-making-claude-and-codex-talk-like-cavemen-to-stop-ais-soaring-costs/)

Published in the Artificial Intelligence section – Tools and Cost Optimization
