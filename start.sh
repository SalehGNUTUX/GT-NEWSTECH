#!/usr/bin/env bash
# GT-NEWSTECH — تشغيل الموقع ولوحة التحكم معاً

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GOLD='\033[0;33m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

cleanup() {
  echo -e "\n${GOLD}إيقاف الخدمات...${NC}"
  [ -n "$JEKYLL_PID" ] && { pkill -P "$JEKYLL_PID" 2>/dev/null; kill "$JEKYLL_PID" 2>/dev/null; }
  [ -n "$ADMIN_PID"  ] && { pkill -P "$ADMIN_PID"  2>/dev/null; kill "$ADMIN_PID"  2>/dev/null; }
  wait 2>/dev/null
  echo -e "${GREEN}تم.${NC}"
  exit 0
}
trap cleanup INT TERM

die() { echo -e "${RED}✗ $1${NC}"; exit 1; }

# ── إعداد البيئة ───────────────────────────────────────────────
export GEM_HOME="${GEM_HOME:-$HOME/.local/gems}"
export PATH="$GEM_HOME/bin:$PATH"

# تحميل nvm إن وُجد (لأنه لا يُحمَّل تلقائياً في السكربتات)
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# ── إنشاء _config.local.yml إذا لم يكن موجوداً ───────────────
if [ ! -f "$DIR/_config.local.yml" ]; then
  printf 'baseurl: ""\nurl: "http://localhost:4000"\n' > "$DIR/_config.local.yml"
  echo -e "${GOLD}تم إنشاء _config.local.yml${NC}"
fi

# ── 1) Ruby ───────────────────────────────────────────────────
if ! command -v ruby &>/dev/null; then
  echo -e "${GOLD}تثبيت Ruby...${NC}"
  sudo apt-get update -qq
  sudo apt-get install -y ruby-full build-essential zlib1g-dev
  grep -q 'GEM_HOME' ~/.bashrc 2>/dev/null || {
    echo "export GEM_HOME=\"\$HOME/.local/gems\"" >> ~/.bashrc
    echo "export PATH=\"\$GEM_HOME/bin:\$PATH\""  >> ~/.bashrc
  }
  command -v ruby &>/dev/null || die "فشل تثبيت Ruby"
fi

# ── 2) Bundler ────────────────────────────────────────────────
if ! command -v bundle &>/dev/null; then
  echo -e "${GOLD}تثبيت Bundler...${NC}"
  gem install bundler --no-document
  command -v bundle &>/dev/null || die "فشل تثبيت Bundler"
fi

# ── 3) Node.js ────────────────────────────────────────────────
if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
  echo -e "${GOLD}تثبيت Node.js...${NC}"
  sudo apt-get update -qq
  sudo apt-get install -y nodejs npm
  command -v node &>/dev/null || die "فشل تثبيت Node.js"
fi

# ── 4) حزم Jekyll: فحص التثبيت الفعلي (وليس وجود Gemfile.lock) ──
if ! (cd "$DIR" && bundle exec jekyll -v &>/dev/null); then
  echo -e "${GOLD}تثبيت حزم Jekyll (bundle install)...${NC}"
  (cd "$DIR" && bundle install) || die "فشل bundle install — راجع الأخطاء أعلاه"
  (cd "$DIR" && bundle exec jekyll -v &>/dev/null) || die "Jekyll ما زال غير متاح بعد التثبيت"
fi

# ── 5) حزم لوحة التحكم ────────────────────────────────────────
if [ ! -d "$DIR/admin/node_modules" ]; then
  echo -e "${GOLD}تثبيت حزم Admin (npm install)...${NC}"
  (cd "$DIR/admin" && npm install --silent) || die "فشل npm install"
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
if PULL_OUT=$(git -C "$DIR" pull --ff-only origin main 2>&1); then
  echo -e "${GREEN}✓ $PULL_OUT${NC}"
elif PULL_OUT=$(git -C "$DIR" pull --rebase --autostash origin main 2>&1); then
  echo -e "${GREEN}✓ تمت إعادة الترتيب (rebase) — التغييرات المحلية فوق البعيدة${NC}"
else
  git -C "$DIR" rebase --abort 2>/dev/null
  echo -e "${GOLD}⚠️  تعارض يحتاج حلاً يدوياً — استخدم 'مزامنة' من لوحة التحكم لرؤية التفاصيل${NC}"
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
READY=0
for i in $(seq 1 60); do
  sleep 1
  if curl -sf http://127.0.0.1:4000/ >/dev/null 2>&1; then
    READY=1
    break
  fi
  # إذا مات Jekyll فلا داعي للانتظار
  kill -0 "$JEKYLL_PID" 2>/dev/null || break
done

echo ""
if [ "$READY" = 1 ]; then
  echo -e "${GREEN}✓ جاهز!${NC}"
  echo ""
  echo -e "  ${GOLD}الموقع     ${NC}→  http://localhost:4000/"
  echo -e "  ${CYAN}لوحة التحكم${NC}→  http://localhost:4001/"
  echo ""
  echo -e "${GOLD}Jekyll يُعيد البناء تلقائياً عند حفظ أي مقال."
  echo -e "حدّث المتصفح يدوياً بعد كل تعديل (F5).${NC}"
  echo ""
else
  echo -e "${RED}⚠️  Jekyll لم يبدأ — راجع الأخطاء أعلاه.${NC}"
fi

wait
