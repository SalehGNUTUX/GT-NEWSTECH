# GT-NEWSTECH — GNUTUX NEWS TECH

موقع إخباري وتقني مفتوح المصدر، يغطي مشاريع GNUTUX، البرمجيات الحرة، غنو/لينكس، أخبار التقنية، والذكاء الاصطناعي — **بالعربية والإنجليزية**.

An open-source bilingual tech news site covering GNUTUX projects, FOSS, GNU/Linux, tech news, and AI.

**URL:** https://SalehGNUTUX.github.io/GT-NEWSTECH

---

## الأقسام / Sections

| القسم | Section | URL |
|-------|---------|-----|
| مشاريع GNUTUX | GNUTUX Projects | `/ar/category/gnutux-projects/` |
| البرمجيات الحرة | Free & Open Source | `/ar/category/foss/` |
| غنو/لينكس | GNU/Linux | `/ar/category/gnulinux/` |
| أخبار التقنية | Tech News | `/ar/category/tech-news/` |
| الذكاء الاصطناعي | AI News | `/ar/category/ai/` |

---

## هيكل المشروع

```
GT-NEWSTECH/
├── _config.yml             # إعدادات Jekyll
├── index.html              # الصفحة الرئيسية
├── _layouts/               # قوالب الصفحات
│   ├── default.html        # القالب الأساسي (header + footer)
│   ├── home.html           # الصفحة الرئيسية
│   ├── post.html           # صفحة المقال
│   ├── category.html       # صفحة القسم
│   └── archive.html        # أرشيف اللغة
├── _includes/
│   └── article-card.html   # بطاقة المقال (مكوّن مشترك)
├── assets/
│   ├── css/style.css       # التنسيقات (ذهبي × أسود + وضع داكن)
│   ├── js/
│   │   ├── theme.js        # تبديل الوضع الداكن/الفاتح
│   │   └── main.js         # تفاعلات الواجهة (TOC، بحث، تقدم القراءة...)
│   ├── images/
│   │   ├── ar/             # صور المقالات العربية
│   │   └── en/             # صور المقالات الإنجليزية
│   └── icons/
│       └── gt-newstech-icon.png
├── _ar/                    # مقالات عربية (مجلد فرعي لكل قسم)
├── _en/                    # مقالات إنجليزية (مجلد فرعي لكل قسم)
├── ar/
│   ├── index.html          # أرشيف العربية
│   └── category/           # صفحات أقسام عربية
├── en/
│   ├── index.html          # English archive
│   └── category/           # English category pages
├── _data/
│   └── categories.yml      # تعريف الأقسام
├── search.json             # فهرس البحث
└── Gemfile
```

---

## إضافة مقال جديد

### 1. أنشئ ملف المقال

**مقال عربي** في `_ar/<القسم>/YYYY-MM-DD-عنوان.md`:

```yaml
---
layout: post
title: "عنوان المقال"
date: 2026-05-10
category: ai          # gnutux-projects | foss | gnulinux | tech-news | ai
lang: ar
slug: my-unique-slug  # نفس الـ slug في المقال الإنجليزي للربط بينهما
image: my-image.jpg   # في assets/images/ar/
author: GNUTUX
tags: [وسم1, وسم2]
excerpt: "ملخص قصير للمقال..."
---

محتوى المقال بصيغة Markdown...
```

**المقال الإنجليزي النظير** في `_en/<category>/YYYY-MM-DD-title.md`:

```yaml
---
layout: post
title: "Article Title"
date: 2026-05-10
category: ai
lang: en
slug: my-unique-slug  # نفس الـ slug أعلاه — هذا يربط النسختين
image: my-image.jpg   # في assets/images/en/
author: GNUTUX
tags: [tag1, tag2]
excerpt: "Short article summary..."
---

Article content in Markdown...
```

### 2. أضف الصورة

- صورة عربية: `assets/images/ar/my-image.jpg`
- صورة إنجليزية: `assets/images/en/my-image.jpg`
- مقاس مقترح: **1200×630 px** (نسبة 16:9)

### 3. ارفع التغييرات

```bash
git add .
git commit -m "add: مقال جديد — عنوان المقال"
git push origin main
```

سيُنشر المقال تلقائياً بعد دقائق عبر GitHub Pages.

---

## التشغيل المحلي

```bash
# تثبيت Ruby و Bundler أولاً
gem install bundler
bundle install

# تشغيل الخادم المحلي
bundle exec jekyll serve --livereload

# الموقع على: http://localhost:4000/GT-NEWSTECH/
```

---

## التقنيات

- **Jekyll** — محرك المواقع الثابتة
- **GitHub Pages** — الاستضافة
- **HTML5 / CSS3 / Vanilla JS** — بدون frameworks ثقيلة
- **Google Fonts** — Cairo (عربي) + Inter (لاتيني)
- ثنائي اللغة عبر `slug` مشترك بين المقالات
- وضع داكن/فاتح تلقائي مع حفظ التفضيل

---

## الترخيص

هذا المشروع مرخص تحت **GNU Affero General Public License v3.0**.

راجع ملف [LICENSE.txt](LICENSE.txt) للتفاصيل.

---

&copy; 2026 GNUTUX — [github.com/SalehGNUTUX](https://github.com/SalehGNUTUX)
