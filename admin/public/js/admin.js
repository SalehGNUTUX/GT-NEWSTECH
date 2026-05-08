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

const CATS = {
  'gnutux-projects': { ar:'مشاريع GNUTUX', en:'GNUTUX Projects', icon:'fa-terminal',   cc:'gnutux-projects' },
  'foss':            { ar:'البرمجيات الحرة', en:'FOSS',          icon:'fa-code',       cc:'foss' },
  'gnulinux':        { ar:'غنو/لينكس',      en:'GNU/Linux',      icon:'fa-linux',      cc:'gnulinux',  brand:true },
  'tech-news':       { ar:'أخبار التقنية',  en:'Tech News',      icon:'fa-microchip',  cc:'tech-news' },
  'ai':              { ar:'الذكاء الاصطناعي',en:'AI News',       icon:'fa-robot',      cc:'ai' },
};

// ── Utils ──────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className=cls; if(html) e.innerHTML=html; return e; };

function toast(msg, type='info', dur=3000) {
  const t = el('div', `toast ${type}`, msg);
  $('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), dur);
}

async function api(url, opts={}) {
  const r = await fetch(url, { headers:{'Content-Type':'application/json'}, ...opts });
  return r.json();
}

function catBadge(cat, small=false) {
  const info = CATS[cat] || {};
  return `<span class="r-cat cc-${cat}" style="${small?'font-size:.6rem':''}">${info.ar||cat}</span>`;
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
  const titles = { dashboard:'لوحة التحكم', articles:'المقالات', 'new-article':'مقال جديد', images:'مدير الصور', git:'Git / نشر', config:'الإعدادات' };
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
  if (page === 'git')          return renderGit(c);
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
  return list.map(a => `
  <tr>
    <td class="td-title" title="${a.title||''}">${a.title||a._file}</td>
    <td>${catBadge(a._cat)}</td>
    <td style="font-family:'Inter',monospace;font-size:.78rem">${(a.date||'').toString().slice(0,10)}</td>
    <td style="font-size:.72rem;color:var(--muted);font-family:monospace">${a.slug||'-'}</td>
    <td style="font-size:.72rem">${(a.also_in||[]).map(c=>`<span class="r-cat cc-${c}" style="font-size:.6rem">${CATS[c]?.ar||c}</span>`).join(' ')||'-'}</td>
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
        <option value="">كل الأقسام</option>
        ${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${S.catFilter===k?'selected':''}>${v.ar}</option>`).join('')}
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
  const fd = new FormData();
  Array.from(files).forEach(f => fd.append('files', f));
  const r = await fetch(`/api/images/${S.langFilter}`, { method:'POST', body:fd });
  const d = await r.json();
  toast(`تم رفع ${d.uploaded?.length||0} صورة`, 'success');
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
window.editFrom = async (lang, cat, file) => openEditor({ lang, cat, file });

async function openEditor(ref) {
  S.editingArticle = ref;
  let a = {};
  if(ref) {
    a = await api(`/api/article?lang=${ref.lang}&cat=${ref.cat}&file=${encodeURIComponent(ref.file)}`);
  }

  $('editorTitle').textContent = ref ? 'تحرير المقال' : 'مقال جديد';
  $('fTitle').value   = a.title || '';
  $('fDate').value    = (a.date||new Date().toISOString().slice(0,10)).toString().slice(0,10);
  $('fSlug').value    = a.slug  || '';
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
  updateWordCount();
  updateImgPreview();

  // hide current category in also_in
  syncAlsoInWithCat();

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
$('fContent').addEventListener('input', updateWordCount);

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

// Toolbar actions
document.querySelectorAll('.tb-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const ta = $('fContent');
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.slice(s, e);
    let ins = '';

    if(btn.dataset.insert) {
      const w = btn.dataset.insert;
      ins = sel ? `${w}${sel}${w}` : `${w}متن${w}`;
      ta.setRangeText(ins, s, e, 'end');
    } else if(btn.dataset.insertH) {
      const line = ta.value.lastIndexOf('\n', s-1)+1;
      ta.setRangeText(btn.dataset.insertH, line, line, 'start');
    } else if(btn.dataset.insertLine) {
      ta.setRangeText('\n'+btn.dataset.insertLine, s, e, 'end');
    } else if(btn.dataset.insertBlock) {
      ta.setRangeText('\n'+btn.dataset.insertBlock+(sel||'نص')+'', s, e, 'end');
    } else if(btn.dataset.insertCode) {
      ta.setRangeText('\n```\n'+(sel||'الكود هنا')+'\n```\n', s, e, 'end');
    } else if(btn.dataset.action === 'link') {
      const url = prompt('رابط URL:', 'https://');
      if(url) ta.setRangeText(`[${sel||'نص الرابط'}](${url})`, s, e, 'end');
    } else if(btn.dataset.action === 'aff-link') {
      const url = prompt('رابط الأفيلييت:', 'https://');
      if(url) ta.setRangeText(`[${sel||'اسم المنتج'}](${url}){: .aff-link rel="nofollow sponsored" target="_blank"}`, s, e, 'end');
    }
    ta.focus();
    updateWordCount();
  });
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

  const fm = {
    layout: 'post',
    title, slug, lang, category: cat,
    date: $('fDate').value,
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
    d = await api('/api/article', { method:'POST', body:JSON.stringify({...fm, content}) });
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
  if(!confirm(`حذف المقال:\n"${title}"?\n\nهذا الإجراء لا يمكن التراجع عنه.`)) return;
  const d = await api(`/api/article?lang=${lang}&cat=${cat}&file=${encodeURIComponent(file)}`, { method:'DELETE' });
  if(d.ok) { toast('تم حذف المقال', 'success'); renderArticles($('content')); }
  else toast('خطأ في الحذف', 'error');
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

// ── Init ───────────────────────────────────────────────────────
navigate(location.hash.slice(1) || 'dashboard');
