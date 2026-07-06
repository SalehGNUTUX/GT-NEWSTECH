---
layout: post
title: >-
  Repowise: Solving the Token Consumption Problem in Coding Agents with Smart
  Repository Indexing
category: ai
author: GNUTUX
excerpt: >-
  Repowise is an open source project (AGPL-3.0) that solves the problem of
  repeated repository exploration that consumes the budgets of coding agents. By
  indexing the repository once and providing multiple intelligence layers via
  the MCP protocol, it reduces token consumption by up to 96% while maintaining
  answer quality.
image: 'https://opengraph.githubassets.com/1/repowise-dev/repowise'
tags:
  - Repowise
  - MCP
  - Coding Agent
  - Tokens
  - Efficiency
  - AI
  - AGPL
also_in:
  - foss
date: 2026-07-06T20:14:00.000Z
lang: en
slug: repowise-mcp-codebase-intelligence
---

## The Problem of Repeated Exploration in Coding Agents

Coding agents such as Claude Code and Codex have become essential tools in software development, but they face a fundamental problem: token consumption. Most of the agent's budget goes toward repeatedly exploring the repository: searching for symbols using commands like `grep`, reading files, and re-reading them as the conversation context grows. This repeated exploration wastes time and burns tokens, especially in large projects.

The **repowise** project comes to solve this problem by performing this exploration once, offline, and then providing the coding agent with formatted and refined answers via the Model Context Protocol (MCP).

🔗 **Official Repository:** [github.com/repowise-dev/repowise](https://github.com/repowise-dev/repowise)
🔗 **Official Website:** [repowise.dev](https://repowise.dev)

## What Is Repowise?

Repowise is an open source project (licensed under AGPL-3.0) that provides a **Codebase Intelligence Layer** for coding agents. It indexes your codebase once and builds five integrated intelligence layers from it:

1. **Graph Layer:** A tree-sitter dependency graph across 15 programming languages, tracking connections between files and symbols at multiple levels .
2. **Git Layer:** Analysis of repository history, hotspots, ownership, co-change pairs, and bus factor .
3. **Docs Layer:** AI-generated documentation (wiki) for each module/file, automatically updated with each commit, with a hybrid search system (FTS + Vector) .
4. **Decisions Layer:** Extraction of architectural decisions from 8 different sources, linked to graph nodes, with tracking of decision history and relationships (replacement, improvement, conflict).
5. **Code Health Layer:** The most distinctive feature with no equivalent in other tools . It evaluates every file in the codebase using three main indicators: **Defect Risk**, **Maintainability**, and **Performance**, using 25 deterministic markers, without any AI model calls, and in under 30 seconds on a repository with 3000 files .

## Token Savings: Actual Results

According to the project, repowise achieves massive savings in token consumption. In SWE-QA tests on real repositories (same model, same test environment), the results showed:

- **Up to 96% reduction in tokens used to load context** .
- **Up to 89% reduction in file reads** .
- **Up to 70% reduction in tool calls** .
- **Answer quality equivalent to the traditional method** (savings do not come at the expense of quality).

> "Most of a coding agent's spend goes to **exploration**: grepping for symbols, reading candidate files, re-reading them as context grows. repowise does that work once so the agent skips it on every query." - From the project documentation.

### Benchmark Details

In a benchmark on the `pallets/flask` repository (48 tasks, Claude Sonnet 4.6), repowise-augmented Claude Code matched baseline answer quality while being significantly more efficient :

| Metric | Baseline | + Repowise | Change |
|--------|----------|------------|--------|
| 💰 Cost | $0.1396 | $0.0890 | **-36%** |
| ⚡ Wall time | 41.7s | 33.9s | **-19%** |
| 🛠️ Tool calls | 7.4 | 3.8 | **-49%** |
| 📄 Files read | 1.9 | 0.2 | **-89%** |

### Token Efficiency

To understand a commit, repowise reduces tokens dramatically :

| Strategy | Tokens / commit |
|----------|-----------------|
| Naive (full contents of changed files) | 64,039 |
| `git diff` only | 14,888 |
| **repowise `get_context`** | **2,391** |

This represents ~27x more efficiency than the naive approach, with a best-case improvement of 1,214x .

## How It Works: One-Time Indexing and Continuous Service

1. **Installation:** Simple via pip:
   ```bash
   pip install repowise
   ```

2. **Indexing:** After installing repowise, navigate to your project folder and run:
   ```bash
   repowise init
   ```
   This builds all five intelligence layers. The first time may take about 25 minutes (for a large project), but it is done only once. After that, repowise stays automatically synchronized with each new commit.

3. **Serving:** After indexing is complete, start the MCP server :
   ```bash
   repowise serve
   ```
   This server provides 10 tools (MCP Tools) that any MCP-compatible coding agent (such as Claude Code) can call to query the codebase directly, without needing to read or search files manually .

## The MCP Tools

The server provides task-oriented tools that give structured access to the codebase intelligence :

| Tool | Purpose |
|------|---------|
| `get_overview` | Architecture summary for unfamiliar codebases |
| `get_answer` | One-call RAG Q&A over the codebase |
| `get_context` | Rich context for targets before reading or modifying code |
| `get_symbol` | Raw source bytes for one symbol (cheaper than `Read + offset math`) |
| `search_codebase` | Hybrid symbol/path/concept search |
| `get_risk` | Modification risk before changing hotspot files |
| `get_why` | Architectural decisions before structural changes |
| `get_dead_code` | Unreachable code for cleanup tasks |
| `get_health` | Code-health marker scores before refactoring |

The tool surface is configurable via `mcp.tools` in `.repowise/config.yaml` or through CLI options like `--tools "+get_execution_flows"` . A curated `core` profile advertises only the 4 tools the agent actually uses (`get_answer`, `get_context`, `get_symbol`, `search_codebase`), further reducing per-call overhead .

## Integration with AI Agents

Repowise supports all major MCP-compatible agents :

- **Claude Code:** `repowise init` automatically registers the MCP server and installs proactive hooks .
- **Codex:** `repowise init --codex` writes project-local Codex MCP config and hooks .
- **Cursor, Cline, Windsurf:** Works via the standard MCP server .

## Why This Project Matters

Repowise is not just a tool for saving tokens. It is a **shift in how coding agents interact with codebases**. Instead of the agent reading files and searching them manually, repowise provides a complete mental map of the project, with ready answers to questions like "why does authentication work this way?" rather than just "here is what auth.ts contains."

With a **Code Health evaluation system** that outperforms leading commercial tools like CodeScene in key metrics (2.3x more efficient at finding defects under a fixed review budget) , and a **smart refactoring plan** directly linked to the project graph, repowise becomes a powerful tool not only for developers, but for project managers and quality teams as well.

### Code Health Validation

The health scores are validated against real bug history :

- Across **21 open-source repositories, 9 languages, and 2,826 files**, the cross-project mean ROC AUC is **0.737** (95% CI 0.683 to 0.787).
- It survives controlling for file size (partial Spearman -0.156), so it is not merely flagging large files.
- In a head-to-head comparison with CodeScene on 2,770 files: repowise wins significantly on recall, effort-aware ranking, and defect density .

## Summary

If you use coding agents in large projects, the token cost and time wasted on repeated exploration represent a real challenge. Repowise offers a practical and effective solution: **smart indexing, multiple analysis layers, and token savings of up to 96%**. The project is open source and available to everyone, having already gained over 1.3k stars on GitHub, reflecting the community's interest in it.

## Quick Links

[https://github.com/repowise-dev/repowise](https://github.com/repowise-dev/repowise)

[https://repowise.dev](https://repowise.dev)

[https://github.com/repowise-dev/repowise-bench](https://github.com/repowise-dev/repowise-bench)

Published in the Artificial Intelligence section – Software Development Tools
