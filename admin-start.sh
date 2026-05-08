#!/usr/bin/env bash
# GT-NEWSTECH — Admin Panel Launcher

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/admin"

GOLD='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GOLD}   GT-NEWSTECH Admin Panel${NC}"
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -d "node_modules" ]; then
  echo -e "${GOLD}جاري تثبيت الحزم...${NC}"
  npm install
fi

echo -e "${GREEN}✓ الخادم يعمل على: http://localhost:4001${NC}"
echo -e "${GOLD}  اضغط Ctrl+C للإيقاف${NC}\n"

node server.js
