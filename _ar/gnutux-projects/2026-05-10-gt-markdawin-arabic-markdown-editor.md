---
layout: post
title: 'GT-MARKDAWIN: محرر مارك داون عربي متكامل يعمل دون إنترنت'
category: gnutux-projects
author: GNUTUX
excerpt: >-
  GT-MARKDAWIN هو محرر Markdown عربي متكامل ومستقل، مبني بـ Electron وReact
  وTypeScript، يعمل بالكامل دون اتصال بالإنترنت على لينكس وأندرويد.
image: markdawin-ar.jpg
tags:
  - محرر نصوص
  - Markdown
  - عربي
  - Linux
  - Android
  - Electron
  - React
  - FOSS
date: '2026-05-10'
lang: ar
slug: gt-markdawin-arabic-markdown-editor
---

## الكتابة بالعربية تحتاج أدوات خاصة

لطالما عانى الكتّاب والمطورون العرب من نقص الأدوات المتخصصة. معظم محررات Markdown إما تفتقر لدعم RTL، أو لا تحتوي على خطوط عربية مدمجة، أو تتطلب اتصالاً بالإنترنت.

**GT-MARKDAWIN** — أو "مارك دَوِّنْ" — صُمم خصيصاً لسد هذه الفجوة.

> 🔗 الموقع الرسمي: [salehgnutux.github.io/GT-MARKDAWIN](https://salehgnutux.github.io/GT-MARKDAWIN/)
> 🔗 المستودع: [github.com/SalehGNUTUX/GT-MARKDAWIN](https://github.com/SalehGNUTUX/GT-MARKDAWIN)

---

## ما هو GT-MARKDAWIN؟

GT-MARKDAWIN هو **محرر Markdown عربي متكامل** مفتوح المصدر، يعمل كتطبيق مستقل على سطح المكتب (Linux) وعلى الهواتف الذكية (Android). الميزة الأهم: **يعمل بالكامل دون أي اتصال بالإنترنت**.

| التقنية | الإصدار | الدور |
|---------|---------|-------|
| **Electron** | 33 | نافذة مستقلة على سطح المكتب + IPC + PDF |
| **Capacitor** | 8 | تطبيق Android أصيل |
| **React** | 18 | واجهة المستخدم التفاعلية |
| **TypeScript** | 5.7 | أمان الأنواع |
| **Vite** | 6 | بناء فائق السرعة |
| **marked** | 15 | تحليل Markdown |
| **KaTeX** | 0.16 | المعادلات الرياضية |
| **highlight.js** | 11 | تمييز الكود البرمجي |

---

## الميزات الرئيسية

### 📝 محرر متقدم للغة العربية
- **دعم كامل لـ RTL/LTR** — تبديل اتجاه النص دون التأثير على واجهة البرنامج
- **خط المحرر ثابت** (Noto Sans Arabic) لوضوح الكتابة العربية
- **خط المعاينة والتصدير** قابل للتغيير من 8 خطوط عربية مدمجة + استيراد خطوط مخصصة
- **بحث واستبدال** مع عدّ التكرارات والتنقل بينها
- **لوحة إيموجي** — أكثر من 3600 إيموجي مصنّف بالعربية والإنجليزية
- **السحب والإفلات** لفتح الملفات فوراً
- **حفظ تلقائي** كل 30 ثانية + سجل تراجع يحتفظ بـ 50 حالة

### 👁️ معاينة احترافية
- **تحديث فوري** للمعاينة أثناء الكتابة
- **تمييز الكود البرمجي** بألوان GitHub — يدعم 20+ لغة برمجة
- **معادلات KaTeX** الرياضية
- **ثلاثة أوضاع عرض**: مقسّم · محرر فقط · معاينة فقط

### 📤 تصدير متكامل

| الصيغة | سطح المكتب (Electron) | Android |
|--------|----------------------|---------|
| **Markdown** `.md` | حوار حفظ أصيل | يُحفظ في Documents/MARKDAWIN/ |
| **HTML** `.html` | حوار حفظ أصيل | يُحفظ في Documents/MARKDAWIN/ |
| **PDF** | printToPDF مع تضمين الخط | يُحفظ HTML جاهز للطباعة |

### 🔒 خصوصية كاملة
- **لا خوادم خارجية** — كل شيء يعمل محلياً
- **لا إنترنت مطلوب** — يعمل في وضع عدم الاتصال
- **لا تتبع ولا تحليلات** — بياناتك لك وحدك

---

## التحميل والتثبيت

| الحزمة | المنصة | الرابط |
|--------|--------|--------|
| **AppImage** | جميع توزيعات Linux | [تحميل](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN-3.0.0-x86_64.AppImage) |
| **DEB** | Ubuntu / Debian / Mint | [تحميل](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN_3.0.0_amd64.deb) |
| **RPM** | Fedora / RHEL / CentOS | [تحميل](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN-3.0.0-x86_64.rpm) |
| **Flatpak** | جميع توزيعات Linux | [تحميل](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN-3.0.0.flatpak) |
| **APK** | Android 7.0+ | [تحميل](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases/download/GT-MARKDAWIN-3.0/GT-MARKDAWIN-3.0.0.apk) |

> 🔗 جميع الإصدارات: [github.com/SalehGNUTUX/GT-MARKDAWIN/releases](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases)

---

## استخدم مباشرة من المتصفح

لا ترغب في تثبيت أي شيء؟ يمكنك استخدام المحرر مباشرة من متصفحك:

- **الإصدار 3.0 (الأحدث)**: [GT-MARKDAWIN-v3.0/dist/index.html](https://salehgnutux.github.io/GT-MARKDAWIN/GT-MARKDAWIN-v3.0/dist/index.html)
- **الإصدار 2.0 (الكلاسيكي)**: [GT-MARKDAWIN-v2.0/index.html](https://salehgnutux.github.io/GT-MARKDAWIN/GT-MARKDAWIN-v2.0/index.html)

---

## الخطوط العربية المدمجة

| الخط | الطراز | مثالي لـ |
|------|--------|---------|
| **Ubuntu Arabic** *(افتراضي)* | عصري واضح | كتابة عامة، مستندات |
| **Amiri Quran** | خطي كلاسيكي | نصوص قرآنية |
| **Uthmanic Hafs** | عثماني أصيل | المصحف الشريف |
| **Arslan Wessam** | فني زخرفي | عناوين، شعارات |
| **Noto Sans Arabic** | حديث متعدد الأوزان | واجهات، كود |

> **خط المحرر ثابت** على Noto Sans Arabic لوضوح الكتابة. **خط المعاينة والتصدير** يتغير حسب اختيارك. يمكن أيضاً **استيراد خطوط مخصصة** (TTF/OTF/WOFF/WOFF2).

---

## مقارنة مع الإصدار السابق

| الميزة | v2.0 | v3.0 |
|--------|------|------|
| **تقنية البناء** | HTML/JS/CSS | Electron + React + TypeScript |
| **تصدير PDF احترافي** | ❌ محدود | ✅ مع تضمين الخطوط |
| **تمييز الكود** | أساسي | 20+ لغة برمجة |
| **حفظ تلقائي** | ❌ | ✅ كل 30 ثانية |
| **تطبيق Android** | ❌ | ✅ عبر Capacitor |
| **استيراد خطوط** | ❌ | ✅ TTF/OTF/WOFF |
| **لوحة إيموجي** | أساسية | 3600+ إيموجي |
| **سجل التراجع** | محدود | 50 حالة |

---

## لماذا هذا مهم لمجتمع FOSS العربي؟

> **GT-MARKDAWIN** ليس مجرد محرر نصوص — إنه خطوة نحو استقلالية الأدوات البرمجية العربية.

### الفوائد الرئيسية:
- **أداة مبنية خصيصاً للعربية** — ليست مجرد ترجمة لواجهة محرر إنجليزي
- **خصوصية مطلقة** — لا خوادم، لا تتبع، بياناتك على جهازك فقط
- **مفتوح المصدر بالكامل** — رخصة GPL-3.0، يمكن لأي شخص التدقيق أو التطوير أو التوزيع
- **دعم المنصات الحرة** — لينكس هو المنصة الأساسية، وليس فكرة لاحقة
- **مجتمع عربي** — وثائق ودعم باللغة العربية

---

## روابط سريعة

- 🌐 **الموقع الرسمي**: [salehgnutux.github.io/GT-MARKDAWIN](https://salehgnutux.github.io/GT-MARKDAWIN/)
- 💻 **مستودع GitHub**: [github.com/SalehGNUTUX/GT-MARKDAWIN](https://github.com/SalehGNUTUX/GT-MARKDAWIN)
- 📥 **جميع الإصدارات**: [github.com/SalehGNUTUX/GT-MARKDAWIN/releases](https://github.com/SalehGNUTUX/GT-MARKDAWIN/releases)
- 🚀 **جرّب مباشرة (v3.0)**: [GT-MARKDAWIN-v3.0/dist/index.html](https://salehgnutux.github.io/GT-MARKDAWIN/GT-MARKDAWIN-v3.0/dist/index.html)
- 📰 **أخبار غنوتوكس التقني**: [salehgnutux.github.io/GT-NEWSTECH](https://salehgnutux.github.io/GT-NEWSTECH)
- 🌍 **مشاريع غنوتوكس**: [salehgnutux.github.io/gnutux](https://salehgnutux.github.io/gnutux/)
- 🐘 **Mastodon**: [linuxrocks.online/@gnutux](https://linuxrocks.online/@gnutux)
- 📺 **YouTube**: [youtube.com/@gnutux](https://www.youtube.com/@gnutux)
- 🐦 **Twitter/X**: [twitter.com/GnuGnutux](https://twitter.com/GnuGnutux)

---

## خلاصة

**GT-MARKDAWIN ليس مجرد محرر Markdown آخر — إنه إعادة تفكير في كيفية تعامل الكتّاب والمطورين العرب مع النصوص.**

بدمج Electron وReact مع دعائم عربية عميقة (RTL، خطوط مدمجة، تصدير PDF مع خطوط مضمنة)، يقدم المشروع تجربة كتابة عربية لا توجد في أي محرر Markdown آخر — والأهم: **كل شيء يعمل دون إنترنت، وبياناتك تبقى على جهازك**.

إذا كنت كاتباً أو مطوراً عربياً تبحث عن محرر يكون **ملكك بالكامل**، فهذا المشروع يستحق التحميل الفوري.

---
