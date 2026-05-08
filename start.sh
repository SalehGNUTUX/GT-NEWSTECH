#!/usr/bin/env bash
# GT-NEWSTECH — تشغيل الموقع ولوحة التحكم معاً

set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GOLD='\033[0;33m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'

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
echo -e "  ║  ${CYAN}🌐 الموقع     ${GOLD}→  http://localhost:4000       ${GOLD}║"
echo -e "  ║  ${CYAN}⚙️  لوحة التحكم${GOLD}→  http://localhost:4001       ${GOLD}║"
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

echo ""
echo -e "${GREEN}▶ تشغيل الخدمتين...${NC}"
echo -e "${CYAN}─────────────────────────────────────────────${NC}"

# ── تشغيل Jekyll ─────────────────────────────────────────────
(
  cd "$DIR"
  bundle exec jekyll serve \
    --config _config.yml,_config.local.yml \
    --livereload \
    2>&1 | sed "s/^/  ${GOLD}[Jekyll]${NC} /"
) &
JEKYLL_PID=$!

# انتظر قليلاً لتجنب تشابك الطباعة
sleep 1

# ── تشغيل Admin ───────────────────────────────────────────────
(
  cd "$DIR/admin"
  node server.js 2>&1 | sed "s/^/  ${CYAN}[Admin] ${NC} /"
) &
ADMIN_PID=$!

echo ""
echo -e "  ${GOLD}[Jekyll]${NC} → http://localhost:4000"
echo -e "  ${CYAN}[Admin] ${NC} → http://localhost:4001"
echo -e "${CYAN}─────────────────────────────────────────────${NC}"
echo ""

# ── فتح المتصفح بعد ثانيتين ─────────────────────────────────
sleep 3
if command -v xdg-open &>/dev/null; then
  xdg-open "http://localhost:4000/" &>/dev/null &
  xdg-open "http://localhost:4001/" &>/dev/null &
elif command -v open &>/dev/null; then
  open "http://localhost:4000/"
  open "http://localhost:4001/"
fi

# ── انتظار حتى Ctrl+C ────────────────────────────────────────
wait "$JEKYLL_PID" "$ADMIN_PID"
