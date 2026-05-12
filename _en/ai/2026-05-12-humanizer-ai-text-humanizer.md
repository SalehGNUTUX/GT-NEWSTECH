---
layout: post
title: 'Humanizer: Open Source Tool That Makes AI Writing Sound Human'
slug: humanizer-ai-text-humanizer
lang: en
category: ai
date: 2026-05-12T11:08:00.000Z
author: GNUTUX
excerpt: >-
  Humanizer is a skill for Claude Code and OpenCode that removes signs of
  AI-generated writing from text, based on Wikipedia's comprehensive guide to
  signs of AI writing.
image: humanizer-en.png
tags:
  - Humanizer
  - AI
  - Writing
  - LLM
  - Tools
  - Claude Code
  - OpenCode
also_in:
  - foss
---

## The Problem with AI Writing: Telltale Signs

If you've read enough LLM-generated text, you start to notice a **familiar pattern**:

- Words like "testament," "pivotal moment," "evolving landscape"
- Phrases like "It's not just X, it's Y"
- The rule of three (three items in a list)
- Overuse of em dashes and bold text
- Faux-helpful phrases like "I hope this helps!"

**Humanizer** comes to solve this problem, transforming AI-generated text into something that reads as if written by a real human.

🔗 **Official Repository:** [github.com/blader/humanizer](https://github.com/blader/humanizer)

---

## What is Humanizer?

Humanizer is a **skill** for both **Claude Code** and **OpenCode** that removes signs of AI-generated writing from text.

It's based on **Wikipedia's "Signs of AI writing" guide**, maintained by **WikiProject AI Cleanup**. This comprehensive guide comes from observations of thousands of instances of AI-generated text.

> "LLMs use statistical algorithms to guess what should come next. The result tends toward the most statistically likely result that applies to the widest variety of cases." – Wikipedia source

---

## How Humanizer Works

### Three-Step Process

| Step | Description |
|------|-------------|
| **1. Text Analysis** | Applies 29 different patterns to detect AI writing signs |
| **2. Rewriting** | Rewrites the text while avoiding every detected pattern |
| **3. Final Audit** | Performs an "obviously AI generated" audit and second rewrite pass if needed |

### Voice Calibration

To match your **personal writing style**, you can provide Humanizer with a sample of your own writing:

```
/humanizer

Here's a sample of my writing for voice matching:
[paste 2-3 paragraphs of your own writing]

Now humanize this text:
[paste AI-generated text to humanize]
```

The skill will analyze your sentence rhythm, word choices, and quirks, then apply them to the rewrite instead of producing generic "clean" output.

---

## The 29 Detection Patterns

Humanizer implements **29 different detection patterns**, organized into categories:

### 📝 Content Patterns (5 patterns)

| # | Pattern | "Before" Example | "After" Example |
|---|---------|------------------|-----------------|
| 1 | **Significance inflation** | "marking a pivotal moment in the evolution of..." | "was established in 1989 to collect regional statistics" |
| 2 | **Notability name-dropping** | "cited in NYT, BBC, FT..." | Remove or be specific |
| 3 | **Superficial -ing analyses** | "symbolizing... reflecting... showcasing..." | Remove or expand with actual sources |
| 4 | **Promotional language** | "nestled within the breathtaking region" | "is a town in the Gonder region" |
| 5 | **Vague attributions** | "Experts believe it plays a crucial role" | "according to a 2019 survey by..." |

### 🗣️ Language Patterns (7 patterns)

| # | Pattern | "Before" Example | "After" Example |
|---|---------|------------------|-----------------|
| 7 | **AI vocabulary** | "Actually... additionally... testament... landscape... showcasing" | "also... remain common" |
| 8 | **Copula avoidance** | "serves as... features... boasts" | "is... has" |
| 9 | **Negative parallelisms / tailing negations** | "It's not just X, it's Y" | State the point directly |
| 10 | **Rule of three** | "innovation, inspiration, and insights" | Use natural number of items |
| 11 | **Synonym cycling** | "protagonist... main character... central figure... hero" | Repeat the clearest term |
| 12 | **False ranges** | "from the Big Bang to dark matter" | List topics directly |
| 13 | **Passive voice / subjectless fragments** | "No configuration file needed" | Name the actor when helpful |

### ✍️ Style Patterns (7 patterns)

| # | Pattern | "Before" Example | "After" Example |
|---|---------|------------------|-----------------|
| 14 | **Em dash overuse** | "institutions—not the people—yet this continues—" | Prefer commas or periods |
| 15 | **Boldface overuse** | "**OKRs**, **KPIs**, **BMC**" | Remove boldface |
| 16 | **Inline-header lists** | "**Performance:** Performance improved" | Convert to prose |
| 17 | **Title Case Headings** | "Strategic Negotiations And Partnerships" | "Strategic negotiations and partnerships" (sentence case) |
| 18 | **Emojis** | "🚀 Launch Phase: 💡 Key Insight:" | Remove emojis |
| 19 | **Curly quotes** | `said “the project”` | `said "the project"` (straight quotes) |
| 26 | **Hyphenated word pairs** | "cross-functional, data-driven, client-facing" | Drop hyphens on common pairs |

### 💬 Communication Patterns (3 patterns)

| # | Pattern | "Before" Example | "After" Example |
|---|---------|------------------|-----------------|
| 20 | **Chatbot artifacts** | "I hope this helps! Let me know if..." | Remove entirely |
| 21 | **Cutoff disclaimers** | "While details are limited in available sources..." | Find sources or remove |
| 22 | **Sycophantic tone** | "Great question! You're absolutely right!" | Respond directly |

### ✂️ Filler and Hedging Patterns (3 patterns)

| # | Pattern | "Before" Example | "After" Example |
|---|---------|------------------|-----------------|
| 23 | **Filler phrases** | "In order to", "Due to the fact that" | "To", "Because" |
| 24 | **Excessive hedging** | "could potentially possibly" | "may" |
| 25 | **Generic conclusions** | "The future looks bright" | Specific plans or facts |

---

## Full Example: AI Text → Human Text

### Before (AI-sounding)

> Great question! Here is an essay on this topic. I hope this helps!
>
> AI-assisted coding serves as an enduring testament to the transformative potential of large language models, marking a pivotal moment in the evolution of software development. In today's rapidly evolving technological landscape, these groundbreaking tools—nestled at the intersection of research and practice—are reshaping how engineers ideate, iterate, and deliver, underscoring their vital role in modern workflows.
>
> At its core, the value proposition is clear: streamlining processes, enhancing collaboration, and fostering alignment. It's not just about autocomplete; it's about unlocking creativity at scale. The tool serves as a catalyst. The assistant functions as a partner. The system stands as a foundation for innovation.
>
>   * 💡 **Speed:** Code generation is significantly faster.
>   * 🚀 **Quality:** Output quality has been enhanced.
>   * ✅ **Adoption:** Usage continues to grow.

### After (Humanized)

> AI coding assistants can speed up the boring parts of the job. They're great at boilerplate: config files and the little glue code you don't want to write. They can also help you sketch a test, but you still have to read it.
>
> The dangerous part is how confident the suggestions look. I've accepted code that compiled and passed lint, then discovered later it missed the point because I stopped paying attention.
>
> If you treat it like autocomplete and review every line, it's useful. If you use it to avoid thinking, it will help you ship bugs faster.

---

## Installation

### Claude Code
```bash
mkdir -p ~/.claude/skills
git clone https://github.com/blader/humanizer.git ~/.claude/skills/humanizer
```

### OpenCode
```bash
mkdir -p ~/.config/opencode/skills
git clone https://github.com/blader/humanizer.git ~/.config/opencode/skills/humanizer
```

> **Note:** OpenCode also scans `~/.claude/skills/` for compatibility, so a single clone into `~/.claude/skills/humanizer/` works for both tools.

---

## Usage

### Direct Command
```
/humanizer

[paste your text here]
```

### Natural Language Request
```
Please humanize this text: [your text]
```

### Voice Calibration (For Personal Style)
```
/humanizer

Here's a sample of my writing for voice matching:
[paste 2-3 paragraphs of your own writing]

Now humanize this text:
[paste AI-generated text to humanize]
```

---

## Why This Matters

### 📝 Improving Content Quality
Many blogs, websites, and academic papers are flooded with AI-generated text that **reads as fake**. Humanizer brings humanity back to writing.

### 🎓 Education and Academia
Instead of banning AI entirely, students can be taught how to **polish and edit** outputs to become authentic and readable.

### 🤝 Building Trust
Text that reads as human builds **greater trust** with readers. Humans prefer reading from humans (not robots).

### 🔓 Open Source and Free
**18.3k stars** on GitHub (and growing) – a massive community that believes in the humanization of AI writing. Everyone can use, modify, and improve Humanizer for free.

---

## Credits and Sources

- **Primary Source:** [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
- **Maintaining Organization:** [WikiProject AI Cleanup](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup)

Humanizer is based on thousands of hours of human observation about how real humans actually write – and that's what makes it different from any other "rewriting" tool.

---

## Version History

| Version | New Features |
|---------|--------------|
| **2.5.1** | Added passive voice/subjectless fragments rule (reached 29 patterns) |
| **2.5.0** | Added patterns for persuasive framing, signposting, and fragmented headers |
| **2.4.0** | Added voice calibration (match user's personal writing style from samples) |
| **2.3.0** | Added pattern #25: hyphenated word pair overuse |
| **2.2.0** | Added final "obviously AI generated" audit + second-pass rewrite prompts |
| **2.1.0** | Added before/after examples for all 24 patterns |
| **2.0.0** | Complete rewrite based on raw Wikipedia article content |
| **1.0.0** | Initial release |

---

## Summary

**Humanizer isn't just another "rewriting" tool. It's a roadmap for transforming cold, clichéd, instantly-recognizable-as-AI writing into text that reads like it came from a real human mind – because it's based exactly on what humans do differently.**

If you're a writer, teacher, marketer, or developer using AI to generate text, this skill is essential for you.

**Install Humanizer today, and make your AI writing sound human.**

---

## Quick Links

- [GitHub – blader/humanizer](https://github.com/blader/humanizer)
- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
- [WikiProject AI Cleanup](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup)

---
