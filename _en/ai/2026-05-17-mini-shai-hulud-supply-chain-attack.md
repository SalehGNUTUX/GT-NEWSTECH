---
layout: post
title: >-
  Mini Shai-Hulud Worm Compromises TanStack, Mistral AI, Guardrails AI & 169
  Packages
category: ai
author: GNUTUX
excerpt: >-
  A large-scale supply chain attack targeted npm and PyPI packages from major
  projects like TanStack, Mistral AI, UiPath, and OpenSearch, exploiting GitHub
  Actions vulnerabilities to steal credentials and publish malicious software
  with forged attestations.
image: mini-shai-hulud-worm-en.png
tags:
  - Mini Shai-Hulud
  - Cybersecurity
  - Supply Chain
  - npm
  - PyPI
  - TanStack
  - Mistral AI
  - GitHub Actions
also_in:
  - tech-news
date: 2026-05-17T18:49:00.000Z
lang: en
slug: mini-shai-hulud-supply-chain-attack
---

## The Largest Software Supply Chain Attack of 2026

On May 11, 2026, the npm and PyPI ecosystems experienced the largest organized supply chain attack to date. The threat group TeamPCP successfully compromised 169 npm packages and 2 PyPI packages, totaling 373 malicious versions, targeting critical projects in web development and artificial intelligence.

🔗 **Official Incident Postmortem:** [tanstack.com/blog/npm-supply-chain-compromise-postmortem](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem)
🔗 **StepSecurity Analysis:** [stepsecurity.io/blog/mini-shai-hulud](https://stepsecurity.io/blog/mini-shai-hulud)

## The Full Scope of the Attack

### Compromised npm Packages

@tanstack (42 packages, 84 versions) includes react-router, vue-router, start-router, and other essential routing libraries.

@uipath (66 packages) includes process automation tools and AI agents.

@squawk (22 packages) for aviation data and weather forecasting tools.

@mistralai (3 packages) is the official SDK for Mistral AI's language models.

@opensearch-project is the open source search and storage client with 1.3 million weekly downloads.

@tallyui (10 packages) for commercial UI components.

Additionally, uncategorized packages like safe-action, ts-dna, cross-stitch, wot-api, git-git-git, cmux-agent-mcp, and others were also compromised.

### Compromised PyPI Packages

mistralai version 2.4.6.

guardrails-ai version 0.10.1.

## How the Attack Was Executed

TeamPCP used three sequential vulnerabilities in GitHub Actions to compromise the official publishing workflow.

First, pull_request_target exploitation. The attacker forked the TanStack/router repository and opened a pull request. This type of GitHub Actions trigger is designed to run automated tasks even from untrusted branches, assuming they are safe by default.

Second, cache poisoning. The attacker exploited the pnpm cache mechanism in GitHub Actions. When the cache is restored in a legitimate workflow later, the poisoned package is fetched instead of the clean one.

Third, OIDC token extraction from memory. After the malicious package executed inside the legitimate project's GitHub Actions environment, the attacker read /proc/<pid>/mem to extract the OIDC (OpenID Connect) token, which grants direct permission to publish npm packages without needing any passwords or traditional access tokens.

The result: malicious versions of TanStack libraries were published using the project's own official publishing workflow, appearing as legitimate updates.

## Why This Attack Is Dangerous: Breaking SLSA

The malicious versions carried valid SLSA Build Level 3 attestations, security certificates designed specifically to prove a package came from an approved publishing workflow and not from an unknown source. This is the first documented npm worm to produce malicious packages with fully valid attestations.

What this means practically: relying on SLSA alone is no longer sufficient to guarantee package security, because an attacker can control the build process itself and obtain the certificate on behalf of the legitimate system.

Additionally, the report confirmed that the attack successfully forged npm tool signatures and GitHub device signatures completely, making source tracing nearly impossible using traditional methods.

## The Worm's Propagation Mechanism

What makes Mini Shai-Hulud a true worm and not just a static attack is its self-propagation capability.

After the malicious package executes on a developer's machine or in a CI/CD environment, the following steps occur:

First, credential theft includes npm tokens, GitHub tokens, GitHub Actions OIDC tokens, AWS credentials (via IMDSv2), GCP and Azure credentials, Kubernetes service account tokens, HashiCorp Vault tokens, SSH keys, Claude Code API keys, VS Code tokens, and all environment variables and keys from .env files.

Second, target identification. The worm searches for npm packages where the victim has publishing permissions with bypass_2fa enabled.

Third, injection and publication. It modifies the original package by adding malicious code as an optional dependency or via a preinstall hook, then increments the version and publishes a new malicious version under the victim's own name.

Thus, every developer or project that gets compromised becomes a launching point for new attacks, creating an endless chain of infections.

## Primary Target: AI Development Environments

The attack specifically targeted Mistral AI, Guardrails AI, and TanStack (widely used in large React applications). This is no coincidence. AI development environments often contain expensive API keys, proprietary models, and access to sensitive cloud infrastructure.

In the case of the mistralai package on PyPI, the attacker injected code into client/__init__.py that executes immediately upon importing the package. The code downloads a credential stealer from a remote server (83.142.209.194) with geolocation-based logic. If the system is detected to be in Russia, execution is avoided. If the system is detected in Israel or Iran, there is a one-in-six chance of executing rm -rf / to wipe the entire machine.

For the guardrails-ai package on PyPI, once imported on a Linux system, it downloads a malicious Python file from git-tanstack.com and executes it without any integrity verification.

## Technical Details of the Malware

### File Names

The malware uses several key files in its operations:

router_init.js is the encrypted JavaScript payload, executed via the Bun runtime.

tanstack_runner.js is a helper file for process management and command execution.

setup.mjs is an installation script used in packages that follow direct preinstallation hooks.

@tanstack/setup is an optional dependency hosted on GitHub, containing a prepare script that calls Bun to execute the payload.

Bun runtime simulator is a fast JavaScript runtime loaded and executed directly from memory. The encrypted payload size is approximately 11.7 megabytes.

### Data Exfiltration Channels

The attacker used three parallel channels to ensure successful exfiltration of stolen credentials:

The primary channel uses the Session Protocol, a decentralized and encrypted messaging network (getsession.org). Choosing this network makes DNS or IP-based blocking ineffective, because communication occurs through multiple distributed nodes.

The secondary channel uses the GitHub API. New repositories are created with names inspired by the novel Dune, such as "Shai-Hulud: Here We Go Again". Stolen data is uploaded as files within these repositories using previously stolen tokens.

The third channel uses the domain git-tanstack.com, a typosquatting domain that mimics the official project domain.

### Persistence and Ransom Mechanism

The malware installs a background service called gh-token-monitor. This service performs the following:

It checks the validity of the existing GitHub token every 60 seconds via the GitHub API. If the token is revoked by the victim, the service executes rm -rf ~/ to delete the entire user home directory. The service persists for 24 hours then terminates automatically. It installs via LaunchAgent on macOS and systemd service on Linux.

This means before revoking any token, one must locate and manually delete this service.

Additionally, the malware installs persistence points in Claude Code and Visual Studio Code, so the credential stealer restarts every time these applications are opened.

On macOS, a plist file is installed at ~/Library/LaunchAgents/com.user.gh-token-monitor.plist. On Linux, the service is installed at ~/.config/systemd/user/gh-token-monitor.service.

## Open Sourcing the Worm

On May 12, 2026, TeamPCP published the complete source code of Shai-Hulud on GitHub with a message stating: "Shai-Hulud: Open Sourcing The Carnage. Is it vibe coded? Yes. Does it work? Let results speak. Change keys and C2 as needed. Love – TeamPCP."

Within hours, the repository was removed from GitHub, but copies spread rapidly across alternative platforms and encryption sites.

This publication means any beginner hacker can now modify the encryption keys and C2 addresses and launch their own version of the attack. Experts expect a wave of copycat and derivative attacks in the coming weeks, similar to what happened with the Mirai worm after its source code was released.

## What to Do If You Are Affected

The first step is system isolation: disconnect the machine from the network immediately. Do not revoke any GitHub or npm access tokens before removing the gh-token-monitor service.

The second step is removing the malicious service:

On macOS:
rm ~/Library/LaunchAgents/com.user.gh-token-monitor.plist
launchctl remove com.user.gh-token-monitor

On Linux:
rm ~/.config/systemd/user/gh-token-monitor.service
systemctl --user disable gh-token-monitor

The third step is scanning files and directories: search all project folders for router_init.js, setup.mjs, and tanstack_runner.js. Check .claude/ and .vscode/ folders in all user and project directories.

The fourth step is rotating credentials: after confirming service removal, change all the following credentials: npm tokens, GitHub Personal Access Tokens, GitHub Actions Secrets, AWS, GCP, and Azure credentials, Kubernetes service account tokens, HashiCorp Vault tokens, Claude API keys, and VS Code tokens.

The fifth step is checking publishing logs: review GitHub Actions logs and npm publish logs to detect any unauthorized releases under your name. Delete any malicious versions immediately.

The sixth step is upgrading to clean versions: ensure all packages are updated to the latest version after May 12, 2026 (check each project's website for specific dates).

## Available Scanning Tools

The community has released several tools for scanning affected projects:

tanstack-shield is a one-click scanner to detect CVE-2026-45321 in TanStack projects.

shai-scan is a zero-dependency CLI tool for scanning npm and PyPI packages, supporting multiple lockfiles and checking system-level compromise indicators.

Standard npm-audit and pip-audit can detect some affected versions, but the specialized tools above are recommended.

## Vulnerability Disclosure (CVE-2026-45321)

CVE-2026-45321 was assigned to this attack, with a severity rating of 9.6 out of 10. The core vulnerability is not a traditional software bug, but an exploit chain targeting misconfigured GitHub Actions workflows and automatic trigger vulnerabilities.

The crucial point is that pull_request_target executes in the context of the base repository, not the attacker's branch, allowing access to stored secrets. When combined with cache poisoning and OIDC memory extraction, the entire process becomes vulnerable.

## Previous Attacks by the Same Group

TeamPCP is not new to this type of attack. In April 2026, they targeted SAP CAP packages on npm. On April 30, they compromised the PyTorch Lightning library via a maliciously tagged release. On the same day, the intercom-client package on npm and the associated intercom-php repository on Composer were compromised.

What distinguishes the May 2026 attack is the scale (169 packages), the diversity (npm and PyPI combined), and the specific targeting of AI projects.

## Summary

The Mini Shai-Hulud attack is not just another security vulnerability. It represents a shift in how software supply chains are targeted. Using trusted publishing to forge the identity of official publishers, extracting OIDC tokens from memory, publishing packages with forged attestations, and adding a kill switch that deletes victim data if they try to protect themselves – all these techniques make this attack unique and dangerous.

If you are a developer using any of the affected packages, ensure you scan your projects immediately. If you are a security professional, be aware that the worm's source code is now publicly available, and copycat attacks are inevitable. It is time to audit GitHub Actions permissions, review cloud access policies, and prepare rapid response plans for supply chain incidents.

## Quick Links

Official TanStack Report: tanstack.com/blog/npm-supply-chain-compromise-postmortem
StepSecurity Full Analysis: stepsecurity.io/blog/mini-shai-hulud
Complete List of Affected Packages: socket.dev/blog/tanstack-npm-packages-compromised-mini-shai-hulud-supply-chain-attack
tanstack-shield Scanner: github.com/Caixa-git/tanstack-shield
shai-scan Scanner: github.com/digi4care/shai-scan
NHS Official Advisory: digital.nhs.uk/cyber-alerts/2026/cc-4781
Microsoft Malicious Package Analysis: msftsecintel on X
Shai-Hulud Source Analysis: reversinglabs.com/blog/the-shai-hulud-code-drop
