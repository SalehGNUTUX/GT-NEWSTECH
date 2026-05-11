#!/usr/bin/env bash
# GT-NEWSTECH — تشغيل الموقع ولوحة التحكم معاً

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GOLD='\033[0;33m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

cleanup() {
  echo -e "\n${GOLD}إيقاف الخدمات...${NC}"
  [ -n "$JEKYLL_PID" ] && kill "$JEKYLL_PID" 2>/dev/null
  [ -n "$ADMIN_PID"  ] && kill "$ADMIN_PID"  2>/dev/null
  wait 2>/dev/null
  echo -e "${GREEN}تم.${NC}"
  exit 0
}
trap cleanup INT TERM

# ── إعداد البيئة ───────────────────────────────────────────────
export GEM_HOME="${GEM_HOME:-$HOME/.local/gems}"
export PATH="$GEM_HOME/bin:$PATH"

# ── إنشاء _config.local.yml إذا لم يكن موجوداً ───────────────
if [ ! -f "$DIR/_config.local.yml" ]; then
  printf 'baseurl: ""\nurl: "http://localhost:4000"\n' > "$DIR/_config.local.yml"
  echo -e "${GOLD}تم إنشاء _config.local.yml${NC}"
fi

# ── التحقق من Ruby ────────────────────────────────────────────
if ! command -v ruby &>/dev/null; then
  echo -e "${GOLD}تثبيت Ruby...${NC}"
  sudo apt-get update -qq
  sudo apt-get install -y ruby-full build-essential zlib1g-dev
  echo "export GEM_HOME=\"\$HOME/.local/gems\"" >> ~/.bashrc
  echo "export PATH=\"\$GEM_HOME/bin:\$PATH\""  >> ~/.bashrc
fi

if ! command -v bundle &>/dev/null; then
  echo -e "${GOLD}تثبيت Bundler...${NC}"
  gem install bundler --no-document
fi

if [ ! -f "$DIR/Gemfile.lock" ]; then
  echo -e "${GOLD}تثبيت حزم Jekyll...${NC}"
  (cd "$DIR" && bundle install --quiet)
fi

if [ ! -d "$DIR/admin/node_modules" ]; then
  echo -e "${GOLD}تثبيت حزم Admin...${NC}"
  (cd "$DIR/admin" && npm install --silent)
fi

# ── العنوان ───────────────────────────────────────────────────
clear
echo -e "${GOLD}"
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║         GT-NEWSTECH — Local Dev              ║"
echo "  ╠══════════════════════════════════════════════╣"
echo "  ║  الموقع      →  http://localhost:4000        ║"
echo "  ║  لوحة التحكم →  http://localhost:4001        ║"
echo "  ╠══════════════════════════════════════════════╣"
echo "  ║  Ctrl+C لإيقاف كل شيء                       ║"
echo -e "  ╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── مزامنة مع GitHub (لتجنب التعارض مع Decap CMS) ────────────
echo -e "${GOLD}🔄 مزامنة مع GitHub...${NC}"
PULL_OUT=$(git -C "$DIR" pull --ff-only origin main 2>&1)
PULL_STATUS=$?
if [ $PULL_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ $PULL_OUT${NC}"
else
  echo -e "${GOLD}⚠️  تعذرت المزامنة التلقائية — استخدم زر 'مزامنة' في لوحة التحكم عند الحاجة${NC}"
fi
echo ""

# ── تشغيل Admin ───────────────────────────────────────────────
(cd "$DIR/admin" && node server.js 2>&1) &
ADMIN_PID=$!

# ── تشغيل Jekyll (بدون livereload) ────────────────────────────
(
  cd "$DIR"
  bundle exec jekyll serve \
    --config _config.yml,_config.local.yml \
    --watch \
    --force_polling \
    --host 127.0.0.1 \
    2>&1 | grep -v "\.well-known\|\.tmp\.\|settings\.local\.json\|Errno::ECONNRESET"
) &
JEKYLL_PID=$!

# ── انتظار جاهزية Jekyll ──────────────────────────────────────
echo -e "${GOLD}جاري البناء الأولي...${NC}"
for i in $(seq 1 30); do
  sleep 1
  if curl -sf http://127.0.0.1:4000/ >/dev/null 2>&1; then
    break
  fi
done

echo ""
echo -e "${GREEN}✓ جاهز!${NC}"
echo ""
echo -e "  ${GOLD}الموقع     ${NC}→  http://localhost:4000/"
echo -e "  ${CYAN}لوحة التحكم${NC}→  http://localhost:4001/"
echo ""
echo -e "${GOLD}Jekyll يُعيد البناء تلقائياً عند حفظ أي مقال."
echo -e "حدّث المتصفح يدوياً بعد كل تعديل (F5).${NC}"
echo ""

wait
