# مزامنة GitHub → Codeberg تلقائياً (Bulk Mirror)

> دليل لإنشاء مرايا تلقائية لكل مستودعاتك على GitHub داخل Codeberg.
> Codeberg يستخدم **Forgejo** (مفتوح المصدر، مستضاف في ألمانيا).
> الحد الأدنى لتردد المزامنة: **ساعة واحدة**.

---

## الطريقة (أ) — يدوياً (إذا كانت ≤ 5 مشاريع)

لكل مشروع:

1. افتح <https://codeberg.org/repo/migrate>
2. أدخل:
   - **Migration Type:** `Git`
   - **Clone URL:** `https://github.com/SalehGNUTUX/REPO.git`
   - **Owner:** `gnutux` (حسابك على Codeberg)
   - **Repository Name:** اسم المستودع
   - ☑ **This repository will be a mirror**
   - **Mirror interval:** `every 1h`
3. **Migrate Repository**

---

## الطريقة (ب) — آلياً عبر Script (للعدد الكبير)

### الخطوة 1 — احصل على Codeberg Personal Access Token

1. افتح: <https://codeberg.org/user/settings/applications>
2. في قسم **"Generate new token"**:
   - **Token name:** `bulk-mirror`
   - **Repository and organization access:** ⦿ `All (public, private, and limited)`
   - **Select permissions:**

     | Scope | الإعداد |
     |---|---|
     | activitypub | No access |
     | issue | No access |
     | misc | No access |
     | notification | No access |
     | organization | No access |
     | package | No access |
     | **repository** | **Write** ← مهم |
     | **user** | **Read** ← مهم |

3. اضغط **Generate Token**
4. انسخ الـ token فوراً (يظهر مرة واحدة فقط، لا prefix معين)

### الخطوة 2 — احفظ هذا الـ Script

```bash
#!/bin/bash
# codeberg_github_sync.sh — حذف وإعادة إنشاء كل مستودعات Codeberg كمرايا من GitHub
# الاستخدام: CODEBERG_TOKEN="xxx" bash codeberg_github_sync.sh

set -e

CODEBERG_TOKEN="${CODEBERG_TOKEN:?ضع CODEBERG_TOKEN=... قبل التشغيل}"
CODEBERG_USER="${CODEBERG_USER:-gnutux}"
GITHUB_USER="${GITHUB_USER:-SalehGNUTUX}"
API="https://codeberg.org/api/v1"
MIRROR_INTERVAL="${MIRROR_INTERVAL:-1h0m0s}"   # كل ساعة (Codeberg الحد الأدنى)

echo "════════════════════════════════════════════"
echo "  حذف وإعادة إنشاء مستودعات Codeberg كمرايا "
echo "════════════════════════════════════════════"

# ── 1) قائمة المستودعات الحالية على Codeberg ──
echo ""
echo "📋 مستودعاتك الحالية على Codeberg:"
repos=$(curl -s -H "Authorization: token $CODEBERG_TOKEN" \
  "$API/users/$CODEBERG_USER/repos?limit=50")

echo "$repos" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if not isinstance(data, list):
    print(f'  ⚠ خطأ في القائمة: {data}')
    sys.exit(1)
for r in data:
    mirror_flag = ' (مرآة 🟢)' if r.get('mirror') else ''
    print(f\"  - {r['full_name']} (ID: {r['id']}){mirror_flag}\")
print(f\"\nالمجموع: {len(data)} مستودع\")
"

# ── 2) تأكيد ──
echo ""
read -p "⚠  هل تريد حذفها كلها وإعادة إنشائها كمرايا؟ اكتب YES للمتابعة: " confirm
[ "$confirm" != "YES" ] && { echo "أُلغي"; exit 0; }

# ── 3) حذف كل المستودعات الحالية ──
echo ""
echo "🗑  جاري الحذف..."

full_names=$(echo "$repos" | python3 -c "
import json, sys
for r in json.load(sys.stdin):
    print(r['full_name'])
")

for full in $full_names; do
  echo "  حذف: $full"
  curl -sf -X DELETE -H "Authorization: token $CODEBERG_TOKEN" \
    "$API/repos/$full" > /dev/null || echo "    ⚠ فشل حذف $full"
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
        desc = (r.get('description') or '').replace('|', '/')
        print(f\"{r['name']}|{r['clone_url']}|{desc}\")
")

echo "$gh_repos" | while IFS='|' read -r name url desc; do
  [ -z "$name" ] && continue
  echo ""
  echo "🔄 إنشاء مرآة: $name"

  # JSON body
  body=$(python3 -c "
import json
print(json.dumps({
    'clone_addr': '$url',
    'repo_owner': '$CODEBERG_USER',
    'repo_name': '$name',
    'mirror': True,
    'mirror_interval': '$MIRROR_INTERVAL',
    'private': False,
    'service': 'github',
    'description': '''$desc'''
}))
")

  resp=$(curl -s -X POST "$API/repos/migrate" \
    -H "Authorization: token $CODEBERG_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$body")

  err=$(echo "$resp" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    if isinstance(d, dict) and 'message' in d and 'id' not in d:
        print(d['message'])
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
echo "  https://codeberg.org/$CODEBERG_USER"
echo "════════════════════════════════════════════"
```

### الخطوة 3 — احفظه وشغّله

```bash
# احفظ الـ script
nano ~/codeberg_github_sync.sh
# (الصق المحتوى ثم Ctrl+O ثم Ctrl+X)
chmod +x ~/codeberg_github_sync.sh

# شغّله مع الـ token (طريقة آمنة)
echo "YOUR_TOKEN_HERE" > ~/.codeberg_token
chmod 600 ~/.codeberg_token
CODEBERG_TOKEN=$(cat ~/.codeberg_token) bash ~/codeberg_github_sync.sh
```

---

## ماذا يفعل الـ Script؟

1. يعرض كل مستودعاتك الحالية على Codeberg + علامة 🟢 إن كانت مرآة
2. يطلب تأكيداً صريحاً (`YES`)
3. يحذف المستودعات الحالية واحداً واحداً
4. ينتظر 10 ثوانٍ لاكتمال الحذف
5. يجلب مستودعاتك من GitHub (يتجاهل forks)
6. ينشئ لكل واحد مستودعاً جديداً على Codeberg مع:
   - **Mirror** مفعّل مع `mirror_interval: 1h0m0s`
   - **service: github** (يستفيد من تكامل Codeberg الخاص بـ GitHub)
   - **Visibility:** Public
   - **Description** منسوخ من GitHub
7. يعرض ملخصاً نهائياً مع رابط للتحقق

---

## ميزات الـ Script

| الميزة | الوصف |
|---|---|
| 🛡 **آمن** | يطلب تأكيد `YES` قبل أي حذف |
| 👁 **شفاف** | يعرض المستودعات الموجودة قبل التعامل معها |
| ⏱ **rate-limit aware** | ينتظر ثانية بين كل عملية |
| 🔍 **يتجاهل forks** | لا يُنشئ مرآة لمستودعات نسختها من غيرك |
| 📝 **ينقل الوصف** | يقرأ `description` من GitHub ويمرّره للمرآة |
| ⚠ **يبلّغ بالأخطاء** | لكل مستودع، رسالة نجاح أو فشل واضحة |

---

## التحقق بعد التشغيل

عرض كل المستودعات وحالة المرآة لكل واحد:

```bash
curl -s -H "Authorization: token $CODEBERG_TOKEN" \
  "https://codeberg.org/api/v1/users/$CODEBERG_USER/repos?limit=50" \
  | python3 -c "
import json, sys
for r in json.load(sys.stdin):
    icon = '🟢' if r.get('mirror') else '⚪'
    print(f\"{icon} {r['full_name']:35s} mirror={r.get('mirror', False)}\")
"
```

أو زيارة: <https://codeberg.org/gnutux>

---

## الفروقات الرئيسية: GitLab vs Codeberg

| | GitLab API | Codeberg (Forgejo) API |
|---|---|---|
| **Auth header** | `PRIVATE-TOKEN: ...` | `Authorization: token ...` |
| **Base URL** | `gitlab.com/api/v4` | `codeberg.org/api/v1` |
| **إنشاء مرآة** | `POST /projects` + `import_url` | `POST /repos/migrate` + JSON |
| **الحذف** | `DELETE /projects/:id` | `DELETE /repos/:owner/:repo` |
| **أدنى تردد مزامنة** | 30 دقيقة | **1 ساعة** |
| **Scopes المطلوبة** | `api` | `repository:Write` + `user:Read` |

---

## التشغيل المتوازي للـ Scripts الثلاثة

النسخ الاحتياطي الكامل عبر 3 مستودعات (3 طبقات حماية):

```bash
# مرة واحدة فقط — احفظ الـ tokens في ملفات محمية
echo "glpat-xxxx" > ~/.gitlab_token   && chmod 600 ~/.gitlab_token
echo "xxxxxxxxxx" > ~/.codeberg_token && chmod 600 ~/.codeberg_token

# شغّل الاثنين معاً
GITLAB_TOKEN=$(cat ~/.gitlab_token)     bash ~/gitlab_github_sync.sh
CODEBERG_TOKEN=$(cat ~/.codeberg_token) bash ~/codeberg_github_sync.sh
```

**النتيجة:**
```
GitHub  (المصدر الرئيسي)
  ├─→ GitLab    (مزامنة كل 30 دقيقة)
  └─→ Codeberg  (مزامنة كل ساعة)
```
