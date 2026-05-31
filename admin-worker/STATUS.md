# GT-NEWSTECH Remote Admin — حالة العمل وخارطة الطريق

> آخر تحديث: 2026-05-31
> الحالة الإجمالية: **المرحلة 2 (CRUD كامل) تعمل محلياً ✓ — لم تُنشر بعد على Cloudflare**

---

## ✓ ما اكتمل

### البنية التحتية
- **مشروع `admin-worker/`** قائم بذاته (~750 سطر JS)، منفصل تماماً عن `admin/` المحلي
- **wrangler.toml** يربط `public/` كـ static assets وملف Worker واحد للـ API
- **نسخة احتياطية:** tag `pre-worker-v1` + branch `backup/pre-cloudflare-worker` (مرفوعة)

### المصادقة
- SHA-256 hash لكلمة المرور (مطابق لنموذج `admin/server.js`)
- HMAC tokens مع timestamp مضمَّن، صالحة 24 ساعة
- header `x-admin-token` متطابق مع الواجهة الحالية

### Endpoints جاهزة (طبق contract `admin/server.js`)

**القراءة (المرحلة 1):**
| Endpoint | الحالة | ملاحظة |
|---|---|---|
| `GET /api/health` | ✓ | بدون مصادقة |
| `GET /api/mode` | ✓ | يُعلم الواجهة أنها في وضع بعيد |
| `GET /api/auth/status` | ✓ | |
| `POST /api/auth/login` | ✓ | |
| `GET /api/stats` | ✓ | `{total, byLang, byCat, recent}` |
| `GET /api/categories` | ✓ | `{categories:[{...c, count_ar, count_en}]}` |
| `GET /api/articles?lang=&cat=&q=` | ✓ | مصفوفة `{...fm, _file, _lang, _cat}` |
| `GET /api/article?lang=&cat=&file=` | ✓ | كائن واحد بنفس الشكل + content |
| `GET /api/images?lang=` | ✓ | روابط raw.githubusercontent |
| `GET /api/config` | ✓ | معلومات بسيطة |

**الكتابة (المرحلة 2):**
| Endpoint | الحالة | ملاحظة |
|---|---|---|
| `POST /api/article` | ✓ | يُنشئ commit جديد، invalidate index cache |
| `PUT /api/article?lang=&cat=&file=` | ✓ | sha optimistic lock، 409 لو تعارض |
| `DELETE /api/article?lang=&cat=&file=` | ✓ | retry تلقائي ×3 على 409 (eventual consistency) |
| `POST /api/images/:lang` | ✓ | multipart، حد 20MB، صيغ jpg/png/webp/avif/gif/svg |
| `DELETE /api/images/:lang/:name` | ✓ | حذف صلب |

### Stubs آمنة (يردّ الـ Worker حتى لا يكسر الواجهة)
- `GET /api/auth/security` → `{confirmFor:{}, sessionMinutes:1440}`
- `GET /api/git/status` → `{clean:true, ahead:0, behind:0}`
- `GET /api/remotes` → `[origin]`
- `GET /api/trash` → `[]`
- `GET /api/github-token/status` → `{hasToken:false}`
- `GET /api/comments` → `{discussions:[]}`

أي endpoint كتابة (POST/PUT/DELETE) يردّ `501` مع رسالة واضحة بالعربية.

### الواجهة
- **نسخة كاملة من `admin/public/`** منسوخة إلى `admin-worker/public/`
- index.html + admin.js + admin.css + الأيقونة
- المسارات النسبية (`/api/...`) تعمل لأن Worker يخدم نفس الدومين

### الاختبار
- ✓ Syntax لكل ملفات JS
- ✓ YAML parser على `_data/categories.yml` الحقيقي (مع دعم block scalars `>-` و `|`)
- ✓ Front matter على مقال حقيقي
- ✓ المصادقة (login + verify + reject)
- ✓ كل القراءات ضد GitHub API (34 مقال AR، 34 EN، 6 أقسام، 36 صورة)
- ✓ تشغيل عبر `wrangler dev` محلياً على المنفذ 8787

---

## ⚠ مشاكل معروفة (تحتاج إصلاح في الجلسة القادمة)

### 🐛 (1) لون القسم لا يظهر في بطاقات المقالات
- الـ API يُرجع `color` من YAML بنجاح (مُختبَر)
- المشكلة في الواجهة: ربما الجلب من cache، أو match بين `article._cat` و `category.id` يفشل
- **خطوة التشخيص:** افتح F12 → Network → `/api/categories` وتحقّق أن `color` موجود في الاستجابة، ثم افحص `admin.js` بحثاً عن `categories.find(c => c.id === ...)`

### 🐛 (2) المحتوى لا يُعرض مطابقاً للنسخة المحلية
- لم يُحدَّد بالضبط ما الذي يختلف
- احتمالات: تنسيق التاريخ، اقتطاع الـ excerpt، صور غير محمَّلة، ترتيب
- **خطوة التشخيص:** مقارنة جنباً إلى جنب (محلي على :4001 vs Worker على :8787) لمقال معيّن

---

## 📋 خارطة الطريق

### المرحلة 1.5 — إصلاحات الجلسة القادمة (~1 ساعة)
- [x] **حل مشكلة الأداء + اكتمال المحتوى** — articles-index.json (طلب واحد، 28× أسرع) ✓
- [ ] إصلاح ألوان الأقسام (الـ API يُرجع الألوان صحيحة — المشكلة في تطبيق الواجهة)
- [ ] مقارنة عرض المقالات وإصلاح الفروقات الأخرى
- [ ] إضافة شارة "وضع بعيد — قراءة فقط" في الـ topbar (لتمييز اللوحتين)
- [ ] إخفاء أزرار الكتابة في الوضع البعيد بدلاً من جعلها تفشل بـ 501

### المرحلة 2 — الكتابة (مكتملة ✓)
- [x] `POST /api/article` — إنشاء عبر Contents API
- [x] `PUT /api/article` — تعديل مع sha للقفل التفاؤلي
- [x] `DELETE /api/article` — حذف صلب (مع retry تلقائي عند 409 — eventual consistency)
- [x] `POST /api/images/:lang` — رفع صورة (multipart → Contents API، حد 20MB)
- [x] `DELETE /api/images/:lang/:name` — حذف صورة
- [x] **PAT مُرقَّى** إلى `Contents: Read and write`
- [x] الـ GitHub Action يحدّث `articles-index.json` تلقائياً بعد كل عملية كتابة

### المرحلة 2.5 — الإضافات الباقية (~2-3 ساعات)
- [ ] `POST /api/categories` — إنشاء قسم جديد (تحديث YAML + إنشاء مجلدات)
- [ ] سلة `_trash/` — حذف بنقل لمجلد بدل الحذف الصلب + استرجاع
- [ ] إصلاح timezone للتاريخ (الـ Worker يخزّن UTC، حالياً يفترض client أرسلها UTC)

### المرحلة 3 — Cloudflare deploy + Access (~2 ساعة)
- [ ] `wrangler deploy` فعلي على `gt-newstech-admin.<user>.workers.dev`
- [ ] إعداد Cloudflare Access (Google login) أمام `/admin/` كطبقة أمان إضافية
- [ ] واجهة dual-mode: الكشف التلقائي محلي vs بعيد، عرض شارة مختلفة
- [ ] خيار توحيد الواجهة عبر symlink أو script يحفظها واحدة بين `admin/public/` و `admin-worker/public/`

### المرحلة 4 — مزامنة ذكية مع اللوحة المحلية (~2 ساعة)
- [ ] اللوحة المحلية تكتشف عند البدء "خلف بـ N commits" + زر pull
- [ ] إشعار تلقائي عند فتح اللوحة المحلية بعد تعديل عن بُعد
- [ ] منع التعارض: لو فُتح نفس المقال في الاثنتين، حذّر قبل الحفظ

---

## أوامر سريعة

### إعادة التشغيل المحلي
```bash
cd admin-worker
npx wrangler dev --port 8787 --local
# افتح http://localhost:8787
# كلمة السر الافتراضية للاختبار: test1234
```

### تعديل كلمة السر للاختبار
```bash
echo -n "كلمة-سر-جديدة" | sha256sum | cut -c-64
# انسخ النتيجة وضعها في admin-worker/.dev.vars كقيمة ADMIN_PASS_HASH=
```

### نشر على Cloudflare (متى أردت)
انظر `admin-worker/README.md` §3-§4.

### الرجوع إلى ما قبل Worker
```bash
git checkout pre-worker-v1   # tag
# أو
git checkout backup/pre-cloudflare-worker   # branch
```

---

## بنية الملفات

```
admin-worker/
├── wrangler.toml          ← إعدادات Cloudflare + متغيّرات بيئة
├── package.json
├── .gitignore             ← يمنع .dev.vars و node_modules و .wrangler
├── README.md              ← خطوات النشر التفصيلية
├── STATUS.md              ← هذا الملف
├── public/                ← نسخة كاملة من admin/public/
│   ├── index.html
│   ├── index.test.html    ← واجهة الاختبار البسيطة (احتفاظ كمرجع)
│   ├── site-icons/gt-newstech-icon.png
│   ├── css/admin.css
│   └── js/admin.js        ← 2486 سطر — كما هي بدون تعديل
└── src/
    ├── index.js           ← Worker الرئيسي + router + CORS + stubs
    ├── lib/
    │   ├── auth.js        ← SHA-256 + HMAC tokens
    │   ├── github.js      ← Contents API + Git Trees + getBlob
    │   └── yaml.js        ← parser صغير يدعم block scalars
    └── routes/
        ├── stats.js       ← /api/stats (متطابق مع server.js)
        ├── categories.js  ← /api/categories (مصفوفة)
        ├── articles.js    ← /api/articles + /api/article (مصفوفة + كائن)
        └── images.js      ← /api/images (مصفوفة)
```
