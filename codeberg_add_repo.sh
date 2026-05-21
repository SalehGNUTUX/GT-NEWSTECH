#!/bin/bash
# codeberg_add_repo.sh
# ─────────────────────────────────────────────────────────────────
# يضيف مستودعاً واحداً (موجود على GitHub) إلى مزامنة Codeberg.
# يقوم بثلاث خطوات: إنشاء Codeberg repo + ضبط secret + رفع workflow.
#
# الاستخدام:
#   bash codeberg_add_repo.sh REPO_NAME
#
# مثال:
#   bash codeberg_add_repo.sh GT-NEW-PROJECT
# ─────────────────────────────────────────────────────────────────
set -e

REPO_NAME="${1:?استخدم: bash codeberg_add_repo.sh REPO_NAME}"
TOKEN_FILE="${TOKEN_FILE:-$HOME/.codeberg_token}"
CODEBERG_USER="${CODEBERG_USER:-gnutux}"
GITHUB_USER="${GITHUB_USER:-SalehGNUTUX}"
CB_API="https://codeberg.org/api/v1"
WORKFLOW_PATH=".github/workflows/codeberg-mirror.yml"
WORKFLOW_FILE="$(dirname "$0")/codeberg-mirror.yml"

# ── تحقق ──
[ ! -f "$TOKEN_FILE" ]    && { echo "❌ لم أجد $TOKEN_FILE"; exit 1; }
[ ! -f "$WORKFLOW_FILE" ] && { echo "❌ لم أجد $WORKFLOW_FILE"; exit 1; }
command -v gh >/dev/null || { echo "❌ gh CLI غير مثبّت"; exit 1; }
gh auth status &>/dev/null || { echo "❌ سجّل دخول gh أولاً: gh auth login"; exit 1; }

CODEBERG_TOKEN=$(cat "$TOKEN_FILE")

echo "════════════════════════════════════════════"
echo "  إضافة $REPO_NAME إلى مزامنة Codeberg"
echo "════════════════════════════════════════════"

# ── (0) هل المستودع موجود على GitHub؟ ──
gh_check=$(gh api "repos/$GITHUB_USER/$REPO_NAME" --jq .name 2>/dev/null || echo "")
if [ -z "$gh_check" ]; then
  echo "❌ المستودع $GITHUB_USER/$REPO_NAME غير موجود على GitHub"
  echo "   أنشئه أولاً: gh repo create $GITHUB_USER/$REPO_NAME --public"
  exit 1
fi
IS_PRIVATE=$(gh api "repos/$GITHUB_USER/$REPO_NAME" --jq .private)

# ── (1) أنشئ مستودع Codeberg فارغ إن لم يوجد ──
echo ""
echo "🔧 (1/3) Codeberg: التحقق من المستودع..."
cb_check=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: token $CODEBERG_TOKEN" \
  "$CB_API/repos/$CODEBERG_USER/$REPO_NAME")

if [ "$cb_check" = "404" ]; then
  echo "   إنشاء مستودع فارغ..."
  create_body=$(REPO_NAME="$REPO_NAME" IS_PRIVATE="$IS_PRIVATE" python3 -c "
import json, os
print(json.dumps({
    'name': os.environ['REPO_NAME'],
    'private': os.environ['IS_PRIVATE'] == 'true',
    'auto_init': False,
    'default_branch': 'main'
}))")
  cb_create=$(curl -s -o /tmp/cb_add.txt -w "%{http_code}" \
    -X POST "$CB_API/user/repos" \
    -H "Authorization: token $CODEBERG_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$create_body")
  if [ "$cb_create" != "201" ]; then
    echo "   ⚠ فشل ($cb_create): $(cat /tmp/cb_add.txt)"
    rm -f /tmp/cb_add.txt
    exit 1
  fi
  rm -f /tmp/cb_add.txt
  echo "   ✓ أُنشئ"
elif [ "$cb_check" = "200" ]; then
  echo "   ✓ موجود سلفاً — تخطّي"
else
  echo "   ⚠ استجابة غير متوقعة: HTTP $cb_check"
  exit 1
fi

# ── (2) ضبط Secret في GitHub (من الملف مباشرة — gh يقطع \n) ──
echo ""
echo "🔧 (2/3) GitHub: ضبط CODEBERG_TOKEN secret..."
if gh secret set CODEBERG_TOKEN --repo "$GITHUB_USER/$REPO_NAME" < "$TOKEN_FILE" >/dev/null 2>&1; then
  echo "   ✓ تم"
else
  echo "   ⚠ فشل"
  exit 1
fi

# ── (3) رفع ملف الـ workflow ──
echo ""
echo "🔧 (3/3) GitHub: رفع $WORKFLOW_PATH..."
WF_B64=$(base64 -w 0 "$WORKFLOW_FILE")
existing_sha=$(gh api "repos/$GITHUB_USER/$REPO_NAME/contents/$WORKFLOW_PATH" --jq .sha 2>/dev/null || echo "")

if [ -n "$existing_sha" ]; then
  if gh api -X PUT "repos/$GITHUB_USER/$REPO_NAME/contents/$WORKFLOW_PATH" \
       -f message="ci: تحديث Codeberg mirror workflow" \
       -f content="$WF_B64" \
       -f sha="$existing_sha" \
       --silent 2>/dev/null; then
    echo "   ✓ حُدّث (sha=$existing_sha)"
  else
    echo "   ⚠ فشل التحديث"; exit 1
  fi
else
  if gh api -X PUT "repos/$GITHUB_USER/$REPO_NAME/contents/$WORKFLOW_PATH" \
       -f message="ci: إضافة Codeberg mirror workflow" \
       -f content="$WF_B64" \
       --silent 2>/dev/null; then
    echo "   ✓ أُضيف"
  else
    echo "   ⚠ فشل الرفع"; exit 1
  fi
fi

# ── تشغيل أوّلي (اختياري) ──
echo ""
read -p "هل تشغّل المزامنة الأولى الآن؟ (Y/n): " run_now
if [ "$run_now" != "n" ] && [ "$run_now" != "N" ]; then
  sleep 3
  gh workflow run codeberg-mirror.yml --repo "$GITHUB_USER/$REPO_NAME" >/dev/null
  echo "   ✓ بدأ التشغيل. تابع:"
  echo "     gh run list --repo $GITHUB_USER/$REPO_NAME --workflow=codeberg-mirror.yml --limit 1"
fi

echo ""
echo "════════════════════════════════════════════"
echo "  ✓ اكتمل!"
echo ""
echo "  • GitHub:   https://github.com/$GITHUB_USER/$REPO_NAME"
echo "  • Codeberg: https://codeberg.org/$CODEBERG_USER/$REPO_NAME"
echo "════════════════════════════════════════════"
