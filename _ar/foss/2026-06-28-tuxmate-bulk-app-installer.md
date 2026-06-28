---
layout: post
title: 'TuxMate: أداة لتثبيت مئات التطبيقات دفعة واحدة على لينكس'
slug: tuxmate-bulk-app-installer
lang: ar
category: foss
date: 2026-06-28T18:20:00.000Z
author: GNUTUX
excerpt: >-
  TuxMate هو تطبيق ويب مفتوح المصدر يسمح لمستخدمي لينكس بتثبيت مئات التطبيقات
  الشائعة دفعة واحدة، عبر واجهة بسيطة تعتمد على الاختيار من قائمة وتوليد أوامر
  التثبيت المناسبة للتوزيعة المستخدمة.
image: tuxmate-gnutux.webp
tags:
  - TuxMate
  - تثبيت تطبيقات
  - أدوات لينكس
  - إنتاجية
  - مفتوح المصدر
also_in:
  - gnulinux
---

## مشكلة تثبيت التطبيقات بعد تثبيت نظام جديد

أي شخص قام بتثبيت توزيعة لينكس جديدة يعرف هذه المرحلة المملة: بعد الانتهاء من تثبيت النظام، تبدأ رحلة البحث عن التطبيقات التي تحتاجها. تفتح متجر البرامج، تبحث عن Firefox، ثم تثبته. تبحث عن GIMP، تثبته. تبحث عن VLC، تثبته. تكرر هذه العملية لعشرات التطبيقات. إذا كنت من مستخدمي سطر الأوامر، قد تلجأ إلى كتابة أوامر `sudo apt install` أو `sudo dnf install` لكل تطبيق على حدة، وهو أيضاً عمل متكرر وممل.

TuxMate جاء ليحل هذه المشكلة بطريقة بسيطة وأنيقة.

🔗 **الموقع الرسمي:** [tuxmate.com](https://tuxmate.com)
🔗 **مستودع GitHub:** [github.com/MikeTheHash/TuxMate](https://github.com/MikeTheHash/TuxMate)

## ما هو TuxMate؟

TuxMate هو تطبيق ويب مفتوح المصدر، صُمم ليكون "أداة تثبيت التطبيقات المجمعة" (Bulk App Installer) لنظام لينكس . الفكرة بسيطة: بدلاً من تثبيت كل تطبيق على حدة، تختار جميع التطبيقات التي تريدها من قائمة، وتضغط زراً واحداً، ويقوم TuxMate بإنشاء الأمر المناسب لتثبيتها كلها دفعة واحدة.

التطبيق يعمل عبر المتصفح، ولا يحتاج إلى تثبيت. يقوم بتوليد أوامر التثبيت المناسبة حسب توزيعتك (سواء كنت تستخدم APT، DNF، Pacman، Zypper، أو Flatpak) ثم يسمح لك بنسخها ولصقها في الطرفية .

## قائمة التطبيقات الهائلة

يضم TuxMate قائمة ضخمة من التطبيقات مقسمة إلى فئات، تشمل تقريباً كل ما يحتاجه مستخدم لينكس :

المتصفحات: Firefox، Chromium، Brave، LibreWolf، Waterfox، Tor Browser، Google Chrome، Zen Browser، Helium، Vivaldi، Ungoogled Chromium، Konqueror، Falkon، GNOME Web، qutebrowser، Nyxt، Floorp، Mullvad Browser، Microsoft Edge، Opera.

أدوات الألعاب: Steam، Lutris، Heroic، Prism Launcher، RetroArch، MangoHud، GameMode، ProtonUp-Qt، AntiMicroX، GOverlay.

برامج الإبداع والتصميم: Blender، GIMP، Inkscape، Krita، Darktable، FreeCAD، KiCad، UltiMaker Cura، Godot Engine، KolourPaint، OrcaSlicer، DaVinci Resolve.

أدوات التطوير: Cursor، VS Code، VSCodium، Zed، IntelliJ IDEA، PyCharm، CLion، Arduino IDE، Sublime Text، Kate، Geany، Neovim، Vim، Helix، Micro، Emacs، Git، Git LFS، LazyGit، Docker، Podman، Podman Desktop، Incus، kubectl، Vagrant، VirtualBox، GNOME Boxes، DBeaver، Meld، Wireshark، Postman، Bruno، Hoppscotch، Yaak، Virt Manager، ImHex، CMake.

أدوات الذكاء الاصطناعي: OpenCodescript، OpenAI Codex، Gemini CLI، Claude Code، Ollama، llama.cpp، Jan.

تطبيقات التواصل: Discord، Vesktop، Stoat، Telegram، Signal، Slack، Zoom، Thunderbird، Element، Nheko، Cinny، Fluffy Chat، Halloy، Dino.

الوسائط المتعددة: VLC، mpv، Celluloid، Strawberry، Spotify، Audacity، Kdenlive، OBS Studio، FFmpeg، HandBrake، Stremio، Kodi، Haruna، Shortwave، Parabolic.

الإنتاجية والمكتب: LibreOffice، OnlyOffice، Obsidian، Logseq، Joplin، Okular، Zathura، Calibre، Xournal++، Zotero، Trilium Notes.

أدوات الأمان والخصوصية: Bitwarden، KeePassXC، VeraCrypt، GnuPG، Firejail، ClamAV، Ente Auth، IVPN، Proton VPN، Mullvad VPN، Tailscale، WireGuard، OpenVPN.

أدوات النظام: GParted، KDE Partition Manager، KDE Connect، Timeshift، BleachBit، Flameshot، GNOME Tweaks، dconf Editor، BorgBackup، Restic، Flatpak، Filelight، Conky، FSearch، Resources، CPU-X، Mission Center، OpenRGB.

أدوات الشبكة والطرفية: Nmap، OpenSSH، Remmina، Python 3، Node.js، Go، Rust، Ruby، PHP، OpenJDK، Deno، Bun، npm، pnpm، yarn، uv، Zsh، Oh My Zsh، Fish، Starship، Alacritty، Kitty، WezTerm، Foot، Ghostty، Ptyxis، btop، htop، fastfetch، eza، bat، fzf، ripgrep، zoxide، tldr، wget، curl، aria2، yazi، ranger، ncdu، fd، tmux، Zellij، Superfile، rsync.

هذه القائمة غير شاملة؛ الموقع يضيف تطبيقات جديدة باستمرار.

## سهولة الاستخدام

استخدام TuxMate بسيط للغاية:

1. افتح الموقع [tuxmate.com](https://tuxmate.com) في متصفحك.
2. تصفح التطبيقات (يمكنك البحث بالاسم أو التصفية حسب الفئة).
3. اضغط على أيقونة "+" بجانب كل تطبيق تريد تثبيته.
4. بعد اختيار جميع التطبيقات، اضغط على الزر الذي يظهر في الأسفل لعرض أمر التثبيت الموحد.
5. انسخ الأمر والصقه في الطرفية.

يعمل TuxMate مع معظم مديري الحزم الشائعة: APT (أوبونتو/ديبيان)، DNF (فيدورا)، Pacman (آرتش)، Zypper (أوبن سوزي). كما يدعم Flatpak للتطبيقات العالمية.

## لماذا TuxMate؟

هناك أسباب متعددة تجعل TuxMate أداة مفيدة:

للمستخدمين الجدد، يوفر TuxMate طريقة سهلة لاستكشاف واكتشاف التطبيقات الشائعة التي قد لا يعرفون بوجودها. بدلاً من التصفح العشوائي لمتجر البرامج، يرون قائمة منظمة بكل ما هو متاح.

للمحترفين الذين يعيدون تثبيت النظام بشكل دوري، يوفر TuxMate وقتاً كبيراً. بدلاً من كتابة أوامر طويلة يدوياً، يختارون التطبيقات من واجهة رسومية وينسخون أمراً واحداً.

للمطورين الذين يريدون بيئة تطوير متكاملة، يمكن اختيار جميع أدوات التطوير دفعة واحدة: محرر الكود، Git، Docker، لغات البرمجة، وأدوات قواعد البيانات.

## القيود الحالية

TuxMate لا يزال في مراحله الأولى، وله بعض القيود:

أولاً، التطبيق لا يقوم بالتثبيت تلقائياً. يولد أمراً للتثبيت، ولكن يجب على المستخدم نسخه ولصقه في الطرفية. هذا مقصود لأسباب أمنية (لن يسمح أي موقع ويب بتشغيل أوامر على نظامك دون موافقتك).

ثانياً، بعض التطبيقات قد لا تكون متوفرة في جميع التوزيعات. على سبيل المثال، بعض التطبيقات متوفرة فقط عبر Flatpak، بينما البعض الآخر متوفر فقط في مستودعات التوزيعة.

ثالثاً، القائمة كبيرة جداً وقد تكون مربكة للمستخدمين الجدد. لكن التصنيفات تساعد في التنظيم.

## الخلاصة

TuxMate هو أداة بسيطة لكنها عملية جداً لأي مستخدم لينكس. إذا كنت تثبت نظاماً جديداً، أو تريد تجربة تطبيقات جديدة، أو ترغب في توفير الوقت عند إعداد بيئة عمل جديدة، فهذه الأداة تستحق الزيارة. كونها مفتوحة المصدر، يمكن للمطورين المساهمة في إضافة تطبيقات جديدة أو تحسين الواجهة.

## روابط سريعة

[https://tuxmate.com](https://tuxmate.com)

[https://github.com/MikeTheHash/TuxMate](https://github.com/MikeTheHash/TuxMate)

نشر في قسم البرمجيات الحرة مفتوحة المصدر – أدوات إنتاجية
