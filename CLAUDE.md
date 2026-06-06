# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

GT-NEWSTECH is a bilingual (Arabic/English) Jekyll static site hosted on GitHub Pages. It has **four** access points:

- **Jekyll site** — the public website, built and deployed via GitHub Actions
- **Admin panel** (`admin/`) — a local-only Node.js/Express SPA, never deployed
- **Decap CMS** (`cms/`) — a hosted static SPA at `/cms/`, uses GitHub API for editing
- **Admin Worker** (`admin-worker/`) — a Cloudflare Worker that mirrors the admin panel UI but reads/writes via GitHub Contents API instead of a local Express server. **Deployed and operational** at `https://gt-newstech-admin.gnutux-arabic.workers.dev`. Full CRUD + trash + comments + categories. See [Admin Worker section](#admin-worker-remote-admin-cloudflare).

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

### Remote admin Worker (local dev for testing)
```bash
cd admin-worker
npx wrangler dev --port 8787 --local
# http://localhost:8787  (requires admin-worker/.dev.vars — see admin-worker/README.md)
```
See `admin-worker/STATUS.md` for current phase + roadmap.

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
- Configured for `SalehGNUTUX/GT-NEWSTECH` (real IDs in `_includes/giscus.html`). To re-point to a different repo, regenerate at giscus.app and replace `data-repo-id` + `data-category-id`.
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
- Tags rendered as hashtags: **spaces, dots, AND hyphens** are all replaced by `_` (e.g., `Tailwind v3.4` → `#Tailwind_v3_4`, `open-source` → `#open_source`). Done in `_layouts/post.html` via Liquid `replace` chain. Cross-platform-safe (no hashtag breaks on `.` or `-`). Decap CMS shows a `hint` on tags field warning the user.
- **Permanent `#gnutux` hashtag** appended to every article's `_share_tags` in `_layouts/post.html` — site identity. Authors who put "gnutux" in their per-article tags will see it twice; they can remove it manually if needed.
- **X (Twitter) share text** includes the URL **inline** between excerpt and tags (not via `&url=` parameter) so the tweet reads: title → excerpt → URL → tags. `buildShortText()` budgets for ~270 chars.
- **Floating action buttons (FABs)** on post pages, stacked right-side bottom-up: `back-to-top` (always) → `fab-share` (opens modal with cloned `.share-btn`s — clicks dispatched to the originals) → `fab-lang` (only if `translation` Liquid var is set — links to other-lang version by slug). Defined in `_layouts/post.html` after `</article>`. CSS uses `bottom: 1.5rem / 5rem / 8.5rem`.

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
DELETE /api/article?lang=&cat=&file= ← moves to _trash/<id>.md + updates _data/trash-index.json (same contract as Worker)
GET  /api/trash                      ← list trash items
POST /api/trash/:id/restore          ← restore from trash
DELETE /api/trash/:id                ← permanent delete
DELETE /api/trash                    ← empty trash
GET  /api/images?lang=
POST /api/images/:lang               ← multer memoryStorage, sharp, max 20MB. Form field: "files" (multi). Response: { ok, uploaded: [{name, size, url, converted}] }. The remote Worker mirrors the same contract (accepts both "files" and "image" field names).
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
GET  /api/github-token/status        ← hasToken: bool
POST /api/github-token               ← store PAT in admin/.github-token (confirmRequired manage_security)
DELETE /api/github-token             ← remove PAT
GET  /api/comments                   ← GraphQL: discussions + replies + reactions
POST /api/comments/reply             ← addDiscussionComment
POST /api/comments/:id/hide          ← minimizeComment (SPAM/OFF_TOPIC/…)
POST /api/comments/:id/unhide        ← unminimizeComment
DELETE /api/comments/:id             ← deleteDiscussionComment
POST /api/comments/discussion/:id/lock|unlock
POST /api/images/from-url            ← download image from URL into assets/images/<lang>/ (body: { url, lang, filename? }). Validates Content-Type starts with `image/`, sanitizes the filename, runs the compress pipeline. **The remote Worker has the same endpoint** — it uses `fetch` + Contents API and relies on `generate-webp.yml` workflow to produce the WebP companion later (~30s after commit).
GET  /api/config
```

**Image handling (sharp compress pipeline):**
- **Every upload passes through `compressImage()`** (`admin/server.js`) — no raw saves
- Pipeline: resize to `max-width 1600px`, strip EXIF, then format-specific compression:
  - JPEG: `quality: 85, mozjpeg: true, progressive: true` (~60-70% smaller)
  - PNG: `compressionLevel: 9, palette` (if channels < 4)
  - WebP: `quality: 82`
  - AVIF: `quality: 70`
  - SVG / GIF: skipped (SVG is text, GIF may be animation)
- **WebP companion auto-generated** alongside every JPG/PNG (`image.jpg` + `image.webp`)
- Non-web formats (heic, heif, tiff, bmp) → converted to JPEG **and** WebP
- **Only writes if output smaller than input** (avoids inflating already-tiny images)
- `_layouts/post.html` and `_includes/article-card.html` use `<picture>` element. **Critical: each template iterates `site.static_files` to verify the `.webp` companion exists before emitting `<source>`** — prevents 404 console floods + layout flicker when an image lacks a companion. Extension extraction uses Liquid `split: '.'` (supports `.jpg`, `.jpeg`, `.png`, any length). `<img>` has `onerror` guarded by `data-fallen=1` to prevent infinite loop if the fallback icon also fails. Hero image in post.html adds `fetchpriority="high"`.
- **Batch script** for existing images: `cd scripts && npm run optimize` (or `:dry` / `:new`). First full run on the library (96 images): **40 MB → 26 MB (-45%)**, plus 94 WebP companions totaling 3.92 MB. Heavy screenshots reduced 70-78% via resize to 1600px. Two corrupt files (`claudevscodex.png`, `ubuntu-2604-noble-numbat.avif`) failed with `heif: Invalid input` and were skipped — re-encode them if you need them in the build.
- **`.github/workflows/generate-webp.yml`** automatically runs `optimize-images.js --new` on every push that touches `assets/images/**.{jpg,jpeg,png}` and commits any new `.webp` companions. No manual `npm run optimize` needed after uploads from the remote panel.
- **The Worker cannot compress** (no native sharp binaries on Cloudflare Workers) — uploads bypass compression. The workflow generates WebP companions ~30s after each push. Options for stricter handling: reject uploads > 2MB at the Worker, browser-side compression via `browser-image-compression`, or Cloudflare Images (paid).

**Image picker / list ordering (both panels):**
- Local `getImages()` and Worker `getImages()` follow the same logic:
  1. **Disk / Contents API = source of truth for "which files exist"** — captures freshly uploaded files before the index workflow runs.
  2. **`_data/images-index.json` supplements timestamps** from `git log` (more accurate than `fs.statSync` mtime which is unreliable when files come from backup with same mtime).
  3. **`buildImageToArticleDate()` builds a map** `name → max(article.date for articles using this image)` from `_data/articles-index.json`. Used as primary sort key — an image referenced by a 2026-06-05 article sorts above one referenced by 2026-04-01.
  4. **`isCompanion(name)`** hides `.webp` files that have a `.jpg/.jpeg/.png` master with the same base name — these are auto-generated companions served only by the template, not user-selectable.
- Final sort: `articleDate (if image is used) || git-log ts || fs.mtime || 0`, descending.

**Categories are dynamic:**
- `getCatIds()` reads `_data/categories.yml` + scans `_ar/` subfolders
- `readCatsData()` / `writeCatsData()` use js-yaml

**Trash system:**
- **Unified trash:** both panels use `_trash/<id>.md` + `_data/trash-index.json` (in the repo, git-tracked). `_trash/` is excluded from Jekyll via `_config.yml`. Items deleted from either panel are visible/restorable in both. The old `admin/.trash/` is legacy — kept as a path constant but no longer written to.
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

**SPA routing:** `#dashboard`, `#articles`, `#new-article`, `#images`, `#categories`, `#trash`, `#git`, `#remotes`, `#comments`, `#security`, `#config`. The router (`navigate()`) parses query strings: `#articles?lang=ar&cat=foss` sets `S.langFilter='ar'`, `S.catFilter='foss'`, then renders the page. Dashboard AR/EN stat cards are anchors to `#articles?lang=ar/en` — clicking them syncs the topbar `filterAr/filterEn` badges (`.active` class toggled inside `navigate()`).

**Cross-language save reminder:** After successfully saving a new article (POST /api/article), the editor checks `/api/articles?lang=<other>` for an article with the same `slug`. If none → shows a dialog with "Edit other-lang version" + "Later" buttons. Choosing edit opens the editor pre-filled with shared fields (slug, category, image, tags, date, author, also_in) so the user only writes title + content in the other language. Implemented in `promptCrossLang()` after `$('saveArticle')` click handler.

**Behind-N-commits badge:** topbar shows a pulsing blue badge "خلف بـ N" when the local panel is behind origin/main. `updateBehindBadge()` calls `/api/git/status` (which performs `git fetch origin main` server-side) on boot + every 90s + after pushes. Hidden in remote mode (no concept of "behind" via GitHub API). Click navigates to Git tab for pull. The Git page's "تحديث" button calls `window.refreshGitPanel(btn)` which runs `renderGit` + `updateBehindBadge` in parallel, spins the icon (`fa-spin`) for visual feedback, and shows a "تم التحديث ✓" toast.

**sha/mtime conflict detection on save:** when an existing article is opened for editing, `openEditor()` snapshots `{_sha, _mtime}` (Worker returns `_sha`; local `server.js readArticle` returns `_mtime` from `fs.statSync`). Before PUT, the editor re-fetches `/api/article` and compares — if either field differs from the snapshot, a `confirm()` appears: "edited from another panel — overwrite OR cancel?". Prevents silent overwrite of changes made via remote panel / Decap CMS / another machine.

**Image picker lang-sync:** `openImagePicker()` reads the editor's current language (`[name=fLang]:checked`) and pre-selects the matching ptab (`AR/EN Images`) + the matching `importDest` radio. Saves 2 clicks per English article. Falls back to `S.langFilter` if no fLang is set yet.

**Image-from-URL modal (`urlImageBtn` next to `fImage`):** Triggered by the link icon beside the hero-image input. `openUrlImportModal()` shows: URL input with **live preview** (auto-renders when a valid image URL is pasted), optional custom filename, and 4 action radios:
1. Download & save in **AR only**
2. Download & save in **EN only**
3. Download & save in **AR + EN** (calls `/api/images/from-url` twice — same filename, both folders)
4. **Use as direct URL** (no download — puts the raw URL into `fImage`, so the image is served from the original host)

Option 4 stays useful for stable hosts (GitHub raw, Wikimedia, CDNs). Options 1-3 protect against source rot or deletion.

**Comments moderation page (`#comments`):**
- Uses GitHub GraphQL API for Discussions of `SalehGNUTUX/GT-NEWSTECH`
- Requires PAT with `repo` scope, stored in `admin/.github-token` (mode 0600, gitignored)
- Token mgmt UI in Security page; add/remove requires `manage_security` confirmation
- Lists discussions by article, threaded replies, badges (OWNER, MAINTAINER, hidden, answer)
- Actions: reply, hide (with classification), unhide, delete, lock/unlock discussion

**Article editor toolbar (`#new-article` → tab "محتوى المقال"):**
- Undo/Redo/Cut/Paste/Clear • Bold/Italic/H2/H3 • Lists/Quote • Code block/inline • Link/Image-by-URL/Table/AFF
- **Cut** copies selection to clipboard + deletes it; needs HTTPS or localhost for clipboard API
- **Image by URL** prompts for URL + alt text (uses selection as default alt) → inserts `![alt](url)` Markdown
- Toolbar HTML in `admin/public/index.html`; handlers in `admin/public/js/admin.js` (`document.querySelectorAll('.tb-btn')` block)

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

### Admin Worker (remote admin, Cloudflare)

`admin-worker/` is a **separate** project that mirrors the admin panel UI but runs as a Cloudflare Worker, so it's reachable from any device without keeping the local machine running. **Deployed and operational** at `https://gt-newstech-admin.gnutux-arabic.workers.dev`.

**Key contract: it matches `admin/server.js` API exactly** — so the same `admin/public/` UI works against either backend with relative `/api/...` paths. To preserve this, when you change shapes returned by `admin/server.js` (e.g. add/remove a field on `/api/articles`), mirror the change in `admin-worker/src/routes/`.

**Architecture:**
- **Backend = single Worker** (`src/index.js`, ~200 lines router) — no Express, no Node modules at runtime, only Web APIs (`fetch`, `crypto.subtle`)
- **Performance fix:** all article-list reads use `_data/articles-index.json` (one GitHub API request instead of 68 blobs). Index auto-rebuilt by `.github/workflows/build-articles-index.yml` on every push that touches `_ar/**` or `_en/**`
- **Write operations** use GitHub Contents API directly. Multi-file writes (e.g., creating a category which touches 3 files) use Git Trees API via `lib/github.js commitFiles()` for atomic commits.
- **YAML parser** is custom (`src/lib/yaml.js`) — supports block scalars (`>-`, `|`, `|-`, `|+`); kept tiny on purpose (no `js-yaml` in a Worker). Also provides `buildFrontMatter`, `buildMarkdown`, `serializeCategories`
- **Auth identical to `admin/server.js`:** SHA-256 password hash + HMAC session tokens (`${ts}.${hmac}`), `x-admin-token` header. Plus 30-second confirm tokens for sensitive operations (`/api/auth/confirm`, used for `DELETE /api/github-token`).
- **Mode detection** (`public/js/mode-detect.js`) sets `<body data-mode="remote">`, adds badge, hides irrelevant tabs (Git/Remotes/Security), and **monkey-patches `window.fetch`** to convert local-time dates to **ISO 8601 with explicit offset** (e.g., `2026-06-05T18:16:00+0200`) before sending to `/api/article` POST/PUT. Why offset and not `Z`: `toISOString()` silently shifts the value by DST boundaries on some platforms, causing a 1-hour drift; explicit offset preserves the user's wall-clock + their browser's actual UTC delta, and Jekyll/Ruby DateTime interprets it precisely.
- **Categories creation in Worker** writes 4 files in one atomic Git Trees commit: updated `_data/categories.yml`, `ar/category/<id>.html`, `en/category/<id>.html`, **AND `cms/config.yml`** (via `updateCmsConfigText()` in `lib/yaml.js` — pure port of the local `updateCmsConfig` line-based YAML editor). Decap CMS picks up new categories without manual edit.
- **Trash** lives in `_trash/` directory + `_data/trash-index.json` index (both committed via git). Jekyll ignores `_trash/` via `_config.yml` exclude. `DELETE /api/article` moves to trash; restore moves back; purge deletes permanently
- **Categories creation** writes 3 files in one atomic commit via Git Trees API: updated `_data/categories.yml`, `ar/category/<id>.html`, `en/category/<id>.html` (Worker also writes `cms/config.yml` — see above)
- **Comments management** via GitHub GraphQL API for Discussions — same endpoints as local panel (list/reply/hide/unhide/delete + lock/unlock discussion)

**Run locally:**
```bash
cd admin-worker
npm install
# Create .dev.vars (gitignored) with secrets — see README.md §1
npx wrangler dev --port 8787 --local
# Open http://localhost:8787  (default test password from .dev.vars)
```

**Deploy updates:**
```bash
cd admin-worker
npx wrangler deploy
```

**Secrets (3) stored as Cloudflare secrets in production, or `.dev.vars` for local dev:**
- `GITHUB_TOKEN` — Classic PAT (`ghp_...`) with `repo` scope (covers Contents R+W + Discussions R+W). The local `admin/.github-token` is the same token, kept in sync.
- `ADMIN_PASS_HASH` — `sha256sum` of the admin password (hex, 64 chars)
- `AUTH_SECRET` — random 32-byte hex for HMAC signing of session tokens

**Gotcha for secret upload:** Use `printf '%s' "value" | npx wrangler secret put NAME` or `cat file | npx wrangler secret put NAME`. **Avoid** `echo` (adds newline) and the interactive paste prompt (may capture trailing chars). After upload, wait ~60s for Cloudflare's global propagation before testing.

**UI source of truth:** `admin-worker/public/` is a **copy** of `admin/public/` (HTML/CSS/JS identical) plus `js/mode-detect.js` and remote-mode CSS. When the local panel UI changes, **copy the changed files into `admin-worker/public/`** to keep them in sync.

**Status & roadmap:** see `admin-worker/STATUS.md`. Completed: Phases 1, 2, 2.5, 3a (deploy). Remaining: Phase 3b (Cloudflare Access for Google login / One-time PIN as second factor — Cloudflare dashboard only, no code), Phase 4 (sync notifications between local and remote panels, unified trash).

**Rollback:** the entire `admin-worker/` introduction has tag `pre-worker-v1` and branch `backup/pre-cloudflare-worker` on GitHub. To wipe entirely: `git reset --hard pre-worker-v1` (destructive — confirm with user first). To wipe just the Cloudflare deployment: `npx wrangler delete` from `admin-worker/`.

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

## Backup mirroring (GitLab + Codeberg)

User maintains 34 GitHub repos (all under `SalehGNUTUX`) and mirrors them to two backup hosts for redundancy.

**GitLab — Pull Mirror (still available):**
- `gitlab_github_sync.sh` bulk-creates Pull Mirrors via GitLab API
- Token in `~/.gitlab_token` (mode 0600); 30-min minimum sync interval

**Codeberg — Push via GitHub Actions** (Pull Mirror was disabled site-wide):
- `codeberg_github_sync.sh` is the **old** Pull Mirror script — kept for archive only, returns HTTP 403
- The current setup uses `.github/workflows/codeberg-mirror.yml` in each repo that does `git push --mirror` to Codeberg on every push (seconds, not 1h)
- Three operational scripts:
  - `codeberg_workflow_install.sh` — bulk install on all repos (skips already-configured)
  - `codeberg_add_repo.sh REPO_NAME` — single-repo helper after `gh repo create`
  - `codeberg_fix_secrets.sh` — re-set CODEBERG_TOKEN across all repos (e.g., after token rotation)
- Codeberg user is **`gnutux`** (different from GitHub's `SalehGNUTUX`)
- Token needs `repository: Admin` (creates empty repos) + `user: Read`

**Critical gotcha — token `\n`:**
- `echo "$TOKEN" > ~/.codeberg_token` writes 41 bytes (token + newline)
- `echo "$TOKEN" | gh secret set --body -` keeps the `\n` → GitHub Actions builds URL like `https://gnutux:TOKEN\n@codeberg.org/...` → fails with `Credentials are incorrect or have expired`
- **Always use `gh secret set CODEBERG_TOKEN --repo X < ~/.codeberg_token`** (file via stdin — `gh` strips the trailing newline)
- The workflow also `git config --global credential.helper ""` to neutralize the helper `actions/checkout` registers for github.com (it interferes with codeberg.org auth)

Reference: `codeberg_github_sync_wiki.md` + `gitlab_github_sync_wiki.md`.

---

## Local-only files (gitignored — must persist across restarts)

| File | Purpose |
|---|---|
| `admin/.admin-password` | SHA-256 hash of admin panel password |
| `admin/.admin-security.json` | confirmFor toggles + sessionMinutes |
| `admin/.github-token` | PAT for Discussions moderation (mode 0600) |
| `admin/.trash/` | Legacy — empty after Phase 4 unification (deletes now go to repo's `_trash/`) |
| `_config.local.yml` | Local Jekyll overrides (auto-created by `start.sh`) |
| `admin-worker/.dev.vars` | Local-dev secrets for the Worker: `GITHUB_TOKEN` (PAT), `ADMIN_PASS_HASH`, `AUTH_SECRET` |
| `assets/images/_originals/<lang>/` | Backups created by `scripts/optimize-images.js` before in-place compression |
| `admin-worker/node_modules/` | Wrangler + deps (only used for `wrangler dev`/`wrangler deploy`) |
| `admin-worker/.wrangler/` | Wrangler cache + local Miniflare state |
| `~/.codeberg_token` | Codeberg PAT (outside repo; used by mirror scripts) |
| `~/.gitlab_token` | GitLab PAT (outside repo; used by mirror script) |

---

## Key Conventions

- **Slug**: Latin, lowercase, hyphens only. Identical in both `_ar/` and `_en/` for translation linking.
- **Category system**: defined in `_data/categories.yml`. Add category: update YAML + create dirs + create pages.
- **`page.lang`** drives all bilingual branching in templates and `main.js`
- Font Awesome 6 Free from jsDelivr CDN (no integrity hash — caused silent failures previously)
- `_config.local.yml` is gitignored; `start.sh` creates it automatically
- **POST /api/article**: body must include `cat`, `lang`, `slug` as top-level keys
- **Date storage**: use `new Date(y, m-1, d, h, min, s)` (local timezone interpretation) — Node converts to UTC internally, gray-matter writes ISO UTC. **Never use `Date.UTC(...)`** for user-entered times — it treats inputs as UTC literally, creating future-dated articles for any user not in UTC (Jekyll skips them, causing 404 with visible cards in lists). The remote Worker has no local TZ so it relies on `mode-detect.js` to convert browser-local times to ISO UTC before sending.
- **Decap CMS locale**: keep `locale: en` — changing to `ar` breaks Collections panel rendering
- **Do not add integrity hash** to Font Awesome CDN link
- **`_data/articles-index.json` is auto-managed.** Never edit by hand — it's regenerated by `.github/workflows/build-articles-index.yml` on every push that touches `_ar/**` or `_en/**`, and the Worker reads it on every list query. If you need to regenerate locally: `cd scripts && npm install && node build-articles-index.js`.
- **`_data/images-index.json` is auto-managed.** Same pattern as articles-index: `.github/workflows/build-images-index.yml` runs on push that touches `assets/images/**` and generates per-image `last_modified_ts` via `git log -1 --format=%at`. **Both panels read this index for newest-first sort** — the local panel falls back to `fs.statSync(...).mtimeMs` only if the index file is missing. This guarantees the same image order in both UIs (`fs.statSync mtime` was unreliable when images were restored from backup with same timestamps). Regenerate locally with `node scripts/build-images-index.js` (script needs `fetch-depth: 0` checkout to read git history).
- **Unified GitHub PAT.** The same Classic PAT (`ghp_...` with `repo` scope = Contents R+W + Discussions R+W) is used in **two** places: (1) `admin/.github-token` for local Discussions moderation, (2) Cloudflare secret `GITHUB_TOKEN` for the remote Worker (both CRUD and Discussions). When rotating the PAT, update **both** locations. The remote Worker secret update needs `~60s` for Cloudflare's global propagation.
