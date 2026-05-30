# GT-NEWSTECH Remote Admin — حالة العمل وخارطة الطريق

> آخر تحديث: 2026-05-30
> الحالة الإجمالية: **المرحلة 1 (قراءة فقط) تعمل محلياً ✓ — لم تُنشر بعد على Cloudflare**

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
| Endpoint | الحالة | ملاحظة |
|---|---|---|
| `GET /api/health` | ✓ | بدون مصادقة |
| `GET /api/mode` | ✓ | جديد — يُعلم الواجهة أنها في وضع بعيد |
| `GET /api/auth/status` | ✓ | |
| `POST /api/auth/login` | ✓ | |
| `GET /api/stats` | ✓ | `{total, byLang, byCat, recent}` — متطابق |
| `GET /api/categories` | ✓ | مصفوفة من YAML + scan disk |
| `GET /api/articles?lang=&cat=&q=` | ✓ | مصفوفة `{...fm, content, _file, _lang, _cat}` |
| `GET /api/article?lang=&cat=&file=` | ✓ | كائن واحد بنفس الشكل |
| `GET /api/images?lang=` | ✓ | روابط raw.githubusercontent |
| `GET /api/config` | ✓ | معلومات بسيطة |

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
- [ ] إصلاح ألوان الأقسام
- [ ] مقارنة عرض المقالات وإصلاح الفروقات
- [ ] إضافة شارة "وضع بعيد — قراءة فقط" في الـ topbar (لتمييز اللوحتين)
- [ ] إخفاء أزرار الكتابة في الوضع البعيد بدلاً من جعلها تفشل بـ 501

### المرحلة 2 — الكتابة (~4-6 ساعات)
- [ ] `POST /api/article` (إنشاء) — عبر Contents API بـ commit جديد
- [ ] `PUT /api/article` (تعديل) — مع sha للقفل التفاؤلي
- [ ] `DELETE /api/article` (حذف) — branch `trash` للمهملات
- [ ] `POST /api/images/:lang` (رفع صورة) — base64 → Contents API (حد 25MB)
- [ ] `POST /api/categories` (إنشاء قسم) — تحديث YAML + إنشاء مجلدات
- [ ] PAT يحتاج ترقية إلى صلاحية `Contents: Read and write`
- [ ] دعم استرجاع من المهملات

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
