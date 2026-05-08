#!/usr/bin/env bash
# GT-NEWSTECH — Local Development Server
# الاستخدام: bash serve.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
GOLD='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GOLD}   GT-NEWSTECH — Local Server${NC}"
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ── تحقق من Ruby ─────────────────────────────────────────────
if ! command -v ruby &>/dev/null; then
  echo -e "${RED}Ruby غير مثبت. جاري التثبيت...${NC}"
  sudo apt-get update -qq
  sudo apt-get install -y ruby-full build-essential zlib1g-dev

  # إعداد مجلد Gems في المجلد الشخصي
  if ! grep -q 'GEM_HOME' ~/.bashrc; then
    echo 'export GEM_HOME="$HOME/.local/gems"' >> ~/.bashrc
    echo 'export PATH="$HOME/.local/gems/bin:$PATH"' >> ~/.bashrc
  fi
  export GEM_HOME="$HOME/.local/gems"
  export PATH="$HOME/.local/gems/bin:$PATH"
  echo -e "${GREEN}✓ Ruby مثبت: $(ruby --version)${NC}"
fi

export GEM_HOME="${GEM_HOME:-$HOME/.local/gems}"
export PATH="$GEM_HOME/bin:$PATH"

# ── تحقق من Bundler ───────────────────────────────────────────
if ! command -v bundle &>/dev/null; then
  echo -e "${GOLD}جاري تثبيت Bundler...${NC}"
  gem install bundler --no-document
fi

# ── تثبيت الحزم ───────────────────────────────────────────────
if [ ! -f Gemfile.lock ]; then
  echo -e "${GOLD}جاري تثبيت حزم Jekyll...${NC}"
  bundle install
fi

# ── تشغيل الخادم ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}✓ الموقع متاح على: http://localhost:4000${NC}"
echo -e "${GOLD}  اضغط Ctrl+C للإيقاف${NC}"
echo ""

bundle exec jekyll serve \
  --config _config.yml,_config.local.yml \
  --livereload \
  --open-url
