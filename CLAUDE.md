# CLAUDE.md

claude --resume 00b11c2c-76d9-4243-8c50-e75d5064e94f


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

GT-NEWSTECH is a bilingual (Arabic/English) Jekyll static site hosted on GitHub Pages. It has two independent parts:

- **Jekyll site** — the public website, built and deployed via GitHub Actions
- **Admin panel** (`admin/`) — a local-only Node.js/Express SPA for content management, never deployed

---

## Commands

### Run everything locally (recommended)
```bash
bash start.sh
# Jekyll → http://localhost:4000/
# Admin  → http://localhost:4001/
# Ctrl+C stops both
```

### Jekyll only
```bash
bash serve.sh
# Uses both _config.yml + _config.local.yml (baseurl: "")
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

### Admin panel (manual)
```bash
cd admin && npm install && node server.js
```

### Deploy (push to GitHub Pages)
```bash
git add . && git commit -m "message" && git push origin main
# GitHub Actions builds and deploys automatically
```

---

## Architecture

### Jekyll site

**Two-config system:**
- `_config.yml` — production config (`baseurl: "/GT-NEWSTECH"`, `url: "https://SalehGNUTUX.github.io"`)
- `_config.local.yml` — local override (`baseurl: ""`, `url: "http://localhost:4000"`) — gitignored, used only with `--config _config.yml,_config.local.yml`

**Dynamic categories — single source of truth:**
- `_data/categories.yml` stores all category definitions: `id`, `name_ar`, `name_en`, `icon` (FA class), `color` (hex)
- All templates loop over `site.data.categories` — no hardcoded category lists anywhere
- `category.html` uses `site.data.categories | where: "id", page.category | first` for icon, title, and header color
- `article-card.html` uses inline styles from `cat_data.color` — no CSS class per category needed
- Adding a new category only requires updating `_data/categories.yml` + creating folders and category pages

**Language isolation:**
- `index.html` (root) — JS router that reads `localStorage['gnt-lang']` or browser language, then redirects to `/ar/` or `/en/`
- `ar/index.html` and `en/index.html` use `layout: home` with `page.lang` set, so `home.html` renders `site[page.lang]` exclusively
- All templates branch on `page.lang` — never mix Arabic and English content
- Language choice is saved to `localStorage['gnt-lang']`; nav links carry `data-lang-link` + `data-lang` attributes that `main.js` reads

**Article collections:**
- Articles live in `_ar/<category>/YYYY-MM-DD-slug.md` and `_en/<category>/YYYY-MM-DD-slug.md`
- The `slug` front matter field (Latin only, kebab-case) is the **only link** between an Arabic article and its English counterpart — `post.html` uses `site.en | where: "slug", page.slug | first` to find the translation
- Images are language-separated: `assets/images/ar/<name>` and `assets/images/en/<name>`, referenced as `{{ site.baseurl }}/assets/images/{{ page.lang }}/{{ page.image }}`
- If `image` is absent or broken, `article-card.html` and `post.html` fall back to `assets/icons/gt-newstech-icon.png`

**Multi-category (`also_in`):**
- A post has one primary `category` (determines its folder and permalink color)
- `also_in: [cat1, cat2]` makes it appear in additional category pages
- `category.html` merges: `primary_posts = where("category", page.category)` + `cross_posts = where_exp("item", "item.also_in contains page.category")` → `uniq`

**Affiliate disclosure:**
- `affiliate: true` is set as a default for all posts in `_config.yml` defaults
- `_includes/affiliate-disclosure.html` only renders when `page.content contains 'aff-link'` — automatic detection, no manual flag needed
- Affiliate links in Markdown: `[text](url){: .aff-link rel="nofollow sponsored" target="_blank"}`

**SEO:**
- `_includes/seo-jsonld.html` injects `NewsArticle` schema for posts and `WebSite` schema for other pages
- Included via `{% include seo-jsonld.html %}` inside `<head>` in `_layouts/default.html`
- `search.json` (Jekyll template) generates a client-side search index filtered by `page.lang` in `main.js`

**Critical `exclude` rule:**
The `admin/` directory and all shell scripts **must stay** in `_config.yml`'s `exclude` list. Jekyll will crash if it tries to process `admin/node_modules/` (Liquid syntax errors from npm README files).

**Do NOT use `--livereload`** with Jekyll serve — it causes Chrome to display `chrome-error://chromewebdata/` errors by triggering browser reloads during incomplete builds. Use `--watch` and manual F5 refresh instead.

### Admin panel (`admin/`)

Express REST API + vanilla JS SPA. The server uses `path.join(__dirname, '..')` as `ROOT` to read/write Jekyll project files directly.

**API surface:**
```
GET  /api/stats                              → counts by lang/category + recent 6
GET  /api/articles?lang=&cat=&q=            → list (filtered)
GET  /api/article?lang=&cat=&file=          → single article (parsed front matter + content)
POST /api/article                           → create (body must include cat, lang, slug explicitly)
PUT  /api/article?lang=&cat=&file=          → update
DELETE /api/article?lang=&cat=&file=        → delete
GET  /api/images?lang=                      → list images
POST /api/images/:lang                      → upload (multer memoryStorage, sharp for conversion, max 20MB)
POST /api/images/import                     → import from filesystem path, copy to lang folders
DELETE /api/images/:lang/:name              → delete image
GET  /api/categories                        → list all categories with AR/EN article counts
POST /api/categories                        → create new category (dirs + pages + _data/categories.yml)
GET  /api/git/status                        → git status + git log -5
POST /api/git/push                          → git add . && git commit -m msg && git push origin main
GET  /api/config                            → raw _config.yml content
```

**Image handling (sharp):**
- Web formats (jpg, png, webp, avif, gif, svg) → saved as-is
- Non-web formats (heic, heif, tiff, bmp) → converted to JPEG via sharp
- Filenames sanitized: only `[a-zA-Z0-9._-]`, lowercase

**Categories are dynamic:**
- `getCatIds()` reads from `_data/categories.yml` + scans `_ar/` subfolders for unlisted ones
- `getAllArticles()` uses `getCatIds()` — no hardcoded category list in server
- `readCatsData()` / `writeCatsData()` use `js-yaml` to parse/write `_data/categories.yml`
- Creating a category: creates `_ar/<id>/`, `_en/<id>/`, `ar/category/<id>.html`, `en/category/<id>.html`, appends to `_data/categories.yml`

**CATS in admin.js:**
- `CATS` is populated from `GET /api/categories` at startup via `loadCats()`
- Not hardcoded — adding a category in admin instantly reflects in editor dropdowns after reload

**SPA routing:** hash-based (`#dashboard`, `#articles`, `#new-article`, `#images`, `#categories`, `#git`, `#config`). The articles page renders the toolbar once (`if (!$('articlesTable'))`) then only updates `<tbody>` on search/filter to preserve input focus.

**FM paste feature:** Tab "لصق FM" in article editor — pastes raw front matter YAML, `parseFrontMatterText()` parses it and `fillFormFromParsed()` fills all form fields.

### CSS architecture

Single file `assets/css/style.css`. Theming via CSS custom properties:
- Light mode: defined on `:root`
- Dark mode: overrides on `[data-theme="dark"]`
- `theme.js` runs before CSS loads (inline `<script>` in `<head>`) to set `data-theme` from `localStorage['gnt-theme']`, preventing flash

Category badge colors use **inline styles** from `_data/categories.yml` — no per-category CSS class needed for new categories. Existing `.cat-*` CSS classes are kept for backward compatibility but templates now use `style="background:{{ cat_data.color }}"`.

---

## Key Conventions

- **Slug**: Latin characters, lowercase, hyphens only. Must be identical in both `_ar/.../` and `_en/.../` files for translation linking to work.
- **Category system**: defined in `_data/categories.yml`, not hardcoded in templates or server. To add a category: update YAML + create dirs + create category HTML pages.
- **`page.lang`** drives all bilingual branching in Liquid templates and in `main.js` (`currentLang = document.body.getAttribute('data-lang')`)
- Font Awesome 6 Free is loaded from jsDelivr CDN (no integrity hash — avoid adding one, it caused silent load failures previously)
- `_config.local.yml` is gitignored; recreate it if missing with `baseurl: ""` and `url: "http://localhost:4000"`. `start.sh` creates it automatically.
- **POST /api/article**: body must include `cat`, `lang`, `slug` as top-level keys (not just inside `fm`) for the server to find them.
