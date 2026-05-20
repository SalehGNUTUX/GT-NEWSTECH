'use strict';

// ── State ──────────────────────────────────────────────────────
const S = {
  page: 'dashboard',
  langFilter: 'ar',
  catFilter: '',
  searchQ: '',
  editingArticle: null,   // { lang, cat, file } | null = new
  pickerLang: 'ar',
  articles: [],
};

/* CATS يُحمَّل ديناميكياً من /api/categories عند بدء التشغيل */
let CATS = {};

async function loadCats() {
  try {
    const d = await api('/api/categories');
    CATS = {};
    (d.categories || []).forEach(c => {
      CATS[c.id] = { ar: c.name_ar, en: c.name_en, icon: c.icon, color: c.color };
    });
  } catch (_) {}
}

// ── Utils ──────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className=cls; if(html) e.innerHTML=html; return e; };

function toast(msg, type='info', dur=3000) {
  const t = el('div', `toast ${type}`, msg);
  $('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), dur);
}

// ── Auth ───────────────────────────────────────────────────────
const TOKEN_KEY = 'gnt-admin-token';
const PASS_CACHE_KEY = 'gnt-admin-pass-cache';  /* لتعبئة الحقل بعد انتهاء الجلسة */

function getToken()      { return localStorage.getItem(TOKEN_KEY) || ''; }
function setToken(t)     { if(t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }
function cachePass(p)    { try { sessionStorage.setItem(PASS_CACHE_KEY, p); } catch(_){} }
function getCachedPass() { try { return sessionStorage.getItem(PASS_CACHE_KEY) || ''; } catch(_){ return ''; } }
function clearCachedPass(){ try { sessionStorage.removeItem(PASS_CACHE_KEY); } catch(_){} }

async function api(url, opts={}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-admin-token': getToken(),
    ...(opts.headers || {})
  };
  let r = await fetch(url, { ...opts, headers });

  if (r.status === 401) {
    /* تحقّق هل هي needsConfirm أم انتهاء جلسة */
    let body = {};
    try { body = await r.clone().json(); } catch (_) {}
    if (body.needsConfirm) {
      const ct = await promptConfirm(body.action);
      if (!ct) return { ok: false, cancelled: true };
      /* أعد المحاولة مع رمز التأكيد */
      r = await fetch(url, {
        ...opts,
        headers: { ...headers, 'x-admin-confirm': ct }
      });
      return r.json();
    }
    /* انتهاء جلسة أو unauthorized عام */
    setToken(null);
    showLogin();
    return {};
  }
  return r.json();
}

/* قاموس تسميات الإجراءات */
const ACTION_LABELS = {
  create_article:  'إنشاء مقال',
  edit_article:    'تعديل مقال',
  delete_article:  'حذف مقال',
  push:            'دفع التغييرات إلى GitHub',
  manage_security: 'تعديل إعدادات الأمان',
  remove_password: 'إزالة كلمة المرور'
};

/* Modal تأكيد كلمة المرور */
async function promptConfirm(action) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'confirm-overlay';
    wrap.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-header">
          <i class="fa-solid fa-shield-halved"></i>
          <h3>تأكيد كلمة المرور</h3>
        </div>
        <p>الإجراء <strong>"${ACTION_LABELS[action] || action}"</strong> يتطلّب تأكيد كلمة المرور.</p>
        <input type="password" id="_cfPass" placeholder="كلمة المرور" autocomplete="current-password">
        <div id="_cfErr" class="confirm-err"></div>
        <div class="confirm-actions">
          <button class="btn btn-gold" id="_cfOk"><i class="fa-solid fa-check"></i> تأكيد</button>
          <button class="btn btn-ghost" id="_cfCancel"><i class="fa-solid fa-xmark"></i> إلغاء</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    const pwd = wrap.querySelector('#_cfPass');
    setTimeout(() => pwd.focus(), 30);

    const close = (val) => { wrap.remove(); resolve(val); };

    wrap.querySelector('#_cfCancel').onclick = () => close(null);
    wrap.querySelector('#_cfOk').onclick = async () => {
      const r = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
        body: JSON.stringify({ password: pwd.value })
      });
      const d = await r.json();
      if (d.ok && d.confirmToken) close(d.confirmToken);
      else { wrap.querySelector('#_cfErr').textContent = d.error || 'خطأ'; pwd.select(); }
    };
    pwd.addEventListener('keydown', e => {
      if (e.key === 'Enter')  wrap.querySelector('#_cfOk').click();
      if (e.key === 'Escape') close(null);
    });
  });
}

async function checkAuth() {
  const st = await fetch('/api/auth/status', { headers: { 'x-admin-token': getToken() } });
  if (st.status === 401) { showLogin(); return false; }
  return true;
}

function showLogin() {
  const overlay = $('loginOverlay');
  const passInp = $('loginPass');
  overlay.removeAttribute('hidden');
  /* استرجع كلمة المرور المحفوظة في الجلسة (sessionStorage فقط، لا localStorage)
     ليكفي المستخدم Enter بعد انتهاء الجلسة بدون إعادة كتابتها */
  if (passInp) {
    const cached = getCachedPass();
    if (cached) passInp.value = cached;
  }
  setTimeout(() => {
    passInp?.focus();
    if (passInp?.value) passInp.select();  /* اختر المحتوى ليُستبدل بسهولة */
  }, 50);
}

window.doLogin = async function() {
  const pass = $('loginPass')?.value || '';
  const d = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pass })
  }).then(r => r.json());
  if (d.ok) {
    setToken(d.token);
    cachePass(pass);   /* احفظها في sessionStorage لجلسات المتصفح المتعاقبة */
    $('loginOverlay').setAttribute('hidden', '');
    $('loginError').textContent = '';
    navigate(location.hash.slice(1) || 'dashboard');
  } else {
    $('loginError').textContent = d.error || 'خطأ في الدخول';
    $('loginPass').select();
  }
};

function catBadge(cat, small=false, en=false) {
  const info  = CATS[cat] || {};
  const color = info.color || '#888';
  const label = en ? (info.en || cat) : (info.ar || cat);
  return `<span class="r-cat" style="background:${color};color:#000;${small?'font-size:.6rem':''}">${label}</span>`;
}

function fmt(kb) {
  if(!kb) return '';
  if(kb < 1024) return kb+'B';
  return (kb/1024).toFixed(1)+'KB';
}

// ── Routing ────────────────────────────────────────────────────
function navigate(page) {
  S.page = page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page===page));
  const titles = { dashboard:'لوحة التحكم', articles:'المقالات', 'new-article':'مقال جديد', images:'مدير الصور', categories:'الأقسام', trash:'المهملات', comments:'إدارة التعليقات', git:'Git / نشر', remotes:'المستودعات', security:'الأمان', config:'الإعدادات' };
  $('topbarTitle').textContent = titles[page] || page;
  renderPage(page);
}

window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'dashboard'));

// ── Pages ──────────────────────────────────────────────────────
async function renderPage(page) {
  const c = $('content');
  c.innerHTML = '<div class="loading-wrap"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  if (page === 'dashboard')    return renderDashboard(c);
  if (page.startsWith('cat-stats/')) return renderCategoryStats(c, page.split('/')[1]);
  if (page === 'articles')     return renderArticles(c);
  if (page === 'new-article')  { openEditor(null); return renderArticles(c); }
  if (page === 'images')       return renderImages(c);
  if (page === 'categories')   return renderCategories(c);
  if (page === 'trash')        return renderTrash(c);
  if (page === 'comments')     return renderComments(c);
  if (page === 'git')          return renderGit(c);
  if (page === 'remotes')      return renderRemotes(c);
  if (page === 'security')     return renderSecurity(c);
  if (page === 'config')       return renderConfig(c);
}

// Dashboard ─────────────────────────────────────────────────────
async function renderDashboard(c) {
  const d = await api('/api/stats');
  const catTotal = Object.values(d.byCat).reduce((a,b)=>a+b,0)||1;
  c.innerHTML = `
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-icon gold"><i class="fa-solid fa-newspaper"></i></div>
      <div><div class="stat-val">${d.total}</div><div class="stat-lbl">إجمالي المقالات</div></div></div>
    <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-language"></i></div>
      <div><div class="stat-val">${d.byLang.ar||0}</div><div class="stat-lbl">مقالة عربية</div></div></div>
    <div class="stat-card"><div class="stat-icon green"><i class="fa-solid fa-earth-americas"></i></div>
      <div><div class="stat-val">${d.byLang.en||0}</div><div class="stat-lbl">English Articles</div></div></div>
    ${Object.entries(CATS).map(([k,v])=>`
    <a class="stat-card stat-card--link" href="#cat-stats/${k}" title="إحصائيات تفصيلية">
      <div class="stat-icon" style="background:rgba(255,255,255,.06)"><i class="fa-${v.brand?'brands':'solid'} ${v.icon}" style="font-size:1.1rem;color:var(--gold)"></i></div>
      <div><div class="stat-val">${d.byCat[k]||0}</div><div class="stat-lbl">${v.ar}</div></div>
    </a>`).join('')}
  </div>
  <div class="dash-grid">
    <div class="card">
      <div class="card-header"><i class="fa-solid fa-clock" style="color:var(--gold)"></i><h3>أحدث المقالات</h3></div>
      <div class="card-body">
        <div class="recent-list">
          ${(d.recent||[]).map(a=>`
          <div class="recent-item" onclick="editFrom('${a._lang}','${a._cat}','${a._file}')" style="cursor:pointer">
            ${catBadge(a._cat, true)}
            <span class="r-title">${a.title||a._file}</span>
            <span class="r-date">${(a.date||'').toString().slice(0,10)}</span>
            <span style="color:var(--muted);font-size:.7rem">${a._lang.toUpperCase()}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><i class="fa-solid fa-chart-bar" style="color:var(--gold)"></i><h3>توزيع الأقسام</h3></div>
      <div class="card-body">
        <div class="cat-bars">
          ${Object.entries(CATS).map(([k,v])=>`
          <div class="cat-bar-item">
            <div class="cat-bar-label"><span>${v.ar}</span><span>${d.byCat[k]||0}</span></div>
            <div class="cat-bar-track"><div class="cat-bar-fill cc-${k}" style="width:${Math.round(((d.byCat[k]||0)/catTotal)*100)}%"></div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// Category Stats ────────────────────────────────────────────────
async function renderCategoryStats(c, catId) {
  const info = CATS[catId];
  if (!info) { c.innerHTML = '<div class="empty-state">قسم غير موجود</div>'; return; }

  const [arList, enList] = await Promise.all([
    api(`/api/articles?lang=ar&cat=${catId}`),
    api(`/api/articles?lang=en&cat=${catId}`)
  ]);

  const total = (arList?.length || 0) + (enList?.length || 0);
  const allArticles = [...(arList||[]), ...(enList||[])];
  const sorted = [...allArticles].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5);
  const oldest = sorted[sorted.length - 1];
  const newest = sorted[0];

  /* مقالات also_in (الفئة كقسم إضافي) */
  const allBoth = await api(`/api/articles`);
  const alsoInArr = (allBoth||[]).filter(a => Array.isArray(a.also_in) && a.also_in.includes(catId));

  /* أكثر الوسوم */
  const tagCount = {};
  allArticles.forEach(a => (a.tags||[]).forEach(t => { tagCount[t] = (tagCount[t]||0) + 1; }));
  const topTags = Object.entries(tagCount).sort((a,b) => b[1]-a[1]).slice(0, 8);

  /* مقالات مكتملة الترجمة (slug موجود في الجانبين) */
  const arSlugs = new Set((arList||[]).map(a => a.slug));
  const enSlugs = new Set((enList||[]).map(a => a.slug));
  const matched = [...arSlugs].filter(s => enSlugs.has(s)).length;
  const arOnly = (arList||[]).filter(a => !enSlugs.has(a.slug)).length;
  const enOnly = (enList||[]).filter(a => !arSlugs.has(a.slug)).length;

  c.innerHTML = `
  <div style="margin-bottom:1rem">
    <a href="#dashboard" class="btn btn-ghost btn-sm">
      <i class="fa-solid fa-arrow-right"></i> العودة للوحة التحكم
    </a>
  </div>

  <div class="card" style="margin-bottom:1rem">
    <div class="card-header" style="background:${info.color||'#888'};color:#000">
      <i class="fa-${info.brand?'brands':'solid'} ${info.icon||'fa-folder'}" style="font-size:1.5rem"></i>
      <h3 style="color:#000;margin:0">${info.ar}</h3>
      <span style="margin-right:auto;font-family:monospace;font-size:.85rem;color:rgba(0,0,0,.7)">${info.en} · ${catId}</span>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="stat-icon gold"><i class="fa-solid fa-newspaper"></i></div>
      <div><div class="stat-val">${total}</div><div class="stat-lbl">إجمالي المقالات</div></div></div>
    <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-language"></i></div>
      <div><div class="stat-val">${arList?.length||0}</div><div class="stat-lbl">عربية</div></div></div>
    <div class="stat-card"><div class="stat-icon green"><i class="fa-solid fa-earth-americas"></i></div>
      <div><div class="stat-val">${enList?.length||0}</div><div class="stat-lbl">English</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(122,196,87,.15)"><i class="fa-solid fa-link" style="color:#7ac457"></i></div>
      <div><div class="stat-val">${matched}</div><div class="stat-lbl">مقالات مكتملة الترجمة</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(212,160,23,.15)"><i class="fa-solid fa-shuffle" style="color:var(--gold)"></i></div>
      <div><div class="stat-val">${alsoInArr.length}</div><div class="stat-lbl">يظهر فيها كقسم إضافي</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(255,165,80,.15)"><i class="fa-solid fa-triangle-exclamation" style="color:#ffa550"></i></div>
      <div><div class="stat-val">${arOnly+enOnly}</div><div class="stat-lbl">مقالات بلا ترجمة (${arOnly} AR / ${enOnly} EN)</div></div></div>
  </div>

  <div class="dash-grid">
    <div class="card">
      <div class="card-header"><i class="fa-solid fa-clock" style="color:var(--gold)"></i><h3>أحدث 5 مقالات</h3></div>
      <div class="card-body">
        ${recent.length ? recent.map(a => `
        <a class="dash-list-row" href="#" onclick="editFrom('${a._lang}','${a._cat}','${a._file}');return false">
          <div style="flex:1">
            <div style="font-weight:600;font-size:.88rem">${a.title || a._file}</div>
            <div style="font-size:.7rem;color:var(--muted);font-family:monospace">${a._lang.toUpperCase()} · ${(a.date||'').toString().slice(0,10)}</div>
          </div>
          <i class="fa-solid fa-chevron-left" style="color:var(--muted);font-size:.75rem"></i>
        </a>`).join('') : '<div class="empty-state">لا توجد مقالات</div>'}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><i class="fa-solid fa-tags" style="color:var(--gold)"></i><h3>أكثر الوسوم استخداماً</h3></div>
      <div class="card-body">
        ${topTags.length ? `
        <div style="display:flex;flex-wrap:wrap;gap:.5rem">
          ${topTags.map(([t, n]) => `
          <span class="r-cat" style="background:var(--bg3);color:var(--text);border:1px solid var(--border);padding:.35rem .7rem;font-size:.8rem">
            ${t} <strong style="color:var(--gold);margin-inline-start:.3rem">${n}</strong>
          </span>`).join('')}
        </div>` : '<div class="empty-state">لا توجد وسوم</div>'}
      </div>
    </div>
  </div>

  ${newest && oldest ? `
  <div class="card" style="margin-top:1rem">
    <div class="card-header"><i class="fa-solid fa-timeline" style="color:var(--gold)"></i><h3>الزمن</h3></div>
    <div class="card-body" style="display:flex;gap:1rem;flex-wrap:wrap">
      <div style="flex:1;min-width:240px">
        <div style="font-size:.78rem;color:var(--muted);margin-bottom:.25rem">أول مقال نُشر</div>
        <div style="font-weight:600">${oldest.title}</div>
        <div style="font-size:.72rem;color:var(--muted);font-family:monospace">${(oldest.date||'').toString().slice(0,10)}</div>
      </div>
      <div style="flex:1;min-width:240px">
        <div style="font-size:.78rem;color:var(--muted);margin-bottom:.25rem">آخر مقال نُشر</div>
        <div style="font-weight:600">${newest.title}</div>
        <div style="font-size:.72rem;color:var(--muted);font-family:monospace">${(newest.date||'').toString().slice(0,10)}</div>
      </div>
    </div>
  </div>` : ''}`;
}

// Articles ──────────────────────────────────────────────────────
function articlesTableRows(list) {
  if (!list.length) return `<tr class="empty-row"><td colspan="6"><i class="fa-solid fa-inbox"></i> لا توجد مقالات</td></tr>`;
  const isEn = S.langFilter === 'en';
  return list.map(a => `
  <tr>
    <td class="td-title" title="${a.title||''}">${a.title||a._file}</td>
    <td>${catBadge(a._cat, false, isEn)}</td>
    <td style="font-family:'Inter',monospace;font-size:.78rem">${(a.date||'').toString().slice(0,10)}</td>
    <td style="font-size:.72rem;color:var(--muted);font-family:monospace">${a.slug||'-'}</td>
    <td style="font-size:.72rem">${(a.also_in||[]).map(c=>{const n=CATS[c];return`<span class="r-cat" style="background:${n?.color||'#888'};color:#000;font-size:.6rem">${isEn?(n?.en||c):(n?.ar||c)}</span>`;}).join(' ')||'-'}</td>
    <td><div class="td-actions">
      <button class="btn-icon edit" title="تحرير" onclick="editFrom('${a._lang}','${a._cat}','${a._file}')"><i class="fa-solid fa-pen-to-square"></i></button>
      <button class="btn-icon danger" title="حذف" onclick="deleteArticle('${a._lang}','${a._cat}','${a._file}','${(a.title||a._file).replace(/'/g,"\\'")}')"><i class="fa-solid fa-trash"></i></button>
    </div></td>
  </tr>`).join('');
}

async function fetchAndRenderRows() {
  let url = `/api/articles?lang=${S.langFilter}`;
  if (S.catFilter) url += `&cat=${S.catFilter}`;
  if (S.searchQ)   url += `&q=${encodeURIComponent(S.searchQ)}`;
  S.articles = await api(url);
  const tbody = document.querySelector('#articlesTable tbody');
  if (tbody) tbody.innerHTML = articlesTableRows(S.articles);
}

async function renderArticles(c) {
  /* الهيكل يُرسم مرة واحدة فقط — لا يُعاد رسمه عند البحث */
  if (!$('articlesTable')) {
    c.innerHTML = `
    <div class="table-toolbar">
      <input class="search-box" id="searchBox" placeholder="ابحث في عنوان المقال..."
             value="${S.searchQ}" autocomplete="off">
      <select class="filter-select" id="catFilter">
        <option value="">${S.langFilter==='en'?'All Categories':'كل الأقسام'}</option>
        ${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${S.catFilter===k?'selected':''}>${S.langFilter==='en'?v.en:v.ar}</option>`).join('')}
      </select>
      <button class="btn btn-gold" onclick="openEditor(null)">
        <i class="fa-solid fa-plus"></i> مقال جديد
      </button>
    </div>
    <div class="table-wrap">
      <table id="articlesTable">
        <thead><tr>
          <th>العنوان</th><th>القسم</th><th>التاريخ</th><th>Slug</th><th>أقسام إضافية</th><th>إجراءات</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>`;

    /* المستمعون يُضافون مرة واحدة فقط — بدون إعادة رسم الصفحة */
    $('searchBox').addEventListener('input', e => {
      S.searchQ = e.target.value;
      fetchAndRenderRows();           /* يُحدَّث tbody فقط */
    });
    $('catFilter').addEventListener('change', e => {
      S.catFilter = e.target.value;
      fetchAndRenderRows();
    });
  }

  await fetchAndRenderRows();
}

// Images ────────────────────────────────────────────────────────
async function renderImages(c) {
  c.innerHTML = `
  <div class="img-lang-tabs">
    <button class="iltab ${S.langFilter==='ar'?'active':''}" onclick="setImgLang('ar')">AR صور العربية</button>
    <button class="iltab ${S.langFilter==='en'?'active':''}" onclick="setImgLang('en')">EN English Images</button>
  </div>
  <div class="upload-zone" id="uploadZone" onclick="$('fileInput').click()">
    <i class="fa-solid fa-cloud-arrow-up"></i>
    انقر لرفع صور أو اسحبها هنا<br>
    <small>JPG، PNG، WebP — حتى 5MB لكل صورة</small>
  </div>
  <input type="file" id="fileInput" multiple accept="image/*" hidden>
  <div class="image-grid" id="imageGrid"><div class="loading-wrap"><i class="fa-solid fa-spinner fa-spin"></i></div></div>`;

  await loadImages();

  $('fileInput').addEventListener('change', async e => {
    await uploadImages(e.target.files);
    $('fileInput').value = '';
  });
  const zone = $('uploadZone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor='var(--gold)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor=''; });
  zone.addEventListener('drop', async e => { e.preventDefault(); zone.style.borderColor=''; await uploadImages(e.dataTransfer.files); });
}

async function loadImages() {
  const imgs = await api(`/api/images?lang=${S.langFilter}`);
  const grid = $('imageGrid');
  if (!grid) return;
  grid.innerHTML = imgs.length ? imgs.map(img=>`
  <div class="img-item" id="img-${img.name.replace(/\./g,'_')}">
    <img src="${img.url}" alt="${img.name}" loading="lazy">
    <div class="img-actions">
      <button class="img-act-btn" title="نسخ الاسم" onclick="copyImgName('${img.name}')"><i class="fa-solid fa-copy"></i></button>
      <button class="img-act-btn del" title="حذف" onclick="deleteImage('${img.lang}','${img.name}')"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="img-item-info">
      <div class="img-name" title="${img.name}">${img.name}</div>
      <div class="img-size">${fmt(img.size)}</div>
    </div>
  </div>`).join('') : '<div class="loading-wrap" style="color:var(--muted)"><i class="fa-solid fa-images"></i></div>';
}

async function uploadImages(files) {
  if(!files?.length) return;
  toast('جاري الرفع والمعالجة...', 'info');
  const fd = new FormData();
  Array.from(files).forEach(f => fd.append('files', f));
  const r = await fetch(`/api/images/${S.langFilter}`, {
    method: 'POST',
    headers: { 'x-admin-token': getToken() },   /* ← مهم: token مع uploads */
    body: fd
  });
  if (r.status === 401) { showLogin(); return; }
  const d = await r.json();
  if(!d.ok) { toast('خطأ: '+(d.error||'فشل الرفع'), 'error'); return; }
  const converted = (d.uploaded||[]).filter(u => u.converted).length;
  const msg = converted
    ? `✓ تم رفع ${d.uploaded.length} صورة (${converted} تم تحويلها إلى JPEG)`
    : `✓ تم رفع ${d.uploaded?.length||0} صورة`;
  toast(msg, 'success');
  await loadImages();
}

window.setImgLang = lang => { S.langFilter = lang; renderImages($('content')); };
window.copyImgName = name => { navigator.clipboard.writeText(name); toast('تم نسخ اسم الصورة: '+name, 'info'); };
window.deleteImage = async (lang, name) => {
  if(!confirm(`حذف الصورة "${name}"؟`)) return;
  await api(`/api/images/${lang}/${name}`, {method:'DELETE'});
  toast('تم حذف الصورة', 'success');
  await loadImages();
};

// ── Trash ───────────────────────────────────────────────────────
async function updateTrashBadge() {
  try {
    const d = await api('/api/trash');
    const n = (d.items || []).length;
    const badge = $('trashBadge');
    const nav   = $('trashNavItem');
    if (!badge) return;
    if (n > 0) {
      badge.textContent = n;
      badge.removeAttribute('hidden');
      nav?.classList.add('has-badge');
    } else {
      badge.setAttribute('hidden', '');
      nav?.classList.remove('has-badge');
    }
  } catch (_) {}
}

// ── Comments Management ─────────────────────────────────────────
async function renderComments(c) {
  /* تحقق من توفر GitHub token */
  const tokenStatus = await api('/api/github-token/status');
  if (!tokenStatus.hasToken) {
    return renderTokenSetup(c);
  }

  c.innerHTML = '<div class="loading-wrap"><i class="fa-solid fa-spinner fa-spin"></i> جاري جلب التعليقات من GitHub...</div>';

  const data = await api('/api/comments');
  if (data.needsToken) return renderTokenSetup(c);
  if (data.error) {
    c.innerHTML = `<div class="card"><div class="card-body" style="color:var(--danger)">
      <i class="fa-solid fa-triangle-exclamation"></i> خطأ: ${escapeHtml(data.error)}
      ${data.error.includes('token') || data.error.includes('credentials') ? '<br><button class="btn btn-gold btn-sm" style="margin-top:.75rem" onclick="renderTokenSetup($(\'content\'))">تحديث Token</button>' : ''}
    </div></div>`;
    return;
  }

  const discussions = data.discussions?.nodes || [];
  const allComments = discussions.flatMap(d => d.comments.nodes);
  const totalComments = allComments.length + allComments.reduce((s, c) => s + (c.replies?.totalCount || 0), 0);
  const totalReactions = discussions.reduce((s, d) => s + d.reactionGroups.reduce((x, r) => x + r.users.totalCount, 0), 0);

  c.innerHTML = `
  <div class="stats-grid" style="margin-bottom:1rem">
    <div class="stat-card"><div class="stat-icon gold"><i class="fa-solid fa-comments"></i></div>
      <div><div class="stat-val">${discussions.length}</div><div class="stat-lbl">نقاش (مقال)</div></div></div>
    <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-comment-dots"></i></div>
      <div><div class="stat-val">${totalComments}</div><div class="stat-lbl">تعليق ورد</div></div></div>
    <div class="stat-card"><div class="stat-icon green"><i class="fa-solid fa-heart"></i></div>
      <div><div class="stat-val">${totalReactions}</div><div class="stat-lbl">تفاعل</div></div></div>
    <div class="stat-card stat-card--link" onclick="renderTokenSetup($('content'))" style="cursor:pointer">
      <div class="stat-icon" style="background:rgba(212,160,23,.15)"><i class="fa-solid fa-key" style="color:var(--gold)"></i></div>
      <div><div class="stat-val" style="font-size:.95rem">إعداد</div><div class="stat-lbl">Token</div></div></div>
  </div>

  <div style="margin-bottom:1rem;display:flex;gap:.5rem;flex-wrap:wrap">
    <button class="btn btn-ghost btn-sm" onclick="renderComments($('content'))">
      <i class="fa-solid fa-rotate"></i> تحديث
    </button>
    <a href="https://github.com/SalehGNUTUX/GT-NEWSTECH/discussions" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
      <i class="fa-brands fa-github"></i> فتح في GitHub
    </a>
  </div>

  ${discussions.length === 0 ? `
    <div class="empty-state" style="padding:3rem">
      <i class="fa-solid fa-comments" style="font-size:2.5rem;color:var(--muted);margin-bottom:1rem"></i>
      <p>لا توجد تعليقات بعد. ستظهر هنا عندما يبدأ القراء بالتفاعل.</p>
    </div>
  ` : discussions.map(d => renderDiscussionCard(d)).join('')}`;
}

function renderDiscussionCard(d) {
  const comments = d.comments.nodes;
  const totalReactions = d.reactionGroups.reduce((s, r) => s + r.users.totalCount, 0);
  /* استخرج رابط المقال من URL النقاش (يحوي pathname mapping) */
  const articleTitle = d.title.replace(/^.*\//, '');
  return `
  <div class="discussion-card" data-id="${d.id}">
    <div class="discussion-header">
      <div style="flex:1;min-width:0">
        <div class="discussion-title" title="${escapeHtml(d.title)}">
          <i class="fa-solid fa-file-lines" style="color:var(--gold)"></i>
          ${escapeHtml(d.title)}
        </div>
        <div class="discussion-meta">
          <span><i class="fa-solid fa-comment"></i> ${d.comments.totalCount}</span>
          <span><i class="fa-solid fa-heart"></i> ${totalReactions}</span>
          <span><i class="fa-solid fa-clock"></i> ${timeAgo(d.updatedAt)}</span>
          ${d.locked ? '<span style="color:var(--danger)"><i class="fa-solid fa-lock"></i> مقفل</span>' : ''}
        </div>
      </div>
      <div class="discussion-actions">
        <a href="${d.url}" target="_blank" rel="noopener" class="btn-icon" title="فتح في GitHub">
          <i class="fa-brands fa-github"></i>
        </a>
        ${d.locked
          ? `<button class="btn-icon" title="فك القفل" onclick="toggleLock('${d.id}',false)"><i class="fa-solid fa-unlock"></i></button>`
          : `<button class="btn-icon danger" title="قفل النقاش" onclick="toggleLock('${d.id}',true)"><i class="fa-solid fa-lock"></i></button>`}
      </div>
    </div>

    <div class="comments-list">
      ${comments.length === 0
        ? '<div style="color:var(--muted);padding:.75rem;font-size:.85rem">لا تعليقات في هذا النقاش (فقط ردود فعل)</div>'
        : comments.map(c => renderCommentItem(c, d.id, false)).join('')}
    </div>

    <div class="discussion-reply">
      <textarea class="discussion-reply-text" id="reply-${d.id}" placeholder="أضف رداً جديداً من المالك..." rows="2"></textarea>
      <button class="btn btn-gold btn-sm" onclick="postReply('${d.id}', null, 'reply-${d.id}')">
        <i class="fa-solid fa-paper-plane"></i> رد
      </button>
    </div>
  </div>`;
}

function renderCommentItem(c, discussionId, isReply) {
  const auth = c.authorAssociation || '';
  const ownerBadge = ['OWNER', 'COLLABORATOR', 'MEMBER'].includes(auth)
    ? `<span class="badge-owner" title="${auth}">${auth === 'OWNER' ? 'مالك' : auth === 'COLLABORATOR' ? 'متعاون' : 'عضو'}</span>`
    : '';
  const reactionsCount = c.reactions?.totalCount || 0;
  const replies = (c.replies?.nodes || []);

  return `
  <div class="comment-item ${c.isMinimized ? 'is-hidden' : ''} ${isReply ? 'is-reply' : ''}">
    <img class="comment-avatar" src="${c.author?.avatarUrl || ''}" alt="" loading="lazy">
    <div style="flex:1;min-width:0">
      <div class="comment-header">
        <a href="${c.author?.url || '#'}" target="_blank" rel="noopener" class="comment-author">
          @${escapeHtml(c.author?.login || 'مجهول')}
        </a>
        ${ownerBadge}
        <span class="comment-time">${timeAgo(c.createdAt)}</span>
        ${c.isMinimized ? `<span class="badge-hidden">🙈 ${c.minimizedReason || 'مخفي'}</span>` : ''}
        ${c.isAnswer ? '<span class="badge-answer">✓ إجابة</span>' : ''}
      </div>
      <div class="comment-body">${escapeHtml(c.body).slice(0, 500)}${c.body.length > 500 ? '…' : ''}</div>
      ${reactionsCount > 0 ? `<div class="comment-reactions">${reactionsCount} تفاعل</div>` : ''}

      <div class="comment-actions">
        ${!isReply ? `<button class="btn btn-sm btn-ghost" onclick="toggleReplyBox('${c.id}')">
          <i class="fa-solid fa-reply"></i> رد
        </button>` : ''}
        ${c.isMinimized
          ? `<button class="btn btn-sm btn-ghost" onclick="unhideComment('${c.id}')">
              <i class="fa-solid fa-eye"></i> إظهار
            </button>`
          : `<button class="btn btn-sm btn-ghost" onclick="hideComment('${c.id}')">
              <i class="fa-solid fa-eye-slash"></i> إخفاء
            </button>`}
        <button class="btn btn-sm btn-ghost danger" onclick="deleteComment('${c.id}')">
          <i class="fa-solid fa-trash"></i> حذف
        </button>
      </div>

      <div class="reply-box" id="replyBox-${c.id}" hidden>
        <textarea class="discussion-reply-text" id="replyText-${c.id}" rows="2" placeholder="اكتب ردك..."></textarea>
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-gold btn-sm" onclick="postReply('${discussionId}', '${c.id}', 'replyText-${c.id}')">
            <i class="fa-solid fa-paper-plane"></i> أرسل الرد
          </button>
          <button class="btn btn-ghost btn-sm" onclick="toggleReplyBox('${c.id}')">إلغاء</button>
        </div>
      </div>

      ${replies.length ? `<div class="comment-replies">
        ${replies.map(r => renderCommentItem({...r, reactions: {totalCount: 0}}, discussionId, true)).join('')}
      </div>` : ''}
    </div>
  </div>`;
}

function renderTokenSetup(c) {
  c.innerHTML = `
  <div class="card">
    <div class="card-header">
      <i class="fa-solid fa-key" style="color:var(--gold)"></i>
      <h3>إعداد GitHub Personal Access Token</h3>
    </div>
    <div class="card-body">
      <p style="color:var(--muted);font-size:.88rem;margin-bottom:1rem;line-height:1.7">
        لإدارة التعليقات والتفاعلات على المقالات، يحتاج لوحة التحكم Personal Access Token (PAT) من GitHub
        بصلاحيات قراءة/كتابة Discussions. الـ token يُحفظ محلياً في
        <code>admin/.github-token</code> (لا يُرفع للمستودع).
      </p>

      <h4 style="margin:1rem 0 .5rem;color:var(--gold);font-size:.95rem">خطوات إنشاء Token (مرة واحدة):</h4>
      <ol style="padding-inline-start:1.5rem;color:var(--text);font-size:.85rem;line-height:1.9">
        <li>افتح: <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener" style="color:var(--gold)">github.com/settings/tokens/new</a></li>
        <li>الاسم (Note): <code>GT-NEWSTECH Admin</code></li>
        <li>المدة (Expiration): اختر <strong>No expiration</strong> أو سنة</li>
        <li>الصلاحيات (Scopes): فعّل ☑ <strong>repo</strong> (يشمل كل ما يلزم للـ Discussions)</li>
        <li>اضغط <strong>Generate token</strong></li>
        <li>انسخ الـ token (يبدأ بـ <code>ghp_</code>) — لن يظهر مرة أخرى!</li>
        <li>الصقه أدناه</li>
      </ol>

      <div class="form-group" style="margin-top:1rem">
        <label>Personal Access Token</label>
        <div style="display:flex;gap:.5rem">
          <input type="password" id="ghToken" placeholder="ghp_..." dir="ltr" style="flex:1;font-family:monospace">
          ${pasteBtn('ghToken')}
        </div>
      </div>

      <div id="ghTokenResult" style="margin:.75rem 0;font-size:.82rem;min-height:1.2em"></div>

      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn btn-gold" onclick="saveGitHubToken()">
          <i class="fa-solid fa-save"></i> حفظ Token
        </button>
        <button class="btn btn-danger" onclick="removeGitHubToken()">
          <i class="fa-solid fa-trash"></i> إزالة Token المحفوظ
        </button>
        <button class="btn btn-ghost" onclick="renderComments($('content'))">
          <i class="fa-solid fa-arrow-right"></i> العودة للتعليقات
        </button>
      </div>
    </div>
  </div>`;
}

window.saveGitHubToken = async function() {
  const token = $('ghToken')?.value.trim();
  if (!token) { $('ghTokenResult').innerHTML = '<span style="color:var(--danger)">أدخل الـ token أولاً</span>'; return; }
  const d = await api('/api/github-token', { method:'POST', body: JSON.stringify({ token }) });
  if (d.cancelled) return;
  if (d.ok) {
    $('ghTokenResult').innerHTML = '<span style="color:var(--success)">✓ تم حفظ الـ token. جارٍ جلب التعليقات...</span>';
    setTimeout(() => renderComments($('content')), 800);
  } else {
    $('ghTokenResult').innerHTML = `<span style="color:var(--danger)">${d.error || 'خطأ'}</span>`;
  }
};

window.removeGitHubToken = async function() {
  if (!confirm('إزالة GitHub Token؟')) return;
  const d = await api('/api/github-token', { method:'DELETE' });
  if (d.cancelled) return;
  if (d.ok) {
    toast('تمت الإزالة', 'info');
    renderTokenSetup($('content'));
  }
};

window.toggleReplyBox = function(commentId) {
  const box = $(`replyBox-${commentId}`);
  if (!box) return;
  if (box.hasAttribute('hidden')) {
    box.removeAttribute('hidden');
    setTimeout(() => $(`replyText-${commentId}`)?.focus(), 50);
  } else {
    box.setAttribute('hidden', '');
  }
};

window.postReply = async function(discussionId, replyToId, textareaId) {
  const ta = $(textareaId);
  const body = ta?.value.trim();
  if (!body) { toast('اكتب نص الرد أولاً', 'error'); return; }
  toast('جاري إرسال الرد...', 'info');
  const d = await api('/api/comments/reply', {
    method: 'POST',
    body: JSON.stringify({ discussionId, replyToId, body })
  });
  if (d.cancelled) return;
  if (d.ok) {
    toast('✓ تم إرسال الرد', 'success');
    renderComments($('content'));
  } else {
    toast('خطأ: ' + (d.error || ''), 'error', 5000);
  }
};

window.hideComment = async function(id) {
  const reason = prompt('سبب الإخفاء (OFF_TOPIC, SPAM, ABUSE, OUTDATED, DUPLICATE, RESOLVED):', 'OFF_TOPIC');
  if (!reason) return;
  const d = await api(`/api/comments/${id}/hide`, { method:'POST', body: JSON.stringify({ reason: reason.toUpperCase() }) });
  if (d.cancelled) return;
  if (d.ok) { toast('✓ أُخفي التعليق', 'success'); renderComments($('content')); }
  else toast('خطأ: ' + (d.error||''), 'error', 5000);
};

window.unhideComment = async function(id) {
  const d = await api(`/api/comments/${id}/unhide`, { method:'POST' });
  if (d.cancelled) return;
  if (d.ok) { toast('✓ أُظهر التعليق', 'success'); renderComments($('content')); }
  else toast('خطأ: ' + (d.error||''), 'error', 5000);
};

window.deleteComment = async function(id) {
  if (!confirm('حذف التعليق نهائياً؟ لا يمكن التراجع.')) return;
  const d = await api(`/api/comments/${id}`, { method:'DELETE' });
  if (d.cancelled) return;
  if (d.ok) { toast('تم الحذف', 'info'); renderComments($('content')); }
  else toast('خطأ: ' + (d.error||''), 'error', 5000);
};

window.toggleLock = async function(discussionId, lock) {
  if (lock && !confirm('قفل النقاش؟ لن يستطيع أحد التعليق.')) return;
  const ep = lock ? 'lock' : 'unlock';
  const d = await api(`/api/comments/discussion/${discussionId}/${ep}`, { method:'POST' });
  if (d.cancelled) return;
  if (d.ok) { toast(lock ? '🔒 قُفل النقاش' : '🔓 فُكَّ القفل', 'success'); renderComments($('content')); }
  else toast('خطأ: ' + (d.error||''), 'error', 5000);
};

/* مساعد: timeAgo */
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)     return 'الآن';
  if (s < 3600)   return `منذ ${Math.floor(s/60)} د`;
  if (s < 86400)  return `منذ ${Math.floor(s/3600)} س`;
  if (s < 604800) return `منذ ${Math.floor(s/86400)} يوم`;
  return new Date(iso).toLocaleDateString('ar');
}

function escapeHtml(s) {
  return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

async function renderTrash(c) {
  const d = await api('/api/trash');
  const items = d.items || [];
  c.innerHTML = `
  <div class="card">
    <div class="card-header">
      <i class="fa-solid fa-trash-can" style="color:var(--danger)"></i>
      <h3>المهملات <span style="color:var(--muted);font-size:.8rem">(${items.length} مقال)</span></h3>
      ${items.length ? `<button class="btn btn-danger btn-sm" style="margin-right:auto" onclick="emptyTrash()">
        <i class="fa-solid fa-fire"></i> تفريغ المهملات
      </button>` : ''}
    </div>
    <div class="card-body" style="padding:0">
      ${!items.length
        ? `<div class="empty-state" style="padding:3rem"><i class="fa-solid fa-check-circle" style="font-size:2rem;color:var(--success)"></i><p style="margin-top:.75rem">المهملات فارغة</p></div>`
        : `<table style="width:100%;border-collapse:collapse">
            <thead><tr style="background:var(--bg3)">
              <th style="padding:9px 14px;text-align:right;font-size:.75rem;color:var(--muted)">العنوان</th>
              <th style="padding:9px 14px;text-align:right;font-size:.75rem;color:var(--muted)">القسم</th>
              <th style="padding:9px 14px;text-align:right;font-size:.75rem;color:var(--muted)">تاريخ الحذف</th>
              <th style="padding:9px 14px;width:130px"></th>
            </tr></thead>
            <tbody>
              ${items.map(item => `
              <tr style="border-bottom:1px solid var(--border)">
                <td style="padding:10px 14px">
                  <div style="font-weight:600;font-size:.875rem">${item.title||item.file}</div>
                  <div style="font-size:.7rem;color:var(--muted);font-family:monospace">${item.lang.toUpperCase()} · ${item.file}</div>
                </td>
                <td style="padding:10px 14px">${catBadge(item.cat, true)}</td>
                <td style="padding:10px 14px;font-size:.75rem;color:var(--muted);font-family:'Inter',monospace">
                  ${new Date(item.deleted_at).toLocaleString('ar-SA', {dateStyle:'short', timeStyle:'short'})}
                </td>
                <td style="padding:10px 14px">
                  <div style="display:flex;gap:.4rem">
                    <button class="btn btn-sm" style="background:var(--cat-foss);color:#fff" onclick="restoreArticle('${item.id}')" title="استرجاع">
                      <i class="fa-solid fa-rotate-left"></i> استرجاع
                    </button>
                    <button class="btn-icon danger" onclick="deleteForever('${item.id}')" title="حذف نهائي">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>`}
    </div>
  </div>`;
}

window.restoreArticle = async function(id) {
  const d = await api(`/api/trash/${id}/restore`, { method: 'POST' });
  if (d.ok) { toast('✓ تم استرجاع المقال', 'success'); updateTrashBadge(); renderTrash($('content')); }
  else toast('خطأ: ' + (d.error || ''), 'error');
};

window.deleteForever = async function(id) {
  if (!confirm('حذف نهائي لا يمكن التراجع عنه؟')) return;
  const d = await api(`/api/trash/${id}`, { method: 'DELETE' });
  if (d.ok) { toast('تم الحذف النهائي', 'info'); updateTrashBadge(); renderTrash($('content')); }
  else toast('خطأ: ' + (d.error || ''), 'error');
};

window.emptyTrash = async function() {
  if (!confirm('تفريغ المهملات نهائياً؟ لا يمكن التراجع.')) return;
  const d = await api('/api/trash', { method: 'DELETE' });
  if (d.ok) { toast('✓ تم تفريغ المهملات', 'info'); updateTrashBadge(); renderTrash($('content')); }
};

// Categories ────────────────────────────────────────────────────
const CAT_ICONS = [
  'fa-solid fa-folder','fa-solid fa-terminal','fa-solid fa-code',
  'fa-brands fa-linux','fa-solid fa-microchip','fa-solid fa-robot',
  'fa-solid fa-gamepad','fa-solid fa-newspaper','fa-solid fa-book',
  'fa-solid fa-camera','fa-solid fa-music','fa-solid fa-globe',
  'fa-solid fa-shield-halved','fa-solid fa-bolt','fa-solid fa-star',
  'fa-solid fa-flask','fa-solid fa-laptop','fa-solid fa-mobile-screen',
  'fa-solid fa-cloud','fa-solid fa-database','fa-solid fa-network-wired',
  'fa-solid fa-lock','fa-solid fa-palette','fa-solid fa-chart-line',
];

async function renderCategories(c) {
  await loadCats();
  const d = await api('/api/categories');
  const cats = d.categories || [];

  c.innerHTML = `
  <div class="card" style="margin-bottom:16px">
    <div class="card-header">
      <i class="fa-solid fa-layer-group" style="color:var(--gold)"></i>
      <h3>الأقسام الحالية</h3>
      <span style="margin-right:auto;font-size:.78rem;color:var(--muted)">${cats.length} قسم</span>
    </div>
    <div class="card-body" style="padding:0">
      <div class="cats-grid">
        ${cats.map(cat => `
        <div class="cat-card" style="border-color:${cat.color}33">
          <div class="cat-card-icon" style="background:${cat.color}22;color:${cat.color}">
            <i class="${cat.icon || 'fa-solid fa-folder'}"></i>
          </div>
          <div class="cat-card-info">
            <div class="cat-card-id" dir="ltr">${cat.id}</div>
            <div class="cat-card-names">${cat.name_ar} / ${cat.name_en}</div>
            <div class="cat-card-stats">
              <span><i class="fa-solid fa-language" style="color:#888"></i> AR: ${cat.count_ar} · EN: ${cat.count_en}</span>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- New category form -->
  <div class="card">
    <div class="card-header">
      <i class="fa-solid fa-plus-circle" style="color:var(--gold)"></i>
      <h3>إنشاء قسم جديد</h3>
    </div>
    <div class="card-body">
      <div class="form-grid">
        <div class="form-group">
          <label>معرّف القسم (ID) <span class="req">*</span> <small>latin-lowercase-hyphens</small></label>
          <input type="text" id="ncId" placeholder="my-new-category" dir="ltr" pattern="[a-z0-9-]+">
        </div>
        <div class="form-group">
          <label>الاسم بالعربية <span class="req">*</span></label>
          <input type="text" id="ncNameAr" placeholder="قسم جديد">
        </div>
        <div class="form-group">
          <label>الاسم بالإنجليزية <span class="req">*</span></label>
          <input type="text" id="ncNameEn" placeholder="New Category" dir="ltr">
        </div>
        <div class="form-group">
          <label>اللون</label>
          <div style="display:flex;gap:.5rem;align-items:center">
            <input type="color" id="ncColor" value="#0ea5e9" style="width:48px;height:36px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:none;padding:2px">
            <div class="color-palette" id="colorPalette">
              ${['#d4a017','#2ea043','#e95420','#0969da','#8957e5','#7c3aed','#0ea5e9','#ec4899','#f97316','#14b8a6'].map(c=>`
              <button class="color-dot" style="background:${c}" onclick="$('ncColor').value='${c}'" title="${c}"></button>`).join('')}
            </div>
          </div>
        </div>
        <div class="form-group fg-full">
          <label>الأيقونة (Font Awesome)</label>
          <div class="icon-picker" id="iconPicker">
            ${CAT_ICONS.map(ic => `<button class="icon-opt" data-icon="${ic}" onclick="selectCatIcon('${ic}')" title="${ic}"><i class="${ic}"></i></button>`).join('')}
          </div>
          <input type="hidden" id="ncIcon" value="fa-solid fa-folder">
          <div style="margin-top:.4rem;font-size:.78rem;color:var(--muted)">الأيقونة المختارة: <span id="ncIconPreview"><i class="fa-solid fa-folder"></i> fa-solid fa-folder</span></div>
        </div>
      </div>
      <div style="margin-top:1rem;display:flex;gap:.75rem">
        <button class="btn btn-gold" onclick="createCategory()">
          <i class="fa-solid fa-plus"></i> إنشاء القسم
        </button>
        <div id="ncResult" style="font-size:.85rem;padding:.5rem 0;color:var(--muted)"></div>
      </div>
    </div>
  </div>`;
}

window.selectCatIcon = function(icon) {
  $('ncIcon').value = icon;
  $('ncIconPreview').innerHTML = `<i class="${icon}"></i> ${icon}`;
  document.querySelectorAll('.icon-opt').forEach(b => b.classList.toggle('active', b.dataset.icon === icon));
};

window.createCategory = async function() {
  const id      = $('ncId')?.value.trim();
  const name_ar = $('ncNameAr')?.value.trim();
  const name_en = $('ncNameEn')?.value.trim();
  const color   = $('ncColor')?.value || '#888888';
  const icon    = $('ncIcon')?.value  || 'fa-solid fa-folder';
  const result  = $('ncResult');

  if (!id || !name_ar || !name_en) {
    result.innerHTML = '<span style="color:var(--danger)">يرجى ملء الحقول الإلزامية.</span>';
    return;
  }
  if (!/^[a-z0-9-]+$/.test(id)) {
    result.innerHTML = '<span style="color:var(--danger)">ID: أحرف لاتينية صغيرة وأرقام وشرطات فقط.</span>';
    return;
  }

  result.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإنشاء...';
  const d = await api('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ id, name_ar, name_en, icon, color })
  });

  if (d.ok) {
    toast(`✓ تم إنشاء قسم "${name_ar}"`, 'success');
    await loadCats();
    populateCategoryFields();   /* حدّث محرر المقال بالقسم الجديد */
    renderCategories($('content'));
  } else {
    result.innerHTML = `<span style="color:var(--danger)">خطأ: ${d.error}</span>`;
  }
};

// Git ───────────────────────────────────────────────────────────
async function renderGit(c) {
  const d = await api('/api/git/status');
  const behind = d.behind || 0;
  const ahead  = d.ahead  || 0;
  const syncAlert = behind > 0
    ? `<div class="sync-alert">
        <i class="fa-solid fa-triangle-exclamation"></i>
        المستودع البعيد متقدم بـ <strong>${behind} commit</strong> — قد تكون هناك تعديلات من Decap CMS
        <button class="btn btn-gold btn-sm" onclick="pullChanges()"><i class="fa-solid fa-download"></i> مزامنة (Pull)</button>
      </div>`
    : (ahead > 0
        ? `<div class="sync-ok"><i class="fa-solid fa-circle-check"></i> أنت متقدم بـ ${ahead} commit على المستودع البعيد</div>`
        : `<div class="sync-ok"><i class="fa-solid fa-circle-check"></i> محدّث — لا توجد تغييرات بعيدة</div>`);

  c.innerHTML = `
  ${syncAlert}
  <div class="card" style="margin-bottom:16px">
    <div class="card-header"><i class="fa-brands fa-git-alt" style="color:#f05032"></i><h3>حالة Git</h3>
      <button class="btn btn-sm btn-ghost" style="margin-right:auto" onclick="renderGit($('content'))"><i class="fa-solid fa-rotate"></i> تحديث</button>
    </div>
    <div class="card-body">
      <div class="git-status-box">${d.status||'✓ لا توجد تغييرات محلية'}</div>
      <div class="commit-row">
        <input class="commit-input" id="commitMsg" placeholder="رسالة الـ commit..." value="update: via admin panel">
        <button class="btn btn-gold" onclick="pushChanges()"><i class="fa-solid fa-upload"></i> Commit &amp; Push</button>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><i class="fa-solid fa-clock-rotate-left" style="color:var(--gold)"></i><h3>آخر 5 commits</h3></div>
    <div class="card-body"><div class="log-box">${d.log||'—'}</div></div>
  </div>`;
}

window.pullChanges = async () => {
  toast('جاري المزامنة...', 'info');
  /* fetch مباشر لقراءة status code */
  const r = await fetch('/api/git/pull', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() }
  });
  const d = await r.json();

  if (d.ok) {
    toast('✓ ' + (d.message || 'تمت المزامنة'), 'success');
    renderGit($('content'));
  } else if (r.status === 409 && d.needsResolution) {
    openConflictResolver();
  } else {
    toast('خطأ في المزامنة: ' + (d.error || 'فشل غير معروف'), 'error', 5000);
  }
};

/* ════════════════════════════════════════════════════════════
   حل التعارض شبه الآلي (Conflict Resolver)
   ════════════════════════════════════════════════════════════ */

const _esc = s => (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

async function openConflictResolver() {
  const d = await api('/api/git/conflicts');
  const items = d.conflicts || [];
  if (!items.length) { toast('لا توجد تعارضات', 'info'); return; }

  const html = `
  <div class="conflict-overlay" id="conflictOverlay">
    <div class="conflict-modal">
      <div class="conflict-header">
        <h3><i class="fa-solid fa-triangle-exclamation" style="color:var(--gold)"></i>
            حل تعارض في ${items.length} ملف</h3>
        <p>هذه الملفات عُدِّلت من جهازك المحلي ومن Decap CMS في نفس الوقت.<br>
           اختر النسخة التي تريد الاحتفاظ بها لكل ملف.</p>
      </div>
      <div class="conflict-list">
        ${items.map((it, i) => renderConflictItem(it, i)).join('')}
      </div>
      <div class="conflict-progress">
        تم حل <strong id="resolvedCount">0</strong> من <strong>${items.length}</strong>
      </div>
      <div class="conflict-footer">
        <button class="btn btn-gold" id="completeBtn" onclick="completeResolution()" disabled>
          <i class="fa-solid fa-check"></i> إكمال الدمج والدفع
        </button>
        <button class="btn btn-ghost" onclick="abortResolution()">
          <i class="fa-solid fa-xmark"></i> إلغاء المزامنة
        </button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  window.__conflictState = { total: items.length, resolved: new Set() };
}

function renderConflictItem(item, idx) {
  const oursMore   = item.oursSize   > 600 ? `<div class="conflict-more">... +${item.oursSize-600} حرف</div>` : '';
  const theirsMore = item.theirsSize > 600 ? `<div class="conflict-more">... +${item.theirsSize-600} حرف</div>` : '';
  return `
  <div class="conflict-item" id="conflict-${idx}" data-file="${_esc(item.file)}">
    <div class="conflict-file-header">
      <i class="fa-regular fa-file-lines"></i>
      <span class="conflict-filename">${_esc(item.file)}</span>
      <span class="conflict-status pending" id="status-${idx}">⏳ غير محلول</span>
    </div>
    <div class="conflict-versions">
      <div class="conflict-version local">
        <div class="conflict-version-header">
          <i class="fa-solid fa-laptop"></i> نسختي المحلية
          <span class="conflict-size">${item.oursSize} حرف</span>
        </div>
        <pre>${_esc(item.oursPreview) || '<em style="color:var(--muted)">(فارغ)</em>'}</pre>
        ${oursMore}
      </div>
      <div class="conflict-version remote">
        <div class="conflict-version-header">
          <i class="fa-solid fa-cloud"></i> نسخة Decap CMS
          <span class="conflict-size">${item.theirsSize} حرف</span>
        </div>
        <pre>${_esc(item.theirsPreview) || '<em style="color:var(--muted)">(فارغ)</em>'}</pre>
        ${theirsMore}
      </div>
    </div>
    <div class="conflict-actions">
      <button class="btn btn-sm btn-outline" onclick="resolveFile(${idx}, 'ours')">
        <i class="fa-solid fa-laptop"></i> احتفظ بنسختي
      </button>
      <button class="btn btn-sm btn-outline" onclick="resolveFile(${idx}, 'theirs')">
        <i class="fa-solid fa-cloud"></i> احتفظ بنسخة GitHub
      </button>
    </div>
  </div>`;
}

window.resolveFile = async function(idx, strategy) {
  const item = document.getElementById(`conflict-${idx}`);
  const file = item?.dataset.file;
  if (!file) return;

  const d = await api('/api/git/resolve', {
    method: 'POST',
    body: JSON.stringify({ file, strategy })
  });
  if (!d.ok) { toast('خطأ: ' + (d.error||''), 'error'); return; }

  const status = document.getElementById(`status-${idx}`);
  status.className = 'conflict-status resolved';
  status.innerHTML = `✓ ${strategy === 'ours' ? 'احتفظت بنسختي' : 'احتفظت بنسخة GitHub'}`;
  item.classList.add('resolved');
  item.querySelectorAll('.conflict-actions button').forEach(b => b.disabled = true);
  item.querySelector('.conflict-version.local').classList.toggle('chosen', strategy === 'ours');
  item.querySelector('.conflict-version.remote').classList.toggle('chosen', strategy === 'theirs');

  window.__conflictState.resolved.add(idx);
  document.getElementById('resolvedCount').textContent = window.__conflictState.resolved.size;
  if (window.__conflictState.resolved.size >= window.__conflictState.total) {
    document.getElementById('completeBtn').disabled = false;
  }
};

window.completeResolution = async function() {
  toast('جاري إكمال الدمج...', 'info');
  const cont = await api('/api/git/continue', { method: 'POST' });

  /* قد تظهر تعارضات جديدة من commit آخر في الـ rebase */
  if (cont.hasMore && cont.conflicts) {
    document.getElementById('conflictOverlay').remove();
    toast('ظهرت تعارضات إضافية من commit آخر — حلَّها أيضاً', 'info', 4000);
    return openConflictResolver();
  }
  if (!cont.ok) { toast('خطأ: ' + (cont.error||''), 'error', 5000); return; }

  /* تم الدمج → ادفع */
  const push = await api('/api/git/push', { method: 'POST', body: JSON.stringify({}) });
  document.getElementById('conflictOverlay').remove();
  if (push.ok) toast('✓ تم الدمج والدفع بنجاح', 'success', 4000);
  else         toast('تم الدمج محلياً — اضغط Push يدوياً: ' + (push.error||''), 'info', 5000);
  renderGit($('content'));
};

window.abortResolution = async function() {
  if (!confirm('إلغاء المزامنة والعودة لحالة ما قبل المحاولة؟')) return;
  const d = await api('/api/git/abort', { method: 'POST' });
  document.getElementById('conflictOverlay').remove();
  if (d.ok) toast('تم إلغاء المزامنة', 'info');
  else      toast('خطأ: ' + (d.error||''), 'error');
  renderGit($('content'));
};

window.pushChanges = async () => {
  const msg = $('commitMsg')?.value || 'update: via admin panel';
  toast('جاري الرفع...', 'info');
  const d = await api('/api/git/push', { method:'POST', body:JSON.stringify({message:msg}) });
  if(d.ok) toast('تم الرفع بنجاح ✓', 'success');
  else toast('خطأ: '+d.error, 'error', 5000);
  renderGit($('content'));
};

// Config ────────────────────────────────────────────────────────
async function renderConfig(c) {
  const d = await api('/api/config');
  c.innerHTML = `
  <div class="card">
    <div class="card-header"><i class="fa-solid fa-gear" style="color:var(--gold)"></i><h3>_config.yml</h3></div>
    <div class="card-body"><div class="config-box">${escHtml(d.content||'')}</div></div>
  </div>`;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── Article Editor ─────────────────────────────────────────────

/* استخراج التاريخ والوقت من حقل date (قد يكون Date object أو string) */
function parseDatetime(raw) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  /* التاريخ والوقت المحليَّان (local) لتجنب تحول UTC */
  const localDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  const localTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  if (!raw) {
    /* مقال جديد: التاريخ والوقت الحاليَّان من النظام */
    return { dateStr: localDate, timeStr: localTime };
  }

  const s = raw.toString().trim();

  /* صيغة ISO مثل "2026-05-10T01:00:00.000Z" */
  const isoMatch = s.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (isoMatch) {
    /* نحوّل من UTC للمحلي لعرض الوقت الصحيح */
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const ld = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      const lt = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      return { dateStr: ld, timeStr: lt };
    }
  }

  /* صيغة string مثل "2026-05-09 14:30:00" أو "2026-05-09" */
  const strMatch = s.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/);
  if (strMatch) {
    return { dateStr: strMatch[1], timeStr: strMatch[2] || localTime };
  }

  /* Date object من gray-matter */
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const ld = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      const lt = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      return { dateStr: ld, timeStr: lt };
    }
  } catch (_) {}

  return { dateStr: localDate, timeStr: localTime };
}

window.editFrom = async (lang, cat, file) => openEditor({ lang, cat, file });

async function openEditor(ref) {
  S.editingArticle = ref;
  let a = {};
  if(ref) {
    a = await api(`/api/article?lang=${ref.lang}&cat=${ref.cat}&file=${encodeURIComponent(ref.file)}`);
  }

  $('editorTitle').textContent = ref ? 'تحرير المقال' : 'مقال جديد';
  $('fTitle').value = a.title || '';

  /* تحليل التاريخ والوقت من حقل date */
  const { dateStr, timeStr } = parseDatetime(a.date);
  $('fDate').value = dateStr;
  $('fTime').value = timeStr;

  $('fSlug').value = a.slug || '';
  $('fAuthor').value  = a.author|| 'GNUTUX';
  $('fExcerpt').value = a.excerpt || '';
  $('fTags').value    = Array.isArray(a.tags) ? a.tags.join(', ') : (a.tags||'');
  $('fImage').value   = a.image || '';
  $('fAffiliate').checked = !!a.affiliate;
  $('fCategory').value    = a.category || (ref?.cat) || 'tech-news';
  /* اللغة الافتراضية:
     - عند التحرير: تتبع لغة المقال (a.lang أو ref.lang)
     - عند الإنشاء الجديد: تتبع فلتر اللغة الحالي في صفحة المقالات */
  const defaultLang = a.lang || ref?.lang || S.langFilter || 'ar';
  document.querySelectorAll('[name=fLang]').forEach(r => r.checked = (r.value === defaultLang));

  // also_in checkboxes
  const alsoIn = Array.isArray(a.also_in) ? a.also_in : [];
  $('fAlsoIn').querySelectorAll('input').forEach(cb => { cb.checked = alsoIn.includes(cb.value); });

  $('fContent').value = a.content || '';
  chReset(a.content || '');   // إعادة تهيئة سجل الـ undo
  updateWordCount();
  updateImgPreview();
  syncAlsoInWithCat();

  /* إضافة أزرار اللصق لحقول المحرر (مرة واحدة فقط) */
  addEditorPasteButtons();

  $('editorModal').removeAttribute('hidden');
  activateTab('details');
  /* فحص التاريخ المستقبلي عند فتح المحرر */
  checkFutureDate();
}

function syncAlsoInWithCat() {
  const cur = $('fCategory').value;
  $('fAlsoIn').querySelectorAll('input').forEach(cb => {
    cb.closest('.check-label').style.opacity = cb.value === cur ? '0.3' : '1';
    if(cb.value === cur) cb.checked = false;
  });
}

$('fCategory').addEventListener('change', syncAlsoInWithCat);

/* ── Front Matter Parser ──────────────────────────────────────── */
function parseFrontMatterText(raw) {
  /* نزع --- في البداية والنهاية */
  var text = raw.trim().replace(/^---+\s*\n?/, '').replace(/\n?---+\s*$/, '').trim();
  var result = {};
  var lines  = text.split('\n');

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var colonIdx = line.indexOf(':');
    if (colonIdx < 1) continue;

    var key = line.slice(0, colonIdx).trim();
    var val = line.slice(colonIdx + 1).trim();
    if (!key) continue;

    /* قيمة بين علامتي اقتباس مزدوجة أو مفردة */
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    /* مصفوفة: [item1, item2, ...] */
    if (val.startsWith('[') && val.endsWith(']')) {
      var inner = val.slice(1, -1).trim();
      val = inner ? inner.split(',').map(function(s) { return s.trim().replace(/^["']|["']$/g, ''); }) : [];
    }

    result[key] = val;
  }
  return result;
}

function fillFormFromParsed(data) {
  var filled = [];
  var skipped = [];

  var fieldMap = {
    title:    function(v) { $('fTitle').value = v; },
    slug:     function(v) { $('fSlug').value  = v; },
    author:   function(v) { $('fAuthor').value = v; },
    excerpt:  function(v) { $('fExcerpt').value = v; },
    image:    function(v) { $('fImage').value = v; updateImgPreview(); },
    date: function(v) {
      var dt = parseDatetime(v);
      $('fDate').value = dt.dateStr;
      if ($('fTime')) $('fTime').value = dt.timeStr;
    },
    category: function(v) {
      var opt = $('fCategory').querySelector('option[value="'+v+'"]');
      if (opt) { $('fCategory').value = v; syncAlsoInWithCat(); }
    },
    lang: function(v) {
      var r = document.querySelector('[name=fLang][value="'+v+'"]');
      if (r) r.checked = true;
    },
    tags: function(v) {
      $('fTags').value = Array.isArray(v) ? v.join(', ') : v;
    },
    also_in: function(v) {
      var arr = Array.isArray(v) ? v : [v];
      $('fAlsoIn').querySelectorAll('input').forEach(function(cb) {
        cb.checked = arr.includes(cb.value);
      });
      syncAlsoInWithCat();
    },
    affiliate: function(v) {
      $('fAffiliate').checked = (v === 'true' || v === true);
    },
  };

  var SKIP_KEYS = ['layout']; /* يُتجاهل */

  Object.keys(data).forEach(function(key) {
    if (SKIP_KEYS.includes(key)) return;
    if (fieldMap[key]) {
      try {
        fieldMap[key](data[key]);
        filled.push(key);
      } catch(e) {
        skipped.push(key);
      }
    } else {
      skipped.push(key);
    }
  });

  return { filled: filled, skipped: skipped };
}

/* أزرار تبويب لصق FM */
$('parseFmBtn').addEventListener('click', function() {
  var raw = $('fmPasteArea').value.trim();
  var resultEl = $('fmParseResult');

  if (!raw) {
    resultEl.className = 'fm-parse-result error';
    resultEl.textContent = 'الحقل فارغ — الصق كتلة Front Matter أولاً.';
    resultEl.removeAttribute('hidden');
    return;
  }

  var data = {};
  try {
    data = parseFrontMatterText(raw);
  } catch(e) {
    resultEl.className = 'fm-parse-result error';
    resultEl.textContent = 'خطأ في التحليل: ' + e.message;
    resultEl.removeAttribute('hidden');
    return;
  }

  if (!Object.keys(data).length) {
    resultEl.className = 'fm-parse-result error';
    resultEl.textContent = 'لم يُعثر على أي بيانات صالحة. تأكد من صيغة الـ Front Matter.';
    resultEl.removeAttribute('hidden');
    return;
  }

  var r = fillFormFromParsed(data);

  var html = '<strong>✓ تم ملء الحقول بنجاح</strong><ul class="fm-parsed-list">';
  r.filled.forEach(function(k) {
    var val = data[k];
    var display = Array.isArray(val) ? val.join(', ') : String(val);
    if (display.length > 60) display = display.slice(0, 60) + '...';
    html += '<li><span class="fm-parsed-key">'+k+'</span><span class="fm-parsed-val">'+display+'</span></li>';
  });
  html += '</ul>';
  if (r.skipped.length) {
    html += '<div style="margin-top:.5rem;color:var(--muted);font-size:.75rem">تُجاهَل: ' + r.skipped.join(', ') + '</div>';
  }
  html += '<div style="margin-top:.75rem"><button class="btn btn-gold btn-sm" onclick="activateTab(\'details\')"><i class="fa-solid fa-sliders"></i> انتقل للحقول</button></div>';

  resultEl.className = 'fm-parse-result success';
  resultEl.innerHTML = html;
  resultEl.removeAttribute('hidden');
});

$('clearFmBtn').addEventListener('click', function() {
  $('fmPasteArea').value = '';
  $('fmParseResult').setAttribute('hidden', '');
});

/* لصق من الحافظة إلى منطقة FM */
$('pasteFmBtn')?.addEventListener('click', async function() {
  const ok = await pasteIntoField($('fmPasteArea'));
  if (ok) toast('تم اللصق من الحافظة ✓', 'success');
});

// Tabs
document.querySelectorAll('.etab').forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

function activateTab(tab) {
  document.querySelectorAll('.etab').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('.etab-pane').forEach(p => p.classList.toggle('active', p.id===`tab-${tab}`));
  if(tab === 'preview') renderPreview();
}

function renderPreview() {
  const md = $('fContent').value;
  if(typeof marked !== 'undefined') {
    $('previewPane').innerHTML = marked.parse(md);
  }
}

// Word count
function updateWordCount() {
  const words = ($('fContent').value.trim().match(/\S+/g)||[]).length;
  $('wordCount').textContent = `${words} كلمة`;
}
/* updateWordCount + chSave مدمجان في المستمع أدناه */

// Image preview
function updateImgPreview() {
  const name = $('fImage').value.trim();
  const lang = document.querySelector('[name=fLang]:checked')?.value || 'ar';
  const wrap = $('fImagePreview');
  if(name) {
    wrap.innerHTML = `<img src="/site-images/${lang}/${name}" alt="${name}" onerror="this.style.display='none'">`;
  } else {
    wrap.innerHTML = '';
  }
}
$('fImage').addEventListener('input', updateImgPreview);
document.querySelectorAll('[name=fLang]').forEach(r => r.addEventListener('change', updateImgPreview));

// زر "الآن" — يضع التاريخ والوقت الحاليَّين
document.getElementById('setNowBtn')?.addEventListener('click', function() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  $('fDate').value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  $('fTime').value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
});

// Toolbar actions
document.querySelectorAll('.tb-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const ta = $('fContent');
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.slice(s, e);
    let ins = '';

    /* ── أوامر التراجع/التقدم/اللصق/المسح ── */
    if (btn.dataset.action === 'undo') {
      chUndo(); ta.focus(); return;
    } else if (btn.dataset.action === 'redo') {
      chRedo(); ta.focus(); return;
    } else if (btn.dataset.action === 'paste') {
      chSave();
      pasteIntoField(ta, { atCursor: true }).then(() => {
        updateWordCount();
        chSave();
      });
      return;
    } else if (btn.dataset.action === 'clear') {
      if (!ta.value || confirm('مسح كامل محتوى المقال؟')) {
        chSave(); ta.value = ''; updateWordCount(); chSave();
      }
      ta.focus(); return;

    /* ── إدراج جدول ── */
    } else if (btn.dataset.action === 'table') {
      const cols = parseInt(prompt('عدد الأعمدة:', '3') || '3', 10) || 3;
      const rows = parseInt(prompt('عدد الصفوف (بدون الرأس):', '2') || '2', 10) || 2;
      const header = Array.from({length:cols}, (_,i) => `العمود ${i+1}`).join(' | ');
      const sep    = Array.from({length:cols}, () => '---').join(' | ');
      const row    = Array.from({length:cols}, () => 'بيانات').join(' | ');
      const table  = '\n| ' + header + ' |\n| ' + sep + ' |\n' +
                     Array.from({length:rows}, () => '| ' + row + ' |').join('\n') + '\n';
      chSave();
      ta.setRangeText(table, s, e, 'end');

    /* ── التنسيق النصي ── */
    } else if(btn.dataset.insert) {
      const w = btn.dataset.insert;
      ins = sel ? `${w}${sel}${w}` : `${w}متن${w}`;
      chSave();
      ta.setRangeText(ins, s, e, 'end');
    } else if(btn.dataset.insertH) {
      const line = ta.value.lastIndexOf('\n', s-1)+1;
      chSave();
      ta.setRangeText(btn.dataset.insertH, line, line, 'start');
    } else if(btn.dataset.insertLine) {
      chSave();
      ta.setRangeText('\n'+btn.dataset.insertLine, s, e, 'end');
    } else if(btn.dataset.insertBlock) {
      chSave();
      ta.setRangeText('\n'+btn.dataset.insertBlock+(sel||'نص')+'', s, e, 'end');
    } else if(btn.dataset.insertCode) {
      chSave();
      ta.setRangeText('\n```\n'+(sel||'الكود هنا')+'\n```\n', s, e, 'end');
    } else if(btn.dataset.action === 'link') {
      const url = prompt('رابط URL:', 'https://');
      if(url) { chSave(); ta.setRangeText(`[${sel||'نص الرابط'}](${url})`, s, e, 'end'); }
    } else if(btn.dataset.action === 'aff-link') {
      const url = prompt('رابط الأفيلييت:', 'https://');
      if(url) { chSave(); ta.setRangeText(`[${sel||'اسم المنتج'}](${url}){: .aff-link rel="nofollow sponsored" target="_blank"}`, s, e, 'end'); }
    }
    ta.focus();
    updateWordCount();
    chSave();
  });
});

/* حفظ السجل عند الكتابة في المحتوى */
let chTimer;
document.getElementById('fContent')?.addEventListener('input', () => {
  updateWordCount();
  clearTimeout(chTimer);
  chTimer = setTimeout(chSave, 600);
});

// Save article
$('saveArticle').addEventListener('click', async () => {
  const title = $('fTitle').value.trim();
  const slug  = $('fSlug').value.trim();
  const lang  = document.querySelector('[name=fLang]:checked')?.value;
  const cat   = $('fCategory').value;

  if(!title || !slug || !lang || !cat) { toast('يرجى ملء الحقول الإلزامية', 'error'); return; }

  const alsoIn = Array.from($('fAlsoIn').querySelectorAll('input:checked')).map(c=>c.value).filter(v=>v!==cat);
  const tagsRaw = $('fTags').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim()).filter(Boolean) : [];

  /* دمج التاريخ + الوقت → يُحدد الترتيب بدقة عند تعدد مقالات بنفس اليوم */
  const dateVal = $('fDate').value;
  const timeVal = $('fTime')?.value || '12:00';
  const fullDatetime = `${dateVal} ${timeVal}:00`;

  const fm = {
    layout: 'post',
    title, slug, lang, category: cat,
    date: fullDatetime,
    author: $('fAuthor').value.trim() || 'GNUTUX',
    excerpt: $('fExcerpt').value.trim() || undefined,
    image: $('fImage').value.trim() || undefined,
    tags: tags.length ? tags : undefined,
    also_in: alsoIn.length ? alsoIn : undefined,
    affiliate: $('fAffiliate').checked || undefined,
  };
  // Remove undefined keys
  Object.keys(fm).forEach(k => fm[k] === undefined && delete fm[k]);

  const content = $('fContent').value;
  const ref = S.editingArticle;
  let d;

  if(ref) {
    d = await api(`/api/article?lang=${ref.lang}&cat=${ref.cat}&file=${encodeURIComponent(ref.file)}`,
      { method:'PUT', body:JSON.stringify({...fm, content}) });
  } else {
    /* POST: يجب إرسال cat و lang و slug صراحةً بجانب fm */
    d = await api('/api/article', { method:'POST', body:JSON.stringify({...fm, cat, lang, slug, content}) });
  }

  if(d.ok) {
    toast('تم حفظ المقال ✓', 'success');
    $('editorModal').setAttribute('hidden', '');
    navigate('articles');
  } else {
    toast('خطأ: '+(d.error||'فشل الحفظ'), 'error');
  }
});

$('closeEditor').addEventListener('click', () => $('editorModal').setAttribute('hidden', ''));
$('cancelEditor').addEventListener('click', () => $('editorModal').setAttribute('hidden', ''));

// Delete article
window.deleteArticle = async (lang, cat, file, title) => {
  if(!confirm(`نقل المقال إلى المهملات:\n"${title}"?\n\nيمكن استرجاعه لاحقاً من قسم المهملات.`)) return;
  const d = await api(`/api/article?lang=${lang}&cat=${cat}&file=${encodeURIComponent(file)}`, { method:'DELETE' });
  if(d.ok) {
    toast('تم نقل المقال إلى المهملات 🗑', 'info');
    updateTrashBadge();
    renderArticles($('content'));
  } else toast('خطأ في الحذف', 'error');
};

// ── Image Picker ───────────────────────────────────────────────
$('pickImageBtn').addEventListener('click', () => openImagePicker());

// ── Image from URL ─────────────────────────────────────────────
$('urlImageBtn')?.addEventListener('click', async () => {
  const url = prompt('الصق رابط الصورة (https://...):');
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) { toast('الرابط يجب أن يبدأ بـ http:// أو https://', 'error'); return; }

  const lang = document.querySelector('[name=fLang]:checked')?.value || 'ar';
  toast('جاري تنزيل الصورة...', 'info');

  const d = await api('/api/images/from-url', {
    method: 'POST',
    body: JSON.stringify({ url, lang })
  });

  if (d.cancelled) return;
  if (!d.ok) { toast('خطأ: ' + (d.error || 'فشل التنزيل'), 'error', 5000); return; }

  $('fImage').value = d.filename;
  $('fImage').dispatchEvent(new Event('input'));
  const msg = d.converted
    ? `✓ تم تنزيل الصورة وحفظها كـ ${d.filename} (مع تحويل لـ JPEG)`
    : `✓ تم تنزيل الصورة: ${d.filename}`;
  toast(msg, 'success', 4000);
});

async function openImagePicker() {
  $('imagePickerModal').removeAttribute('hidden');
  await loadPickerImages();
}

async function loadPickerImages() {
  const imgs = await api(`/api/images?lang=${S.pickerLang}`);
  $('imagePickerGrid').innerHTML = imgs.length ? imgs.map(img=>`
  <div class="picker-img" onclick="selectImage('${img.name}')">
    <img src="${img.url}" alt="${img.name}" loading="lazy">
    <div class="picker-img-name">${img.name}</div>
  </div>`).join('') : '<p style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">لا توجد صور</p>';
}

window.selectImage = name => {
  $('fImage').value = name;
  updateImgPreview();
  $('imagePickerModal').setAttribute('hidden', '');
  toast('تم اختيار: '+name, 'info');
};

document.querySelectorAll('.ptab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.ptab').forEach(p=>p.classList.remove('active'));
    t.classList.add('active');
    S.pickerLang = t.dataset.lang;
    loadPickerImages();
  });
});

$('closeImagePicker').addEventListener('click', () => $('imagePickerModal').setAttribute('hidden', ''));

// ── Image Import from filesystem ──────────────────────────────
/* زر تصفح: يفتح file picker للاختيار من الجهاز */
$('browseFileBtn').addEventListener('click', () => $('browseFileInput').click());

$('browseFileInput').addEventListener('change', function() {
  if (!this.files.length) return;
  const file = this.files[0];
  /* نستخدم اسم الملف كـ placeholder في خانة المسار (المتصفح لا يكشف المسار الكامل) */
  $('importPathInput').value = file.name;
  /* نحفظ الملف في S لنستخدمه عند الضغط على استيراد */
  S._importFile = file;
});

$('importImageBtn').addEventListener('click', async function() {
  const resultEl = $('importResult');
  const dest     = document.querySelector('[name=importDest]:checked')?.value || 'ar';
  const pathVal  = $('importPathInput').value.trim();

  if (!pathVal) {
    resultEl.className = 'import-result error';
    resultEl.textContent = 'اختر صورة أولاً.';
    resultEl.removeAttribute('hidden');
    return;
  }

  resultEl.setAttribute('hidden', '');
  const langs = dest === 'both' ? ['ar','en'] : [dest];

  /* إذا اختار المستخدم ملفاً من file picker → رفع مباشر */
  if (S._importFile) {
    let allUploaded = [];
    for (const lang of langs) {
      const fd = new FormData();
      fd.append('files', S._importFile);
      const r = await fetch(`/api/images/${lang}`, {
        method: 'POST',
        headers: { 'x-admin-token': getToken() },
        body: fd
      });
      if (r.status === 401) { showLogin(); return; }
      const d = await r.json();
      if (d.uploaded) allUploaded = allUploaded.concat(d.uploaded);
    }
    if (allUploaded.length) {
      const name      = allUploaded[0].name;
      const converted = allUploaded.some(u => u.converted);
      const note      = converted ? ' <span style="color:#f0c040;font-size:.75rem">(تم التحويل إلى JPEG)</span>' : '';
      resultEl.className = 'import-result success';
      resultEl.innerHTML = `✓ تم الرفع: <strong>${name}</strong> → ${langs.join(', ')} ${note}
        <br><button class="btn btn-sm" style="margin-top:.4rem" onclick="selectImage('${name}')">
          <i class="fa-solid fa-check"></i> اختر هذه الصورة
        </button>`;
      resultEl.removeAttribute('hidden');
      S._importFile = null;
      $('importPathInput').value = '';
      await loadPickerImages();
    }
    return;
  }

  /* إذا كتب مساراً نصياً → الخادم يقوم بالتحويل والنسخ */
  const d = await api('/api/images/import', {
    method: 'POST',
    body: JSON.stringify({ sourcePath: pathVal, langs: dest })
  });

  if (d.ok) {
    const note = d.converted ? ' <span style="color:#f0c040;font-size:.75rem">(تم التحويل إلى JPEG)</span>' : '';
    resultEl.className = 'import-result success';
    resultEl.innerHTML = `✓ تم الاستيراد: <strong>${d.filename}</strong> → ${d.copied.map(c=>c.lang).join(', ')} ${note}
      <br><button class="btn btn-sm" style="margin-top:.4rem" onclick="selectImage('${d.filename}')">
        <i class="fa-solid fa-check"></i> اختر هذه الصورة
      </button>`;
    resultEl.removeAttribute('hidden');
    $('importPathInput').value = '';
    await loadPickerImages();
  } else {
    resultEl.className = 'import-result error';
    resultEl.textContent = 'خطأ: ' + (d.error || 'فشل الاستيراد');
    resultEl.removeAttribute('hidden');
  }
});

// ── Language filter (topbar) ────────────────────────────────────
$('filterAr').addEventListener('click', () => {
  S.langFilter = 'ar';
  $('filterAr').classList.add('active'); $('filterEn').classList.remove('active');
  if(S.page === 'articles') renderArticles($('content'));
  if(S.page === 'images')   renderImages($('content'));
});
$('filterEn').addEventListener('click', () => {
  S.langFilter = 'en';
  $('filterEn').classList.add('active'); $('filterAr').classList.remove('active');
  if(S.page === 'articles') renderArticles($('content'));
  if(S.page === 'images')   renderImages($('content'));
});

// ── Sidebar toggle (mobile) ────────────────────────────────────
$('sidebarToggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

// ── Remotes page ───────────────────────────────────────────────
async function renderRemotes(c) {
  const d = await api('/api/remotes');
  const remotes = d.remotes || [];
  c.innerHTML = `
  <div class="card" style="margin-bottom:16px">
    <div class="card-header"><i class="fa-solid fa-code-branch" style="color:var(--gold)"></i>
      <h3>المستودعات المتصلة</h3>
      <button class="btn btn-sm btn-ghost" style="margin-right:auto" onclick="renderRemotes($('content'))"><i class="fa-solid fa-rotate"></i></button>
    </div>
    <div class="card-body" style="padding:0">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:var(--bg3)">
          <th style="padding:9px 14px;text-align:right;font-size:.75rem;color:var(--muted)">الاسم</th>
          <th style="padding:9px 14px;text-align:right;font-size:.75rem;color:var(--muted)">الرابط</th>
          <th style="padding:9px 14px;width:80px"></th>
        </tr></thead>
        <tbody>
          ${remotes.length ? remotes.map(r=>`
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:10px 14px;font-weight:700;color:var(--gold);font-family:monospace">${r.name}</td>
            <td style="padding:10px 14px;font-size:.78rem;color:var(--muted);font-family:monospace;word-break:break-all">${r.url}</td>
            <td style="padding:10px 14px">
              ${r.name!=='origin'?`<button class="btn-icon danger" onclick="removeRemote('${r.name}')"><i class="fa-solid fa-trash"></i></button>`:''}
            </td>
          </tr>`).join('') : `<tr><td colspan="3" style="text-align:center;padding:30px;color:var(--muted)">لا توجد مستودعات</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div class="card-header"><i class="fa-solid fa-plus-circle" style="color:var(--gold)"></i><h3>إضافة مستودع</h3></div>
    <div class="card-body">
      <div class="form-grid">
        <div class="form-group">
          <label>الاسم <small>(مثل: gitlab, codeberg)</small></label>
          <div style="display:flex;gap:.5rem">
            <input type="text" id="rName" placeholder="gitlab" dir="ltr" style="flex:1">
            ${pasteBtn('rName')}
          </div>
        </div>
        <div class="form-group">
          <label>الرابط (URL)</label>
          <div style="display:flex;gap:.5rem">
            <input type="text" id="rUrl" placeholder="https://gitlab.com/user/repo.git" dir="ltr" style="flex:1">
            ${pasteBtn('rUrl')}
          </div>
        </div>
      </div>
      <div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn btn-gold" onclick="addRemote()"><i class="fa-solid fa-plus"></i> إضافة</button>
        <span style="color:var(--muted);font-size:.75rem;margin:auto 0">
          أمثلة: GitLab · Codeberg · Bitbucket · Cloudflare Pages (عبر Workers)
        </span>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><i class="fa-solid fa-upload" style="color:var(--gold)"></i><h3>دفع لمستودعات متعددة</h3></div>
    <div class="card-body">
      <div style="margin-bottom:1rem">
        <label style="font-size:.78rem;color:var(--muted);font-weight:600;display:block;margin-bottom:.5rem">اختر المستودعات:</label>
        <div id="remotesCheckboxes" style="display:flex;flex-wrap:wrap;gap:.6rem">
          ${remotes.map(r=>`
          <label class="check-label">
            <input type="checkbox" name="pushRemote" value="${r.name}" ${r.name==='origin'?'checked':''}>
            <span style="font-family:monospace;font-size:.85rem">${r.name}</span>
          </label>`).join('')}
        </div>
      </div>
      <div class="form-group" style="margin-bottom:.75rem">
        <label>رسالة الـ Commit</label>
        <div style="display:flex;gap:.5rem">
          <input type="text" id="multiCommitMsg" value="update: via admin panel" style="flex:1">
          ${pasteBtn('multiCommitMsg')}
        </div>
      </div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap">
        <button class="btn btn-gold" onclick="pushSelected()">
          <i class="fa-solid fa-upload"></i> دفع للمستودعات المختارة
        </button>
        <button class="btn btn-outline" onclick="pushAll()">
          <i class="fa-solid fa-upload"></i> دفع للكل
        </button>
      </div>
      <div id="pushResults" style="margin-top:.75rem"></div>
    </div>
  </div>`;
}

window.addRemote = async function() {
  const name = $('rName')?.value.trim();
  const url  = $('rUrl')?.value.trim();
  if (!name || !url) { toast('أدخل الاسم والرابط', 'error'); return; }
  const d = await api('/api/remotes', { method:'POST', body: JSON.stringify({ name, url }) });
  if (d.ok) { toast(`✓ تمت إضافة مستودع "${name}"`, 'success'); renderRemotes($('content')); }
  else toast('خطأ: ' + (d.error || ''), 'error');
};

window.removeRemote = async function(name) {
  if (!confirm(`حذف المستودع "${name}"؟`)) return;
  const d = await api(`/api/remotes/${name}`, { method:'DELETE' });
  if (d.ok) { toast('تم الحذف', 'success'); renderRemotes($('content')); }
  else toast('خطأ: ' + (d.error || ''), 'error');
};

window.pushSelected = async function() {
  const remotes = Array.from(document.querySelectorAll('[name=pushRemote]:checked')).map(c=>c.value);
  if (!remotes.length) { toast('اختر مستودعاً واحداً على الأقل', 'error'); return; }
  await doPushMulti(remotes);
};

window.pushAll = async function() {
  const remotes = Array.from(document.querySelectorAll('[name=pushRemote]')).map(c=>c.value);
  await doPushMulti(remotes);
};

async function doPushMulti(remotes) {
  const msg = $('multiCommitMsg')?.value || 'update: via admin panel';
  $('pushResults').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الدفع...';
  const d = await api('/api/git/push-all', { method:'POST', body: JSON.stringify({ remotes, message: msg, branch: 'main' }) });
  const results = d.results || [];
  $('pushResults').innerHTML = results.map(r=>`
    <div style="display:flex;align-items:center;gap:.5rem;padding:.4rem 0;border-bottom:1px solid var(--border)">
      <i class="fa-solid fa-${r.ok ? 'check-circle' : 'times-circle'}" style="color:${r.ok ? 'var(--success)' : 'var(--danger)'}"></i>
      <span style="font-family:monospace;font-weight:600">${r.remote}</span>
      <span style="font-size:.78rem;color:var(--muted)">${r.ok ? '✓ نجح' : r.error || 'فشل'}</span>
    </div>`).join('');
}

// ── Security page ───────────────────────────────────────────────
async function renderSecurity(c) {
  const st  = await fetch('/api/auth/status', { headers: { 'x-admin-token': getToken() } }).then(r=>r.json());
  const has = st.hasPassword;
  const sec = has ? await api('/api/auth/security') : null;
  const cf  = sec?.confirmFor || {};

  c.innerHTML = `
  <div class="card" style="margin-bottom:16px">
    <div class="card-header">
      <i class="fa-solid fa-shield-halved" style="color:var(--gold)"></i>
      <h3>حماية لوحة التحكم</h3>
      <span class="r-cat" style="background:${has?'var(--cat-foss)':'#555'};color:#fff;margin-right:auto">
        ${has ? '🔒 محمية' : '🔓 مفتوحة'}
      </span>
    </div>
    <div class="card-body">
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:1rem">
        كلمة المرور تُحفظ محلياً (SHA-256 في <code>admin/.admin-password</code>) — لا تُرفع للمستودع.
        تبقى صالحة بعد إعادة تشغيل الخادم.
      </p>
      <div class="form-grid">
        ${has ? `
        <div class="form-group">
          <label>كلمة المرور الحالية</label>
          <div style="display:flex;gap:.5rem"><input type="password" id="sCurrent" style="flex:1">${pasteBtn('sCurrent')}</div>
        </div>` : ''}
        <div class="form-group">
          <label>${has ? 'كلمة المرور الجديدة' : 'كلمة المرور'}</label>
          <div style="display:flex;gap:.5rem"><input type="password" id="sNew" style="flex:1">${pasteBtn('sNew')}</div>
        </div>
        <div class="form-group">
          <label>تأكيد كلمة المرور</label>
          <div style="display:flex;gap:.5rem"><input type="password" id="sConfirm" style="flex:1">${pasteBtn('sConfirm')}</div>
        </div>
      </div>
      <div style="margin-top:.75rem;display:flex;gap:.75rem;flex-wrap:wrap">
        <button class="btn btn-gold" onclick="setPassword()">
          <i class="fa-solid fa-lock"></i> ${has ? 'تغيير كلمة المرور' : 'تفعيل الحماية'}
        </button>
        ${has ? `<button class="btn btn-danger" onclick="removePassword()">
          <i class="fa-solid fa-lock-open"></i> إزالة الحماية
        </button>` : ''}
      </div>
      <div id="secResult" style="margin-top:.75rem;font-size:.82rem;min-height:1.5em"></div>
    </div>
  </div>

  ${has ? `
  <div class="card" style="margin-bottom:16px">
    <div class="card-header">
      <i class="fa-solid fa-key" style="color:var(--gold)"></i>
      <h3>تأكيد كلمة المرور للإجراءات الحساسة</h3>
    </div>
    <div class="card-body">
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:.85rem">
        فعّل تأكيد إضافي بكلمة المرور قبل تنفيذ كل إجراء. التأكيد صالح <strong>30 ثانية</strong> ثم يُطلب مجدداً.
        <br>
        <i class="fa-solid fa-shield-halved" style="color:var(--gold)"></i>
        كل تغيير لهذه الخيارات يتطلّب تأكيد كلمة المرور — حتى لا تعبث بها أيدٍ متطفلة.
      </p>
      ${[
        ['create_article', 'إنشاء مقال جديد',             'fa-plus'],
        ['edit_article',   'تعديل مقال موجود',            'fa-pen-to-square'],
        ['delete_article', 'حذف مقال (نقل للمهملات)',     'fa-trash-can'],
        ['push',           'دفع التغييرات إلى GitHub',     'fa-upload']
      ].map(([k,label,icon]) => `
        <label class="sec-toggle">
          <input type="checkbox" data-secaction="${k}" ${cf[k]?'checked':''} data-was="${cf[k]?'1':'0'}">
          <span class="sec-toggle-slider"></span>
          <i class="fa-solid ${icon}"></i>
          <span class="sec-toggle-label">${label}</span>
        </label>
      `).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <i class="fa-solid fa-hourglass-half" style="color:var(--gold)"></i>
      <h3>مدة الجلسة</h3>
    </div>
    <div class="card-body">
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:.85rem">
        بعد انقضاء المدة دون نشاط، يُطلب الدخول مجدداً. تغيير المدة يتطلّب تأكيد كلمة المرور.
      </p>
      <select id="sessionMinutes" class="filter-select" style="max-width:280px" data-was="${sec.sessionMinutes||1440}">
        <option value="15"   ${sec.sessionMinutes==15?'selected':''}>15 دقيقة (أمان عالٍ)</option>
        <option value="60"   ${sec.sessionMinutes==60?'selected':''}>ساعة واحدة</option>
        <option value="480"  ${sec.sessionMinutes==480?'selected':''}>8 ساعات (يوم عمل)</option>
        <option value="1440" ${!sec.sessionMinutes||sec.sessionMinutes==1440?'selected':''}>24 ساعة (افتراضي)</option>
        <option value="10080" ${sec.sessionMinutes==10080?'selected':''}>أسبوع</option>
      </select>
    </div>
  </div>` : ''}`;

  /* ربط المستمعين بعد رسم الـ HTML */
  if (has) bindSecurityToggles();
}

/* حفظ فوري عند تبديل أي مفتاح أمان */
function bindSecurityToggles() {
  document.querySelectorAll('[data-secaction]').forEach(cb => {
    cb.addEventListener('change', async () => {
      const action = cb.dataset.secaction;
      const newVal = cb.checked;
      const d = await api('/api/auth/security', {
        method: 'PUT',
        body: JSON.stringify({ confirmFor: { [action]: newVal } })
      });
      if (d.cancelled || !d.ok) {
        /* إعد المفتاح لحالته السابقة */
        cb.checked = cb.dataset.was === '1';
        if (!d.cancelled) toast('خطأ: ' + (d.error || 'فشل الحفظ'), 'error');
      } else {
        cb.dataset.was = newVal ? '1' : '0';
        const label = ACTION_LABELS[action] || action;
        toast(`✓ ${newVal ? 'فُعِّل' : 'أُلغي'} تأكيد "${label}"`, 'success');
      }
    });
  });

  /* حفظ فوري عند تغيير مدة الجلسة */
  const sel = $('sessionMinutes');
  if (sel) {
    sel.addEventListener('change', async () => {
      const newVal = parseInt(sel.value, 10);
      const d = await api('/api/auth/security', {
        method: 'PUT',
        body: JSON.stringify({ sessionMinutes: newVal })
      });
      if (d.cancelled || !d.ok) {
        sel.value = sel.dataset.was;
        if (!d.cancelled) toast('خطأ: ' + (d.error || 'فشل الحفظ'), 'error');
      } else {
        sel.dataset.was = newVal;
        toast(`✓ مدة الجلسة الآن ${newVal} دقيقة`, 'success');
      }
    });
  }
}

window.setPassword = async function() {
  const cur  = $('sCurrent')?.value || '';
  const npwd = $('sNew')?.value || '';
  const conf = $('sConfirm')?.value || '';
  if (npwd !== conf) { $('secResult').innerHTML = '<span style="color:var(--danger)">كلمتا المرور لا تتطابقان</span>'; return; }
  const wasNoPassword = !$('sCurrent');  // إذا لا يوجد حقل "كلمة المرور الحالية" → لم تكن مفعّلة
  const d = await api('/api/auth/set-password', { method:'POST', body: JSON.stringify({ password: npwd, current: cur }) });
  if (d.ok) {
    if (wasNoPassword) {
      /* أول تفعيل: امسح الـ token وأظهر شاشة الدخول لإجبار الدخول */
      setToken(null);
      toast('✓ تم تفعيل الحماية — سيُطلب الدخول الآن', 'success', 2000);
      setTimeout(() => location.reload(), 1500);
    } else {
      setToken(d.token);
      $('secResult').innerHTML = '<span style="color:var(--success)">✓ تم تحديث كلمة المرور</span>';
      renderSecurity($('content'));
    }
  } else {
    $('secResult').innerHTML = `<span style="color:var(--danger)">${d.error}</span>`;
  }
};

window.removePassword = async function() {
  /* تأكيد داخلي خفيف — كلمة المرور تُطلب تلقائياً عبر modal التأكيد */
  const res = $('secResult');
  res.innerHTML = `
    <div style="background:rgba(224,82,82,.12);border:1px solid rgba(224,82,82,.3);border-radius:8px;padding:.75rem 1rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
      <i class="fa-solid fa-triangle-exclamation" style="color:var(--danger)"></i>
      <span style="flex:1;font-size:.85rem">إزالة الحماية ستنسى كلمة المرور الحالية كلياً. سيُطلب تأكيدها مرة واحدة.</span>
      <button class="btn btn-danger btn-sm" id="confirmRemoveBtn"><i class="fa-solid fa-lock-open"></i> تأكيد الإزالة</button>
      <button class="btn btn-ghost btn-sm" onclick="$('secResult').innerHTML=''"><i class="fa-solid fa-xmark"></i> إلغاء</button>
    </div>`;
  $('confirmRemoveBtn').onclick = async () => {
    /* لا قراءة لـ sCurrent — modal التأكيد سيظهر تلقائياً */
    const d = await api('/api/auth/password', { method:'DELETE', body: JSON.stringify({}) });
    if (d.cancelled) { res.innerHTML = ''; return; }   // ألغى المستخدم modal التأكيد
    if (d.ok) {
      setToken(null);
      toast('✓ تمت إزالة كلمة المرور — يمكنك الآن وضع كلمة جديدة دون إدخال القديمة', 'success', 4000);
      renderSecurity($('content'));
    } else {
      res.innerHTML = `<span style="color:var(--danger)">${d.error || 'فشل غير معروف'}</span>`;
    }
  };
};

/* ── دالة لصق موحَّدة مع fallback ─────────────────────────────────
   تجرّب navigator.clipboard.readText() أولاً، وإذا رفض المتصفح
   (Firefox أو إعدادات صارمة) → تركّز الحقل وتوجّه المستخدم لـ Ctrl+V */
async function readClipboard() {
  try {
    if (navigator.clipboard?.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (_) { /* fall through */ }
  return null;  /* فشل → الـ caller يتعامل */
}

async function pasteIntoField(input, opts = {}) {
  if (!input) return false;
  const text = await readClipboard();
  if (text != null) {
    if (opts.atCursor) {
      const s = input.selectionStart || 0, e = input.selectionEnd || 0;
      input.setRangeText(text, s, e, 'end');
    } else {
      input.value = text;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  /* Fallback: ركّز الحقل وأخبر المستخدم */
  input.focus();
  if (!opts.atCursor) input.select();
  toast('متصفحك يمنع اللصق التلقائي — اضغط Ctrl+V الآن', 'info', 4000);
  return false;
}

// ── Paste button helper ─────────────────────────────────────────
function pasteBtn(targetId) {
  return `<button type="button" class="paste-btn" title="لصق"
    onclick="pasteIntoField(document.getElementById('${targetId}'))">
    <i class="fa-regular fa-clipboard"></i></button>`;
}

/* إضافة أزرار لصق ديناميكياً لحقول محرر المقال */
function addEditorPasteButtons() {
  const fields = ['fTitle', 'fSlug', 'fAuthor', 'fExcerpt', 'fTags', 'fImage'];
  fields.forEach(id => {
    const inp = $(id);
    if (!inp || inp.dataset.pasteAdded) return;
    inp.dataset.pasteAdded = '1';
    inp.style.flex = '1';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:.4rem;align-items:flex-start';
    inp.parentNode.insertBefore(wrap, inp);
    wrap.appendChild(inp);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'paste-btn';
    btn.title = 'لصق';
    btn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
    btn.onclick = () => pasteIntoField(inp);
    wrap.appendChild(btn);
  });
}

/* ── إنذار التاريخ المستقبلي ─────────────────────────────────── */
function checkFutureDate() {
  const dEl = $('fDate'), tEl = $('fTime');
  if (!dEl?.value) return;

  const [y, m, d]  = dEl.value.split('-').map(Number);
  const [h, min]   = (tEl?.value || '00:00').split(':').map(Number);
  const articleDt  = new Date(y, m - 1, d, h, min, 0);
  const now        = new Date();

  let warn = $('futureDateWarn');
  if (!warn) {
    /* أنشئ عنصر الإنذار مرة واحدة */
    const dateRow = dEl.closest('.form-group') || dEl.parentNode;
    warn = document.createElement('div');
    warn.id = 'futureDateWarn';
    warn.className = 'future-date-warn';
    dateRow.parentNode.insertBefore(warn, dateRow.nextSibling);
  }

  const diffMs = articleDt.getTime() - now.getTime();
  if (diffMs > 60000) {  /* أكثر من دقيقة في المستقبل */
    const mins = Math.round(diffMs / 60000);
    const txt  = mins < 60   ? `${mins} دقيقة`
               : mins < 1440 ? `${Math.round(mins/60)} ساعة`
               :               `${Math.round(mins/1440)} يوم`;
    warn.innerHTML = `
      <i class="fa-solid fa-clock"></i>
      <span><strong>مقال مجدول</strong> — سيُعرض كـ "سينشر قريباً" حتى ${dEl.value} ${tEl.value} (بعد ${txt})</span>`;
    warn.style.display = 'flex';
  } else {
    warn.style.display = 'none';
  }
}

/* ربط الإنذار بتغييرات التاريخ والوقت */
document.addEventListener('DOMContentLoaded', () => {
  ['fDate', 'fTime'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', checkFutureDate);
  });
});

// ── Content editor history (undo/redo) ─────────────────────────
const CH = { stack: [''], idx: 0, lock: false };

function chSave() {
  if (CH.lock) return;
  const v = $('fContent')?.value || '';
  if (v === CH.stack[CH.idx]) return;
  CH.stack.splice(CH.idx + 1);
  CH.stack.push(v);
  if (CH.stack.length > 200) CH.stack.shift();
  CH.idx = CH.stack.length - 1;
}

function chReset(val) {
  CH.stack = [val || '']; CH.idx = 0;
}

function chUndo() {
  if (CH.idx <= 0) return;
  CH.lock = true; CH.idx--;
  const ta = $('fContent');
  if (ta) { ta.value = CH.stack[CH.idx]; updateWordCount(); }
  CH.lock = false;
}

function chRedo() {
  if (CH.idx >= CH.stack.length - 1) return;
  CH.lock = true; CH.idx++;
  const ta = $('fContent');
  if (ta) { ta.value = CH.stack[CH.idx]; updateWordCount(); }
  CH.lock = false;
}

// ── Init ───────────────────────────────────────────────────────
loadCats().then(async () => {
  /* فحص المصادقة الصحيح: تحقق من hasPassword ثم تحقق من صحة الـ token */
  const st = await fetch('/api/auth/status').then(r => r.json()).catch(() => ({ hasPassword: false }));
  if (st.hasPassword) {
    const chk = await fetch('/api/stats', { headers: { 'x-admin-token': getToken() } });
    if (chk.status === 401) { showLogin(); return; }
  }

  /* تحديث قائمة الأقسام في محرر المقال — ديناميكياً */
  populateCategoryFields();
  updateTrashBadge();
  navigate(location.hash.slice(1) || 'dashboard');
});

/* تعبئة كل حقول الأقسام بناءً على _data/categories.yml */
function populateCategoryFields() {
  if (!Object.keys(CATS).length) return;

  /* القسم الرئيسي (select) */
  const sel = $('fCategory');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = Object.entries(CATS)
      .map(([id, c]) => `<option value="${id}">${c.ar}</option>`).join('');
    if (cur) sel.value = cur;
  }

  /* أقسام إضافية (checkboxes) — تشمل كل قسم موجود */
  const wrap = $('fAlsoIn');
  if (wrap) {
    wrap.innerHTML = Object.entries(CATS).map(([id, c]) => `
      <label class="check-label">
        <input type="checkbox" value="${id}"> ${c.ar}
      </label>`).join('');
  }
}
