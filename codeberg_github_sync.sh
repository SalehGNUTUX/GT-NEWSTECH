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

delete_failed=0
for full in $full_names; do
  echo "  حذف: $full"
  http_code=$(curl -s -o /tmp/cb_del_resp.txt -w "%{http_code}" \
    -X DELETE -H "Authorization: token $CODEBERG_TOKEN" \
    "$API/repos/$full")
  if [ "$http_code" = "204" ]; then
    echo "    ✓ تم"
  else
    echo "    ⚠ فشل (HTTP $http_code)"
    body=$(cat /tmp/cb_del_resp.txt 2>/dev/null)
    [ -n "$body" ] && echo "      الرد: $body"
    delete_failed=1
  fi
  sleep 1
done
rm -f /tmp/cb_del_resp.txt

if [ "$delete_failed" = "1" ]; then
  echo ""
  echo "════════════════════════════════════════════"
  echo "  ⚠ فشل حذف بعض المستودعات."
  echo ""
  echo "  السبب الأرجح: التوكن ينقصه صلاحية الحذف."
  echo "  افتح: https://codeberg.org/user/settings/applications"
  echo "  وعدّل التوكن ليشمل:"
  echo "    • repository → Admin   (أو على الأقل Delete)"
  echo "    • user       → Read"
  echo "════════════════════════════════════════════"
  read -p "هل تريد المتابعة لإنشاء المرايا للمستودعات المحذوفة فقط؟ (y/N): " cont
  [ "$cont" != "y" ] && [ "$cont" != "Y" ] && exit 1
fi

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

  http_code=$(curl -s -o /tmp/cb_mig_resp.txt -w "%{http_code}" \
    -X POST "$API/repos/migrate" \
    -H "Authorization: token $CODEBERG_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$body")
  resp=$(cat /tmp/cb_mig_resp.txt)

  if [ "$http_code" = "201" ]; then
    echo "  ✓ تم"
  else
    err=$(echo "$resp" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    if isinstance(d, dict):
        msg = d.get('message') or d.get('error') or str(d)
        print(msg)
    else:
        print(str(d))
except Exception:
    print(sys.stdin.read())
" 2>/dev/null)
    echo "  ⚠ خطأ (HTTP $http_code): $err"
  fi
  sleep 2
done

rm -f /tmp/cb_mig_resp.txt
echo ""
echo "════════════════════════════════════════════"
echo "  ✓ اكتمل! تحقق من:                          "
echo "  https://codeberg.org/$CODEBERG_USER"
echo "════════════════════════════════════════════"
