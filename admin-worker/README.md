# GT-NEWSTECH — Remote Admin (Cloudflare Worker)

لوحة تحكم عن بُعد للمشروع تعمل على Cloudflare Workers (مجاناً).
تقرأ من نفس مستودع `SalehGNUTUX/GT-NEWSTECH` عبر GitHub API.

> **المرحلة الحالية: 1 — قراءة فقط.** الكتابة/الحذف ستأتي في المرحلة 2.

---

## ما يعمل في المرحلة 1

- ✅ تسجيل دخول بكلمة سر (SHA-256 + HMAC token)
- ✅ Dashboard مع إحصائيات + قائمة الأقسام
- ✅ قائمة المقالات (AR/EN) مع فلتر بالقسم والبحث
- ✅ معاينة قائمة الصور لكل لغة
- ✅ تجربة `GET /api/*` خام

---

## التشغيل المحلي (اختياري — للتطوير)

```bash
cd admin-worker
npm install
# ضع الأسرار في ملف محلي .dev.vars (gitignored):
cat > .dev.vars <<EOF
GITHUB_TOKEN=ghp_xxx
ADMIN_PASS_HASH=$(echo -n "كلمة-السر" | sha256sum | cut -c-64)
AUTH_SECRET=$(openssl rand -hex 32)
EOF
npm run dev
# يفتح على http://localhost:8787
```

---

## النشر على Cloudflare (الحقيقي)

### 1. تثبيت wrangler + تسجيل دخول

```bash
cd admin-worker
npm install
npx wrangler login   # يفتح المتصفح
```

### 2. إنشاء PAT لـ GitHub (للقراءة فقط)

افتح <https://github.com/settings/personal-access-tokens/new>:
- **Token name:** `gt-newstech-worker-read`
- **Repository access:** Only select → `SalehGNUTUX/GT-NEWSTECH`
- **Permissions → Repository → Contents:** **Read-only**
- (لا تحتج لأي صلاحية أخرى في المرحلة 1)

انسخ التوكن (يظهر مرة واحدة).

### 3. ضبط الأسرار

```bash
# PAT (سيُطلب لصقه)
npx wrangler secret put GITHUB_TOKEN

# كلمة السر — احسب SHA-256 لها أولاً:
echo -n "كلمة-السر-التي-تختارها" | sha256sum | cut -c-64
# انسخ النتيجة (64 حرف hex) ثم:
npx wrangler secret put ADMIN_PASS_HASH

# مفتاح عشوائي لتوقيع الـ session tokens:
openssl rand -hex 32
# انسخ النتيجة ثم:
npx wrangler secret put AUTH_SECRET
```

### 4. النشر

```bash
npx wrangler deploy
```

الإخراج سيُظهر رابطاً مثل:
```
https://gt-newstech-admin.<اسم-مستخدمك>.workers.dev
```

افتح الرابط، أدخل كلمة السر، وتحقق من الوحدات الثلاث (Dashboard / Articles / Images).

---

## التحقق من العمل

```bash
# health check (لا يحتاج مصادقة)
curl https://gt-newstech-admin.<user>.workers.dev/api/health

# هل كلمة السر مضبوطة؟
curl https://gt-newstech-admin.<user>.workers.dev/api/auth/status
```

---

## استكشاف الأخطاء

| المشكلة | السبب الأرجح | الحل |
|---|---|---|
| `invalid password` | hash خاطئ في `ADMIN_PASS_HASH` | أعد ضبطه بـ sha256 |
| `GitHub 401` | PAT منتهٍ أو ينقصه صلاحية Contents:Read | جدّد التوكن |
| `GitHub 403 rate limit` | تجاوزت 5000 طلب/ساعة | انتظر ساعة، أو خفف الاستعلامات |
| `categories.yml not found` | فرع آخر أو مسار مختلف | تأكد من `GITHUB_BRANCH` في `wrangler.toml` |

عرض السجلات الحية:
```bash
npx wrangler tail
```

---

## المراحل التالية

- **المرحلة 2:** كتابة/تعديل/حذف مقالات + رفع صور (يحتاج PAT بصلاحية Contents:**Write**)
- **المرحلة 3:** Cloudflare Access (Google login) أمام اللوحة + dual-mode للواجهة الحالية
- **المرحلة 4:** مزامنة ذكية مع اللوحة المحلية (إشعار "خلف بـ N commits")

---

## بنية الكود

```
admin-worker/
├── wrangler.toml          ← إعدادات Cloudflare
├── package.json
├── public/
│   └── index.html         ← واجهة المرحلة 1 (vanilla JS)
└── src/
    ├── index.js           ← Worker الرئيسي + router + CORS
    ├── lib/
    │   ├── auth.js        ← SHA-256 + HMAC tokens
    │   ├── github.js      ← Contents API + Git Trees wrapper
    │   └── yaml.js        ← YAML بسيط + front matter
    └── routes/
        ├── stats.js
        ├── categories.js
        ├── articles.js
        └── images.js
```
