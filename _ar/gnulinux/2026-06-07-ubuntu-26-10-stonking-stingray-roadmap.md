---
layout: post
title: >-
  Ubuntu 26.10 Stonking Stingray: GNOME 51 و GStreamer 1.30 و RISC-V في طريقها
  لأكتوبر
category: gnulinux
author: GNUTUX
excerpt: >-
  كشفت Canonical عن خريطة طريق Ubuntu 26.10 Stonking Stingray، المقرر إصداره في
  15 أكتوبر 2026. سيأتي الإصدار مع GNOME 51 ونواة Linux 7.2 ومكتبة GStreamer
  1.30 بإضافات Rust، ومركز تطبيقات مستقل عن نوع الحزم، ودعم كامل لمعالجات
  RISC-V، والانتقال إلى dbus-broker.
image: ubuntu2610.jpg
tags:
  - Ubuntu
  - '26.10'
  - Stonking Stingray
  - GNOME 51
  - GStreamer
  - RISC-V
  - dbus-broker
  - App Center
date: 2026-06-07T19:35:00.000Z
lang: ar
slug: ubuntu-26-10-stonking-stingray-roadmap
---

## التحضير لـ 28.04 LTS

مع صدور Ubuntu 26.04 LTS "Resolute Raccoon" واستقراره، وجهت Canonical أنظارها بالفعل إلى الدورة التطويرية التالية. إصدار أكتوبر 2026، الذي يحمل الاسم الرمزي "Stonking Stingray"، ليس مجرد إصدار مرحلي عادي. إنه بمثابة حجر الأساس الفعلي للإصدار LTS القادم (28.04)، حيث سيتم اختبار وتحضير التقنيات التي سترثها التوزيعة المستقرة لاحقاً [citation:1][citation:6].

🔗 **المصدر الرسمي:** [discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751](https://discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751)
🔗 **خريطة طريق النواة:** [discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393](https://discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393)

## موعد الإصدار والنواة الجديدة

وفقاً للخطة الزمنية المعلنة، من المتوقع أن يصل Ubuntu 26.10 في **15 أكتوبر 2026** [citation:7][citation:8][citation:10]. مراحل التطوير الرئيسية تشمل تجميد الميزات في 20 أغسطس، والإصدار التجريبي في 24 سبتمبر [citation:1].

على صعيد النواة، اختارت Canonical رسمياً **Linux Kernel 7.2** لتكون النواة المستهدفة لهذا الإصدار [citation:2][citation:10]. التوقعات تشير إلى صدور النواة الأساسية 7.2 من النواة في 30 أغسطس 2026، وهو ما يتوافق تماماً مع الجدول الزمني للتطوير [citation:10]. هذا يتبع سياسة Canonical الجديدة بتزويد كل إصدار بأحدث إصدار رئيسي من النواة متاح في ذلك الوقت.

## بيئة سطح المكتب: GNOME 51

سيأتي Ubuntu 26.10 مزوداً بأحدث إصدار من بيئة سطح المكتب، **GNOME 51** [citation:1][citation:6][citation:9]. هذا الإصدار من المتوقع أن يُصدر في سبتمبر 2026، وسيتم دمجه مباشرة في التوزيعة. يهدف هذا التحديث إلى تحسين تجربة المستخدم، مع واجهة أكثر نظافة وأداء أفضل [citation:9]. هذه الخطوة تتيح للمطورين اختبار أحدث تحسينات GNOME وضمان استقرارها قبل دمجها في الإصدار LTS القادم 28.04 [citation:1].

الصورة أدناه توضح شعار Ubuntu 26.10 مع سمكة الراي اللاسعة:

![Ubuntu 26.10 Stonking Stingray Logo](https://discourse.ubuntu.com/uploads/default/original/1X/8b1f5c0b3e2d4f6a7c8d9e0f1a2b3c4d5e6f7a8b.png)

## GStreamer 1.30 وإضافات Rust

أحد التحسينات الجوهرية في هذا الإصدار هو الانتقال إلى **GStreamer 1.30**، إطار العمل الأساسي للتعامل مع الوسائط المتعددة في Ubuntu [citation:1][citation:6][citation:8]. هذه الخطوة تأتي لمعالجة العقبات التي واجهها المستخدمون سابقاً في تشغيل الوسائط.

إصدار GStreamer 1.30 يجلب معه مجموعة من الإضافات الجديدة المكتوبة بلغة **Rust** [citation:1][citation:8]. استخدام Rust يعزز من أمان وكفاءة هذه المكونات، ويوفر دعماً محسناً لتقنيات HDR10+ و AV1 [citation:4]. أيضاً، تم تحسين آلية اكتشاف وتثبيت برامج الترميز (codecs)، حيث ستصبح الرسائل الموجهة للمستخدم أكثر وضوحاً عند الحاجة إلى تثبيت ترميزات احتكارية لتشغيل تنسيقات معينة [citation:6].

## مركز التطبيقات: محايد للحزم

من أكثر الميزات التي طال انتظارها، هي تحديث **مركز التطبيقات (App Center)** ليصبح مستقلاً عن نوع الحزمة [citation:6][citation:8]. الواجهة الموحدة ستدمج البحث بين تنسيقات **DEB** و **Snap** و **Flatpak** في مكان واحد. هذا يمنح المستخدمين أخيراً الحرية في اختيار تنسيق الحزمة المفضل لديهم (APT، Snap، أو Flatpak) دون الحاجة إلى أدوات منفصلة أو أوامر طرفية، مع الحفاظ على تجربة بحث وتثبيت سلسة.

## الانتقال إلى dbus-broker

كجزء من تحديث البنية التحتية الأساسية، ستنتقل Canonical من `dbus-daemon` التقليدي إلى **dbus-broker** [citation:1][citation:6][citation:8]. هذا التغيير، الذي قد لا يكون مرئياً للمستخدم العادي، يهدف إلى تحسين أداء النظام وموثوقيته وأمانه في إدارة الاتصالات بين العمليات (IPC). إنها ترقية أساسية تجعل النظام أكثر كفاءة في التعامل مع المهام [citation:1].

## دعم معماري RISC-V

يبدو أن Canonical جادة في دعم الهندسة المفتوحة RISC-V. مع الإصدار 26.10، ستقدم Ubuntu تجربة سطح مكتب **كاملة** على الأجهزة المتوافقة مع معيار **RVA23** [citation:1][citation:6][citation:9]. هذا يشكل علامة فارقة للمتبنين الأوائل لهذه المعمارية، حيث سيمكنهم من استخدام Ubuntu كبيئة عمل رئيسية على أجهزتهم، مما يعزز مكانة Ubuntu كمنصة رائدة للحوسبة مفتوحة المصدر [citation:1][citation:5].

## تحسينات إضافية

من بين التحسينات الأخرى التي ستصل في هذا الإصدار:

- **تثبيت وإعداد أولي مبسط**: تجربة تثبيت جديدة تقلل التعقيد خلال تقسيم القرص وإعداد التخزين، مع إعداد أولي (onboarding) لمساعدة المستخدمين الجدد في تخصيص نظامهم [citation:8].
- **إدارة وضوح drivers**: واجهة محسّنة لإدارة برامج التشغيل توفر معلومات أكثر تفصيلاً عن الحالة والتوافق [citation:6].
- **تحسينات إمكانية الوصول**: استكمال العمل نحو الامتثال لمعايير WCAG 2.2 AA، مع تحسينات في النظام البيئي Flutter [citation:1].

## الخلاصة

Ubuntu 26.10 "Stonking Stingray" ليس مجرد إصدار مرحلي عابر. مع اعتماد GNOME 51، ونواة 7.2، و GStreamer 1.30، والانتقال إلى dbus-broker، والخطوة الكبيرة نحو دعم RISC-V، يمثل هذا الإصدار مرحلة نضج كبيرة. إنه بمثابة معمل اختبار مباشر للتقنيات التي ستشكل أساس Ubuntu 28.04 LTS [citation:1][citation:6]. إذا كنت من مستخدمي Ubuntu الذين يحبون البقاء على اطلاع بأحدث ما تقدمه Canonical، فهذا الإصدار يستحق المتابعة عن كثب.

## روابط سريعة

[https://discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751](https://discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751)

[https://discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393](https://discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393)

[https://ubuntu.com/download](https://ubuntu.com/download)

نشر في قسم GNU/Linux – أخبار التوزيعات## التحضير لـ 28.04 LTS

مع صدور Ubuntu 26.04 LTS "Resolute Raccoon" واستقراره، وجهت Canonical أنظارها بالفعل إلى الدورة التطويرية التالية. إصدار أكتوبر 2026، الذي يحمل الاسم الرمزي "Stonking Stingray"، ليس مجرد إصدار مرحلي عادي. إنه بمثابة حجر الأساس الفعلي للإصدار LTS القادم (28.04)، حيث سيتم اختبار وتحضير التقنيات التي سترثها التوزيعة المستقرة لاحقاً [citation:1][citation:6].

🔗 **المصدر الرسمي:** [discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751](https://discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751)
🔗 **خريطة طريق النواة:** [discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393](https://discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393)

## موعد الإصدار والنواة الجديدة

وفقاً للخطة الزمنية المعلنة، من المتوقع أن يصل Ubuntu 26.10 في **15 أكتوبر 2026** [citation:7][citation:8][citation:10]. مراحل التطوير الرئيسية تشمل تجميد الميزات في 20 أغسطس، والإصدار التجريبي في 24 سبتمبر [citation:1].

على صعيد النواة، اختارت Canonical رسمياً **Linux Kernel 7.2** لتكون النواة المستهدفة لهذا الإصدار [citation:2][citation:10]. التوقعات تشير إلى صدور النواة الأساسية 7.2 من النواة في 30 أغسطس 2026، وهو ما يتوافق تماماً مع الجدول الزمني للتطوير [citation:10]. هذا يتبع سياسة Canonical الجديدة بتزويد كل إصدار بأحدث إصدار رئيسي من النواة متاح في ذلك الوقت.

## بيئة سطح المكتب: GNOME 51

سيأتي Ubuntu 26.10 مزوداً بأحدث إصدار من بيئة سطح المكتب، **GNOME 51** [citation:1][citation:6][citation:9]. هذا الإصدار من المتوقع أن يُصدر في سبتمبر 2026، وسيتم دمجه مباشرة في التوزيعة. يهدف هذا التحديث إلى تحسين تجربة المستخدم، مع واجهة أكثر نظافة وأداء أفضل [citation:9]. هذه الخطوة تتيح للمطورين اختبار أحدث تحسينات GNOME وضمان استقرارها قبل دمجها في الإصدار LTS القادم 28.04 [citation:1].

الصورة أدناه توضح شعار Ubuntu 26.10 مع سمكة الراي اللاسعة:

![Ubuntu 26.10 Stonking Stingray Logo](https://discourse.ubuntu.com/uploads/default/original/1X/8b1f5c0b3e2d4f6a7c8d9e0f1a2b3c4d5e6f7a8b.png)

## GStreamer 1.30 وإضافات Rust

أحد التحسينات الجوهرية في هذا الإصدار هو الانتقال إلى **GStreamer 1.30**، إطار العمل الأساسي للتعامل مع الوسائط المتعددة في Ubuntu [citation:1][citation:6][citation:8]. هذه الخطوة تأتي لمعالجة العقبات التي واجهها المستخدمون سابقاً في تشغيل الوسائط.

إصدار GStreamer 1.30 يجلب معه مجموعة من الإضافات الجديدة المكتوبة بلغة **Rust** [citation:1][citation:8]. استخدام Rust يعزز من أمان وكفاءة هذه المكونات، ويوفر دعماً محسناً لتقنيات HDR10+ و AV1 [citation:4]. أيضاً، تم تحسين آلية اكتشاف وتثبيت برامج الترميز (codecs)، حيث ستصبح الرسائل الموجهة للمستخدم أكثر وضوحاً عند الحاجة إلى تثبيت ترميزات احتكارية لتشغيل تنسيقات معينة [citation:6].

## مركز التطبيقات: محايد للحزم

من أكثر الميزات التي طال انتظارها، هي تحديث **مركز التطبيقات (App Center)** ليصبح مستقلاً عن نوع الحزمة [citation:6][citation:8]. الواجهة الموحدة ستدمج البحث بين تنسيقات **DEB** و **Snap** و **Flatpak** في مكان واحد. هذا يمنح المستخدمين أخيراً الحرية في اختيار تنسيق الحزمة المفضل لديهم (APT، Snap، أو Flatpak) دون الحاجة إلى أدوات منفصلة أو أوامر طرفية، مع الحفاظ على تجربة بحث وتثبيت سلسة.

## الانتقال إلى dbus-broker

كجزء من تحديث البنية التحتية الأساسية، ستنتقل Canonical من `dbus-daemon` التقليدي إلى **dbus-broker** [citation:1][citation:6][citation:8]. هذا التغيير، الذي قد لا يكون مرئياً للمستخدم العادي، يهدف إلى تحسين أداء النظام وموثوقيته وأمانه في إدارة الاتصالات بين العمليات (IPC). إنها ترقية أساسية تجعل النظام أكثر كفاءة في التعامل مع المهام [citation:1].

## دعم معماري RISC-V

يبدو أن Canonical جادة في دعم الهندسة المفتوحة RISC-V. مع الإصدار 26.10، ستقدم Ubuntu تجربة سطح مكتب **كاملة** على الأجهزة المتوافقة مع معيار **RVA23** [citation:1][citation:6][citation:9]. هذا يشكل علامة فارقة للمتبنين الأوائل لهذه المعمارية، حيث سيمكنهم من استخدام Ubuntu كبيئة عمل رئيسية على أجهزتهم، مما يعزز مكانة Ubuntu كمنصة رائدة للحوسبة مفتوحة المصدر [citation:1][citation:5].

## تحسينات إضافية

من بين التحسينات الأخرى التي ستصل في هذا الإصدار:

- **تثبيت وإعداد أولي مبسط**: تجربة تثبيت جديدة تقلل التعقيد خلال تقسيم القرص وإعداد التخزين، مع إعداد أولي (onboarding) لمساعدة المستخدمين الجدد في تخصيص نظامهم [citation:8].
- **إدارة وضوح drivers**: واجهة محسّنة لإدارة برامج التشغيل توفر معلومات أكثر تفصيلاً عن الحالة والتوافق [citation:6].
- **تحسينات إمكانية الوصول**: استكمال العمل نحو الامتثال لمعايير WCAG 2.2 AA، مع تحسينات في النظام البيئي Flutter [citation:1].

## الخلاصة

Ubuntu 26.10 "Stonking Stingray" ليس مجرد إصدار مرحلي عابر. مع اعتماد GNOME 51، ونواة 7.2، و GStreamer 1.30، والانتقال إلى dbus-broker، والخطوة الكبيرة نحو دعم RISC-V، يمثل هذا الإصدار مرحلة نضج كبيرة. إنه بمثابة معمل اختبار مباشر للتقنيات التي ستشكل أساس Ubuntu 28.04 LTS [citation:1][citation:6]. إذا كنت من مستخدمي Ubuntu الذين يحبون البقاء على اطلاع بأحدث ما تقدمه Canonical، فهذا الإصدار يستحق المتابعة عن كثب.

## روابط سريعة

[https://discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751](https://discourse.ubuntu.com/t/ubuntu-desktop-26-10-stonking-stingray-roadmap-building-toward-ubuntu-28-04-lts/83751)

[https://discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393](https://discourse.ubuntu.com/t/announcing-7-2-kernel-for-ubuntu-26-10-stonking-stingray/83393)

[https://ubuntu.com/download](https://ubuntu.com/download)
