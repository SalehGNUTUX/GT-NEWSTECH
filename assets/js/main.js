(function () {
  'use strict';

  var LANG_KEY = 'gnt-lang';

  /* ── Language preference ──────────────────────────────────── */
  var currentLang = document.body.getAttribute('data-lang') || 'ar';

  /* Save language when user clicks a language link */
  document.querySelectorAll('[data-lang-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      var lang = a.getAttribute('data-lang');
      if (lang) localStorage.setItem(LANG_KEY, lang);
    });
  });

  /* ── Reading Progress ─────────────────────────────────────── */
  var progressBar = document.getElementById('readingProgress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var scrollHeight = doc.scrollHeight - doc.clientHeight;
      var progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      progressBar.style.transform = 'scaleX(' + progress + ')';
    }, { passive: true });
  }

  /* ── Back To Top ──────────────────────────────────────────── */
  var backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', function () {
      backBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Mobile Menu ──────────────────────────────────────────── */
  var menuToggle = document.getElementById('mobileMenuToggle');
  var mainNav    = document.querySelector('.main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.querySelector('.menu-icon').style.display  = open ? 'none' : '';
      menuToggle.querySelector('.close-icon').style.display = open ? ''     : 'none';
    });
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.querySelector('.menu-icon').style.display  = '';
        menuToggle.querySelector('.close-icon').style.display = 'none';
      }
    });
  }

  /* ── Dropdown Nav ─────────────────────────────────────────── */
  document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
    var toggle = dd.querySelector('.dropdown-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dd.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(dd.classList.contains('open')));
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown.open').forEach(function (dd) {
      dd.classList.remove('open');
      var t = dd.querySelector('.dropdown-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Search ───────────────────────────────────────────────── */
  var searchToggle  = document.getElementById('searchToggle');
  var searchBar     = document.getElementById('searchBar');
  var searchInput   = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  var postsData     = [];

  function loadSearchIndex() {
    if (postsData.length) return;
    var base = document.querySelector('meta[name="baseurl"]');
    var url  = (base ? base.content : '') + '/search.json';
    fetch(url)
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { postsData = data; })
      .catch(function () {});
  }

  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', function () {
      var hidden = searchBar.hasAttribute('hidden');
      if (hidden) {
        searchBar.removeAttribute('hidden');
        loadSearchIndex();
        if (searchInput) searchInput.focus();
      } else {
        searchBar.setAttribute('hidden', '');
        if (searchResults) searchResults.innerHTML = '';
      }
    });
  }

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      searchResults.innerHTML = '';
      if (q.length < 2) return;

      /* Filter by CURRENT language — only show same-language results */
      var matches = postsData.filter(function (p) {
        return p.lang === currentLang &&
          (p.title.toLowerCase().includes(q) ||
           (p.excerpt && p.excerpt.toLowerCase().includes(q)));
      }).slice(0, 7);

      if (!matches.length) {
        var msg = document.createElement('p');
        msg.style.cssText = 'color:#666;font-size:.85rem;padding:.5rem 0';
        msg.textContent = currentLang === 'en' ? 'No results found.' : 'لا توجد نتائج.';
        searchResults.appendChild(msg);
        return;
      }

      matches.forEach(function (p) {
        var a = document.createElement('a');
        a.className = 'search-result-item';
        a.href = p.url;

        var catLabel = p.category || '';
        if (currentLang === 'ar') {
          var catMap = { 'gnutux-projects': 'GNUTUX', 'foss': 'حرة', 'gnulinux': 'لينكس', 'tech-news': 'تقنية', 'ai': 'ذكاء' };
          catLabel = catMap[p.category] || p.category;
        } else {
          var catMapEn = { 'gnutux-projects': 'GNUTUX', 'foss': 'FOSS', 'gnulinux': 'GNU/Linux', 'tech-news': 'Tech', 'ai': 'AI' };
          catLabel = catMapEn[p.category] || p.category;
        }

        a.innerHTML =
          '<span class="search-cat-badge cat-' + p.category + '" style="font-size:.65rem;font-weight:700;padding:.15rem .45rem;border-radius:3px;color:#000;white-space:nowrap">' + catLabel + '</span>' +
          '<span style="flex:1;font-size:.875rem">' + p.title + '</span>' +
          '<span style="font-size:.72rem;color:#666;white-space:nowrap;font-family:Inter,sans-serif">' + (p.date || '') + '</span>';
        a.style.cssText = 'display:flex;align-items:center;gap:.6rem';
        searchResults.appendChild(a);
      });
    });

    /* Close search on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchBar && !searchBar.hasAttribute('hidden')) {
        searchBar.setAttribute('hidden', '');
        searchResults.innerHTML = '';
      }
    });
  }

  /* ── Copy Link ────────────────────────────────────────────── */
  var copyBtn = document.getElementById('copyLink');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        copyBtn.style.background = '#2ea043';
        copyBtn.style.color = '#fff';
        setTimeout(function () {
          copyBtn.style.background = '';
          copyBtn.style.color = '';
        }, 1500);
      });
    });
  }

  /* ── Table of Contents ────────────────────────────────────── */
  var postBody = document.getElementById('postBody');
  var tocNav   = document.getElementById('tocNav');
  var tocBox   = document.getElementById('tocBox');
  if (postBody && tocNav) {
    var headings = postBody.querySelectorAll('h2, h3');
    if (headings.length < 2) {
      if (tocBox) tocBox.style.display = 'none';
    } else {
      headings.forEach(function (h, i) {
        if (!h.id) h.id = 'heading-' + i;
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.style.paddingInlineStart = h.tagName === 'H3' ? '1.5rem' : '0.6rem';
        tocNav.appendChild(a);
      });
      var tocLinks = tocNav.querySelectorAll('a');
      window.addEventListener('scroll', function () {
        var scrollY = window.scrollY + 140;
        var activeId = null;
        headings.forEach(function (h) { if (h.offsetTop <= scrollY) activeId = h.id; });
        tocLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
        });
      }, { passive: true });
    }
  }

  /* ── Reading Time ─────────────────────────────────────────── */
  var bodyEl = document.getElementById('postBody');
  var rtEl   = document.getElementById('readingTimeDisplay');
  if (bodyEl && rtEl) {
    var words = bodyEl.textContent.trim().split(/\s+/).length;
    var mins  = Math.max(1, Math.round(words / 200));
    rtEl.textContent = currentLang === 'en' ? mins + ' min read' : mins + ' دقيقة قراءة';
  }

  /* ── Archive Filter ───────────────────────────────────────── */
  var filterBtns  = document.querySelectorAll('.filter-btn');
  var archiveGrps = document.querySelectorAll('.archive-group');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      archiveGrps.forEach(function (g) {
        g.style.display = (f === 'all' || g.dataset.category === f) ? '' : 'none';
      });
    });
  });

})();
