---
layout: post
title: 'دليل شامل: كيف تجهز توزيعتك للألعاب على منصة ستيم وخارجها'
category: gnulinux
author: GNUTUX
excerpt: >-
  لينكس أصبح منصة ألعاب حقيقية. هذا الدليل يشرح الطريقة المثالية لإعداد توزيعتك
  للألعاب، بدءاً من مكونات Steam وProton، مروراً بأدوات إدارة الألعاب الخارجية
  مثل Lutris وHeroic، وصولاً إلى تحسينات الأداء الأساسية مثل GameMode وMangoHud.
image: steamos-gnutux-ar.png
tags:
  - ألعاب لينكس
  - Steam
  - SteamOS
  - Proton
  - Lutris
  - Heroic
  - Flatpak
  - Vulkan
also_in:
  - gaming
date: 2026-10-20T12:10:00.000Z
lang: ar
slug: ultimate-linux-gaming-setup-steam
---

## لينكس: منصة الألعاب الناضجة

لم يعد اللعب على لينكس حكراً على المتحمسين أو حلاً وسطاً. بفضل جهود Valve المستمرة، وتطور طبقة التوافق Proton، أصبحت مكتبة ضخمة من ألعاب ويندوز تعمل على لينكس بسلاسة تامة. لكن الإعداد المثالي لا يقتصر على تثبيت Steam وفتح لعبة. لتحقيق أفضل تجربة، تحتاج إلى فهم المكونات الأساسية والأدوات المساعدة.

هذا الدليل يقدم خارطة طريق عملية لإعداد توزيعتك، سواء كنت تستخدم توزيعة تقليدية مثل Ubuntu أو Fedora، أو توزيعة مخصصة للألعاب مثل Bazzite أو CachyOS.

## الأساس: Steam و Proton

### تثبيت Steam

الطريقة المثلى لتثبيت Steam تختلف حسب توزيعتك. الخيار الأكثر أماناً وعالمية هو **Flatpak**، لأنه يوفر بيئة معزولة ومحدثة باستمرار:

```bash
# تثبيت Steam عبر Flatpak (لجميع التوزيعات)
flatpak install flathub com.valvesoftware.Steam
```

إذا كنت تفضل مدير حزم توزيعتك، يمكنك استخدام:
```bash
# Ubuntu/Debian
sudo apt install steam

# Fedora (يتطلب تفعيل مستودع RPM Fusion)
sudo dnf install steam

# Arch Linux
sudo pacman -S steam
```

### تفعيل Proton

Proton هو طبقة التوافق التي تسمح بتشغيل ألعاب ويندوز على لينكس. لتفعيله:

1. افتح Steam واذهب إلى **Steam > Settings** (الإعدادات).
2. انتقل إلى قسم **Compatibility** (التوافق).
3. فعّل خيار **"Enable Steam Play for all other titles"** (تمكين Steam Play لجميع العناوين الأخرى).
4. اختر أحدث إصدار من Proton (مثل Proton 10.0-4 أو أحدث) من القائمة المنسدلة .

بعد التفعيل، أي لعبة ويندوز في مكتبتك ستظهر مع زر "تثبيت" وستعمل عبر Proton تلقائياً.

### التحقق من التوافق: ProtonDB

قبل شراء أو تثبيت لعبة، تحقق من تقييمها على [ProtonDB](https://www.protondb.com). الموقع يعرض تقييمات من المستخدمين (Platinum, Gold, Silver, Bronze, Borked) وتفاصيل عن أي إصلاحات مطلوبة.

## الألعاب خارج Steam: Lutris و Heroic

مكتبتك ليست كلها على Steam. للعب ألعاب من Epic Games Store أو GOG أو Ubisoft Connect أو حتى ألعاب قديمة، تحتاج إلى أدوات مساعدة.

### Lutris: المدير الشامل

Lutris هو منصة مفتوحة المصدر تجمع كل مصادر الألعاب في مكان واحد. يدعم متاجر متعددة، ويسهل تثبيت الألعاب عبر سكريبتات جاهزة من المجتمع.

```bash
# تثبيت Lutris (يفضل عبر Flatpak للعزل)
flatpak install flathub net.lutris.Lutris
```

### Heroic Games Launcher: بديل Epic و GOG

Heroic هو عميل مفتوح المصدر لمتاجر Epic Games Store و GOG و Amazon Games. يوفر واجهة نظيفة، ويدعم Proton و Wine، ويسمح بإضافة الألعاب إلى مكتبة Steam لتشغيلها من واجهة واحدة .

```bash
flatpak install flathub com.heroicgameslauncher.hgl
```

### ألعاب ويندوز الأخرى (مثل Ubisoft Connect و EA App)

الطريقة الأكثر شيوعاً هي تثبيت برنامج المتجر نفسه كـ "لعبة غير Steam" (Non-Steam Game) في Steam، ثم إجباره على العمل عبر Proton:
1. في Steam، اختر **Games > Add a Non-Steam Game to My Library**.
2. اختر ملف التثبيت `.exe` الخاص بالمتجر.
3. بعد إضافته، انقر عليه بزر الفأرة الأيمن واختر **Properties**.
4. في قسم **Compatibility**، فعّل **"Force the use of a specific Steam Play compatibility tool"** واختر Proton .

## تحسينات الأداء الأساسية

### GameMode: تحسين الأداء تلقائياً

GameMode هو خادم خفيف يعمل في الخلفية ويطبق تحسينات على النظام عند تشغيل لعبة (مثل ضبط حاكم المعالج إلى وضع الأداء، ورفع أولوية العملية).

```bash
# Ubuntu/Debian
sudo apt install gamemode

# Fedora
sudo dnf install gamemode

# Arch Linux
sudo pacman -S gamemode
```

لتشغيل لعبة مع GameMode:
```bash
gamemoderun %command%
```
(أضف هذا السطر في خيارات تشغيل اللعبة في Steam).

### MangoHud: مراقبة الأداء

MangoHud هو طبقة عرض (Overlay) تعرض معلومات الأداء في الوقت الفعلي: الإطارات في الثانية (FPS)، استهلاك المعالج والذاكرة، ودرجات الحرارة. أداة لا غنى عنها لضبط الإعدادات.

```bash
# Ubuntu/Debian
sudo apt install mangohud

# Fedora
sudo dnf install mangohud

# Arch Linux
sudo pacman -S mangohud
```

للاستخدام مع Steam:
```bash
mangohud %command%
```

### Gamescope: مدير النوافذ للألعاب

Gamescope هو مُركّب (Compositor) مصغر طورته Valve، يستخدم في SteamOS. يمكن استخدامه على أي توزيعة لينكس لتحسين الأداء، وإصلاح مشاكل الدقة، وتطبيق تقنيات مثل FSR (FidelityFX Super Resolution) .

مثال على استخدامه في خيارات تشغيل Steam:
```bash
gamescope -W 2560 -H 1440 -r 144 -f -- %command%
```
هذا الأمر يشغل اللعبة بدقة 1440p ومعدل تحديث 144 هرتز، مع ملء الشاشة.

## مقارنة سريعة: SteamOS مقابل التوزيعات التقليدية

Valve أطلقت SteamOS 3.8 كصورة متاحة لأجهزة الحاسوب الشخصي (بشكل أساسي مع بطاقات AMD) . SteamOS يقدم تجربة "جاهزة للعب" مشابهة لوحدات التحكم، مع واجهة موجهة لوحدات التحكم (Game Mode) وبيئة سطح مكتب KDE (Desktop Mode).

| الميزة | SteamOS | توزيعة تقليدية (مثل Ubuntu/Fedora) |
|--------|---------|-------------------------------------|
| **التجربة** | موجهة لوحدات التحكم، جاهزة للعب | سطح مكتب كامل، تحتاج إعداداً |
| **الأجهزة المدعومة** | AMD (رسمياً)، Intel (جزئياً) | جميع الأجهزة (بما فيها NVIDIA) |
| **النظام** | غير قابل للتغيير (Immutable)، تحديثات آمنة | تقليدي، مرن، لكن قد يتعطل بالتعديلات |
| **المرونة** | محدودة في التخصيص العميق | مرونة كاملة |
| **الاستخدام** | ألعاب + استخدام خفيف | ألعاب + عمل + إنتاجية كاملة |

إذا كنت تريد جهازاً مخصصاً للألعاب في غرفة المعيشة، أو جهازاً محمولاً، فإن SteamOS أو توزيعة مبنية عليه (مثل Bazzite) هي الخيار الأمثل. إذا كنت تريد جهازاً واحداً للألعاب والعمل، فالتوزيعة التقليدية مع الأدوات المذكورة أعلاه هي الخيار الأفضل .

## نصائح إضافية

- **Vulkan:** تأكد من تثبيت تعريفات Vulkan الحديثة. على Ubuntu، حزمة `mesa-vulkan-drivers` ضرورية. على Fedora، `vulkan-loader` و `mesa-vulkan-drivers`.
- **تعريفات NVIDIA:** استخدم التعريفات الاحتكارية من NVIDIA (أو `nvidia-open` للأجهزة الحديثة) للحصول على أفضل أداء. على Ubuntu، يمكنك استخدام `ubuntu-drivers install`، أو إضافة PPA الرسمي.
- **Flatpak:** استخدم Flatpak لتثبيت Steam و Lutris و Heroic. يوفر بيئة معزولة، ويتجنب تعارضات المكتبات مع نظامك الأساسي.
- **النسخ الاحتياطي:** قبل تجربة أي أداة أو تعديل، تأكد من وجود نسخة احتياطية من بياناتك، خاصة إذا كنت ستجرب توزيعة جديدة أو تعدل إعدادات النظام.

## خلاصة

إعداد لينكس للألعاب لم يكن أسهل مما هو عليه اليوم. مع Steam و Proton كأساس، و Lutris و Heroic لتغطية المتاجر الأخرى، و GameMode و MangoHud كأدوات تحسين، يمكنك بناء تجربة ألعاب متكاملة على توزيعتك المفضلة. الفرق الرئيسي بين SteamOS والتوزيعات التقليدية هو الفلسفة: الأولى تقدم جهازاً مخصصاً للألعاب، والثانية تقدم جهازاً متعدد الاستخدامات. أيهما تختار يعتمد على احتياجاتك.

## روابط سريعة

[https://store.steampowered.com/steamos/](https://store.steampowered.com/steamos/)

[https://www.protondb.com](https://www.protondb.com)

[https://lutris.net](https://lutris.net)

[https://heroicgameslauncher.com](https://heroicgameslauncher.com)

[https://github.com/ValveSoftware/gamescope](https://github.com/ValveSoftware/gamescope)

نشر في قسم GNU/Linux – ألعاب وتطبيقات
```
