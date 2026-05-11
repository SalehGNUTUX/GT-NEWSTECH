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

function getToken()      { return localStorage.getItem(TOKEN_KEY) || ''; }
function setToken(t)     { if(t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }

async function api(url, opts={}) {
  const headers = { 'Content-Type': 'application/json', 'x-admin-token': getToken() };
  const r = await fetch(url, { headers, ...opts });
  if (r.status === 401) { showLogin(); return {}; }
  return r.json();
}

async function checkAuth() {
  const st = await fetch('/api/auth/status', { headers: { 'x-admin-token': getToken() } });
  if (st.status === 401) { showLogin(); return false; }
  return true;
}

function showLogin() {
  $('loginOverlay').removeAttribute('hidden');
  setTimeout(() => $('loginPass')?.focus(), 50);
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
  const titles = { dashboard:'لوحة التحكم', articles:'المقالات', 'new-article':'مقال جديد', images:'مدير الصور', categories:'الأقسام', trash:'المهملات', git:'Git / نشر', remotes:'المستودعات', security:'الأمان', config:'الإعدادات' };
  $('topbarTitle').textContent = titles[page] || page;
  renderPage(page);
}

window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'dashboard'));

// ── Pages ──────────────────────────────────────────────────────
async function renderPage(page) {
  const c = $('content');
  c.innerHTML = '<div class="loading-wrap"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  if (page === 'dashboard')    return renderDashboard(c);
  if (page === 'articles')     return renderArticles(c);
  if (page === 'new-article')  { openEditor(null); return renderArticles(c); }
  if (page === 'images')       return renderImages(c);
  if (page === 'categories')   return renderCategories(c);
  if (page === 'trash')        return renderTrash(c);
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
    <div class="stat-card"><div class="stat-icon" style="background:rgba(255,255,255,.06)"><i class="fa-${v.brand?'brands':'solid'} ${v.icon}" style="font-size:1.1rem;color:var(--gold)"></i></div>
      <div><div class="stat-val">${d.byCat[k]||0}</div><div class="stat-lbl">${v.ar}</div></div></div>`).join('')}
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
  const r = await fetch(`/api/images/${S.langFilter}`, { method:'POST', body:fd });
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
    renderCategories($('content'));
  } else {
    result.innerHTML = `<span style="color:var(--danger)">خطأ: ${d.error}</span>`;
  }
};

// Git ───────────────────────────────────────────────────────────
async function renderGit(c) {
  const d = await api('/api/git/status');
  c.innerHTML = `
  <div class="card" style="margin-bottom:16px">
    <div class="card-header"><i class="fa-brands fa-git-alt" style="color:#f05032"></i><h3>حالة Git</h3>
      <button class="btn btn-sm btn-ghost" style="margin-right:auto" onclick="renderGit($('content'))"><i class="fa-solid fa-rotate"></i> تحديث</button>
    </div>
    <div class="card-body">
      <div class="git-status-box">${d.status||'لا توجد تغييرات'}</div>
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
  document.querySelectorAll('[name=fLang]').forEach(r => r.checked = (r.value === (a.lang||ref?.lang||'ar')));

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

    /* ── أوامر التراجع/التقدم/المسح ── */
    if (btn.dataset.action === 'undo') {
      chUndo(); ta.focus(); return;
    } else if (btn.dataset.action === 'redo') {
      chRedo(); ta.focus(); return;
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
      const r = await fetch(`/api/images/${lang}`, { method:'POST', body:fd });
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
  const st = await fetch('/api/auth/status', { headers: { 'x-admin-token': getToken() } }).then(r=>r.json());
  const has = st.hasPassword;
  c.innerHTML = `
  <div class="card">
    <div class="card-header">
      <i class="fa-solid fa-shield-halved" style="color:var(--gold)"></i>
      <h3>حماية لوحة التحكم</h3>
      <span class="r-cat" style="background:${has?'var(--cat-foss)':'#555'};color:#fff;margin-right:auto">
        ${has ? '🔒 محمية' : '🔓 مفتوحة'}
      </span>
    </div>
    <div class="card-body">
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:1rem">
        كلمة المرور تُحفظ محلياً (hash SHA-256) ولا تُرفع للمستودع.
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
  </div>`;
}

window.setPassword = async function() {
  const cur  = $('sCurrent')?.value || '';
  const npwd = $('sNew')?.value || '';
  const conf = $('sConfirm')?.value || '';
  if (npwd !== conf) { $('secResult').innerHTML = '<span style="color:var(--danger)">كلمتا المرور لا تتطابقان</span>'; return; }
  const d = await api('/api/auth/set-password', { method:'POST', body: JSON.stringify({ password: npwd, current: cur }) });
  if (d.ok) { setToken(d.token); $('secResult').innerHTML = '<span style="color:var(--success)">✓ تم حفظ كلمة المرور</span>'; renderSecurity($('content')); }
  else $('secResult').innerHTML = `<span style="color:var(--danger)">${d.error}</span>`;
};

window.removePassword = async function() {
  /* أظهر تأكيد داخلي بدل browser dialog */
  const res = $('secResult');
  res.innerHTML = `
    <div style="background:rgba(224,82,82,.12);border:1px solid rgba(224,82,82,.3);border-radius:8px;padding:.75rem 1rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
      <i class="fa-solid fa-triangle-exclamation" style="color:var(--danger)"></i>
      <span style="flex:1;font-size:.85rem">هل أنت متأكد من إزالة الحماية؟</span>
      <button class="btn btn-danger btn-sm" id="confirmRemoveBtn"><i class="fa-solid fa-lock-open"></i> تأكيد الإزالة</button>
      <button class="btn btn-ghost btn-sm" onclick="$('secResult').innerHTML=''"><i class="fa-solid fa-xmark"></i> إلغاء</button>
    </div>`;
  $('confirmRemoveBtn').onclick = async () => {
    const cur = $('sCurrent')?.value || '';
    const d = await api('/api/auth/password', { method:'DELETE', body: JSON.stringify({ current: cur }) });
    if (d.ok) { setToken(null); toast('✓ تمت إزالة كلمة المرور', 'success'); renderSecurity($('content')); }
    else { res.innerHTML = `<span style="color:var(--danger)">${d.error}</span>`; }
  };
};

// ── Paste button helper ─────────────────────────────────────────
function pasteBtn(targetId) {
  return `<button type="button" class="paste-btn" title="لصق"
    onclick="navigator.clipboard.readText().then(t=>{$('${targetId}').value=t;$('${targetId}').dispatchEvent(new Event('input'))})">
    <i class="fa-regular fa-clipboard"></i></button>`;
}

/* إضافة أزرار لصق ديناميكياً لحقول محرر المقال */
function addEditorPasteButtons() {
  const fields = ['fTitle', 'fSlug', 'fAuthor', 'fExcerpt', 'fTags'];
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
    btn.onclick = () => navigator.clipboard.readText().then(t => {
      inp.value = t; inp.dispatchEvent(new Event('input'));
    });
    wrap.appendChild(btn);
  });
}

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

  /* تحديث قائمة الأقسام في محرر المقال */
  const sel = $('fCategory');
  if (sel && Object.keys(CATS).length) {
    sel.innerHTML = Object.entries(CATS)
      .map(([id, c]) => `<option value="${id}">${c.ar}</option>`).join('');
  }
  updateTrashBadge();
  navigate(location.hash.slice(1) || 'dashboard');
});
