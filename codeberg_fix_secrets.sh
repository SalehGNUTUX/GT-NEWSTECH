#!/bin/bash
# codeberg_fix_secrets.sh
# يُعيد ضبط CODEBERG_TOKEN في كل مستودعات GitHub بدون newline
# الاستخدام: CODEBERG_TOKEN=$(cat ~/.codeberg_token) bash codeberg_fix_secrets.sh
set -e

TOKEN_FILE="${TOKEN_FILE:-$HOME/.codeberg_token}"
GITHUB_USER="${GITHUB_USER:-SalehGNUTUX}"

[ ! -f "$TOKEN_FILE" ] && { echo "❌ لم أجد $TOKEN_FILE"; exit 1; }

echo "📥 جلب مستودعات GitHub..."
repos=$(gh repo list "$GITHUB_USER" --no-archived --source --limit 200 --json name --jq '.[].name')

echo "🔧 إعادة ضبط CODEBERG_TOKEN في كل مستودع (قراءة مباشرة من $TOKEN_FILE)..."
for name in $repos; do
  echo -n "  $name ... "
  if gh secret set CODEBERG_TOKEN --repo "$GITHUB_USER/$name" < "$TOKEN_FILE" >/dev/null 2>&1; then
    echo "✓"
  else
    echo "⚠ فشل"
  fi
done

echo ""
echo "✓ اكتمل. لإعادة تشغيل الـ workflow على GT-NEWSTECH:"
echo "  gh workflow run codeberg-mirror.yml --repo $GITHUB_USER/GT-NEWSTECH"
