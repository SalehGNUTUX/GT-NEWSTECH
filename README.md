# GT-NEWSTECH — GNUTUX NEWS TECH

موقع إخباري وتقني مفتوح المصدر، يغطي مشاريع GNUTUX، البرمجيات الحرة، غنو/لينكس، أخبار التقنية، الذكاء الاصطناعي، وألعاب لينكس — **بالعربية والإنجليزية**.

**الموقع:** https://SalehGNUTUX.github.io/GT-NEWSTECH  
**الترخيص:** GNU Affero General Public License v3.0

---

## الأقسام / Sections

الأقسام تُدار من ملف واحد: `_data/categories.yml`

| القسم | Section | الأيقونة |
|---|---|---|
| مشاريع GNUTUX | GNUTUX Projects | `fa-terminal` |
| البرمجيات الحرة | Free & Open Source | `fa-code` |
| غنو/لينكس | GNU/Linux | `fa-linux` |
| أخبار التقنية | Tech News | `fa-microchip` |
| الذكاء الاصطناعي | AI News | `fa-robot` |
| ألعاب لينكس | Linux Gaming | `fa-gamepad` |

---

## نظام لوحتَي التحكم

### اللوحة المحلية — `http://localhost:4001`
```bash
bash start.sh
```
كاملة الصلاحيات: تحرير، صور، أقسام، مهملات، دفع متعدد المستودعات.

### Decap CMS — `https://SalehGNUTUX.github.io/GT-NEWSTECH/cms/`
للعمل من الهاتف أو أي جهاز: تحرير المقالات، رفع الصور، commit تلقائي.  
راجع `دليل-نظام-لوحتي-التحكم.md` لإعداد OAuth.

---

## هيكل المشروع

```
GT-NEWSTECH/
├── _config.yml                  # إعدادات Jekyll الرئيسية
├── _config.local.yml            # إعدادات محلية (gitignored)
│
├── _data/
│   └── categories.yml           # المصدر الوحيد لتعريف الأقسام
│
├── _layouts/                    # قوالب الصفحات (ديناميكية)
├── _includes/                   # مكونات مشتركة
│
├── assets/
│   ├── css/style.css            # ذهبي × أسود + وضع داكن + responsive
│   ├── js/theme.js + main.js
│   ├── images/ar/ + images/en/  # صور المقالات
│   └── icons/gt-newstech-icon.png
│
├── _ar/ + _en/                  # مقالات (مجلد لكل قسم)
├── ar/ + en/                    # صفحات رئيسية وأقسام
│
├── cms/                         # Decap CMS (لوحة تحكم مستضافة)
│   ├── index.html
│   └── config.yml
│
├── admin/                       # لوحة التحكم المحلية Node.js
│   ├── server.js                # Express API
│   ├── package.json
│   └── public/
│
├── .github/workflows/pages.yml  # نشر تلقائي
├── start.sh                     # تشغيل الموقع + اللوحة المحلية
└── serve.sh                     # تشغيل الموقع فقط
```

---

## التشغيل المحلي

```bash
bash start.sh
# الموقع      → http://localhost:4000/
# لوحة التحكم → http://localhost:4001/
```

يسحب التغييرات من GitHub تلقائياً عند التشغيل (لمنع التعارض مع Decap CMS).

---

## لوحة التحكم المحلية — المزايا

| القسم | الصلاحيات |
|---|---|
| **Dashboard** | إحصائيات + مخطط الأقسام + آخر المقالات |
| **المقالات** | بحث حي، فلتر AR/EN، تحرير، حذف (→ مهملات) |
| **محرر المقال** | بيانات + لصق FM + محتوى Markdown + معاينة |
| **شريط الأدوات** | غامق، مائل، عناوين، كود، جدول، رابط أفيلييت، **تراجع/تقدم** |
| **لصق FM** | الصق front matter → يُوزَّع على الحقول تلقائياً |
| **مدير الصور** | رفع drag & drop، استيراد من الجهاز (AR/EN/كليهما)، تحويل HEIC/TIFF→JPEG |
| **المهملات** | حذف مؤقت مع إمكانية الاسترجاع أو الحذف النهائي |
| **الأقسام** | عرض الأقسام + إنشاء قسم جديد (ID, اسمان, أيقونة, لون) |
| **Git / نشر** | مزامنة (Pull) + commit + push |
| **المستودعات** | إضافة GitHub/GitLab/Codeberg + دفع لمستودعات متعددة |
| **الأمان** | كلمة مرور للوحة المحلية (SHA-256) |
| **الإعدادات** | عرض `_config.yml` |

---

## إضافة مقال

```yaml
---
layout: post
title: "عنوان المقال"
date: 2026-05-15 14:00:00
category: gaming        # من _data/categories.yml
lang: ar
slug: my-unique-slug    # ← نفسه في المقال الإنجليزي
image: my-image.jpg
author: GNUTUX
tags: [وسم1, وسم2]
excerpt: "ملخص قصير..."
also_in: [gnulinux]     # اختياري
---
```

---

## إدارة الأقسام

من لوحة التحكم → **الأقسام** → إنشاء قسم جديد.  
أو يدوياً في `_data/categories.yml`:
```yaml
- id: hardware
  name_ar: "الأجهزة"
  name_en: "Hardware"
  icon: "fa-solid fa-memory"
  color: "#06b6d4"
```

---

## الأفيلييت

```markdown
[منتج](https://رابط.com){: .aff-link rel="nofollow sponsored" target="_blank"}
```
شريط الإفصاح يظهر تلقائياً.

---

## منع التعارض بين اللوحتين

| الموقف | الإجراء |
|---|---|
| تعديل من Decap CMS | أنهِ وانشر قبل فتح اللوحة المحلية |
| اللوحة المحلية تُظهر تنبيه أصفر | اضغط **مزامنة (Pull)** قبل فتح أي مقال |
| تحرير نفس المقال من كلا اللوحتين | ❌ تجنب |

---

## النشر

```bash
git add . && git commit -m "وصف" && git push origin main
```

الموقع يتحدث خلال ~دقيقة عبر GitHub Actions.

---

## التقنيات

| | |
|---|---|
| Jekyll + GitHub Pages | محرك الموقع والاستضافة |
| Node.js + Express | لوحة التحكم المحلية |
| Decap CMS | لوحة التحكم المستضافة (GitHub API) |
| sharp | معالجة الصور |
| js-yaml | قراءة/كتابة `_data/categories.yml` |
| Font Awesome 6 | أيقونات الأقسام |
| CSS Custom Properties | الوضع الداكن/الفاتح |
| JSON-LD | SEO منظّم |

---

## الأدلة

| الملف | المحتوى |
|---|---|
| `دليل-العمل.md` | مقالات، صور، أفيلييت، أقسام، الألعاب |
| `دليل-نظام-لوحتي-التحكم.md` | إعداد Decap CMS + OAuth + سير العمل |
| `دليل-تغيير-النطاق.md` | نطاق مخصص (DNS + CNAME) |
| `دليل-الربط-بـGitHub.md` | Token، credentials، حل مشاكل الدفع |
| `CLAUDE.md` | توجيهات لـ Claude Code |

---

&copy; 2026 GNUTUX — GNU AGPL v3
