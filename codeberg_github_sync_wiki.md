# مزامنة GitHub → Codeberg تلقائياً (Push عبر GitHub Actions)

> Codeberg **عطّل ميزة Pull Mirrors** لكل المستخدمين الجدد (سياسة لتقليل الضغط على البنية التحتية).
> الحل البديل: **GitHub Actions يدفع** إلى Codeberg عند كل تحديث.
> النتيجة نفسها — مزامنة تلقائية، لكنها فورية (وليست بانتظار جدولة 1 ساعة).

---

## نظرة عامة

| | |
|---|---|
| **آلية المزامنة** | كل push إلى GitHub → workflow يدفع نسخة لـ Codeberg |
| **التأخير** | ثوانٍ معدودة (لا انتظار ساعة) |
| **التكلفة** | مجاني تماماً (GitHub Actions يمنح ساعات وفيرة للمستودعات العامة) |
| **النطاق** | كل الفروع والوسوم تلقائياً (`--mirror`) |

---

## اختر السكريبت المناسب

| الحالة | الأمر |
|---|---|
| **أول مرة** (إعداد كل مستودعاتك) | `bash codeberg_workflow_install.sh` |
| **مستودع جديد** (واحد فقط) | `bash codeberg_add_repo.sh REPO_NAME` |
| **توكن بُدِّل** (إعادة ضبط الـ secrets) | `bash codeberg_fix_secrets.sh` |
| **تشغيل المزامنة فوراً** | `gh workflow run codeberg-mirror.yml --repo SalehGNUTUX/REPO` |

> ❌ **لا تستعمل** `codeberg_github_sync.sh` (السكريبت القديم — Codeberg عطّل Pull Mirror).

---

## الطريقة (أ) — يدوياً لمستودع واحد

### 1. أنشئ مستودعاً فارغاً على Codeberg

افتح: <https://codeberg.org/repo/create>
- الاسم: نفس اسم المستودع على GitHub
- ⛔ **لا تختر** "Initialize repository" (يجب أن يبقى فارغاً)

### 2. احصل على Codeberg Token

افتح: <https://codeberg.org/user/settings/applications>
- **Token name:** `mirror-push`
- **Repository:** ⦿ All
- **Permissions:**

  | Scope | الإعداد |
  |---|---|
  | **repository** | **Write** (لا حاجة لـ Admin لأن المستودع موجود) |
  | **user** | **Read** |

انسخ التوكن فوراً.

### 3. أضف Secret في GitHub

في مستودعك على GitHub:
- Settings → Secrets and variables → Actions → **New repository secret**
- Name: `CODEBERG_TOKEN`
- Value: الصق التوكن

### 4. أضف ملف الـ workflow

أنشئ `.github/workflows/codeberg-mirror.yml` بمحتوى ملف `codeberg-mirror.yml` المرفق.

عند أول push بعد ذلك → سيظهر تشغيل الـ workflow في تبويب **Actions**، وستجد المستودع مُحدَّثاً على Codeberg.

---

## إضافة مستودع جديد لاحقاً (مستودع واحد فقط)

عند إنشاء مستودع جديد على GitHub، استعمل:

```bash
bash codeberg_add_repo.sh REPO_NAME
```

السكريبت يقوم بالخطوات الثلاث لمستودع واحد فقط:
1. ✅ يتحقّق أن المستودع موجود على GitHub
2. ✅ يُنشئ مستودعاً فارغاً مطابقاً على Codeberg (مع حفظ private/public)
3. ✅ يضبط `CODEBERG_TOKEN` كـ secret
4. ✅ يرفع ملف الـ workflow
5. ✅ يسأل إن كنت تريد تشغيل المزامنة فوراً

**مثال:**
```bash
gh repo create SalehGNUTUX/GT-NEW-PROJECT --public
# … أضف الكود ثم …
bash codeberg_add_repo.sh GT-NEW-PROJECT
```

> **متى تختار هذا بدل (ب)؟** عند إضافة مستودع واحد فقط. أسرع لأنه لا يفحص الـ34 الموجودين.

---

## الطريقة (ب) — آلياً لكل المستودعات (مُوصى بها لأول مرة)

سكريبت `codeberg_workflow_install.sh` يقوم بكل ما سبق لكل مستودعاتك دفعةً واحدة.

### المتطلبات

- **gh CLI** مُسجَّل دخول:
  ```bash
  sudo apt install gh
  gh auth login
  ```
- **Codeberg Token** بصلاحيات `repository: Admin` + `user: Read` (Admin مطلوب لأن السكريبت ينشئ المستودعات تلقائياً).

### التشغيل

```bash
# احفظ التوكن
echo "YOUR_CODEBERG_TOKEN" > ~/.codeberg_token
chmod 600 ~/.codeberg_token

# شغّل المثبّت
CODEBERG_TOKEN=$(cat ~/.codeberg_token) bash codeberg_workflow_install.sh
```

### ماذا يفعل لكل مستودع؟

1. ✅ يتحقّق إن كان مستودع Codeberg موجوداً — إن لا، يُنشئه فارغاً (يحافظ على private/public)
2. ✅ يُضيف `CODEBERG_TOKEN` كـ secret في مستودع GitHub
3. ✅ يرفع ملف `.github/workflows/codeberg-mirror.yml` (يُحدّث الموجود إن وُجد)

### النتيجة

- كل commit جديد على GitHub → خلال ثوانٍ يظهر على Codeberg
- يشمل: كل الفروع، الوسوم، الحذف (delete events)
- لا تدخّل يدوي بعد ذلك

---

## كيف يعمل الـ Workflow؟

```yaml
name: Mirror to Codeberg
on:
  push:    { branches: ['**'], tags: ['**'] }
  delete:
  workflow_dispatch:

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: |
          git remote add codeberg "https://gnutux:${CODEBERG_TOKEN}@codeberg.org/gnutux/${GITHUB_REPOSITORY##*/}.git"
          git push --mirror codeberg
```

- `fetch-depth: 0` — يجلب كل التاريخ (مطلوب لـ `--mirror`)
- `git push --mirror` — يدفع كل المراجع كما هي (يحذف ما حُذف)
- `concurrency` — يمنع تداخل تشغيلات متعددة

---

## تشغيل يدوي

لإجبار المزامنة فوراً (مثلاً بعد رجوع المستودع من حذف):

```bash
gh workflow run codeberg-mirror.yml --repo SalehGNUTUX/REPO_NAME
```

أو من واجهة GitHub:
**Actions → Mirror to Codeberg → Run workflow**

---

## مراقبة الحالة

### رؤية كل التشغيلات

```bash
gh run list --repo SalehGNUTUX/REPO_NAME --workflow=codeberg-mirror.yml
```

### تفاصيل تشغيل معيّن

```bash
gh run view <run-id> --repo SalehGNUTUX/REPO_NAME
```

### إشعار عند الفشل

افتح أي مستودع → Settings → Notifications → فعّل **Actions failures**.

---

## استكشاف الأخطاء

### `403 the site administrator has disabled the creation of new pull mirrors`

هذا الخطأ يعني أنك تستعمل السكريبت القديم `codeberg_github_sync.sh` — لا تستعمله بعد الآن. استخدم `codeberg_workflow_install.sh` الذي يعتمد Push بدل Mirror.

### `remote: error: cannot lock ref`

يحدث عندما يكون مستودع Codeberg غير فارغ. الحل:
1. احذفه يدوياً من Codeberg
2. أنشئه فارغاً (بدون README)
3. أعد تشغيل الـ workflow

### الـ workflow لا يعمل

تحقّق من:
- Settings → Secrets → Actions: هل `CODEBERG_TOKEN` موجود؟
- التوكن لم ينتهِ صلاحيته على Codeberg
- مستودع Codeberg موجود (إن لم يكن، أنشئه يدوياً أو شغّل `codeberg_workflow_install.sh`)

### `Credentials are incorrect or have expired` رغم أن التوكن صحيح

السبب الأرجح: **ملف التوكن ينتهي بـ `\n`** (`echo "..." > file` يضيف سطراً جديداً). حتى لو طوله ظاهرياً صحيح، الـ secret المُخزَّن سيحتوي على الـ newline ويُفسد URL المصادقة.

**الحل:** أعد ضبط الـ secret من الملف مباشرة (gh يقطع `\n` عند القراءة من stdin):
```bash
gh secret set CODEBERG_TOKEN --repo SalehGNUTUX/REPO < ~/.codeberg_token
```

أو لكل المستودعات دفعة واحدة:
```bash
bash codeberg_fix_secrets.sh
```

⚠ **لا** تستعمل `echo "$TOKEN" | gh secret set --body -` — `echo` يضيف `\n` في النهاية.

---

## الفرق عن Pull Mirror التقليدي

| | Pull Mirror (لم يعد متاحاً) | Push عبر Actions (الحالي) |
|---|---|---|
| **آلية** | Codeberg يسحب دورياً | GitHub يدفع عند التحديث |
| **التأخير** | حتى 1 ساعة | ثوانٍ |
| **يحتاج لكل مستودع** | إعداد واحد على Codeberg | secret + workflow file في GitHub |
| **المزامنة بعد حذف فرع** | تلقائي | تلقائي (حدث `delete`) |
| **التوكن** | يُحفظ على Codeberg | يُحفظ كـ secret في GitHub |

---

## النسخ الاحتياطي الكامل (3 طبقات)

| الطبقة | الآلية | التأخير |
|---|---|---|
| **GitHub** (المصدر) | — | — |
| **GitLab** | Pull Mirror (لا يزال يعمل) | 30 دقيقة |
| **Codeberg** | Push عبر Actions | ثوانٍ |

```bash
# مرة واحدة فقط:
echo "glpat-xxxx" > ~/.gitlab_token   && chmod 600 ~/.gitlab_token
echo "xxxxxxxxxx" > ~/.codeberg_token && chmod 600 ~/.codeberg_token

# تشغيل المثبّتين:
GITLAB_TOKEN=$(cat ~/.gitlab_token)     bash gitlab_github_sync.sh
CODEBERG_TOKEN=$(cat ~/.codeberg_token) bash codeberg_workflow_install.sh
```

النتيجة:
```
GitHub  (المصدر الرئيسي)
  ├─→ GitLab    (Pull Mirror كل 30 دقيقة)
  └─→ Codeberg  (Push عبر Actions، فوري)
```

---

## ملاحظة عن السكريبت القديم

`codeberg_github_sync.sh` لا يزال موجوداً للأرشيف، لكنه **لن يعمل** بسبب سياسة Codeberg الجديدة (`HTTP 403`). احتفظ به فقط للرجوع لو غيّروا السياسة لاحقاً.
