---
layout: post
title: 'OpenAuth: بديل مفتوح المصدر ومرن لـ Auth0 و Clerk مع دعم OAuth 2.0'
category: foss
author: GNUTUX
excerpt: >-
  OpenAuth هو مزود مصادقة (Authentication Provider) مفتوح المصدر ومبني على
  معايير OAuth 2.0، يمكن استخدامه مع تطبيقات الويب والجوال وواجهات API وتطبيقات
  الطرف الثالث. يدعم الاستضافة الذاتية ويعمل مع Node.js وBun وAWS Lambda
  وCloudflare Workers.
image: openauth-gnutux.jpg
tags:
  - OpenAuth
  - مصادقة
  - OAuth 2.0
  - مفتوح المصدر
  - استضافة ذاتية
  - تطبيقات ويب
  - Node.js
  - Bun
  - Cloudflare
also_in:
  - tech-news
date: 2026-07-16T16:15:00.000Z
lang: ar
slug: openauth-auth-provider
---

## مشكلة أنظمة المصادقة المغلقة

بناء نظام مصادقة (Authentication) لتطبيقك هو أحد أكثر المهام تعقيداً في تطوير البرمجيات. بين الحاجة إلى تأمين كلمات المرور، وإدارة جلسات المستخدمين، ودعم تسجيل الدخول عبر خدمات خارجية (Google، GitHub)، وإصدار وتحديث رموز الوصول، والتعامل مع حالات إعادة تعيين كلمة المرور، تصبح المهمة شاقة ومكررة. كثير من المطورين يلجأون إلى خدمات سحابية مثل Auth0 أو Clerk، لكن هذه الخدمات تأتي مع تكاليف شهرية، وقيود على عدد المستخدمين، واعتماد على طرف ثالث.

OpenAuth يقدم حلاً مختلفاً: مزود مصادقة مركزي، مفتوح المصدر، يمكنك استضافته ذاتياً على بنيتك التحتية، مع الالتزام بمعايير OAuth 2.0 المفتوحة.

🔗 **المستودع الرسمي:** [github.com/anomalyco/openauth](https://github.com/anomalyco/openauth)

## ما هو OpenAuth؟

OpenAuth هو مزود مصادقة (Authentication Provider) مبني على معايير OAuth 2.0. صُمم ليكون **عالمياً** (Universal)، حيث يمكن نشره كخدمة مستقلة أو دمجه داخل تطبيق موجود. يعمل مع أي إطار عمل أو منصة، ويمكن استضافته على Node.js، Bun، AWS Lambda، أو Cloudflare Workers.

الفكرة الأساسية: بدلاً من تضمين مكتبة مصادقة في كل تطبيق على حدة (وهو ما تفعله معظم الحلول مفتوحة المصدر)، يوفر OpenAuth خادم مصادقة مركزياً واحداً يخدم جميع تطبيقاتك: تطبيقات الويب، تطبيقات الجوال، أدوات الإدارة الداخلية، وواجهات API.

## الميزات الرئيسية

### الاستضافة الذاتية الكاملة
يمكنك تشغيل OpenAuth على بنيتك التحتية الخاصة. لا تعتمد على أي خدمة سحابية تابعة لجهة خارجية. كل بيانات المستخدمين وجلساتهم تبقى تحت سيطرتك.

### التوافق مع OAuth 2.0
لأن OpenAuth يلتزم بمعايير OAuth 2.0، فإن أي عميل OAuth (تطبيق ويب، تطبيق جوال، واجهة API) يمكنه استخدامه للحصول على رموز الوصول والتحديث. يمكنك حتى استخدامه لإصدار شهادات لتطبيقات طرف ثالث، مما يتيح لك تنفيذ تدفق "تسجيل الدخول عبر تطبيقي" (Login with myapp).

### دعم مزودين متعددين
يدعم OpenAuth مزودين خارجيين مثل Google وGitHub، بالإضافة إلى تدفقات مدمجة مثل البريد الإلكتروني/كلمة المرور، أو الرمز السري (PIN code). يمكنك أيضاً تنفيذ مزود خاص بك.

### واجهة مستخدم جاهزة وقابلة للتخصيص
يأتي OpenAuth بواجهة تسجيل دخول جاهزة، قابلة للتخصيص (تغيير الألوان، الشعار، النصوص). يمكنك أيضاً تخطيها بالكامل وتنفيذ واجهتك الخاصة.

### دمج سهل مع تطبيقاتك
بعد نشر خادم OpenAuth، يمكن لأي تطبيق استخدامه عبر عميل OAuth بسيط. يوفر OpenAuth أدوات مساعدة لتبسيط هذه العملية.

## كيف يعمل؟

### خادم المصادقة (Auth Server)

يتم إنشاء خادم المصادقة عبر استيراد دالة `issuer` من حزمة `@openauthjs/openauth`:

```typescript
import { issuer } from "@openauthjs/openauth"

const app = issuer({
  providers: { ... },  // مزودين مثل Google, GitHub, Password
  storage: ...,         // تخزين الرموز وكلمات المرور
  subjects: ...,        // تعريف شكل رمز الوصول (JWT)
  success: async (ctx, value) => { ... } // معالجة بعد نجاح المصادقة
})
```

### موفرو الهوية (Providers)

مثال على إضافة مزود GitHub:

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

مثال على مزود البريد الإلكتروني/كلمة المرور مع واجهة UI جاهزة:

```typescript
import { PasswordProvider } from "@openauthjs/openauth/provider/password"
import { PasswordUI } from "@openauthjs/openauth/ui/password"

const app = issuer({
  providers: {
    password: PasswordProvider(
      PasswordUI({
        sendCode: async (email, code) => {
          console.log(email, code) // أرسل الكود عبر البريد الإلكتروني هنا
        },
      }),
    ),
  },
  ...
})
```

### الموضوعات (Subjects)

الموضوعات تحدد شكل البيانات التي سيتم تضمينها في رمز الوصول (JWT):

```typescript
import { createSubjects } from "@openauthjs/openauth"
import { object, string } from "valibot"

const subjects = createSubjects({
  user: object({
    userID: string(),
  }),
})
```

### معالجة نجاح المصادقة (Success Callback)

بعد أن يكمل المستخدم عملية المصادقة بنجاح، يتم استدعاء دالة `success`، حيث يمكنك البحث عن المستخدم في قاعدة بياناتك أو إنشاؤه، وإرجاع الموضوع المناسب:

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

### التخزين (Storage)

يحتاج OpenAuth إلى تخزين كميات صغيرة من البيانات (رموز التحديث، تجزئات كلمات المرور). يمكن استخدام MemoryStore للتطوير، أو DynamoDB (على AWS)، أو Cloudflare KV:

```typescript
import { MemoryStorage } from "@openauthjs/openauth/storage/memory"

const app = issuer({
  providers: { ... },
  subjects,
  success: async (ctx, value) => { ... },
  storage: MemoryStorage(),
})
```

### النشر (Deployment)

يمكن نشر الخادم على عدة بيئات:

- **Bun / Cloudflare Workers:** التطبيق جاهز للتصدير مباشرة.
- **AWS Lambda:** استخدام معالج من Hono.
- **Node.js:** استخدام خادم من `@hono/node-server`.

## استخدام العميل (Client)

يمكن لأي تطبيق استخدام OpenAuth عبر عميل OAuth 2.0 قياسي. يوفر OpenAuth أداة `createClient` لتبسيط العملية:

```typescript
import { createClient } from "@openauthjs/openauth/client"

const client = createClient({
  clientID: "my-app",
  issuer: "https://auth.myserver.com", // رابط خادم OpenAuth
})
```

للتطبيقات التي تحتوي على خادم ويب (SSR)، يمكن استخدام تدفق `code`:

```typescript
const { url } = await client.authorize(redirectUri, "code")
// توجيه المستخدم إلى url
// بعد العودة، استبدل الكود برمز وصول
const tokens = await client.exchange(code, redirectUri)
```

لتطبيقات الصفحة الواحدة (SPA) أو تطبيقات الجوال، يمكن استخدام تدفق `token` مع PKCE.

## الخلاصة

OpenAuth هو حل مصادقة مفتوح المصدر يجمع بين المرونة والتحكم الكامل. بدلاً من الاعتماد على خدمات سحابية باهظة الثمن أو بناء نظام مصادقة من الصفر، يمكنك نشر خادم OpenAuth واحد يخدم جميع تطبيقاتك، مع الالتزام بمعايير OAuth 2.0 المفتوحة. هذا يمنحك تحكماً كاملاً في بيانات مستخدميك، ويوفر عليك وقت التطوير، ويضمن التوافق مع أي عميل OAuth.

## روابط سريعة

[https://github.com/anomalyco/openauth](https://github.com/anomalyco/openauth)

[https://openauth.js.org](https://openauth.js.org)

نشر في قسم البرمجيات الحرة مفتوحة المصدر – أدوات تطوير
