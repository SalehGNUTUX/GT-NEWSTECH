---
layout: post
title: >-
  Azure Linux 4.0: Microsoft Opens the Door to Testing Its Fedora-Based
  Distribution
category: gnulinux
author: GNUTUX
excerpt: >-
  Microsoft announced the public preview of Azure Linux 4.0, a version that
  completely rebuilds the distribution on top of Fedora Linux, representing a
  strategic shift in the distribution's philosophy to become a general-purpose
  server instead of just an AKS container host.
image: azure-linux-4-released-gnutux.jpg
tags:
  - Azure Linux
  - Microsoft
  - Linux Distributions
  - Cloud
  - Fedora
  - CBL-Mariner
also_in:
  - tech-news
date: 2026-06-05T16:25:00.000Z
lang: en
slug: azure-linux-4-0-public-preview
---

## Azure's Platform Between Windows and Linux

Although Microsoft was known for Windows for decades, the Azure cloud has been increasingly running on Linux. Over two-thirds of compute cores in Azure run Linux today. ChatGPT itself was running on over 10 million compute cores of Linux. This reality drove Microsoft to develop its own Linux distribution years ago, starting with CBL-Mariner.

On June 5, 2026, Microsoft announced Azure Linux 4.0 in public preview, a release that completely redefines the distribution.

🔗 **Official Page:** [github.com/microsoft/azurelinux](https://github.com/microsoft/azurelinux)

## What Is Azure Linux?

Azure Linux, formerly known as CBL-Mariner where CBL stands for Common Base Linux, is an open source Linux distribution developed by Microsoft specifically for the Azure cloud environment. The first version was released in April 2020. Up until version 3.0, CBL-Mariner was a lightweight distribution designed to be the container host for Azure Kubernetes Service only.

With version 4.0, the philosophy has completely changed. Azure Linux is now a general-purpose server Linux that can be used on virtual machines in Azure, not just on AKS containers. This puts it in direct competition with Amazon Linux from AWS and Container-Optimized OS from Google.

## The Radical Shift: From CBL-Mariner to Fedora

### The Old Foundation: Initially, CBL-Mariner was built from scratch using a custom toolchain of SPEC files and RPMs designed by Microsoft. The goal was minimal size and dependencies to reduce the security attack surface.

The New Foundation in version 4.0: Microsoft took a completely different approach. Instead of building everything from scratch, the company decided to use Fedora Linux as an upstream base. This means Azure Linux 4.0 is built from Fedora source code, with a custom overlay layer containing Microsoft's own modifications.

### Why Fedora?

The choice of Fedora was not random. Fedora is known for being a modern distribution, containing the latest kernels and libraries, and has a large, active development community. By relying on Fedora, Microsoft benefits from thousands of hours of development done by the open source community and focuses its efforts on the Azure customization layer. The distribution also retains the RPM package management system, providing a familiar tool for Linux developers.

## What Remains of Microsoft's Signature?

The shift to Fedora does not mean Microsoft has abandoned control over its distribution. The company confirms that this is not just a repackaging of Fedora. Microsoft performs the following:

Full control over the final package: Microsoft selects which packages from Fedora will be included in the final image. This ensures the system remains as lightweight as possible.

Strict security hardening: Microsoft applies its own security layers, including signed packages and SELinux policies designed specifically for cloud environments.

Deep integration with Azure: The overlay layer on top of Fedora contains Azure agents and management and update tools that make the distribution work seamlessly inside the cloud.

## Multiple Distributions: Azure Linux vs Azure Container Linux

Part of the announcement involved a restructuring of Microsoft's strategy in the Linux world. The product was split into two distinct tracks:

Azure Linux 4.0 is the general-purpose distribution discussed in this article. It is used for virtual machines. It supports a full range of RPM packages. It supports a wide range of use cases including databases, web applications, and AI workloads. It has a defined lifecycle of two years, and regular image updates are recommended.

Azure Container Linux is a separate product built on Flatcar Container Linux, which itself is a fork of CoreOS. It is an immutable system. It has no package manager. All workloads run inside containers on top of a fixed kernel. It is specifically designed to be the operating system for AKS nodes. It competes with Fedora CoreOS and Google Container-Optimized OS.

The image below shows the Microsoft Azure logo:

![Microsoft Azure Logo](https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure_logo.svg)

## How to Try Azure Linux 4.0 Today?

The distribution is currently available in public preview.

Steps to use:

1. Go to the Azure Marketplace at marketplace.azure.com.
2. Search for "Azure Linux 4.0".
3. Deploy on a new virtual machine or on a virtual machine scale set.

## WSL Support and ISO Availability

Microsoft announced during Build 2026 that WSL support is under development and will be available soon. This means developers will soon be able to run Azure Linux 4.0 locally on their Windows machines, creating a perfect match between development environment and cloud production environment.

Regarding ISO files, some reports indicate that ISO files and generic images are available for testing outside Azure. However, it must be emphasized that Microsoft will not officially support this scenario. Technical support and guarantees are directed only for operation within the Azure environment.

## Warnings and Limitations

For experimental use only: Version 4.0 is currently a public preview. Microsoft strongly warned against using it in sensitive production environments.

Not supported outside Azure: You can run it on your home computer or on an AWS server, but if you encounter a problem, you will not be able to contact the Azure support team.

Short lifecycle: Versions are supported for only two years, with expectations of regular image updates, requiring an automated update strategy.

## Competitive Cloud Distributions

With this move, Microsoft officially joins the club of major tech companies that have their own Linux distribution:

AWS has Amazon Linux, which is the default and recommended operating system on EC2.

Google Cloud Platform has Container-Optimized OS, a lightweight and secure operating system designed to run containers on GKE.

More interestingly, all three relied on different projects. Amazon Linux was built from scratch on a RHEL-like base. COS is built on Chromium OS and recently added support for executable containers. Azure Linux now relies on Fedora.

## Summary

The release of Azure Linux 4.0 is an explicit acknowledgment by Microsoft that the cloud computing world is run by Linux. By abandoning its isolated CBL-Mariner distribution and embracing Fedora as its core, Microsoft benefits from the open community and saves itself the burden of reinventing the wheel.

If you are a system administrator or developer using Azure, trying Azure Linux 4.0 is worth the effort. If not now during the preview, then certainly after its official release. Performance improvements and deep integration with the rest of Azure services will certainly make it a fierce competitor to traditional Ubuntu and CentOS on the cloud.

## Quick Links

[https://github.com/microsoft/azurelinux](https://github.com/microsoft/azurelinux)

[https://azuremarketplace.microsoft.com](https://azuremarketplace.microsoft.com)

[https://learn.microsoft.com/en-us/azure/azure-linux](https://learn.microsoft.com/en-us/azure/azure-linux)

Published in the GNU/Linux section – Cloud Distribution News
