---
layout: post
title: 'Obscura: المتصفح الخفي الخفيف المصمم خصيصاً لوكلاء الذكاء الاصطناعي'
category: ai
author: GNUTUX
excerpt: >-
  Obscura هو محرك متصفح خفي (Headless Browser) مفتوح المصدر مكتوب بلغة Rust،
  مصمم خصيصاً لوكلاء الذكاء الاصطناعي وعمليات استخراج البيانات. يستهلك ذاكرة أقل
  بـ 85% من Chrome، ويبدأ في أقل من 50 مللي ثانية، مع دعم كامل لبروتوكول CDP
  وPuppeteer وPlaywright.
image: obscura-browser-gnutux-ar.png
tags:
  - Obscura
  - متصفح خفي
  - وكلاء ذكاء اصطناعي
  - استخراج بيانات
  - Rust
  - مفتوح المصدر
  - Apache-2.0
also_in:
  - tech-news
date: 2026-09-26T08:40:00.000Z
lang: ar
slug: obscura-headless-browser-ai-agents
---

## Chrome ليس الخيار الأمثل للوكلاء

عندما يريد وكيل ذكاء اصطناعي تصفح موقع ويب أو استخراج بيانات منه، فإن الخيار الافتراضي هو Headless Chrome. لكن Chrome لم يُصمم لهذا الغرض. صُمم ليكون متصفحاً بشرياً لسطح المكتب، وتشغيله في وضع خفي لا يعني أنه أصبح خفيفاً أو مثالياً للأتمتة. كل نسخة من Headless Chrome تستهلك أكثر من 200 ميجابايت من الذاكرة، وتستغرق ثانيتين للبدء، وتترك بصمات رقمية واضحة تجعل أنظمة مكافحة الروبوتات تكتشفها بسهولة .

هذه الفجوة هي ما يملأه مشروع Obscura.

🔗 **المستودع الرسمي:** [github.com/h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura)
🔗 **الموقع الرسمي:** [obscura.sh](https://obscura.sh)

## ما هو Obscura؟

Obscura هو **محرك متصفح خفي (Headless Browser Engine) مكتوب بالكامل بلغة Rust من الصفر**، وليس مجرد تفرع (fork) من Chromium . صُمم خصيصاً لعمليات استخراج البيانات (Web Scraping) وأتمتة وكلاء الذكاء الاصطناعي. يشغل JavaScript الحقيقي عبر محرك V8، ويدعم بروتوكول Chrome DevTools Protocol (CDP)، ويعمل كبديل مباشر لـ Headless Chrome مع Puppeteer و Playwright .

الفرق الجوهري: Obscura لا يحاول أن يكون متصفحاً كاملاً للاستخدام البشري. هو يقدم فقط ما يحتاجه الوكيل الآلي: تحميل الصفحات، تنفيذ JavaScript، قراءة المحتوى، والتفاعل مع العناصر. كل الميزات التي يحتاجها الإنسان (واجهة رسومية، إضافات، تشغيل وسائط، تأثيرات بصرية معقدة) تم تجريدها لصالح الأداء والكفاءة .

## الفارق التقني: مقارنة مع Headless Chrome

| المقياس | Obscura | Headless Chrome | الفارق |
|---------|---------|-----------------|--------|
| **الذاكرة لكل نسخة** | ~30 ميجابايت | 200+ ميجابايت | **أقل بـ 6-10 مرات** |
| **حجم الملف الثنائي** | ~70 ميجابايت | 300+ ميجابايت | **أصغر بـ 4 مرات** |
| **تحميل صفحة ثابتة** | 51 مللي ثانية | ~500 مللي ثانية | **أسرع بـ 10 مرات** |
| **تحميل صفحة ديناميكية** | 84 مللي ثانية | ~800 مللي ثانية | **أسرع بـ 9 مرات** |
| **وقت البدء** | فوري (<50 مللي ثانية) | ~2 ثانية | **أسرع بـ 40 مرة** |
| **الحماية من الكشف** | مدمج (`--stealth`) | لا يوجد | ميزة فريدة |
| **حجب المتتبعات** | 3,520 نطاقاً | لا يوجد | ميزة فريدة |

هذه الأرقام ليست مجرد أرقام تسويقية. في اختبار حقيقي على 8 عمليات متزامنة، حقق Obscura إنتاجية 21 صفحة في الثانية باستهلاك ذروة بلغ 132 ميجابايت، بينما حقق Headless Chrome 2.8 صفحة في الثانية باستهلاك 7.1 جيجابايت . هذا يعني أن خادماً واحداً بذاكرة 32 جيجابايت يمكنه تشغيل **أكثر من 1000 نسخة Obscura متزامنة**، مقابل 160 نسخة فقط من Chrome .

## الميزات الرئيسية

### وضع التخفي (Stealth Mode) المدمج
على عكس Headless Chrome الذي يترك بصمات واضحة مثل `navigator.webdriver = true`، يقدم Obscura وضع تخفي مدمجاً في محركه نفسه :

- **توليد بصمات فريدة لكل جلسة:** تشمل GPU، الشاشة، Canvas، الصوت، البطارية.
- **إخفاء `navigator.webdriver`:** يتم إرجاع `undefined` مباشرة من المحرك، وليس عبر إضافات خارجية.
- **تزييف التوقيع الرقمي TLS:** يحاكي بصمة TLS لمتصفح Chrome حقيقي.
- **`event.isTrusted = true`:** للأحداث المرسلة من السكربت.
- **إخفاء الخصائص الداخلية:** `Object.keys(window)` آمن.
- **حجب 3,520 نطاقاً للمتتبعات:** حظر كامل للأدوات التحليلية والإعلانات وسكربتات بصمة الإصبع .

### دعم كامل لـ CDP و Puppeteer و Playwright
Obscura يتحدث بروتوكول Chrome DevTools Protocol بشكل كامل، مما يعني أن أي كود موجود لديك يستخدم Puppeteer أو Playwright يمكن توجيهه إلى Obscura **دون أي تغيير** . فقط استبدل نقطة الاتصال بـ WebSocket الخاص بـ Obscura:

```python
from playwright.sync_api import sync_playwright

CDP = "ws://127.0.0.1:9222"
with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(CDP)
    page = browser.new_page()
    page.goto("https://example.com")
    data = page.inner_text("body")
```

### أدوات سطر أوامر قوية
يوفر Obscura واجهة سطر أوامر (CLI) متكاملة لعمليات الاستخراج السريع :

```bash
# الحصول على عنوان الصفحة
obscura fetch https://example.com --eval "document.title"

# استخراج كل الروابط
obscura fetch https://example.com --dump links

# تحويل الصفحة إلى Markdown
obscura fetch https://example.com --dump markdown

# التقاط لقطة شاشة
obscura fetch https://example.com --screenshot page.png

# استخراج متوازي لعدة روابط
obscura scrape url1 url2 url3 --concurrency 25 --format json
```

### خدمة MCP للوكلاء
يأتي Obscura بخادم MCP (Model Context Protocol) مدمج يمكن لوكلاء الذكاء الاصطناعي مثل Claude Desktop و Cursor الاتصال به مباشرة، مما يمنحهم أدوات جاهزة للتصفح والتفاعل مع الصفحات .

### حماية SSRF مدمجة
يمنع Obscura الوصول إلى عناوين IP الخاصة والشبكات المحلية بشكل افتراضي، مما يحمي البنية التحتية من هجمات SSRF. يمكن تعطيل هذا الحظر عبر `--allow-private-network` لتطوير التطبيقات محلياً .

## التثبيت والبدء

### تحميل مباشر
```bash
# Linux x86_64
curl -LO https://github.com/h4ckf0r0day/obscura/releases/latest/download/obscura-x86_64-linux.tar.gz
tar xzf obscura-x86_64-linux.tar.gz
./obscura fetch https://example.com --eval "document.title"
```

### عبر Docker
```bash
docker run -d --name obscura -p 127.0.0.1:9222:9222 \
  -e OBSCURA_CDP_TOKEN="$(openssl rand -hex 32)" \
  h4ckf0r0day/obscura
```

### متطلبات النظام
- Linux x86_64 / ARM64، macOS Apple Silicon / Intel، أو Windows.
- لا يحتاج إلى Node.js أو Chrome أو أي تبعيات خارجية .

## لمن هذا المشروع؟

**لوكلاء الذكاء الاصطناعي:** إذا كنت تبني وكيلاً يحتاج إلى تصفح الويب تلقائياً، فإن Obscura يمنحه متصفحاً خفيفاً يمكن تشغيله بكميات كبيرة على خادم واحد.

**لمهندسي استخراج البيانات:** Obscura يقدم بديلاً أسرع وأرخص وأكثر تخفياً من Headless Chrome، مع دعم كامل للأدوات التي تعرفها بالفعل.

**للمطورين على الأجهزة المحمولة:** إذا كنت تشغل Obscura على حاسوب محمول، فإن استهلاك الذاكرة المنخفض يترك مساحة أكبر للنماذج اللغوية والعمليات الأخرى.

## القيود الحالية

- **محرك العرض ليس كاملاً:** Obscura يطبق جزءاً فقط من مواصفات CSS. الصفحات المعقدة جداً قد لا تظهر بنفس دقة Chromium .
- **إخراج PDF يعتمد على الصور النقطية:** النص في PDF غير قابل للتحديد .
- **التسجيل (Screencast) يعتمد على النشاط:** وليس بمعدل ثابت للفيديو .
- **إدارة البنية التحتية تقع على عاتقك:** لا توجد نسخة سحابية مُدارة بعد (Obscura Cloud في قائمة الانتظار) .

## خلاصة

Obscura ليس مجرد بديل آخر لـ Headless Chrome. إنه إعادة تفكير كاملة في ما يعنيه "متصفح" لوكيل ذكاء اصطناعي. من خلال التخلص من كل ما لا يحتاجه الوكيل، وتقديم تخفٍّ مدمج في المحرك، وتحقيق كفاءة في الذاكرة والبدء تتفوق على Chrome بعشرات المرات، يقدم Obscura حلاً عملياً للمشكلة الأكبر في أتمتة الويب: أن الأدوات الحالية لم تُصمم لهذه المهمة.

إذا كنت تبني وكيلاً يحتاج إلى تصفح الويب، أو تدير عمليات استخراج بيانات واسعة النطاق، أو تبحث عن بديل أخف لـ Headless Chrome، فإن Obscura يستحق تجربة جدية.

## روابط سريعة

[https://github.com/h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura)

[https://obscura.sh](https://obscura.sh)

[https://hub.docker.com/r/h4ckf0r0day/obscura](https://hub.docker.com/r/h4ckf0r0day/obscura)

[https://github.com/h4ckf0r0day/obscura-benchmark](https://github.com/h4ckf0r0day/obscura-benchmark)
