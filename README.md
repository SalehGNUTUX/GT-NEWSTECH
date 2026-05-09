# GT-NEWSTECH — GNUTUX NEWS TECH

موقع إخباري وتقني مفتوح المصدر، يغطي مشاريع GNUTUX، البرمجيات الحرة، غنو/لينكس، أخبار التقنية، الذكاء الاصطناعي، وألعاب لينكس — **بالعربية والإنجليزية**.

**الموقع:** https://SalehGNUTUX.github.io/GT-NEWSTECH  
**الترخيص:** GNU Affero General Public License v3.0

---

## الأقسام / Sections

الأقسام تُدار من ملف واحد: `_data/categories.yml` — أي قسم جديد يُضاف فيه يظهر تلقائياً في كل مكان.

| القسم | Section | الأيقونة |
|---|---|---|
| مشاريع GNUTUX | GNUTUX Projects | `fa-terminal` |
| البرمجيات الحرة | Free & Open Source | `fa-code` |
| غنو/لينكس | GNU/Linux | `fa-linux` |
| أخبار التقنية | Tech News | `fa-microchip` |
| الذكاء الاصطناعي | AI News | `fa-robot` |
| ألعاب لينكس | Linux Gaming | `fa-gamepad` |

---

## هيكل المشروع

```
GT-NEWSTECH/
├── _config.yml                  # إعدادات Jekyll الرئيسية
├── _config.local.yml            # إعدادات محلية (baseurl فارغ) — gitignored
│
├── _data/
│   └── categories.yml           # ← المصدر الوحيد لتعريف الأقسام
│
├── _layouts/
│   ├── default.html             # القالب الأساسي — ديناميكي الأقسام
│   ├── home.html                # الصفحة الرئيسية — ديناميكية
│   ├── post.html                # صفحة المقال (TOC, مشاركة, أفيلييت)
│   ├── category.html            # صفحة القسم — أيقونة ولون ديناميكيان
│   ├── archive.html             # أرشيف اللغة
│   └── page.html                # الصفحات الثابتة
│
├── _includes/
│   ├── article-card.html        # بطاقة المقال — ديناميكية الألوان
│   ├── affiliate-disclosure.html # إفصاح أفيلييت تلقائي
│   └── seo-jsonld.html          # بيانات JSON-LD
│
├── assets/
│   ├── css/style.css            # ذهبي × أسود + وضع داكن + responsive
│   ├── js/theme.js              # تبديل الوضع الداكن/الفاتح
│   ├── js/main.js               # TOC, بحث, تقدم القراءة, مشاركة
│   ├── images/ar/ + images/en/  # صور المقالات
│   └── icons/gt-newstech-icon.png
│
├── _ar/ + _en/                  # مقالات (مجلد لكل قسم)
│   ├── gnutux-projects/
│   ├── foss/ / gnulinux/ / tech-news/ / ai/ / gaming/
│
├── ar/ + en/
│   ├── index.html               # صفحة رئيسية لكل لغة
│   ├── category/<id>.html       # صفحة لكل قسم
│   └── terms.md, privacy.md, rss-terms.md
│
├── admin/                       # لوحة التحكم المحلية — لا تُنشر
│   ├── server.js                # Express API (articles, images, categories, git)
│   ├── package.json             # express, gray-matter, multer, sharp, js-yaml
│   └── public/                  # واجهة SPA (HTML/CSS/JS)
│
├── .github/workflows/pages.yml  # نشر GitHub Actions
├── search.json                  # فهرس البحث
├── robots.txt
├── Gemfile
├── start.sh                     # تشغيل الموقع + لوحة التحكم معاً
├── serve.sh                     # تشغيل الموقع فقط
└── admin-start.sh               # تشغيل لوحة التحكم فقط
```

---

## التشغيل المحلي

```bash
bash start.sh
# الموقع      → http://localhost:4000/
# لوحة التحكم → http://localhost:4001/
# Ctrl+C للإيقاف
```

السكريبت يُنشئ `_config.local.yml` تلقائياً إن غاب، ويثبت Ruby وNode والحزم عند أول تشغيل.

> بعد حفظ أي مقال من لوحة التحكم، اضغط **F5** في المتصفح لرؤية التغييرات.

---

## لوحة التحكم

| الصفحة | ما تفعله |
|---|---|
| **Dashboard** | إحصائيات + مخطط الأقسام + آخر المقالات |
| **المقالات** | بحث حي، فلتر، تحرير، حذف |
| **محرر المقال** | بيانات (form كامل) + لصق FM + محتوى Markdown + معاينة |
| **لصق FM** | الصق front matter → يُوزَّع على الحقول تلقائياً |
| **مدير الصور** | رفع drag & drop، استيراد من الجهاز (AR/EN/كليهما) |
| **الأقسام** | عرض الأقسام + إنشاء قسم جديد (ID, اسمان, أيقونة, لون) |
| **Git / نشر** | حالة الملفات + commit + push |
| **الإعدادات** | عرض `_config.yml` |

---

## إضافة مقال

### Front Matter الكامل

```yaml
---
layout: post
title: "عنوان المقال"
date: 2026-05-10
category: gaming          # id القسم من _data/categories.yml
lang: ar                  # ar أو en
slug: my-unique-slug      # ← متطابق في المقالين (يربطهما)
image: my-image.jpg       # في assets/images/ar/ أو en/
author: GNUTUX
tags: [وسم1, وسم2]
excerpt: "ملخص قصير..."
also_in: [gnulinux]       # اختياري: أقسام إضافية
---
```

**الصور:** 1200×630 px — صيغ مدعومة: `jpg, png, webp, avif, gif, svg`  
الصيغ الأخرى (HEIC, TIFF...) تُحوَّل تلقائياً عبر لوحة التحكم.

---

## إدارة الأقسام

الأقسام مُعرَّفة في `_data/categories.yml`:

```yaml
- id: gaming
  name_ar: "ألعاب لينكس"
  name_en: "Linux Gaming"
  icon: "fa-solid fa-gamepad"
  color: "#7c3aed"
```

إضافة قسم جديد من لوحة التحكم (صفحة الأقسام) يُنشئ تلقائياً:
- `_ar/<id>/` و`_en/<id>/`
- `ar/category/<id>.html` و`en/category/<id>.html`
- إدخال في `_data/categories.yml`

القسم يظهر في الهيدر، الشريط، الصفحة الرئيسية، والـ footer **بدون أي تعديل يدوي**.

---

## الأفيلييت

```markdown
[منتج](https://رابط.com){: .aff-link rel="nofollow sponsored" target="_blank"}
```

شريط الإفصاح يظهر تلقائياً عند وجود أي رابط `.aff-link` في المقال.

---

## النشر

```bash
git add . && git commit -m "وصف التغيير" && git push origin main
```

الموقع يتحدث خلال ~دقيقة عبر GitHub Actions.

---

## التقنيات

| | |
|---|---|
| Jekyll + GitHub Pages | محرك الموقع والاستضافة |
| Node.js + Express | لوحة التحكم المحلية |
| sharp | معالجة الصور وتحويلها |
| js-yaml | قراءة/كتابة `_data/categories.yml` |
| gray-matter | تحليل front matter |
| Font Awesome 6 | أيقونات الأقسام |
| CSS Custom Properties | الوضع الداكن/الفاتح |
| JSON-LD | SEO منظّم لـ Google |

---

## الأدلة المتاحة

| الملف | المحتوى |
|---|---|
| `دليل-العمل.md` | مقالات، صور، أفيلييت، أقسام متعددة، الألعاب |
| `دليل-تغيير-النطاق.md` | نطاق مخصص (DNS + CNAME + config) |
| `دليل-الربط-بـGitHub.md` | Token، credentials، رفع التغييرات |
| `CLAUDE.md` | توجيهات لـ Claude Code |

---

&copy; 2026 GNUTUX — [github.com/SalehGNUTUX](https://github.com/SalehGNUTUX) — GNU AGPL v3
