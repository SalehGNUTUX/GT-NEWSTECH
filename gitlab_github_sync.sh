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
