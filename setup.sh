#!/usr/bin/env bash
# GT-NEWSTECH — إعداد تفاعلي للمشروع (Git + GitHub + الاعتماديات)
# التشغيل: bash setup.sh

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

REPO_URL="https://github.com/SalehGNUTUX/GT-NEWSTECH.git"
DEF_USER="SalehGNUTUX"
DEF_EMAIL="gnutux.arabic@gmail.com"
BRANCH="main"

GOLD='\033[0;33m'; GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'

ok()    { echo -e "${GREEN}✓ $*${NC}"; }
warn()  { echo -e "${GOLD}⚠️  $*${NC}"; }
err()   { echo -e "${RED}✗ $*${NC}"; }
step()  { echo -e "\n${CYAN}━━ $* ━━${NC}"; }

# سؤال بقيمة افتراضية: ask "السؤال" "الافتراضي" → يضع الجواب في $REPLY
ask() {
  local prompt="$1" def="$2"
  read -r -p "$(echo -e "${GOLD}$prompt${NC} [${def}]: ")" REPLY
  REPLY="${REPLY:-$def}"
}

# سؤال نعم/لا: confirm "السؤال" [Y|N]
confirm() {
  local prompt="$1" def="${2:-Y}" hint ans
  [ "$def" = "Y" ] && hint="Y/n" || hint="y/N"
  read -r -p "$(echo -e "${GOLD}$prompt${NC} [$hint]: ")" ans
  ans="${ans:-$def}"
  [[ "$ans" =~ ^([Yy]|yes|YES|نعم|ن)$ ]]
}

add_line_once() {   # add_line_once "السطر" "الملف"
  grep -qxF "$1" "$2" 2>/dev/null || echo "$1" >> "$2"
}

clear
echo -e "${GOLD}"
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║      GT-NEWSTECH — الإعداد التفاعلي          ║"
echo "  ╠══════════════════════════════════════════════╣"
echo "  ║  1) هوية Git       4) رمز GitHub (Token)     ║"
echo "  ║  2) إعدادات Git    5) الاعتماديات            ║"
echo "  ║  3) ربط المستودع   6) اختبار الاتصال         ║"
echo -e "  ╚══════════════════════════════════════════════╝${NC}"

if ! command -v git &>/dev/null; then
  warn "Git غير مثبّت."
  if confirm "تثبيته الآن (sudo apt-get)؟"; then
    sudo apt-get update -qq && sudo apt-get install -y git
  else
    err "Git مطلوب. أوقفنا الإعداد."; exit 1
  fi
fi

# ── 1) هوية Git ───────────────────────────────────────────────
step "1) هوية Git"
CUR_NAME="$(git config --global user.name)"
CUR_EMAIL="$(git config --global user.email)"
if [ -n "$CUR_NAME" ] && [ -n "$CUR_EMAIL" ]; then
  ok "الهوية الحالية: $CUR_NAME <$CUR_EMAIL>"
  confirm "تغييرها؟" N && CHANGE_ID=1 || CHANGE_ID=0
else
  warn "الهوية غير معرّفة (سبب خطأ Author identity unknown)."
  CHANGE_ID=1
fi
if [ "$CHANGE_ID" = 1 ]; then
  ask "اسم المستخدم" "${CUR_NAME:-$DEF_USER}";   git config --global user.name  "$REPLY"
  ask "البريد الإلكتروني" "${CUR_EMAIL:-$DEF_EMAIL}"; git config --global user.email "$REPLY"
  ok "تم حفظ الهوية: $(git config --global user.name) <$(git config --global user.email)>"
fi

# ── 2) إعدادات Git ────────────────────────────────────────────
step "2) إعدادات Git"
git config --global pull.rebase true          && ok "pull.rebase = true"
git config --global credential.helper store   && ok "credential.helper = store (حفظ الـ Token)"
git config --global init.defaultBranch "$BRANCH"

# ── 3) ربط المستودع ───────────────────────────────────────────
step "3) ربط المستودع"
if [ ! -d "$DIR/.git" ]; then
  warn "المجلد ليس مستودع Git."
  if confirm "تهيئته وربطه بـ $REPO_URL ؟"; then
    git -C "$DIR" init -q -b "$BRANCH"
    git -C "$DIR" remote add origin "$REPO_URL"
    git -C "$DIR" fetch origin -q && git -C "$DIR" checkout -q -f "$BRANCH" 2>/dev/null
    ok "تمت التهيئة"
  fi
else
  CUR_REMOTE="$(git -C "$DIR" remote get-url origin 2>/dev/null)"
  if [ -z "$CUR_REMOTE" ]; then
    git -C "$DIR" remote add origin "$REPO_URL" && ok "أُضيف origin"
  elif [ "$CUR_REMOTE" != "$REPO_URL" ]; then
    warn "origin الحالي: $CUR_REMOTE"
    confirm "ضبطه على $REPO_URL ؟" && git -C "$DIR" remote set-url origin "$REPO_URL" && ok "تم التحديث"
  else
    ok "origin صحيح"
  fi
  git -C "$DIR" branch --set-upstream-to="origin/$BRANCH" "$BRANCH" &>/dev/null \
    && ok "الفرع $BRANCH مربوط بـ origin/$BRANCH" \
    || warn "تعذّر ربط الفرع (نفّذ git fetch ثم أعد المحاولة)"
fi

# ── 4) رمز GitHub ─────────────────────────────────────────────
step "4) رمز GitHub (Personal Access Token)"
echo "  يجب أن يملك صلاحيتَي repo و workflow."
echo "  الإنشاء: github.com → Settings → Developer settings → Tokens (classic)"
echo ""
HAS_CRED=0
if printf 'protocol=https\nhost=github.com\n\n' | GIT_TERMINAL_PROMPT=0 git credential fill &>/dev/null; then
  HAS_CRED=1
  ok "توجد بيانات دخول محفوظة لـ github.com"
fi

if [ "$HAS_CRED" = 1 ]; then
  confirm "استبدالها بـ Token جديد؟" N && NEW_TOKEN=1 || NEW_TOKEN=0
else
  confirm "إدخال Token الآن؟" Y && NEW_TOKEN=1 || NEW_TOKEN=0
fi

if [ "$NEW_TOKEN" = 1 ]; then
  ask "مستخدم GitHub" "$DEF_USER"; GH_USER="$REPLY"
  read -r -s -p "$(echo -e "${GOLD}الصق الـ Token (لن يظهر أثناء الكتابة): ${NC}")" GH_TOKEN
  echo ""
  if [ -z "$GH_TOKEN" ]; then
    warn "لم يُدخل Token — تم التخطي."
  else
    if command -v curl &>/dev/null; then
      HDRS="$(curl -s -D - -o /dev/null -H "Authorization: token $GH_TOKEN" https://api.github.com/user)"
      CODE="$(echo "$HDRS" | head -1 | awk '{print $2}')"
      SCOPES="$(echo "$HDRS" | grep -i '^x-oauth-scopes' | cut -d: -f2- | tr -d '\r ')"
      if [ "$CODE" != "200" ]; then
        err "GitHub رفض الـ Token (HTTP ${CODE:-؟}) — تحقق منه أو من الاتصال."
        GH_TOKEN=""
      else
        ok "الـ Token صالح"
        if [ -n "$SCOPES" ]; then
          [[ ",$SCOPES," == *",repo,"* ]]     && ok "صلاحية repo ✓"     || warn "صلاحية repo ناقصة"
          [[ ",$SCOPES," == *",workflow,"* ]] && ok "صلاحية workflow ✓" || warn "صلاحية workflow ناقصة — سيرفض GitHub ملفات .github/workflows"
        else
          warn "تعذّر قراءة الصلاحيات (قد يكون Token من نوع fine-grained)."
        fi
      fi
    else
      warn "curl غير متوفر — سيُحفظ الـ Token دون فحص."
    fi

    if [ -n "$GH_TOKEN" ]; then
      printf 'protocol=https\nhost=github.com\n\n' | git credential reject 2>/dev/null
      printf 'protocol=https\nhost=github.com\nusername=%s\npassword=%s\n\n' "$GH_USER" "$GH_TOKEN" | git credential approve
      ok "تم حفظ بيانات الدخول (~/.git-credentials) — لن يُطلب منك إدخالها ثانية"
    fi
    unset GH_TOKEN
  fi
fi

# ── 5) الاعتماديات ────────────────────────────────────────────
step "5) الاعتماديات (Ruby / Jekyll / Node / لوحة التحكم)"
if confirm "فحص وتثبيت الاعتماديات الناقصة؟"; then
  export GEM_HOME="${GEM_HOME:-$HOME/.local/gems}"
  export PATH="$GEM_HOME/bin:$PATH"
  export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  if ! command -v ruby &>/dev/null; then
    warn "تثبيت Ruby..."
    sudo apt-get update -qq
    sudo apt-get install -y ruby-full build-essential zlib1g-dev
  fi
  add_line_once 'export GEM_HOME="$HOME/.local/gems"' "$HOME/.bashrc"
  add_line_once 'export PATH="$GEM_HOME/bin:$PATH"'   "$HOME/.bashrc"
  command -v ruby &>/dev/null && ok "Ruby: $(ruby -v | cut -d' ' -f2)" || err "Ruby غير متوفر"

  if ! command -v bundle &>/dev/null; then
    warn "تثبيت Bundler..."
    gem install bundler --no-document
  fi
  command -v bundle &>/dev/null && ok "Bundler: $(bundle -v | cut -d' ' -f3)" || err "Bundler غير متوفر"

  if ! command -v node &>/dev/null; then
    warn "تثبيت Node.js..."
    sudo apt-get update -qq
    sudo apt-get install -y nodejs npm
  fi
  command -v node &>/dev/null && ok "Node: $(node -v)" || err "Node.js غير متوفر"

  if command -v bundle &>/dev/null; then
    if ! (cd "$DIR" && bundle exec jekyll -v &>/dev/null); then
      warn "تثبيت حزم Jekyll..."
      (cd "$DIR" && bundle install) && ok "تم تثبيت حزم Jekyll" || err "فشل bundle install — راجع الخطأ أعلاه"
    else
      ok "Jekyll: $(cd "$DIR" && bundle exec jekyll -v)"
    fi
  fi

  if command -v npm &>/dev/null && [ -d "$DIR/admin" ]; then
    if [ ! -d "$DIR/admin/node_modules" ]; then
      warn "تثبيت حزم لوحة التحكم..."
      (cd "$DIR/admin" && npm install --silent) && ok "تم تثبيت حزم Admin" || err "فشل npm install"
    else
      ok "حزم Admin مثبّتة"
    fi
  fi

  if [ ! -f "$DIR/_config.local.yml" ]; then
    printf 'baseurl: ""\nurl: "http://localhost:4000"\n' > "$DIR/_config.local.yml"
    ok "أُنشئ _config.local.yml"
  fi
fi

# ── 6) اختبار الاتصال ─────────────────────────────────────────
step "6) اختبار الاتصال بـ GitHub"
if [ -d "$DIR/.git" ]; then
  if GIT_TERMINAL_PROMPT=0 git -C "$DIR" ls-remote --exit-code origin "$BRANCH" &>/dev/null; then
    ok "الاتصال والمصادقة يعملان"
  else
    warn "تعذّر الوصول إلى المستودع (إنترنت / Token). أعد تشغيل الإعداد واختر Token جديداً."
  fi
fi

echo ""
echo -e "${GOLD}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}انتهى الإعداد.${NC} للتشغيل:  ${CYAN}bash start.sh${NC}"
echo -e "للدفع من الطرفية:  ${CYAN}git add . && git commit -m \"...\" && git push origin $BRANCH${NC}"
echo ""
