# مزامنة GitHub → GitLab تلقائياً (Bulk Mirror)

> دليل لإنشاء مرايا تلقائية لكل مستودعاتك على GitHub داخل GitLab.
> المرآة (Pull Mirror) تجلب التحديثات تلقائياً كل ~30 دقيقة بدون أي تدخل يدوي.

---

## الطريقة (أ) — يدوياً (إذا كانت ≤ 5 مشاريع)

لكل مشروع:

1. افتح **Settings → General → Advanced**
2. **Delete project** → اكتب اسم المشروع للتأكيد
3. أعد إنشاءه من <https://gitlab.com/projects/new> → **Repository by URL** + ✅ **Mirror repository**

---

## الطريقة (ب) — آلياً عبر Script (للعدد الكبير)

### الخطوة 1 — احصل على GitLab Personal Access Token

1. افتح: <https://gitlab.com/-/user_settings/personal_access_tokens>
2. **Add new token**:
   - **Name:** `bulk-mirror`
   - **Expiration:** 7 days (يكفي للمهمة)
   - **Scopes:** ☑ `api`
3. انسخ الـ token (يبدأ بـ `glpat-`)

### الخطوة 2 — احفظ هذا الـ Script

```bash
#!/bin/bash
# gitlab_github_sync.sh — حذف وإعادة إنشاء كل مشاريع GitLab كمرايا من GitHub
# الاستخدام: GITLAB_TOKEN="glpat-xxx" bash gitlab_github_sync.sh

set -e

GITLAB_TOKEN="${GITLAB_TOKEN:?ضع GITLAB_TOKEN=... قبل التشغيل}"
GITLAB_USER="${GITLAB_USER:-SalehGNUTUX}"
GITHUB_USER="${GITHUB_USER:-SalehGNUTUX}"
API="https://gitlab.com/api/v4"

echo "════════════════════════════════════════════"
echo "  حذف وإعادة إنشاء كل مشاريع GitLab كمرايا  "
echo "════════════════════════════════════════════"

# ── 1) قائمة المشاريع الحالية على GitLab ──
echo ""
echo "📋 مشاريعك الحالية على GitLab:"
projects=$(curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$API/users/$GITLAB_USER/projects?per_page=100&owned=true")

echo "$projects" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for p in data:
    print(f\"  - {p['path_with_namespace']} (ID: {p['id']})\")
print(f\"\nالمجموع: {len(data)} مشروع\")
"

# ── 2) تأكيد ──
echo ""
read -p "⚠  هل تريد حذفها كلها وإعادة إنشائها كمرايا؟ اكتب YES للمتابعة: " confirm
[ "$confirm" != "YES" ] && { echo "أُلغي"; exit 0; }

# ── 3) حذف كل مشاريع GitLab ──
echo ""
echo "🗑  جاري الحذف..."

ids=$(echo "$projects" | python3 -c "
import json, sys
for p in json.load(sys.stdin):
    print(p['id'])
")

for id in $ids; do
  name=$(echo "$projects" | python3 -c "
import json, sys
for p in json.load(sys.stdin):
    if p['id'] == $id:
        print(p['path'])
        break
")
  echo "  حذف: $name"
  curl -sf -X DELETE -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    "$API/projects/$id" > /dev/null
  sleep 1
done

echo "✓ تم حذف الكل. الانتظار 10 ثوانٍ لاكتمال العملية..."
sleep 10

# ── 4) جلب مستودعات GitHub العامة وإنشاء مرايا ──
echo ""
echo "📥 جلب مستودعات GitHub لـ @$GITHUB_USER..."

gh_repos=$(curl -s "https://api.github.com/users/$GITHUB_USER/repos?per_page=100&type=owner&sort=updated" \
  | python3 -c "
import json, sys
for r in json.load(sys.stdin):
    if not r['fork']:
        print(f\"{r['name']}|{r['clone_url']}\")
")

echo "$gh_repos" | while IFS='|' read -r name url; do
  [ -z "$name" ] && continue
  echo ""
  echo "🔄 إنشاء مرآة: $name"
  resp=$(curl -s -X POST "$API/projects" \
    -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    -d "name=$name" \
    -d "import_url=$url" \
    -d "mirror=true" \
    -d "mirror_trigger_builds=false" \
    -d "visibility=public")

  err=$(echo "$resp" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    print(d.get('message', d.get('error', '')))
except Exception:
    pass
" 2>/dev/null)

  if [ -n "$err" ]; then
    echo "  ⚠ خطأ: $err"
  else
    echo "  ✓ تم"
  fi
  sleep 2
done

echo ""
echo "════════════════════════════════════════════"
echo "  ✓ اكتمل! تحقق من:                          "
echo "  https://gitlab.com/$GITLAB_USER/?archived=false"
echo "════════════════════════════════════════════"
```

### الخطوة 3 — احفظه وشغّله

```bash
# احفظ الـ script في مكان مناسب
nano ~/gitlab_github_sync.sh
# (الصق المحتوى ثم Ctrl+O ثم Ctrl+X)
chmod +x ~/gitlab_github_sync.sh

# شغّله مع الـ token
GITLAB_TOKEN="glpat-xxxxxxxxxxxxxxxx" bash ~/gitlab_github_sync.sh
```

> **نصيحة أمنية:** بدلاً من كتابة الـ token مباشرة في سطر الأوامر، احفظه في ملف محمي:
> ```bash
> echo "glpat-xxxxxxxx" > ~/.gitlab_token && chmod 600 ~/.gitlab_token
> GITLAB_TOKEN=$(cat ~/.gitlab_token) bash ~/gitlab_github_sync.sh
> ```

---

## ماذا يفعل الـ Script؟

1. يعرض كل مشاريعك الحالية على GitLab + عددها
2. يطلب تأكيداً صريحاً (`YES`) قبل المتابعة
3. يحذف المشاريع الحالية واحداً واحداً
4. ينتظر 10 ثوانٍ لاكتمال الحذف
5. يجلب مستودعاتك من GitHub (يتجاهل forks)
6. ينشئ لكل واحد مشروعاً جديداً على GitLab مع:
   - **Pull mirror** مفعّل
   - **Visibility:** Public
   - مرتبط بـ GitHub URL مباشرةً
7. يعرض ملخصاً نهائياً مع رابط للتحقق

---

## ميزات الـ Script

| الميزة | الوصف |
|---|---|
| 🛡 **آمن** | يطلب تأكيد `YES` قبل أي حذف |
| 👁 **شفاف** | يعرض كل مشروع قبل التعامل معه |
| ⏱ **rate-limit aware** | ينتظر ثانية بين كل عملية |
| 🔍 **يتجاهل forks** | لا يُنشئ مرآة لمستودعات نسختها من غيرك |
| ⚠ **يبلّغ بالأخطاء** | لكل مشروع، رسالة نجاح أو فشل واضحة |

---

## نسخة "إضافة فقط" (بدون حذف)

إذا كنت لا تريد حذف ما هو موجود، فقط إضافة مرايا للمستودعات الموجودة على GitHub والمفقودة من GitLab:

```bash
#!/bin/bash
# only-add-missing.sh — أضف مرآة لكل مشروع GitHub غير موجود على GitLab
set -e
GITLAB_TOKEN="${GITLAB_TOKEN:?ضع GITLAB_TOKEN}"
GITHUB_USER="${GITHUB_USER:-SalehGNUTUX}"
GITLAB_USER="${GITLAB_USER:-SalehGNUTUX}"
API="https://gitlab.com/api/v4"

# أسماء المشاريع الموجودة على GitLab
existing=$(curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$API/users/$GITLAB_USER/projects?per_page=100" \
  | python3 -c "
import json, sys
for p in json.load(sys.stdin):
    print(p['path'])
")

# مستودعات GitHub
curl -s "https://api.github.com/users/$GITHUB_USER/repos?per_page=100&type=owner" \
  | python3 -c "
import json, sys
for r in json.load(sys.stdin):
    if not r['fork']:
        print(f\"{r['name']}|{r['clone_url']}\")
" | while IFS='|' read -r name url; do
  if echo "$existing" | grep -qx "$name"; then
    echo "✓ موجود: $name"
  else
    echo "🔄 إضافة: $name"
    curl -s -X POST "$API/projects" -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
      -d "name=$name" \
      -d "import_url=$url" \
      -d "mirror=true" \
      -d "visibility=public" > /dev/null
    sleep 2
  fi
done
```

---

## التحقق بعد التشغيل

عرض كل المشاريع وحالة المرآة لكل واحدة:

```bash
curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "https://gitlab.com/api/v4/users/$GITLAB_USER/projects?per_page=100" \
  | python3 -c "
import json, sys
for p in json.load(sys.stdin):
    icon = '🟢' if p.get('mirror') else '⚪'
    print(f\"{icon} {p['path']:30s} mirror={p.get('mirror', False)}\")
"
```

أو زيارة الرابط مباشرة: <https://gitlab.com/SalehGNUTUX/?archived=false>

---

## أيهما تختار؟

| السيناريو | الحل |
|---|---|
| ≤ 5 مشاريع | يدوياً (سريع) |
| عدد كبير + تريد البدء من جديد | script الحذف والإعادة |
| تريد إضافة مرايا للمفقود فقط | script "إضافة فقط" |
