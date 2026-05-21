#!/bin/bash
# codeberg_workflow_install.sh
# ─────────────────────────────────────────────────────────────────
# يثبّت .github/workflows/codeberg-mirror.yml في كل مستودعاتك على GitHub
# ويُنشئ المستودع المطابق على Codeberg + يضيف CODEBERG_TOKEN secret.
#
# المتطلبات:
#   • gh CLI مُسجَّل دخول (gh auth login)
#   • CODEBERG_TOKEN في متغيّر بيئة (repository: Admin + user: Read)
#
# الاستخدام:
#   CODEBERG_TOKEN=$(cat ~/.codeberg_token) bash codeberg_workflow_install.sh
# ─────────────────────────────────────────────────────────────────
set -e

CODEBERG_TOKEN="${CODEBERG_TOKEN:?ضع CODEBERG_TOKEN=... قبل التشغيل}"
CODEBERG_USER="${CODEBERG_USER:-gnutux}"
GITHUB_USER="${GITHUB_USER:-SalehGNUTUX}"
CB_API="https://codeberg.org/api/v1"
WORKFLOW_PATH=".github/workflows/codeberg-mirror.yml"
WORKFLOW_FILE="$(dirname "$0")/codeberg-mirror.yml"

[ ! -f "$WORKFLOW_FILE" ] && { echo "❌ لم أجد $WORKFLOW_FILE"; exit 1; }

# تحقق من gh
if ! command -v gh &> /dev/null; then
  echo "❌ gh CLI غير مثبّت. ثبّته: sudo apt install gh أو https://cli.github.com"
  exit 1
fi
if ! gh auth status &> /dev/null; then
  echo "❌ سجّل دخول gh أولاً: gh auth login"
  exit 1
fi

echo "════════════════════════════════════════════"
echo "  تثبيت Workflow لمزامنة GitHub → Codeberg "
echo "════════════════════════════════════════════"

# ── 1) جلب مستودعات GitHub ──
echo ""
echo "📥 جلب مستودعات GitHub لـ @$GITHUB_USER (تجاهل forks)..."
repos=$(gh repo list "$GITHUB_USER" --no-archived --source --limit 200 --json name,isPrivate \
  | python3 -c "
import json, sys
for r in json.load(sys.stdin):
    vis = 'private' if r['isPrivate'] else 'public'
    print(f\"{r['name']}|{vis}\")
")

count=$(echo "$repos" | grep -c '|' || true)
echo "   عدد المستودعات: $count"

# ── 2) تأكيد ──
echo ""
read -p "⚠  متابعة وتثبيت Workflow في كلٍّ منها؟ (YES): " confirm
[ "$confirm" != "YES" ] && { echo "أُلغي"; exit 0; }

# ── 3) لكل مستودع ──
WF_CONTENT=$(cat "$WORKFLOW_FILE")
WF_B64=$(base64 -w 0 "$WORKFLOW_FILE")

echo "$repos" | while IFS='|' read -r name visibility; do
  [ -z "$name" ] && continue
  echo ""
  echo "🔧 المستودع: $name"

  # (أ) أنشئ مستودعاً فارغاً على Codeberg إن لم يوجد
  cb_check=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: token $CODEBERG_TOKEN" \
    "$CB_API/repos/$CODEBERG_USER/$name")
  if [ "$cb_check" = "404" ]; then
    echo "  (1/3) إنشاء مستودع فارغ على Codeberg..."
    create_body=$(python3 -c "
import json
print(json.dumps({
    'name': '$name',
    'private': $( [ "$visibility" = "private" ] && echo true || echo false ),
    'auto_init': False,
    'default_branch': 'main'
}))")
    cb_create=$(curl -s -o /tmp/cb_create.txt -w "%{http_code}" \
      -X POST "$CB_API/user/repos" \
      -H "Authorization: token $CODEBERG_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$create_body")
    if [ "$cb_create" != "201" ]; then
      echo "    ⚠ فشل إنشاء Codeberg ($cb_create): $(cat /tmp/cb_create.txt)"
      continue
    fi
    echo "    ✓ تم"
  else
    echo "  (1/3) موجود على Codeberg مسبقاً — تخطّي"
  fi

  # (ب) أضف Secret في GitHub
  echo "  (2/3) إضافة CODEBERG_TOKEN secret..."
  if echo "$CODEBERG_TOKEN" | gh secret set CODEBERG_TOKEN --repo "$GITHUB_USER/$name" --body - 2>/dev/null; then
    echo "    ✓ تم"
  else
    echo "    ⚠ فشل ضبط secret — تحقّق من صلاحية gh على هذا المستودع"
    continue
  fi

  # (ج) أضف ملف الـ workflow عبر gh api (يحدّث إذا كان موجوداً)
  echo "  (3/3) رفع ملف workflow..."
  # هل الملف موجود؟ نحتاج SHA لتحديثه
  existing_sha=$(gh api "repos/$GITHUB_USER/$name/contents/$WORKFLOW_PATH" --jq .sha 2>/dev/null || echo "")
  if [ -n "$existing_sha" ]; then
    gh api -X PUT "repos/$GITHUB_USER/$name/contents/$WORKFLOW_PATH" \
      -f message="ci: تحديث Codeberg mirror workflow" \
      -f content="$WF_B64" \
      -f sha="$existing_sha" \
      --silent && echo "    ✓ حُدّث" || echo "    ⚠ فشل التحديث"
  else
    gh api -X PUT "repos/$GITHUB_USER/$name/contents/$WORKFLOW_PATH" \
      -f message="ci: إضافة Codeberg mirror workflow" \
      -f content="$WF_B64" \
      --silent && echo "    ✓ أُضيف" || echo "    ⚠ فشل الرفع"
  fi

  sleep 1
done

rm -f /tmp/cb_create.txt

echo ""
echo "════════════════════════════════════════════"
echo "  ✓ اكتمل!"
echo ""
echo "  ما يحدث الآن:"
echo "  • كل مستودع لديه workflow يدفع تلقائياً عند كل push"
echo "  • أول دفعة ستحدث عند أول commit جديد"
echo "  • لإجبار المزامنة فوراً لمستودع معيّن:"
echo "      gh workflow run codeberg-mirror.yml --repo $GITHUB_USER/REPO"
echo ""
echo "  تحقّق من النتائج:"
echo "  https://codeberg.org/$CODEBERG_USER"
echo "════════════════════════════════════════════"
