#!/usr/bin/env bash
# GT-NEWSTECH — تشغيل الموقع ولوحة التحكم معاً
# الاستخدام: bash start.sh

set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GOLD='\033[0;33m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'

# ── تنظيف عند الخروج ──────────────────────────────────────────
cleanup() {
  echo -e "\n${GOLD}إيقاف جميع الخدمات...${NC}"
  kill "$JEKYLL_PID" "$ADMIN_PID" 2>/dev/null || true
  wait "$JEKYLL_PID" "$ADMIN_PID" 2>/dev/null || true
  echo -e "${GREEN}تم الإيقاف بنجاح.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── عنوان ────────────────────────────────────────────────────
clear
echo -e "${GOLD}${BOLD}"
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║         GT-NEWSTECH — Local Dev              ║"
echo "  ╠══════════════════════════════════════════════╣"
echo "  ║  الموقع      →  http://localhost:4000        ║"
echo "  ║  لوحة التحكم →  http://localhost:4001        ║"
echo "  ╠══════════════════════════════════════════════╣"
echo "  ║  Ctrl+C لإيقاف كل شيء                       ║"
echo -e "  ╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── التحقق من Ruby ────────────────────────────────────────────
if ! command -v ruby &>/dev/null; then
  echo -e "${GOLD}تثبيت Ruby...${NC}"
  sudo apt-get update -qq && sudo apt-get install -y ruby-full build-essential zlib1g-dev
  export GEM_HOME="$HOME/.local/gems"
  export PATH="$GEM_HOME/bin:$PATH"
  echo 'export GEM_HOME="$HOME/.local/gems"' >> ~/.bashrc
  echo 'export PATH="$GEM_HOME/bin:$PATH"'   >> ~/.bashrc
fi

export GEM_HOME="${GEM_HOME:-$HOME/.local/gems}"
export PATH="$GEM_HOME/bin:$PATH"

if ! command -v bundle &>/dev/null; then
  echo -e "${GOLD}تثبيت Bundler...${NC}"
  gem install bundler --no-document
fi

if [ ! -f "$DIR/Gemfile.lock" ]; then
  echo -e "${GOLD}تثبيت حزم Jekyll...${NC}"
  (cd "$DIR" && bundle install)
fi

# ── تثبيت حزم Node إذا لزم ───────────────────────────────────
if [ ! -d "$DIR/admin/node_modules" ]; then
  echo -e "${GOLD}تثبيت حزم Admin...${NC}"
  (cd "$DIR/admin" && npm install --silent)
fi

echo -e "${GREEN}▶ تشغيل الخدمتين...${NC}"
echo -e "${CYAN}─────────────────────────────────────────────${NC}"

# ── تشغيل Jekyll ─────────────────────────────────────────────
(
  cd "$DIR"
  bundle exec jekyll serve \
    --config _config.yml,_config.local.yml \
    --livereload \
    --incremental \
    --force_polling \
    2>&1 | while IFS= read -r line; do
      # تجاهل الأخطاء غير المهمة
      echo "$line" | grep -qE "\.well-known|\.tmp\.|settings\.local\.json" && continue
      echo "  [Jekyll] $line"
    done
) &
JEKYLL_PID=$!

sleep 1

# ── تشغيل Admin ───────────────────────────────────────────────
(
  cd "$DIR/admin"
  node server.js 2>&1 | while IFS= read -r line; do
    echo "  [Admin]  $line"
  done
) &
ADMIN_PID=$!

# ── انتظار اكتمال البناء الأول ────────────────────────────────
echo -e "  ${GOLD}[Jekyll]${NC} جاري البناء..."
sleep 6
echo ""
echo -e "${GREEN}✓ الخدمتان جاهزتان:${NC}"
echo ""
echo -e "  ${GOLD}الموقع     ${NC}→  ${BOLD}http://localhost:4000${NC}"
echo -e "  ${CYAN}لوحة التحكم${NC}→  ${BOLD}http://localhost:4001${NC}"
echo ""
echo -e "${GOLD}افتح الروابط يدوياً في المتصفح — Ctrl+C للإيقاف${NC}"
echo -e "${CYAN}─────────────────────────────────────────────${NC}"
echo ""

# ── انتظار حتى Ctrl+C ────────────────────────────────────────
wait "$JEKYLL_PID" "$ADMIN_PID"
