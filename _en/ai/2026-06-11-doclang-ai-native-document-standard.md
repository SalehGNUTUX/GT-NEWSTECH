---
layout: post
title: >-
  DocLang: An Open Standard for AI-Friendly Documents Backed by IBM, NVIDIA, and
  Red Hat
category: ai
author: GNUTUX
excerpt: >-
  The LF AI & Data Foundation has announced the formation of a working group to
  develop DocLang, an open and neutral standard for AI-friendly document
  formats, backed by IBM, NVIDIA, Red Hat, and ABBYY. The standard aims to solve
  the incompatibility of traditional documents with AI models.
image: doclang-gnutux.jpg
tags:
  - DocLang
  - Artificial Intelligence
  - Open Standards
  - Documents
  - LF AI
  - IBM
  - NVIDIA
  - Red Hat
also_in:
  - tech-news
date: 2026-06-11T22:08:00.000Z
lang: en
slug: doclang-ai-native-document-standard
---

## The Problem of Traditional Documents in the AI Era

Every day, organizations produce thousands of documents in PDF, DOCX, and JPEG formats. These files were designed to be readable by humans, not by machines. When these documents are fed into AI pipelines, multiple problems occur. Reading order breaks down, tables collapse into flat text, and images disappear entirely. The logical quality of the document becomes the bottleneck, not the capability of the model itself.

On June 9, 2026, the LF AI & Data Foundation, under the Linux Foundation umbrella, announced the formation of a working group to develop **DocLang**, an open, universal standard for AI-friendly documents. The goal is to create a unified format that AI models can easily understand, while preserving the semantic, geometric, and structural layout of the document.

🔗 **Official Website:** [github.com/doclang-project/doclang](https://github.com/doclang-project/doclang)
🔗 **Working Group:** [lfaidata.foundation/projects/doclang](https://lfaidata.foundation/projects/doclang)

## What Is DocLang?

DocLang is an AI-native markup format designed for unstructured content such as documents, images, and multimedia. It defines a unified, machine-readable structure for documents of any type. Think of it as "JSON for data" or "HTML for the web," but this time for artificial intelligence. Any tool can implement it, and any pipeline can consume it.

DocLang supports the following elements:

Preservation of both semantic meaning and geometric layout together in a single format.

Representation of structural elements such as headings, paragraphs, and tables with their precise positions on the page.

Built-in support for multimedia content including audio, images, and video.

Native support for tables, charts, mathematical formulas, and code blocks.

Embedding of governance metadata such as privacy policies, extraction scope, and model training permissions directly inside the file rather than in a separate file.

This standard is not a replacement for PDF. It is an integration layer on top of existing infrastructure. PDF was for printing. DOCX was for editors. DocLang is for what comes next.

## Founding and Supporting Members

The standard comes with support from leading technology companies, under neutral governance to ensure no single company controls the roadmap.

IBM contributed its initial research that led to DocLang, including technologies such as OTSL for compact table representation and DocTags for preserving document structure.

NVIDIA will help accelerate adoption of this format across industries.

Red Hat plans to integrate Docling, the processing tool, into upcoming Red Hat Enterprise Linux AI releases.

ABBYY is already integrating the standard into its FineReader beta product.

HumanSignal contributes to standard development from the data labeling perspective.

The working group operates under the neutral open governance model of the Joint Development Foundation.

## The Relationship Between DocLang and Docling

To fully understand the project, you must distinguish between two integrated components.

Docling is an open source document processing tool developed by IBM Research Zurich and released by the AI for Knowledge team. It was open sourced in July 2024 and has achieved over 61,000 stars on GitHub. Docling acts as a conversion and extraction engine. It takes a document in PDF, DOCX, HTML, or image format, analyzes it using advanced models for layout and table understanding, and outputs a structured representation called DoclingDocument.

DocLang is the standard exchange format. While Docling handles ingestion and analysis, DocLang provides the unified output format that can be exchanged between different systems.

Together, they form a complete technology stack. Docling for ingestion and analysis, and DocLang for the open, exchangeable standard. Both are now hosted under the LF AI & Data Foundation.

## Current Version and How to Try It

The standard is still in its early stages. It is available as version v0.6 and is being developed openly on GitHub under the Apache 2.0 license.

You can try DocLang today through:

Installing the reference validator tool via PyPI:
```bash
pip install doclang
doclang validate -n my_document.dclg.xml
```

Using Docling to convert your documents directly to DocLang format.

Trying the ABBYY FineReader beta, which supports the new standard.

## What This Means for Developers and Organizations

If you are a developer building applications that rely on retrieval augmented generation or AI agents, DocLang offers you a reliable and consistent data source. Imagine being able to ensure that every document in your system is read in the correct order, its tables are extracted properly, its images are not lost, and you do not have to write custom processing code for each file format.

According to Peter Staar, research manager at IBM, the vision is for DocLang to become a widely adopted international standard for AI-ready documents, providing a consistent representation for both humans and machines, just as PDF became the global standard for document exchange in the human era.

## Summary

The announcement of DocLang is not just a minor technical news item. It is recognition from the biggest players in the field that the current document infrastructure is unsuitable for the AI era. Instead of allowing every company to invent its own closed standard, these companies are uniting under the Linux Foundation to provide an open and neutral alternative.

The standard is still in its infancy at version 0.6, but it was born under the sponsorship of technology giants and the open source community. Its real impact will emerge over the coming years, when AI tools begin to assume that the documents they handle are in DocLang format, not legacy PDF.

## Quick Links

[https://github.com/doclang-project/doclang](https://github.com/doclang-project/doclang)

[https://github.com/docling-project/docling](https://github.com/docling-project/docling)

[https://lfaidata.foundation](https://lfaidata.foundation)

Published in the Artificial Intelligence section – Data Standards and Formats
```
