# GT-NEWSTECH Remote Admin — حالة العمل وخارطة الطريق

> آخر تحديث: 2026-05-31
> **الحالة الإجمالية:** المرحلتان 1 + 2 + 2.5 + 3a (deploy) **مكتملات ✓**
> **اللوحة منشورة وتعمل:** <https://gt-newstech-admin.gnutux-arabic.workers.dev>

---

## 🎯 ملخّص سريع

| الميزة | الحالة |
|---|---|
| النشر على Cloudflare | ✅ منشور |
| تسجيل الدخول بكلمة مرور | ✅ |
| قراءة المقالات/الأقسام/الصور | ✅ سريع (< 100ms مع cache) |
| إنشاء/تعديل/حذف مقال | ✅ |
| رفع/حذف صورة | ✅ |
| إنشاء قسم جديد | ✅ |
| إدارة التعليقات (Discussions) | ✅ |
| سلة المهملات | ✅ مع استرجاع |
| إصلاح Timezone | ✅ تلقائي حسب timezone المتصفح |
| تأكيد كلمة المرور لإزالة Token | ✅ |
| **Cloudflare Access** (Google login إضافي) | ⏳ مخطط لاحقاً |
| مزامنة محلية ↔ بعيدة (إشعارات) | ⏳ المرحلة 4 |

---

## ✅ ما اكتمل (تفصيل)

### المرحلة 1 — البنية + القراءة

- **بنية مستقلة:** مشروع `admin-worker/` كامل (~1500 سطر JS)
- **النسخة الاحتياطية:** tag `pre-worker-v1` + branch `backup/pre-cloudflare-worker`
- **المصادقة:** SHA-256 password + HMAC session tokens 24 ساعة
- **YAML parser صغير** يدعم block scalars (`>-`, `|`, `|-`, `|+`) — كافٍ للـ Worker
- **`articles-index.json`** + GitHub Action — حلّ مشكلة الأداء (1 طلب بدل 68)

**Endpoints القراءة (طبق contract `admin/server.js`):**

| Endpoint | الوظيفة |
|---|---|
| `GET /api/health` | فحص صحة، بدون مصادقة |
| `GET /api/mode` | يُعلم الواجهة أنها بعيدة (phase 2) |
| `GET /api/auth/status` | hasPassword |
| `POST /api/auth/login` | يُسلِّم HMAC token |
| `GET /api/stats` | `{total, byLang, byCat, recent}` |
| `GET /api/categories` | `{categories:[{...c, count_ar, count_en}]}` |
| `GET /api/articles?lang=&cat=&q=` | مصفوفة كاملة من الـ index |
| `GET /api/article?lang=&cat=&file=` | كائن واحد مع content |
| `GET /api/images?lang=` | روابط raw.githubusercontent |
| `GET /api/config` | `{remote:true, phase:2}` |

### المرحلة 2 — الكتابة

| Endpoint | الوظيفة |
|---|---|
| `POST /api/article` | إنشاء عبر Contents API |
| `PUT /api/article` | تعديل مع sha optimistic lock |
| `DELETE /api/article` | نقل إلى `_trash/` (المرحلة 2.5) — مع retry على 409 |
| `POST /api/images/:lang` | رفع صورة (multipart، حد 20MB) |
| `DELETE /api/images/:lang/:name` | حذف صلب |

**ملاحظة:** PAT الموحَّد (Contents:Write + Discussions:Write) يُستعمل لكل العمليات. يبدأ بـ `ghp_` (Classic PAT).

### المرحلة 2.5 — الإضافات

| الميزة | تفاصيل |
|---|---|
| **`POST /api/categories`** | commit ذرّي عبر Git Trees API (3 ملفات: YAML + صفحة AR + صفحة EN) |
| **سلة `_trash/`** | فهرس `_data/trash-index.json` + 4 endpoints (list, restore, purge, empty) |
| **`_config.yml`** | يستبعد `_trash/` و `admin-worker/` من بناء Jekyll |
| **إصلاح Timezone** | `mode-detect.js` يحوّل التاريخ المحلي إلى ISO UTC قبل الإرسال |
| **`POST /api/auth/confirm`** | تأكيد كلمة المرور (HMAC 30 ثانية) |
| **تأكيد لإزالة GitHub Token** | DELETE `/api/github-token` يحتاج confirm token |
| **التعليقات (Discussions)** | كل الـ endpoints العاملة في اللوحة المحلية متاحة عن بُعد |
| **زر تسجيل خروج** | في topbar (محلي + بعيد) |
| **إخفاء التبويبات غير المناسبة** | Git/Remotes/Security في الوضع البعيد فقط |

### المرحلة 3a — النشر

- ✅ Wrangler login + secrets (`GITHUB_TOKEN`, `ADMIN_PASS_HASH`, `AUTH_SECRET`)
- ✅ `wrangler deploy` ناجح
- ✅ Cloudflare Account ID مضبوط في `wrangler.toml`
- ✅ الـ Worker يعمل على `https://gt-newstech-admin.gnutux-arabic.workers.dev`

---

## 📋 الخطط المستقبلية

### المرحلة 3b — Cloudflare Access (الأمان الإضافي) ⏳

**الهدف:** إضافة طبقة Google login (أو One-time PIN) **قبل** صفحة كلمة المرور، حتى لا يصل أي شخص لصفحة الكلمة بدون تحقّق هوية أولاً.

**ما الذي ستوفّره:**

- ✅ منع bot/brute force بشكل كامل (لا يصلون لصفحة الكلمة)
- ✅ مصادقة ثنائية (Google account + كلمة سر اللوحة)
- ✅ سجلّ زيارات في Cloudflare dashboard
- ✅ القدرة على دعوة أشخاص آخرين بضبط بريدهم
- ✅ مجاني حتى 50 مستخدم

**ما **لا** يمسّ:**

- ❌ الموقع العام (`salehgnutux.github.io/GT-NEWSTECH`) — على GitHub Pages، دومين منفصل
- ❌ المستودع على GitHub — الـPAT في Cloudflare secret كما هو
- ❌ اللوحة المحلية (`localhost:4001`)
- ❌ Decap CMS (`/cms/`)
- ❌ Codeberg / GitLab
- ❌ سرعة الموقع (إضافة ~100ms مرة واحدة عند الدخول)

**خطوات التطبيق (عند الاستعداد):**

1. افتح <https://one.dash.cloudflare.com/>
2. أنشئ Team name (إن أول مرة)
3. اختر طريقة المصادقة:
   - **One-time PIN** (أبسط، 2 دقيقة): Cloudflare يُرسل رمز 6 أرقام للبريد كل دخول
   - **Google OAuth** (10 دقائق): يحتاج OAuth credentials من Google Cloud Console
4. أنشئ **Application** نوع "Self-hosted":
   - Domain: `gt-newstech-admin.gnutux-arabic.workers.dev`
   - Session duration: حسب الرغبة (24 ساعة موصى به)
5. أنشئ **Policy**:
   - Action: Allow
   - Include: Emails → `gnutux.arabic@gmail.com`
6. اختبر: افتح اللوحة من تصفّح خاص → تظهر صفحة Google/PIN قبل كلمة المرور

**كيف نتراجع عن التفعيل:**
في Cloudflare dashboard → Access → Applications → احذف التطبيق → اللوحة تعود مكشوفة على رابط workers.dev (لكن بكلمة سرها).

**التراجع التام (لو فقدت وصول Google account):**
شغّل من جهازك: `npx wrangler` يبقى يصل إلى Worker كـ admin (يتجاوز Access). تستطيع حذف التطبيق من dashboard.

### المرحلة 4 — مزامنة محلية ↔ بعيدة ⏳

تحديات بقايا:

1. **سلتان مستقلتان:** اللوحة المحلية تحفظ في `admin/.trash/` (gitignored)، اللوحة البعيدة في `_trash/` (في المستودع). الحذف من إحداهما لا يظهر في الأخرى.
   - **الحل المقترح:** نقل اللوحة المحلية لاستعمال `_trash/` أيضاً.

2. **لا إشعار بـ "خلف بـ N commits":** عند فتح اللوحة المحلية بعد تعديل عن بُعد، لا تنبيه. المستخدم قد يفتح مقالاً قديم محلياً ويسبّب تعارض.
   - **الحل المقترح:** عند البدء، اللوحة المحلية تُجري `git fetch` + تعرض إشعاراً.

3. **لا قفل تعارض:** لو فُتح نفس المقال في اللوحتين، لا تحذير.
   - **الحل المقترح:** عند فتح مقال، اللوحة تطلب آخر sha من GitHub (لو متوفر اتصال) وتُقارنه قبل الحفظ.

4. **Decap CMS auto-sync غير مدعوم في البعيد:** `POST /api/categories` لا يُحدّث `cms/config.yml` تلقائياً (اللوحة المحلية تفعل).
   - **الحل المقترح:** نقل منطق `updateCmsConfig` إلى الـ Worker.

---

## 🗂 بنية الملفات الحالية

```
admin-worker/
├── wrangler.toml          ← name + account_id + main + vars
├── package.json
├── .gitignore             ← يمنع .dev.vars, node_modules, .wrangler
├── .dev.vars (محلي)        ← GITHUB_TOKEN + ADMIN_PASS_HASH + AUTH_SECRET (gitignored)
├── README.md              ← خطوات النشر التفصيلية
├── STATUS.md              ← هذا الملف
├── public/                ← نسخة كاملة من admin/public/ + تخصيصات
│   ├── index.html         ← مع زر تسجيل خروج + شارة وضع بعيد
│   ├── index.test.html    ← واجهة اختبار بسيطة (احتفاظ كمرجع)
│   ├── site-icons/gt-newstech-icon.png
│   ├── css/admin.css      ← + CSS الوضع البعيد و زر الخروج
│   └── js/
│       ├── admin.js       ← 2486 سطر — كما هي بدون تعديل
│       └── mode-detect.js ← شارة + إخفاء تبويبات + timezone patch
└── src/
    ├── index.js           ← Worker الرئيسي + router + CORS
    ├── lib/
    │   ├── auth.js        ← SHA-256 + HMAC tokens + confirm tokens
    │   ├── github.js      ← Contents API + Git Trees + getBlob + commitFiles + putBinaryFile + deleteFile
    │   └── yaml.js        ← parser + buildFrontMatter + serializeCategories
    └── routes/
        ├── stats.js
        ├── categories.js  ← GET + POST (إنشاء قسم)
        ├── articles.js    ← GET + POST + PUT + DELETE → moveToTrash
        ├── images.js      ← GET + POST + DELETE
        ├── comments.js    ← GraphQL: list + reply + hide + unhide + delete + lock/unlock
        └── trash.js       ← list + restore + purge + empty + moveToTrash
```

---

## 🔑 المعلومات الحرجة

| المفتاح | القيمة | المكان |
|---|---|---|
| **Worker URL** | `https://gt-newstech-admin.gnutux-arabic.workers.dev` | منشور |
| **Cloudflare Account ID** | `f03637899e8ad8c55b649300337eeaa8` | `wrangler.toml` |
| **Cloudflare email** | `gnutux.arabic@gmail.com` | حساب Cloudflare |
| **GitHub PAT (موحَّد)** | Classic PAT يبدأ بـ `ghp_…` | Cloudflare secret + `admin/.github-token` |
| **PAT scopes** | Contents:R+W + Discussions:R+W | حقيقي بناءً على اختبار التحقّق |
| **3 secrets على Cloudflare** | `GITHUB_TOKEN`, `ADMIN_PASS_HASH`, `AUTH_SECRET` | `wrangler secret list` |

---

## 🛠 أوامر سريعة

### تشغيل اللوحة البعيدة محلياً (للتطوير)
```bash
cd admin-worker
npx wrangler dev --port 8787 --local
# http://localhost:8787
```

### نشر تحديث
```bash
cd admin-worker
npx wrangler deploy
```

### تغيير كلمة المرور البعيدة
```bash
# (1) ولّد hash جديد
echo -n "كلمة-سر-جديدة-قوية" | sha256sum | cut -c-64
# (2) ارفعه (انتظر ~60 ثانية للانتشار)
printf '%s' 'الـ-hash-الجديد' | npx wrangler secret put ADMIN_PASS_HASH
```

### تغيير GitHub PAT
```bash
cat ~/path/to/new-token.txt | npx wrangler secret put GITHUB_TOKEN
```

### تتبع سجلات الـ Worker الحيّة
```bash
cd admin-worker
npx wrangler tail
```

### الرجوع إلى ما قبل Worker (طوارئ)
```bash
git checkout pre-worker-v1   # tag
# أو
git checkout backup/pre-cloudflare-worker   # branch
```

---

## 🐛 مشاكل معروفة / مفتوحة

### السلتان منفصلتان (المرحلة 4 ستحلّها)
- اللوحة المحلية تحفظ في `admin/.trash/`
- اللوحة البعيدة تحفظ في `_trash/` (في المستودع)
- لا تتزامن — كل لوحة ترى مهملاتها فقط

### Decap CMS auto-sync غير مدعوم في البعيد
- `POST /api/categories` لا يُحدّث `cms/config.yml` تلقائياً
- لو أنشأت قسماً عن بُعد، عدّل `cms/config.yml` يدوياً ليظهر في Decap

### سياسة Cloudflare Workers — حدود مجانية
- 100,000 طلب/يوم (كافٍ بكثير لاستخدام شخصي)
- 50 subrequests لكل طلب (نتجنّبه الآن عبر articles-index.json)
- 10ms CPU لكل طلب (نتجنّبه عبر cache طلب GitHub)
