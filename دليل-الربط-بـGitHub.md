# دليل الربط بـ GitHub ودفع التغييرات — GT-NEWSTECH

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

تحقق من الإعداد:
```bash
git config --global --list
```

---

## الخطوة 2 — إنشاء Personal Access Token على GitHub

Token هو كلمة مرور خاصة تمنح صلاحية الدفع للمستودع.

1. اذهب إلى: **github.com → الصورة الشخصية → Settings**
2. من القائمة الجانبية: **Developer settings**
3. اختر: **Personal access tokens → Tokens (classic)**
4. اضغط: **Generate new token (classic)**
5. في حقل **Note** اكتب: `GT-NEWSTECH Push`
6. في **Expiration** اختر: `No expiration` (أو مدة تناسبك)
7. في **Select scopes** ضع علامة ✓ على: **repo** (كاملاً)
8. اضغط: **Generate token**
9. **انسخ الـ Token فوراً** — لن يظهر مرة أخرى

---

## الخطوة 3 — حفظ بيانات الدخول محلياً (مرة واحدة فقط)

```bash
git config --global credential.helper store
```

ثم ادفع مرة واحدة يدوياً من الطرفية:

```bash
cd "/مسار/GT-NEWSTECH"
git push origin main
```

سيطلب منك:
```
Username: SalehGNUTUX
Password: الصق الـ Token هنا (لن يظهر أثناء الكتابة)
```

بعد هذه المرة يحفظ Git البيانات تلقائياً ولا يطلبها مجدداً.

---

## الخطوة 4 — التحقق من الربط

```bash
git remote -v
```

يجب أن يظهر:
```
origin  https://github.com/SalehGNUTUX/GT-NEWSTECH.git (fetch)
origin  https://github.com/SalehGNUTUX/GT-NEWSTECH.git (push)
```

إذا لم يظهر الـ remote أو كان خاطئاً:
```bash
git remote add origin https://github.com/SalehGNUTUX/GT-NEWSTECH.git
# أو إذا كان موجوداً لكن خاطئاً:
git remote set-url origin https://github.com/SalehGNUTUX/GT-NEWSTECH.git
```

---

## دفع التغييرات — الطريقة اليومية

### من لوحة التحكم (الأسهل)
1. افتح لوحة التحكم: `bash start.sh`
2. انقر **Git / نشر** في القائمة الجانبية
3. اكتب رسالة وصفية في حقل الـ commit
4. اضغط **Commit & Push**

---

### من الطرفية
```bash
cd "/مسار/GT-NEWSTECH"

# 1. إضافة جميع التغييرات
git add .

# 2. حفظ مع رسالة وصفية
git commit -m "add: مقال جديد — عنوان المقال"

# 3. رفع للمستودع
git push origin main
```

---

## صيغ رسائل الـ Commit

| النوع | الاستخدام | مثال |
|---|---|---|
| `add:` | إضافة مقال أو صورة جديدة | `add: مقال — رقائق ARM 2026` |
| `update:` | تعديل مقال موجود | `update: تحديث مقال LibreOffice` |
| `fix:` | تصحيح خطأ أو رابط | `fix: تصحيح صورة مقال Ubuntu` |
| `remove:` | حذف مقال أو صورة | `remove: حذف مقال قديم` |
| `config:` | تغيير في الإعدادات | `config: تحديث وصف الموقع` |

---

## مشكلات شائعة وحلولها

### المشكلة: `remote: Permission denied`
**السبب:** الـ Token منتهي أو ليس له صلاحية `repo`
**الحل:**
```bash
git config --global credential.helper store
# أنشئ Token جديد من GitHub وادفع مرة يدوية
git push origin main
```

---

### المشكلة: `Updates were rejected` أو `! [rejected] main -> main`
**السبب:** المستودع على GitHub أحدث من النسخة المحلية
**الحل:**
```bash
git pull origin main --rebase
git push origin main
```

---

### المشكلة: `fatal: not a git repository`
**السبب:** المجلد غير مرتبط بـ Git
**الحل:**
```bash
cd "/مسار/GT-NEWSTECH"
git init
git remote add origin https://github.com/SalehGNUTUX/GT-NEWSTECH.git
git fetch origin
git checkout main
```

---

### المشكلة: الـ Token انتهت صلاحيته
**الحل:** أنشئ Token جديداً من GitHub ثم احذف البيانات المحفوظة القديمة:
```bash
# على Linux
git credential reject <<EOF
protocol=https
host=github.com
EOF
# ثم ادفع مجدداً وأدخل الـ Token الجديد
git push origin main
```

---

## مرجع سريع

```
إعداد لمرة واحدة:
  git config --global user.name "SalehGNUTUX"
  git config --global user.email "gnutux.arabic@gmail.com"
  git config --global credential.helper store

دفع يومي:
  git add .
  git commit -m "وصف التغيير"
  git push origin main

التحقق من الحالة:
  git status
  git log --oneline -5
```
