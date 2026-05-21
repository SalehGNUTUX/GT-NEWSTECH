#!/bin/bash
# codeberg_fix_secrets.sh
# يُعيد ضبط CODEBERG_TOKEN في كل مستودعات GitHub بدون newline
# الاستخدام: CODEBERG_TOKEN=$(cat ~/.codeberg_token) bash codeberg_fix_secrets.sh
set -e

CODEBERG_TOKEN="${CODEBERG_TOKEN:?ضع CODEBERG_TOKEN=... قبل التشغيل}"
GITHUB_USER="${GITHUB_USER:-SalehGNUTUX}"

echo "📥 جلب مستودعات GitHub..."
repos=$(gh repo list "$GITHUB_USER" --no-archived --source --limit 200 --json name --jq '.[].name')

echo "🔧 إعادة ضبط CODEBERG_TOKEN في كل مستودع..."
for name in $repos; do
  echo -n "  $name ... "
  if printf '%s' "$CODEBERG_TOKEN" | gh secret set CODEBERG_TOKEN --repo "$GITHUB_USER/$name" --body - 2>/dev/null; then
    echo "✓"
  else
    echo "⚠ فشل"
  fi
done

echo ""
echo "✓ اكتمل. لإعادة تشغيل الـ workflow على GT-NEWSTECH:"
echo "  gh workflow run codeberg-mirror.yml --repo $GITHUB_USER/GT-NEWSTECH"
