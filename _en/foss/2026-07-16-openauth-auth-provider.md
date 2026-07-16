---
layout: post
title: >-
  OpenAuth: An Open Source, Flexible Alternative to Auth0 and Clerk with OAuth
  2.0 Support
category: foss
author: GNUTUX
excerpt: >-
  OpenAuth is an open source, standards-based authentication provider built on
  OAuth 2.0, usable with web apps, mobile apps, APIs, and third-party clients.
  It supports self-hosting and runs on Node.js, Bun, AWS Lambda, and Cloudflare
  Workers.
image: openauth-gnutux.jpg
tags:
  - OpenAuth
  - Authentication
  - OAuth 2.0
  - Open Source
  - Self-Hosting
  - Web Apps
  - Node.js
  - Bun
  - Cloudflare
also_in:
  - tech-news
date: 2026-07-16T16:16:00.000Z
lang: en
slug: openauth-auth-provider
---

## The Problem of Closed Authentication Systems

Building an authentication system for your application is one of the most complex tasks in software development. Between securing passwords, managing user sessions, supporting login via external services (Google, GitHub), issuing and refreshing access tokens, and handling password reset flows, the task becomes tedious and repetitive. Many developers turn to cloud services like Auth0 or Clerk, but these come with monthly costs, user limits, and dependence on a third party.

OpenAuth offers a different solution: a centralized, open source authentication provider that you can self-host on your own infrastructure, while adhering to open OAuth 2.0 standards.

🔗 **Official Repository:** [github.com/anomalyco/openauth](https://github.com/anomalyco/openauth)

## What Is OpenAuth?

OpenAuth is an authentication provider built on OAuth 2.0 standards. It is designed to be **universal**, meaning it can be deployed as a standalone service or embedded into an existing application. It works with any framework or platform and can be hosted on Node.js, Bun, AWS Lambda, or Cloudflare Workers.

The core idea is that instead of embedding an authentication library into each application individually, which is what most open source solutions do, OpenAuth provides a single centralized authentication server that serves all your applications: web apps, mobile apps, internal admin tools, and APIs.

## Key Features

### Complete Self-Hosting
You can run OpenAuth on your own infrastructure. You do not depend on any third-party cloud service. All user data and sessions remain under your control.

### OAuth 2.0 Compatibility
Because OpenAuth adheres to OAuth 2.0 standards, any OAuth client, such as a web app, mobile app, or API, can use it to obtain access and refresh tokens. You can even use it to issue credentials for third-party applications, allowing you to implement "Login with myapp" flows.

### Multiple Provider Support
OpenAuth supports external providers like Google and GitHub, as well as built-in flows like email/password or pin code. You can also implement your own custom provider.

### Ready-to-Use and Customizable UI
OpenAuth comes with a prebuilt, themeable login interface. You can customize its colors, logo, and text, or opt out entirely and implement your own interface.

### Easy Integration with Your Applications
After deploying the OpenAuth server, any application can use it through a simple OAuth client. OpenAuth provides helper tools to simplify this process.

## How It Works

### Auth Server

The authentication server is created by importing the `issuer` function from the `@openauthjs/openauth` package:

```typescript
import { issuer } from "@openauthjs/openauth"

const app = issuer({
  providers: { ... },  // Providers like Google, GitHub, Password
  storage: ...,         // Storage for tokens and passwords
  subjects: ...,        // Defines the shape of the access token (JWT)
  success: async (ctx, value) => { ... } // Callback after successful authentication
})
```

### Providers

Example of adding a GitHub provider:

```typescript
import { GithubProvider } from "@openauthjs/openauth/provider/github"

const app = issuer({
  providers: {
    github: GithubProvider({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scopes: ["user:email"],
    }),
  },
  ...
})
```

Example of the email/password provider with a ready-made UI:

```typescript
import { PasswordProvider } from "@openauthjs/openauth/provider/password"
import { PasswordUI } from "@openauthjs/openauth/ui/password"

const app = issuer({
  providers: {
    password: PasswordProvider(
      PasswordUI({
        sendCode: async (email, code) => {
          console.log(email, code) // Send the code via email here
        },
      }),
    ),
  },
  ...
})
```

### Subjects

Subjects define the shape of the data that will be included in the access token (JWT):

```typescript
import { createSubjects } from "@openauthjs/openauth"
import { object, string } from "valibot"

const subjects = createSubjects({
  user: object({
    userID: string(),
  }),
})
```

### Success Callback

After the user completes authentication successfully, the `success` callback is invoked. Here you can look up the user in your database or create them, and return the appropriate subject:

```typescript
const app = issuer({
  providers: { ... },
  subjects,
  async success(ctx, value) {
    let userID
    if (value.provider === "password") {
      userID = await lookupOrCreateUser(value.email)
    }
    if (value.provider === "github") {
      userID = await lookupOrCreateUserByGithub(value.tokenset.access)
    }
    return ctx.subject("user", { userID })
  }
})
```

### Storage

OpenAuth needs to store small amounts of data, such as refresh tokens and password hashes. You can use MemoryStore for development, DynamoDB on AWS, or Cloudflare KV:

```typescript
import { MemoryStorage } from "@openauthjs/openauth/storage/memory"

const app = issuer({
  providers: { ... },
  subjects,
  success: async (ctx, value) => { ... },
  storage: MemoryStorage(),
})
```

### Deployment

The server can be deployed on several environments:

- **Bun / Cloudflare Workers:** The application is ready for direct export.
- **AWS Lambda:** Using a handler from Hono.
- **Node.js:** Using a server from `@hono/node-server`.

## Client Usage

Any application can use OpenAuth through a standard OAuth 2.0 client. OpenAuth provides the `createClient` helper to simplify the process:

```typescript
import { createClient } from "@openauthjs/openauth/client"

const client = createClient({
  clientID: "my-app",
  issuer: "https://auth.myserver.com", // URL of the OpenAuth server
})
```

For applications with a web server (SSR), the `code` flow can be used:

```typescript
const { url } = await client.authorize(redirectUri, "code")
// Redirect the user to url
// After they return, exchange the code for an access token
const tokens = await client.exchange(code, redirectUri)
```

For single-page applications (SPA) or mobile apps, the `token` flow with PKCE can be used.

## Summary

OpenAuth is an open source authentication solution that combines flexibility with full control. Instead of relying on expensive cloud services or building an authentication system from scratch, you can deploy a single OpenAuth server that serves all your applications, while adhering to open OAuth 2.0 standards. This gives you complete control over your user data, saves development time, and ensures compatibility with any OAuth client.

## Quick Links

[https://github.com/anomalyco/openauth](https://github.com/anomalyco/openauth)

[https://openauth.js.org](https://openauth.js.org)

Published in the Free and Open Source Software section – Development Tools
