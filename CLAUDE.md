# CLAUDE.md

claude --resume 00b11c2c-76d9-4243-8c50-e75d5064e94f


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

GT-NEWSTECH is a bilingual (Arabic/English) Jekyll static site hosted on GitHub Pages. It has **three** access points:

- **Jekyll site** — the public website, built and deployed via GitHub Actions
- **Admin panel** (`admin/`) — a local-only Node.js/Express SPA, never deployed
- **Decap CMS** (`cms/`) — a hosted static SPA at `/cms/`, uses GitHub API for editing

---

## Commands

### Run everything locally (recommended)
```bash
bash start.sh
# Syncs with GitHub (git pull) → Jekyll → http://localhost:4000/
# Admin panel                  → http://localhost:4001/
# Ctrl+C stops both
```

### Jekyll only
```bash
bash serve.sh
```

### Admin panel only
```bash
bash admin-start.sh
```

### Manual Jekyll build (for debugging)
```bash
export GEM_HOME="$HOME/.local/gems"
export PATH="$GEM_HOME/bin:$PATH"
bundle exec jekyll build --config _config.yml,_config.local.yml
```

### Deploy (push to GitHub Pages)
```bash
git add . && git commit -m "message" && git push origin main
```

---

## Architecture

### Jekyll site

**Two-config system:**
- `_config.yml` — production (`baseurl: "/GT-NEWSTECH"`, `url: "https://SalehGNUTUX.github.io"`)
- `_config.local.yml` — local override (`baseurl: ""`, `url: "http://localhost:4000"`) — gitignored, created by `start.sh`

**Dynamic categories — single source of truth:**
- `_data/categories.yml` stores: `id`, `name_ar`, `name_en`, `icon` (FA class), `color` (hex)
- All templates loop over `site.data.categories` — no hardcoded category lists anywhere
- `category.html` uses `site.data.categories | where: "id", page.category | first` for icon/title/color
- `article-card.html` uses inline styles from `cat_data.color`
- Adding a category: update YAML + create dirs + create category pages

**Language isolation:**
- `index.html` (root) — JS router reads `localStorage['gnt-lang']` or browser language → `/ar/` or `/en/`
- `ar/index.html` and `en/index.html` use `layout: home` with `page.lang` → `home.html` renders `site[page.lang]` exclusively
- Language choice saved to `localStorage['gnt-lang']`; nav links carry `data-lang-link` + `data-lang`

**Article collections:**
- Articles in `_ar/<category>/YYYY-MM-DD-slug.md` and `_en/<category>/YYYY-MM-DD-slug.md`
- The `slug` front matter field is the **only link** between AR and EN articles
- `post.html` uses `site.en | where: "slug", page.slug | first` for translation link
- Images: `assets/images/ar/<name>` and `assets/images/en/<name>`
- Image field supports two formats: just filename (`img.jpg`) OR full path (`/GT-NEWSTECH/assets/images/ar/img.jpg`)
- Templates handle both: `{% if post.image contains '/assets/images/' %}...{% else %}...{% endif %}`
- Fallback: `assets/icons/gt-newstech-icon.png`

**Date/datetime handling — critical:**
- Article `date` must be a **YAML datetime object** (unquoted), not a quoted string
- Quoted strings like `date: '2026-05-10'` break Jekyll's `sort: "date"` when mixed with Date objects
- `saveArticle()` in `admin/server.js` converts string dates to `new Date(y, m-1, d, h, min, s)` (local timezone) before `matter.stringify()` — ensures unquoted YAML timestamp
- **DO NOT use `Date.UTC(...)`** — it interprets user input as UTC literally, producing future-dated articles for users in UTC+N timezones (Jekyll then skips them by default → 404 on article pages while cards still show in lists)
- The correct flow: user enters local time → `new Date(y,m-1,d,h,min,s)` reads as local → Date object internally UTC → gray-matter writes ISO UTC = the actual moment of publishing regardless of user's timezone
- `_config.yml` has `future: true` to enable intentional scheduled posts (`.github/workflows/pages.yml` also passes `--future` flag)
- Time badge in templates shows only when `minutes != "00"`

**Scheduled posts (future-dated articles):**
- Admin editor: `checkFutureDate()` watches `fDate`/`fTime` inputs → shows `#futureDateWarn` (gold banner) with countdown when date > now
- Card template (`_includes/article-card.html`): compares `post.date | date: '%s'` against `site.time | date: '%s'`. If future, adds `.article-card--scheduled` class + `.card-scheduled-badge` ("Coming soon" / "سينشر قريباً")
- Article page (`_layouts/post.html`): same comparison. If future, replaces `{{ content }}` block with `.post-scheduled` UI (icon, formatted date, live JS countdown that auto-reloads at publish time)
- `_now_ts` is `site.time` which equals build time on GitHub Pages — meaning scheduled state persists until next push/build after publish moment. For strict scheduling without manual push, a GitHub Actions cron is needed.

**Multi-category (`also_in`):**
- Primary `category` determines folder and permalink
- `also_in: [cat1, cat2]` makes it appear in additional category pages
- `category.html`: `primary_posts` + `cross_posts = where_exp("item", "item.also_in contains page.category")` → `uniq`

**Affiliate disclosure:**
- `affiliate: true` default for all posts in `_config.yml`
- `_includes/affiliate-disclosure.html` renders only when `page.content contains 'aff-link'`
- Affiliate links: `[text](url){: .aff-link rel="nofollow sponsored" target="_blank"}`

**SEO:**
- `_includes/seo-jsonld.html` injects NewsArticle/WebSite schema
- `search.json` generates client-side search index filtered by `page.lang`

**Comments & Reactions (Giscus):**
- `_includes/giscus.html` — embed widget, included at end of `post.html` (skipped if `_is_scheduled`)
- Data stored in GitHub Discussions of `SalehGNUTUX/GT-NEWSTECH` (same repo)
- Two placeholders need to be replaced by user (one-time): `REPLACE_ME_REPO_ID` and `REPLACE_ME_CATEGORY_ID` (from giscus.app)
- Theme syncs dynamically with site theme via `postMessage` (see `main.js`)
- Lang attribute set per page (`ar` or `en`)
- Mapping: `pathname` — one discussion thread per article URL
- 8 reactions enabled (GitHub's set: 👍 👎 ❤️ 🎉 😄 😕 🚀 👀)
- Hosting-independent: works wherever the site is served, as long as the repo stays on GitHub

**External links open in new tab:**
- `main.js` adds `target="_blank" rel="noopener noreferrer"` to any `<a href="http..."` whose host differs from current
- Preserves existing rel attributes (e.g., `nofollow sponsored` on affiliate links)

**Article sharing (10 platforms):**
- `_layouts/post.html` defines `.post-share` with `data-share-*` attributes (url, title, excerpt, tags)
- `main.js` reads attributes, builds platform-specific URLs/text, attaches handlers
- Platforms:
  - **URL-based** (read OG tags): Facebook, LinkedIn
  - **Text-based intent**: X (short), Telegram (full)
  - **Federated with instance picker**: Mastodon, Pleroma, Nostr
  - **Clipboard-only** (no web share API): Instagram, Discord
  - **Generic copy**: Copy link → full text
- Custom platforms (Mastodon/Pleroma/Nostr) use a custom modal (`pickInstanceDialog`):
  - Pre-defined common options in `PLATFORMS[platform].common` array
  - Custom URL input with `__custom__` radio value
  - Remember checkbox is **opt-in** (unchecked by default) — `gnt-{platform}-instance` is set only if checked
  - User-entered customs are auto-saved to `gnt-{platform}-customs` JSON array (max 10, newest first)
  - Saved customs appear in modal under "Your saved options" section with delete-on-hover × button
  - Common options cannot be deleted from the modal
  - Shift+Click on the share button forces re-opening the modal (skips remembered value)
- Nostr handler dispatches by client domain: iris.to, snort.social, primal.net, coracle.social, nostrudel.ninja each have different `share?text=` URL formats; custom domains fall back to `?text=`
- Tags rendered as hashtags with underscores replacing spaces (e.g., `مفتوح المصدر` → `#مفتوح_المصدر`) for cross-platform compatibility

**Critical `exclude` rule:**
`admin/` directory must stay in `_config.yml`'s `exclude` list. Jekyll crashes on `admin/node_modules/` (Liquid syntax errors).

**Do NOT use `--livereload`** — causes `chrome-error://chromewebdata/` errors. Use `--watch --force_polling` and manual F5.

**Logo click** navigates to the current language's home page (`/ar/` or `/en/`), not root `/`.

### Admin panel (`admin/`)

Express REST API + vanilla JS SPA. Uses `path.join(__dirname, '..')` as `ROOT`.

**API surface:**
```
GET  /api/stats
GET  /api/articles?lang=&cat=&q=
GET  /api/article?lang=&cat=&file=
POST /api/article                    ← body must include cat, lang, slug explicitly
PUT  /api/article?lang=&cat=&file=
DELETE /api/article?lang=&cat=&file= ← moves to admin/.trash/ (gitignored)
GET  /api/trash                      ← list trash items
POST /api/trash/:id/restore          ← restore from trash
DELETE /api/trash/:id                ← permanent delete
DELETE /api/trash                    ← empty trash
GET  /api/images?lang=
POST /api/images/:lang               ← multer memoryStorage, sharp, max 20MB
POST /api/images/import              ← copy from filesystem path
DELETE /api/images/:lang/:name
GET  /api/categories                 ← dynamic from _data/categories.yml + disk scan
POST /api/categories                 ← create category (dirs + pages + YAML)
GET  /api/git/status                 ← includes ahead/behind count via git fetch
POST /api/git/pull                   ← ff-only → rebase --autostash; 409 + needsResolution on conflict
POST /api/git/push                   ← git add . && commit && push (single remote)
POST /api/git/push-all               ← push to multiple remotes
GET  /api/git/conflicts              ← list conflicted files + preview ours/theirs (600 chars)
POST /api/git/resolve                ← body { file, strategy: 'ours'|'theirs' } → checkout + add
POST /api/git/continue               ← rebase --continue; returns hasMore if next commit has conflicts
POST /api/git/abort                  ← rebase --abort | merge --abort
GET  /api/remotes                    ← list git remotes
POST /api/remotes                    ← add/update remote
DELETE /api/remotes/:name            ← remove remote
GET  /api/auth/status                ← hasPassword: bool (no auth required)
POST /api/auth/login                 ← returns session token: `${ts}.${hmac}`
POST /api/auth/set-password          ← set/change password (SHA-256). Requires `current` if password already set
DELETE /api/auth/password            ← remove password (requires confirmRequired). Deletes both .admin-password and .admin-security.json
GET  /api/auth/security              ← read security config (confirmFor, sessionMinutes)
PUT  /api/auth/security              ← update config (requires confirmRequired manage_security)
POST /api/auth/confirm               ← validate password → returns confirmToken valid 30s
GET  /api/config
```

**Image handling (sharp):**
- Web formats (jpg, png, webp, avif, gif, svg) → saved as-is
- Non-web formats (heic, heif, tiff, bmp) → converted to JPEG
- `saveImage()` / `saveImageFromPath()` handle both cases

**Categories are dynamic:**
- `getCatIds()` reads `_data/categories.yml` + scans `_ar/` subfolders
- `readCatsData()` / `writeCatsData()` use js-yaml

**Trash system:**
- `admin/.trash/` stores deleted articles as JSON (gitignored)
- Each item: `{ id, lang, cat, file, title, deleted_at, content }`
- Restore: writes content back to original path

**Auth middleware:**
- Password hash stored in `admin/.admin-password` (SHA-256, gitignored, persistent across restarts)
- Security config stored in `admin/.admin-security.json` (gitignored)
- Session token format: `${timestamp}.${hmac}` — timestamp embedded, validated via `verifyToken()` against TTL from config (default 1440 min = 24h)
- `makeToken(hash)` includes current `Date.now()` and HMACs `gnt-v2-${ts}` with the password hash
- Confirmation token (separate, for sensitive actions): `${expiry}.${hmac}` — expires after 30 seconds, sent via `x-admin-confirm` header
- Skip list: `/api/auth/login`, `/api/auth/status`
- 401 with `sessionExpired: true` → client clears token and shows login

**Sensitive action confirmation (`confirmRequired(actionKey, alwaysRequire=false)`):**
- Per-action toggle stored in `.admin-security.json` → `confirmFor: {save_article, delete_article, push}`
- `alwaysRequire=true` for `manage_security` (PUT `/api/auth/security`) and `remove_password` (DELETE `/api/auth/password`) — cannot be disabled (anti-tampering)
- Returns `401 { needsConfirm: true, action }` when token missing/expired
- Client side: `api()` catches this, calls `promptConfirm(action)`, retries with `x-admin-confirm` header
- Toggle UX: change-listener on `[data-secaction]` triggers PUT immediately; reverts to `data-was` on cancellation/error (no draft state to tamper with)

**Password lifecycle:**
- First enable: `setToken(null)` + `location.reload()` to force login screen
- Change: requires `current` in body (validated via `hashPwd()` against `getPassHash()`)
- Remove: requires `confirmRequired('remove_password', true)` — deletes both `.admin-password` AND `.admin-security.json` so system forgets everything
- After removal: new password can be set without `current` (no password is set)

**SPA routing:** `#dashboard`, `#articles`, `#new-article`, `#images`, `#categories`, `#trash`, `#git`, `#remotes`, `#security`, `#config`

**Articles page:** toolbar rendered once (`if (!$('articlesTable'))`), only `<tbody>` updated on search/filter to preserve input focus.

**FM paste feature:** Tab "لصق FM" → `parseFrontMatterText()` → `fillFormFromParsed()`. `date` field triggers `parseDatetime()` → populates `fDate` + `fTime`.

**Date/time in admin:**
- `parseDatetime(raw)` extracts local date+time from any format
- Save: `${dateVal} ${timeVal}:00` (local time string) → `saveArticle()` converts to `new Date(y,m-1,d,h,min,s)` (NOT `Date.UTC`) → stored as actual UTC moment
- Time badge shows only when minutes ≠ "00"

### Decap CMS (`cms/`)

Hosted static SPA at `https://SalehGNUTUX.github.io/GT-NEWSTECH/cms/`.

- `cms/index.html` — loads Decap CMS JS, applies GT-NEWSTECH gold/black theme, dark/light toggle
- `cms/config.yml` — backend: github, repo, branch, base_url (OAuth proxy)
- `locale: en` — gives LTR layout (Collections panel on LEFT). Do NOT change to `ar` — it breaks the layout
- `media_folder: assets/images/ar` — global media browser shows AR images
- Each collection has its own `media_folder` for uploads
- Image field uses `image` widget with `choose_url: true` — enables thumbnails AND "Insert from URL" tab. URL choice stores external URL in front matter (template handles both formats)
- Authentication via GitHub OAuth + Sveltia CMS Auth on Cloudflare Workers

**Auto-sync of categories from local admin to Decap CMS:**
- `updateCmsConfig(id, nameAr, nameEn)` in `server.js` (line-based YAML, preserves comments)
- Called automatically from `POST /api/categories` after writing `_data/categories.yml`
- Updates 4 locations in `cms/config.yml`: `category` options + `also_in` options × (AR + EN) collections
- Detects duplicates via `value: ${id} }` substring check — skips if exists
- Returns `{ ok, cmsSync: { ok | skipped | error } }` in API response
- Removal/rename of categories still requires manual edit of `cms/config.yml`

**Conflict prevention between the two admin panels:**
- `start.sh` runs `git pull --ff-only` then `--rebase --autostash` as fallback on startup
- Git page shows sync status (ahead/behind) with Pull button
- `/api/git/pull` is two-tier: ff-only first, rebase --autostash on diverged histories
- Same fallback in `start.sh` (uses if/elif chain)

**Semi-automatic conflict resolver:**
- When `/api/git/pull` rebase fails with real conflicts → returns `409 { needsResolution: true, conflicts: [...] }`
- Client side: `openConflictResolver()` shows modal with each conflicted file
- For each file: previews of `ours` (`:2:<file>`) and `theirs` (`:3:<file>`) (600 chars each)
- User picks: `git checkout --ours|--theirs && git add` per file
- When all resolved: `git -c core.editor=true rebase --continue` (GIT_EDITOR=true skips commit msg editor)
- Multi-commit rebases: if `continue` reveals new conflicts, modal reopens automatically
- `/api/git/abort` calls `rebase --abort` or `merge --abort` depending on `.git/rebase-merge` or `.git/MERGE_HEAD`
- Never edit the same article in both panels simultaneously (best practice still applies)

### CSS architecture

Single file `assets/css/style.css`. Theming via CSS custom properties:
- Light mode on `:root`, dark mode on `[data-theme="dark"]`
- `theme.js` runs inline before CSS to set `data-theme` from `localStorage['gnt-theme']`
- Category colors use inline styles from `_data/categories.yml` — no per-category CSS class needed
- Mobile: `flex-wrap: nowrap` on header; `.mobile-lang-switch` visible on mobile only

**Fixed site header:**
- `.site-header` uses `position: fixed` (NOT `sticky`)
- Reason: `html` and `body` have `overflow-x: hidden` (prevents horizontal scroll) — this breaks `position: sticky` because `sticky` requires no overflow constraint on ancestors
- Compensation: `body { padding-top: var(--header-height, 64px); }` reserves space (with mobile override at 600px)
- `inset-inline: 0` (not `left:0; right:0;`) for RTL/LTR support
- `backdrop-filter: blur(8px)` for glass effect on scroll
- `html { scroll-padding-top: 80px; }` ensures TOC anchor jumps land below the fixed header

---

## Key Conventions

- **Slug**: Latin, lowercase, hyphens only. Identical in both `_ar/` and `_en/` for translation linking.
- **Category system**: defined in `_data/categories.yml`. Add category: update YAML + create dirs + create pages.
- **`page.lang`** drives all bilingual branching in templates and `main.js`
- Font Awesome 6 Free from jsDelivr CDN (no integrity hash — caused silent failures previously)
- `_config.local.yml` is gitignored; `start.sh` creates it automatically
- **POST /api/article**: body must include `cat`, `lang`, `slug` as top-level keys
- **Date storage**: use `new Date(y, m-1, d, h, min, s)` (local timezone interpretation) — Node converts to UTC internally, gray-matter writes ISO UTC. **Never use `Date.UTC(...)`** for user-entered times — it treats inputs as UTC literally, creating future-dated articles for any user not in UTC (Jekyll skips them, causing 404 with visible cards in lists).
- **Decap CMS locale**: keep `locale: en` — changing to `ar` breaks Collections panel rendering
- **Do not add integrity hash** to Font Awesome CDN link
