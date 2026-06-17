---
layout: post
title: >-
  CircleToSearch: بديل مفتوح المصدر لميزة Circle to Search من Google بتحكم كامل
  وخصوصية
category: foss
author: GNUTUX
excerpt: >-
  CircleToSearch هو تطبيق أندرويد مفتوح المصدر يقدم تجربة Circle to Search
  الشهيرة لجميع الأجهزة، مع دعم محركات بحث متعددة (Google وBing وYandex وTinEye
  وChatGPT) وميزة OCR محلية تعمل دون اتصال بالإنترنت، مع الحفاظ على الخصوصية
  وعدم التتبع.
image: circletosearch-gnutux.jpg
tags:
  - CircleToSearch
  - Circle to Search
  - بحث عكسي
  - OCR
  - أندرويد
  - مفتوح المصدر
  - خصوصية
also_in:
  - tech-news
date: 2026-06-17T18:53:00.000Z
lang: ar
slug: circletosearch-open-source-alternative
---

## مشكلة احتكار Circle to Search

ميزة Circle to Search من Google، التي تتيح للمستخدمين تحديد أي جزء من الشاشة والبحث عنه فوراً، كانت حكراً على الأجهزة الرائدة [citation:1][citation:7] مثل Pixel 6 فما فوق [citation:9] و Galaxy S23 فما فوق [citation:8]، مع متطلبات محددة كإصدار أندرويد 13 وضبط Google كمساعد افتراضي [citation:8]. هذا الاحتكار حال دون وصول الميزة للمستخدمين على الأجهزة الأقدم أو من يفضلون بدائل بحث أخرى.

🔗 **المستودع الرسمي:** [github.com/AKS-Labs/CircleToSearch](https://github.com/AKS-Labs/CircleToSearch)

## ما هو CircleToSearch؟

CircleToSearch هو تطبيق أندرويد مفتوح المصدر من AKS-Labs [citation:2]، مبني بلغة Kotlin، مرخص برخصة GPL-3.0-or-later [citation:3][citation:10]، يوفر تجربة Circle to Search المشابهة تماماً، ولكن مع مزايا حاسمة تفتقر لها نسخة Google [citation:8].

وفقاً للمطورين، صُمم التطبيق ليكون مستقلاً عن خدمات Google ويشتغل على أي جهاز يعمل بأندرويد 10 أو أحدث، متجاوزاً بذلك القيود المفروضة على الميزة الأصلية [citation:2][citation:3].

## ما الذي يفعله بشكل مختلف؟

**حرية اختيار محرك البحث**: بدلاً من التقيد بمحرك بحث Google، يوفر التطبيق دعم لعدة محركات [citation:2][citation:3] مثل Google Lens، و Bing Visual Search، و Yandex، و TinEye، و ChatGPT، و Perplexity [citation:2][citation:5][citation:8].

**خصوصية محلية كاملة**: أهم ميزة هي نظام التعرف الضوئي على الحروف (OCR) الذي يعمل بالكامل محلياً على الجهاز باستخدام Tesseract [citation:2][citation:3][citation:6]. هذا يعني أن استخراج النصوص من الصور أو الشاشات يتم دون إرسال أي بيانات إلى الإنترنت [citation:2][citation:3].

**تحكم متقدم بالإظهار**: ميزات إضافية مثل وضع سطح المكتب (Desktop Mode) لعرض نتائج البحث، ومشاركة وحفظ التحديد، وتخصيص واجهة المستخدم [citation:2][citation:5][citation:8].

## الميزات الرئيسية بالتفصيل

### التحديد المرن
يمكن تفعيل الأداة عبر النقر المزدوج على شريط الحالة [citation:2][citation:5]، أو النقرة الطويلة على زر الصفحة الرئيسية بعد تعيين التطبيق كمساعد افتراضي [citation:2][citation:5][citation:8]، أو عبر فقاعة عائمة [citation:2][citation:5]، أو عبر زر في الإعدادات السريعة (Quick Settings Tile) [citation:5]. بعد التفعيل، يمكن رسم دائرة أو مستطيل أو كتابة خربشات لتحديد المنطقة المطلوبة [citation:2][citation:5].

### OCR محلي
محرك التعرف الضوئي على النصوص مدمج يعمل دون اتصال بالإنترنت [citation:2][citation:3]. يتيح نسخ النصوص من أي مكان على الشاشة بسرعة ودون قلق بشأن الخصوصية [citation:5]. يمكن حتى استيراد نماذج Tesseract عالية الدقة للغات أخرى [citation:2][citation:3].

### بحث متعدد المحركات
بعد التحديد، يمكن توجيه البحث إلى أي من المحركات المدعومة [citation:2][citation:3]. في وضع سطح المكتب، تعرض نتائج البحث كاملة كما تظهر على الحاسوب، وهي ميزة مفيدة جداً للمطورين والباحثين [citation:5][citation:8].

### مسح ذكي وتحديد الكيانات
الميزة الذكية هي التعرف على الكيانات (SmartScan) التي تكتشف QR codes [citation:5]، الروابط، أرقام الهواتف، وعناوين البريد الإلكتروني، مع إتاحة اتخاذ إجراء مباشر منها [citation:5].

## الخصوصية والأمان

باعتبار التطبيق مفتوح المصدر، يمكن مراجعة الكود للاطمئنان على أنه لا يقوم بتتبع أو جمع بيانات [citation:2][citation:8]. يعمل بشكل مستقل عن خدمات Google Play أو برامج المصنعين الخاصة [citation:2][citation:3]. التطبيق متاح عبر F-Droid [citation:3]، وهو متجر موثوق للتطبيقات مفتوحة المصدر.

## التثبيت

يمكن تحميل التطبيق من صفحة الإصدارات على GitHub [citation:2] أو من F-Droid [citation:3].

## الخلاصة

CircleToSearch ليس مجرد تقليد لميزة Circle to Search من Google، بل هو تطوير حقيقي لها. يمنح المستخدمين الحرية في اختيار محرك البحث، ويوفر خصوصية لا مثيل لها عبر معالجة OCR المحلية، ويكسر احتكار الميزة للأجهزة الغالية. إذا كنت مستخدماً للأندرويد تبحث عن أداة بحث مرئية تضع الخصوصية والاختيار في المقدمة، فإن هذا المشروع يستحق التجربة.

## روابط سريعة

[https://github.com/AKS-Labs/CircleToSearch](https://github.com/AKS-Labs/CircleToSearch)

[https://f-droid.org/en/packages/com.akslabs.circletosearch/](https://f-droid.org/en/packages/com.akslabs.circletosearch/)

[https://github.com/AKS-Labs/CircleToSearch/releases](https://github.com/AKS-Labs/CircleToSearch/releases)

نشر في قسم البرمجيات الحرة مفتوحة المصدر – تطبيقات أندرويد وإنتاجية
