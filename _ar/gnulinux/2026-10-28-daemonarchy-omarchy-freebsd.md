---
layout: post
title: 'Daemonarchy: عندما ينتقل Omarchy من لينكس إلى FreeBSD بمساعدة الذكاء الاصطناعي'
category: gnulinux
author: GNUTUX
excerpt: >-
  بعد نجاح Omarchy على Arch Linux، قرر أحد مؤسسي FreeBSD، جوردان هوبارد، نقل نفس
  التجربة إلى FreeBSD في مشروع أطلق عليه Daemonarchy. تعرف على المشروعين، الفروق
  بينهما، ما تم إنجازه، وما ينتظره المستخدمون.
image: daemonarchy-omarchy-freebsd-gnutux-ar.jpg
tags:
  - Daemonarchy
  - Omarchy
  - FreeBSD
  - Hyprland
  - Jordan Hubbard
  - DHH
  - Wayland
  - BSD
also_in:
  - foss
date: 2026-10-28T09:12:00.000Z
lang: ar
slug: daemonarchy-omarchy-freebsd
---

## من Arch إلى FreeBSD: نفس التجربة، أساس مختلف

في عالم البرمجيات الحرة، نادراً ما نرى مشروعاً يقرر نقل تجربة سطح مكتب كاملة من نظام تشغيل إلى آخر. لكن هذا بالضبط ما حدث عندما قرر **جوردان هوبارد**، أحد مؤسسي FreeBSD الثلاثة عام 1993، أن يأخذ تجربة **Omarchy** التي اشتهرت على Arch Linux، ويعيد بناءها لتعمل على FreeBSD.

النتيجة هي **Daemonarchy**، وهو مشروع مستقل تماماً، غير مرتبط رسمياً بـ Omarchy أو مشروع FreeBSD [citation:8].

🔗 **Omarchy (الأصل):** [omarchy.org](https://omarchy.org)
🔗 **Daemonarchy (النسخة):** [github.com/jordanhubbard/daemonarchy](https://github.com/jordanhubbard/daemonarchy)

## ما هو Omarchy؟

قبل الخوض في Daemonarchy، من الضروري فهم الأصل. **Omarchy** هو مشروع من تطوير **ديفيد هاينماير هانسون (DHH)**، مؤسس Ruby on Rails و Basecamp. الفكرة مستوحاة من مفهوم "Omakase" الياباني (تفويض الاختيار للطاهي)، لكن هنا الطاهي هو DHH، والوجبة هي بيئة تطوير كاملة جاهزة للعمل [citation:5].

Omarchy ليس توزيعة مستقلة، بل هو **مجموعة من الإعدادات والأدوات** التي تحول تثبيت Arch Linux خام إلى بيئة عمل جاهزة تعتمد على **Hyprland** (مدير نوافذ Wayland) و **Neovim**، مع تركيز على العمل عبر لوحة المفاتيح. يتضمن أدوات مثل Alacritty (طرفية)، Waybar (شريط الحالة)، ومجموعة من السمات البصرية الموحدة [citation:14]. الفكرة هي إنهاء ساعات الإعداد اليدوي، والبدء في العمل فوراً.

## ما هو Daemonarchy؟

**Daemonarchy** هو محاولة جوردان هوبارد لنقل تجربة Omarchy إلى FreeBSD. الاسم نفسه يلعب على كلمة "Omarchy" و"Daemon" (الشيطان الصغير، تميمة FreeBSD) [citation:4].

### كيف بدأ المشروع؟
القصة بدأت من نقاش على LinkedIn. بعض المستخدمين اشتكوا من صعوبة إعداد FreeBSD على أجهزة حديثة، واقترح أحدهم أن FreeBSD تحتاج إلى "Omarchy" الخاصة بها. جوردان هوبارد، الذي كان يختبر نموذج **GPT Astra 6** من OpenAI في ذلك الوقت، قرر أن يجرب بنفسه. النتيجة: النسخة الأولية من المشروع اكتملت في **أقل من ساعتين** (دون احتساب وقت بناء واختبار الحزم). حتى اسم المشروع نفسه كان من اقتراح الذكاء الاصطناعي [citation:4].

### ما الذي يقدمه؟
Daemonarchy ليس توزيعة جديدة، بل هو **صورة ISO قابلة للإقلاع** (بحجم يقارب 2 جيجابايت) تحتوي على FreeBSD 16.0-CURRENT مع سطح مكتب Omarchy (Hyprland) معدل ليعمل على FreeBSD [citation:4][citation:11].

### الفروق التقنية بين النسختين

| الجانب | Omarchy (لينكس) | Daemonarchy (FreeBSD) |
|--------|-----------------|------------------------|
| **الأساس** | Arch Linux | FreeBSD 16.0-CURRENT |
| **مدير الحزم** | pacman | pkg (مع OctoPkg كواجهة رسومية) |
| **إدارة الواي فاي** | NetworkManager | wpa_supplicant |
| **الصوت** | PipeWire | PipeWire |
| **البلوتوث** | عبر BlueZ | عبر FreeBSD Bluetooth Stack |
| **التثبيت** | سكربت على Arch موجود | ISO مستقل مع مثبت رسومي |
| **النسخ الاحتياطي** | Snapper (Btrfs) | ZFS Boot Environments |
| **العزل** | حاويات (Docker/Podman) | Jails |
| **الافتراضية** | QEMU/KVM | bhyve |
| **المتطلبات** | 40 جيجابايت مساحة | 40 جيجابايت مساحة + إنترنت أثناء التثبيت |

بالإضافة إلى ذلك، يضيف Daemonarchy أدوات FreeBSD الأصلية إلى قائمة النظام: Jails (بيئات معزولة)، bhyve (افتراضية)، و DTrace (مراقبة النظام) [citation:13].

### ما تم إنجازه حتى الآن؟
المشروع لا يزال في مراحله المبكرة جداً، لكنه يتقدم بوتيرة مذهلة. من الإصدار 1.0.0 في 9 أكتوبر إلى الإصدار **1.3.1** في 25 أكتوبر، أي 10 إصدارات في أقل من شهر . تم إدخال الحزم اللازمة إلى شجرة Ports الرسمية لـ FreeBSD (رغم أن بعضها لا يزال قيد المراجعة) [citation:4].

### ما ينتظره المستخدمون؟
هناك عدة تحديات وطموحات:
- **الاستقرار:** FreeBSD 16.0-CURRENT هو فرع تطويري (وليس إصداراً مستقراً). كل صورة ISO مرتبطة بلقطة (snapshot) محددة من هذا الفرع. هذا يعني أن النظام قد لا يكون مستقراً بما يكفي للاستخدام اليومي بعد [citation:4].
- **دعم العتاد:** بعض بطاقات الرسوميات (خاصة NVIDIA في الإصدارات الأولى) والواي فاي المؤسسي والبلوتوث الصوتي لا تزال بحاجة إلى اختبارات [citation:13].
- **تطبيقات لينكس:** بعض التطبيقات الحصرية لنظام لينكس تحتاج إلى اختبار عبر **Linuxulator** (طبقة التوافق في FreeBSD) قبل أن تعمل [citation:4].
- **المستقبل:** جوردان هوبارد يعمل على إدخال المشروع بشكل أعمق في FreeBSD، وهناك تعاون مع مشروع **HyprBSD** (الذي يقدم تجربة Hyprland مماثلة) لتبادل الإصلاحات التقنية [citation:7].

## خلاصة

Daemonarchy هو مشروع مثير للاهتمام، ليس فقط لأنه ينقل تجربة Omarchy إلى FreeBSD، بل لأنه يظهر كيف يمكن للذكاء الاصطناعي تسريع تطوير البرمجيات الحرة بشكل جذري. جوردان هوبارد، بمزيج من خبرته الطويلة في FreeBSD وأدوات الذكاء الاصطناعي الحديثة، تمكن من بناء شيء كان يبدو مستحيلاً قبل أشهر: سطح مكتب Wayland حديث وسهل التثبيت على نظام BSD.

لكنه لا يزال مشروعاً تجريبياً. من يريد تجربة Omarchy على FreeBSD يمكنه متابعته بحماس، لكن مع إدراك أن الاستقرار الكامل لم يأت بعد. ومن يريد تجربة Omarchy الأصلية على Arch Linux، فلديه خيار ناضج ومستقر.

## روابط سريعة

[Omarchy — الموقع الرسمي](https://omarchy.org)

[Daemonarchy — مستودع GitHub](https://github.com/jordanhubbard/daemonarchy)

[Daemonarchy — دليل التثبيت (It's FOSS)](https://itsfoss.com/news/daemonarchy-overview/)

[HyprBSD — مشروع شقيق على FreeBSD](https://linuxgratis.com/en/articles/hyprbsd-daemonarchy-virtio-graphics-freebsd)

نشر في قسم GNU/Linux – توزيعات وأخبار
