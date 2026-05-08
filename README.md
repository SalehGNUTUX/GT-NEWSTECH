# GT-NEWSTECH — GNUTUX NEWS TECH

موقع إخباري وتقني مفتوح المصدر، يغطي مشاريع GNUTUX، البرمجيات الحرة، غنو/لينكس، أخبار التقنية، والذكاء الاصطناعي — **بالعربية والإنجليزية**.

An open-source bilingual tech news site covering GNUTUX projects, FOSS, GNU/Linux, tech news, and AI.

**الموقع:** https://SalehGNUTUX.github.io/GT-NEWSTECH  
**الترخيص:** GNU Affero General Public License v3.0

---

## الأقسام / Sections

| القسم | Section | الأيقونة | العربية | الإنجليزية |
|---|---|---|---|---|
| مشاريع GNUTUX | GNUTUX Projects | `fa-terminal` | `/ar/category/gnutux-projects/` | `/en/category/gnutux-projects/` |
| البرمجيات الحرة | Free & Open Source | `fa-code` | `/ar/category/foss/` | `/en/category/foss/` |
| غنو/لينكس | GNU/Linux | `fa-linux` | `/ar/category/gnulinux/` | `/en/category/gnulinux/` |
| أخبار التقنية | Tech News | `fa-microchip` | `/ar/category/tech-news/` | `/en/category/tech-news/` |
| الذكاء الاصطناعي | AI News | `fa-robot` | `/ar/category/ai/` | `/en/category/ai/` |

---

## هيكل المشروع

```
GT-NEWSTECH/
├── _config.yml                  # إعدادات Jekyll الرئيسية
├── _config.local.yml            # إعدادات التشغيل المحلي (baseurl فارغ)
├── index.html                   # موجّه ذكي → /ar/ أو /en/ حسب اللغة
│
├── _layouts/
│   ├── default.html             # القالب الأساسي (header، footer، SEO)
│   ├── home.html                # الصفحة الرئيسية (محتوى اللغة الحالية فقط)
│   ├── post.html                # صفحة المقال (TOC، مشاركة، أفيلييت)
│   ├── category.html            # صفحة القسم (أيقونة FA + مقالات)
│   ├── archive.html             # أرشيف اللغة مع فلتر
│   └── page.html                # الصفحات الثابتة (Terms، Privacy...)
│
├── _includes/
│   ├── article-card.html        # بطاقة المقال (صورة/شعار + أقسام متعددة)
│   ├── affiliate-disclosure.html # شريط الأفيلييت (يظهر تلقائياً)
│   └── seo-jsonld.html          # بيانات JSON-LD لـ Google
│
├── assets/
│   ├── css/style.css            # تصميم ذهبي × أسود + وضع داكن/فاتح
│   ├── js/
│   │   ├── theme.js             # تبديل الوضع + اكتشاف تلقائي
│   │   └── main.js              # TOC، بحث، تقدم القراءة، مشاركة، فلتر
│   ├── images/
│   │   ├── ar/                  # صور المقالات العربية
│   │   └── en/                  # صور المقالات الإنجليزية
│   └── icons/
│       └── gt-newstech-icon.png # الشعار الرسمي (512×512)
│
├── _ar/                         # مقالات عربية (مجلد لكل قسم)
│   ├── gnutux-projects/
│   ├── foss/
│   ├── gnulinux/
│   ├── tech-news/
│   └── ai/
├── _en/                         # مقالات إنجليزية (نفس الهيكل)
│
├── ar/
│   ├── index.html               # الصفحة الرئيسية العربية
│   ├── category/                # صفحات الأقسام العربية (5 ملفات)
│   ├── terms.md                 # شروط الاستخدام
│   ├── privacy.md               # سياسة الخصوصية
│   └── rss-terms.md             # شروط RSS
├── en/
│   ├── index.html               # English home page
│   ├── category/                # English category pages (5 files)
│   ├── terms.md
│   ├── privacy.md
│   └── rss-terms.md
│
├── _data/
│   └── categories.yml           # تعريف الأقسام (اسم، لون، أيقونة)
│
├── admin/                       # لوحة التحكم المحلية (لا تُنشر)
│   ├── server.js                # Express API (CRUD + Git + صور)
│   ├── package.json
│   └── public/                  # واجهة لوحة التحكم (HTML/CSS/JS)
│
├── .github/workflows/pages.yml  # نشر تلقائي عبر GitHub Actions
├── search.json                  # فهرس البحث (مولَّد تلقائياً)
├── robots.txt                   # توجيه محركات البحث
├── Gemfile                      # حزم Ruby
│
├── start.sh                     # تشغيل الموقع ولوحة التحكم معاً
├── serve.sh                     # تشغيل الموقع فقط
├── admin-start.sh               # تشغيل لوحة التحكم فقط
│
├── دليل-العمل.md                # دليل إضافة المقالات والصور
├── دليل-تغيير-النطاق.md         # دليل الانتقال لنطاق مخصص
└── دليل-الربط-بـGitHub.md       # دليل الربط بـ GitHub والدفع
```

---

## التشغيل المحلي

### الموقع ولوحة التحكم معاً (الموصى به)

```bash
bash start.sh
```

| الخدمة | الرابط |
|---|---|
| الموقع | http://localhost:4000/ |
| لوحة التحكم | http://localhost:4001/ |

`Ctrl+C` يوقف الخدمتين معاً.

### الموقع فقط

```bash
bash serve.sh
```

### لوحة التحكم فقط

```bash
bash admin-start.sh
```

> السكريبتات تثبت Ruby وNode وحزمهما تلقائياً عند أول تشغيل.

---

## لوحة التحكم — المزايا

لوحة تحكم محلية مبنية بـ Node.js + Express، تصميم ذهبي/أسود يطابق هوية الموقع.

| القسم | الصلاحيات |
|---|---|
| **Dashboard** | إحصائيات + مخطط الأقسام + آخر المقالات |
| **المقالات** | بحث حي + فلتر لغة/قسم + تحرير + حذف |
| **محرر المقال** | Form كامل (front matter) + محرر Markdown + معاينة |
| **شريط الأدوات** | غامق، مائل، عناوين، كود، رابط، رابط أفيلييت |
| **مدير الصور** | رفع drag & drop + نسخ الاسم + حذف |
| **Git / نشر** | حالة الملفات + commit + push مباشرة |
| **الإعدادات** | عرض `_config.yml` |

---

## إضافة مقال جديد

### من لوحة التحكم (الأسهل)
1. شغّل `bash start.sh`
2. افتح http://localhost:4001/
3. اضغط **مقال جديد** واملأ الحقول
4. اضغط **حفظ** ثم **Git / نشر** للرفع

### يدوياً

**مقال عربي** `_ar/<القسم>/YYYY-MM-DD-عنوان.md`:

```yaml
---
layout: post
title: "عنوان المقال"
date: 2026-05-10
category: ai
lang: ar
slug: my-unique-slug
image: my-image.jpg
author: GNUTUX
tags: [وسم1, وسم2]
excerpt: "ملخص قصير..."
also_in: [tech-news]        # اختياري: أقسام إضافية يظهر فيها المقال
---

محتوى المقال بصيغة Markdown...
```

**المقال الإنجليزي النظير** `_en/<category>/YYYY-MM-DD-title.md`:

```yaml
---
layout: post
title: "Article Title"
date: 2026-05-10
category: ai
lang: en
slug: my-unique-slug        # ← نفس الـ slug بالضبط يربط النسختين
image: my-image.jpg
author: GNUTUX
tags: [tag1, tag2]
excerpt: "Short summary..."
also_in: [tech-news]
---

Article content...
```

**الصور:**
- `assets/images/ar/my-image.jpg` ← للمقال العربي
- `assets/images/en/my-image.jpg` ← للمقال الإنجليزي
- المقاس الموصى به: **1200×630 px**
- بدون صورة: يظهر شعار الموقع تلقائياً

---

## نظام الأقسام المتعددة

مقال يظهر في أكثر من قسم بدون تكرار الملف:

```yaml
category: tech-news        # القسم الرئيسي (مكان الملف)
also_in: [gnulinux, ai]   # أقسام إضافية
```

---

## نظام الأفيلييت

الكشف تلقائي — لا حاجة لإعداد يدوي. أضف رابط أفيلييت في المحتوى:

```markdown
[اسم المنتج](https://رابط.com){: .aff-link rel="nofollow sponsored" target="_blank"}
```

سيظهر شريط الإفصاح القانوني تلقائياً فوق المقال.

---

## نظام اللغة

- الجذر `/` يحوّل تلقائياً حسب اللغة المحفوظة أو لغة المتصفح
- `/ar/` — صفحة رئيسية عربية (محتوى عربي حصري)
- `/en/` — English home page (English content only)
- البحث مفلتر حسب لغة الصفحة الحالية
- تبديل اللغة يُحفظ في `localStorage`

---

## الصفحات القانونية

تظهر في الـ footer فقط، لا في القوائم العلوية:

| الصفحة | عربي | إنجليزي |
|---|---|---|
| شروط الاستخدام | `/ar/terms/` | `/en/terms/` |
| سياسة الخصوصية | `/ar/privacy/` | `/en/privacy/` |
| شروط RSS | `/ar/rss-terms/` | `/en/rss-terms/` |

---

## الدفع للمستودع

```bash
git add .
git commit -m "add: مقال — عنوان المقال"
git push origin main
```

الموقع يتحدث خلال دقيقة تلقائياً عبر GitHub Actions.

> راجع `دليل-الربط-بـGitHub.md` لإعداد المصادقة.

---

## التقنيات

| التقنية | الاستخدام |
|---|---|
| **Jekyll** | محرك المواقع الثابتة |
| **GitHub Pages** | الاستضافة المجانية |
| **GitHub Actions** | النشر التلقائي عند كل push |
| **Node.js + Express** | لوحة التحكم المحلية |
| **Font Awesome 6** | أيقونات الأقسام |
| **Google Fonts** | Cairo (عربي) + Inter (لاتيني) |
| **Vanilla JS** | بدون frameworks (أداء عالٍ) |
| **CSS Custom Properties** | تبديل الوضع الداكن/الفاتح |
| **JSON-LD** | بيانات SEO منظمة لـ Google |

---

## الأدلة المتاحة

| الملف | المحتوى |
|---|---|
| `دليل-العمل.md` | إضافة مقالات، صور، أفيلييت، also_in |
| `دليل-تغيير-النطاق.md` | الانتقال لنطاق مخصص (DNS + CNAME) |
| `دليل-الربط-بـGitHub.md` | Token، credentials، دفع التغييرات |

---

## الترخيص

هذا المشروع مرخص تحت **GNU Affero General Public License v3.0**.

راجع ملف [LICENSE.txt](LICENSE.txt) للتفاصيل.

---

&copy; 2026 GNUTUX — [github.com/SalehGNUTUX](https://github.com/SalehGNUTUX)
