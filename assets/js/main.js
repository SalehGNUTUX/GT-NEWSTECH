(function () {
  'use strict';

  /* ── Reading Progress ─────────────────────────────────── */
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

  /* ── Back To Top ──────────────────────────────────────── */
  var backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    }, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Mobile Menu ──────────────────────────────────────── */
  var menuToggle = document.getElementById('mobileMenuToggle');
  var mainNav    = document.querySelector('.main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      var menuIcon  = menuToggle.querySelector('.menu-icon');
      var closeIcon = menuToggle.querySelector('.close-icon');
      if (menuIcon)  menuIcon.style.display  = open ? 'none'  : '';
      if (closeIcon) closeIcon.style.display = open ? ''      : 'none';
    });
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        var menuIcon  = menuToggle.querySelector('.menu-icon');
        var closeIcon = menuToggle.querySelector('.close-icon');
        if (menuIcon)  menuIcon.style.display  = '';
        if (closeIcon) closeIcon.style.display = 'none';
      }
    });
  }

  /* ── Dropdown ─────────────────────────────────────────── */
  var dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(function (dd) {
    var toggle = dd.querySelector('.dropdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = dd.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
    }
  });
  document.addEventListener('click', function () {
    dropdowns.forEach(function (dd) {
      dd.classList.remove('open');
      var toggle = dd.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Search ───────────────────────────────────────────── */
  var searchToggle  = document.getElementById('searchToggle');
  var searchBar     = document.getElementById('searchBar');
  var searchInput   = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');

  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', function () {
      var hidden = searchBar.hasAttribute('hidden');
      if (hidden) {
        searchBar.removeAttribute('hidden');
        if (searchInput) searchInput.focus();
      } else {
        searchBar.setAttribute('hidden', '');
        if (searchResults) searchResults.innerHTML = '';
      }
    });
  }

  /* Simple client-side search using Jekyll JSON data if available */
  if (searchInput && searchResults) {
    var postsData = [];
    /* Load search index if it exists */
    fetch(document.querySelector('meta[name="baseurl"]') ? document.querySelector('meta[name="baseurl"]').content + '/search.json' : '/search.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { postsData = data; })
      .catch(function () {});

    searchInput.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      searchResults.innerHTML = '';
      if (q.length < 2 || !postsData.length) return;
      var matches = postsData.filter(function (p) {
        return p.title.toLowerCase().includes(q) || (p.excerpt && p.excerpt.toLowerCase().includes(q));
      }).slice(0, 6);
      matches.forEach(function (p) {
        var a = document.createElement('a');
        a.className = 'search-result-item';
        a.href = p.url;
        a.innerHTML =
          '<span class="card-lang-tag" style="position:static;font-size:0.65rem;">' + (p.lang || '').toUpperCase() + '</span>' +
          '<span>' + p.title + '</span>';
        searchResults.appendChild(a);
      });
      if (!matches.length) {
        var p = document.createElement('p');
        p.style.cssText = 'color:#666;font-size:.85rem;padding:.5rem 0';
        p.textContent = 'لا توجد نتائج / No results';
        searchResults.appendChild(p);
      }
    });
  }

  /* ── Copy Link ────────────────────────────────────────── */
  var copyBtn = document.getElementById('copyLink');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        copyBtn.style.background = 'var(--cat-foss)';
        copyBtn.style.color = '#fff';
        setTimeout(function () {
          copyBtn.style.background = '';
          copyBtn.style.color = '';
        }, 1500);
      });
    });
  }

  /* ── Table of Contents ────────────────────────────────── */
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

      /* Highlight active heading on scroll */
      var tocLinks = tocNav.querySelectorAll('a');
      window.addEventListener('scroll', function () {
        var scrollY = window.scrollY + 140;
        var active = null;
        headings.forEach(function (h) {
          if (h.offsetTop <= scrollY) active = h.id;
        });
        tocLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + active);
        });
      }, { passive: true });
    }
  }

  /* ── Reading Time ─────────────────────────────────────── */
  var bodyEl = document.getElementById('postBody');
  var rtEl   = document.getElementById('readingTimeDisplay');
  if (bodyEl && rtEl) {
    var words = bodyEl.textContent.trim().split(/\s+/).length;
    var mins  = Math.max(1, Math.round(words / 200));
    var lang  = document.documentElement.lang;
    rtEl.textContent = lang === 'en' ? mins + ' min read' : mins + ' دقيقة قراءة';
  }

  /* ── Archive filter ───────────────────────────────────── */
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
