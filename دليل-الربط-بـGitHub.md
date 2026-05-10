# دليل الربط بـ GitHub ودفع التغييرات — GT-NEWSTECH

> آخر تحديث: 2026-05-10 — يتضمن جميع المشاكل والحلول الموثقة فعلياً

---

## المعلومات الأساسية للمستودع

| المعلومة | القيمة |
|---|---|
| **المستودع** | `https://github.com/SalehGNUTUX/GT-NEWSTECH` |
| **المستخدم** | `SalehGNUTUX` |
| **الفرع الرئيسي** | `main` |
| **البريد** | `gnutux.arabic@gmail.com` |

---

## الخطوة 1 — إعداد هوية Git (مرة واحدة فقط)

```bash
git config --global user.name "SalehGNUTUX"
git config --global user.email "gnutux.arabic@gmail.com"
```

تحقق:
```bash
git config --global --list
```

---

## الخطوة 2 — إنشاء Personal Access Token

> ⚠️ **مهم:** يجب أن يحتوي Token على صلاحيتَي `repo` **و** `workflow` معاً، وإلا سيرفض GitHub الدفع عند وجود ملفات GitHub Actions.

1. **github.com → الصورة الشخصية → Settings**
2. **Developer settings → Personal access tokens → Tokens (classic)**
3. **Generate new token (classic)**
4. **Note:** `GT-NEWSTECH Push`
5. **Expiration:** `No expiration`
6. **Scopes — ضع ✓ على:**
   - ✅ `repo` (كاملاً)
   - ✅ `workflow` ← **ضروري** لملفات `.github/workflows/`
7. **Generate token** ← **انسخه فوراً**

---

## الخطوة 3 — حفظ بيانات الدخول

```bash
git config --global credential.helper store
```

ادفع مرة يدوية لحفظ البيانات:
```bash
cd "/مسار/GT-NEWSTECH"
git push origin main
# Username: SalehGNUTUX
# Password: [الصق الـ Token]
```

بعدها لا يُطلب منك إدخال بيانات مجدداً.

---

## الخطوة 4 — ربط الفرع بالـ Remote

```bash
git branch --set-upstream-to=origin/main main
```

تحقق من الربط:
```bash
git remote -v
```

يجب أن يظهر:
```
origin  https://github.com/SalehGNUTUX/GT-NEWSTECH.git (fetch)
origin  https://github.com/SalehGNUTUX/GT-NEWSTECH.git (push)
```

---

## الدفع اليومي

### من لوحة التحكم (الأسهل)
1. افتح `bash start.sh`
2. اضغط **Git / نشر** → اكتب رسالة → **Commit & Push**

### من الطرفية
```bash
git add .
git commit -m "وصف التغيير"
git push origin main
```

---

## صيغ رسائل الـ Commit

| النوع | مثال |
|---|---|
| `add:` | `add: مقال — عنوان المقال` |
| `update:` | `update: تحديث مقال LibreOffice` |
| `fix:` | `fix: تصحيح صورة مقال Ubuntu` |
| `remove:` | `remove: حذف مقال قديم` |
| `config:` | `config: تحديث وصف الموقع` |

---

## مشكلات موثقة وحلولها

---

### ① الـ Token لا يملك صلاحية `workflow`

**الخطأ:**
```
remote: refusing to allow a Personal Access Token to create or update
workflow `.github/workflows/pages.yml` without `workflow` scope
```

**السبب:** الـ Token أُنشئ بصلاحية `repo` فقط بدون `workflow`.

**الحل:** أنشئ Token جديداً بالصلاحيتَين `repo` + `workflow`، ثم امسح المحفوظ القديم:
```bash
git credential reject <<'EOF'
protocol=https
host=github.com
EOF
git push origin main
# أدخل المستخدم والـ Token الجديد عند الطلب
```

---

### ② رفض الدفع — تاريخان متباعدان `non-fast-forward`

**الخطأ:**
```
! [rejected] main -> main (non-fast-forward)
Updates were rejected because the tip of your current branch is behind
```

**السبب:** المستودع البعيد يحتوي commits غير موجودة محلياً (مثلاً: ملفات رُفعت مباشرة من واجهة GitHub).

**الحل أ — إذا كان التاريخ المحلي هو الصحيح (الأكثر شيوعاً):**
```bash
git push origin main --force
```

**الحل ب — إذا أردت دمج التاريخَين:**
```bash
git branch --set-upstream-to=origin/main main
git pull origin main --rebase
git push origin main
```

---

### ③ تعذّر الـ pull بسبب تغييرات غير محفوظة

**الخطأ:**
```
error: cannot pull with rebase: You have unstaged changes.
```

**الحل:**
```bash
git stash                    # احفظ التغييرات مؤقتاً
git pull origin main --rebase
git stash pop                # أعد التغييرات
git push origin main
```

> ⚠️ **تحذير:** لا تستخدم `git stash drop` إلا إذا كنت متأكداً من عدم الحاجة للتغييرات، لأن ذلك يحذفها نهائياً من الـ stash (راجع المشكلة ⑤).

---

### ④ الـ pull يطلب تحديد استراتيجية الدمج

**الخطأ:**
```
fatal: Need to specify how to reconcile divergent branches.
hint: git config pull.rebase false  # merge
hint: git config pull.rebase true   # rebase
```

**الحل:**
```bash
git pull origin main --rebase
```

أو لجعله الافتراضي دائماً:
```bash
git config --global pull.rebase true
git pull origin main
```

---

### ⑤ استرجاع تغييرات ضاعت بعد `git stash drop`

**الموقف:** تم تشغيل `git stash drop` عن طريق الخطأ وضاعت تغييرات مهمة.

**الحل — استرجاع الـ stash من الـ reflog:**
```bash
# ابحث عن الـ commits الضائعة
git fsck --lost-found

# ستظهر نتيجة مثل:
# dangling commit f1e79bfc41e6b3158b5547ce08c99a3a44b60523

# تحقق من محتواه
git show f1e79bfc --stat

# إذا كان هو الـ stash المطلوب، طبّقه
git stash apply f1e79bfc

# ثم احفظه وارفعه
git add .
git commit -m "استرجاع التغييرات المفقودة"
git push origin main
```

> ✅ **ملاحظة:** Git يحتفظ بالـ dangling commits في قاعدة بياناته لفترة قبل أن يحذفها نهائياً بـ `git gc`. الاسترجاع ممكن طالما لم تُشغَّل عملية garbage collection.

---

### ⑥ الطرفية لا تقبل إدخال اسم المستخدم والـ Token تفاعلياً

**الموقف:** تشغيل `git push` من سكريبت أو بيئة لا تدعم الإدخال التفاعلي.

**الحل — تضمين الـ Token مباشرة في الرابط:**
```bash
git push https://SalehGNUTUX:TOKEN_HERE@github.com/SalehGNUTUX/GT-NEWSTECH.git main --force
```

استبدل `TOKEN_HERE` بالـ Token الفعلي.

> ⚠️ لا تحفظ هذا الأمر في ملف أو تاريخ الطرفية لأنه يكشف الـ Token.

---

### ⑦ `Everything up-to-date` لكن الموقع لم يتحدث

**الموقف:** الأمر `git push` يقول Everything up-to-date لكن التغييرات لا تظهر على الموقع.

**الأسباب المحتملة والحلول:**

| السبب | الحل |
|---|---|
| GitHub Actions لم ينتهِ بعد | انتظر دقيقة، تحقق من: `github.com/SalehGNUTUX/GT-NEWSTECH/actions` |
| المتصفح يعرض نسخة مخزنة | اضغط `Ctrl+Shift+R` لتحديث قسري |
| التغييرات لم تُحفظ (commit) | شغّل `git status` للتحقق، ثم `git add . && git commit` |
| الـ remote و local متزامنان فعلاً | هذه الرسالة **صحيحة** — لا يوجد جديد للرفع |

---

### ⑧ `fatal: not a git repository`

**السبب:** المجلد غير مرتبط بـ Git.

**الحل:**
```bash
cd "/مسار/GT-NEWSTECH"
git init
git remote add origin https://github.com/SalehGNUTUX/GT-NEWSTECH.git
git fetch origin
git checkout main
```

---

### ⑨ Token منتهية الصلاحية

**الخطأ:** `remote: Permission denied` أو طلب بيانات دخول في كل مرة.

**الحل:**
```bash
# 1. امسح البيانات المحفوظة
git credential reject <<'EOF'
protocol=https
host=github.com
EOF

# 2. أنشئ Token جديداً من GitHub (repo + workflow)

# 3. ادفع وأدخل البيانات الجديدة
git push origin main
```

---

## مرجع سريع

```bash
# إعداد أولي (مرة واحدة)
git config --global user.name "SalehGNUTUX"
git config --global user.email "gnutux.arabic@gmail.com"
git config --global credential.helper store
git config --global pull.rebase true
git branch --set-upstream-to=origin/main main

# دفع يومي
git add .
git commit -m "وصف التغيير"
git push origin main

# عند الرفض (non-fast-forward)
git push origin main --force

# عند وجود تغييرات محلية وتريد السحب
git stash && git pull origin main --rebase && git stash pop

# فحص الحالة
git status
git log --oneline -5
git remote -v
```
