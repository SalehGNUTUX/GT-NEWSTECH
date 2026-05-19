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

  /* ── Compact Header on Scroll (mobile) ─────────────────────
     عند التمرير لأكثر من 50px → يضيف class 'compact' على الرأس
     CSS يقلّص الشعار ويخفي النص لإعطاء مساحة أكبر للقارئ.
     شريط الأقسام (Nav) يبقى مرئياً. */
  var _siteHeader = document.querySelector('.site-header');
  if (_siteHeader) {
    var _lastCompact = false;
    var _checkCompact = function () {
      var shouldBe = window.scrollY > 50;
      if (shouldBe !== _lastCompact) {
        _siteHeader.classList.toggle('compact', shouldBe);
        _lastCompact = shouldBe;
      }
    };
    _checkCompact();
    window.addEventListener('scroll', _checkCompact, { passive: true });
  }

  /* ── Mobile Menu ──────────────────────────────────────────── */
  var menuToggle = document.getElementById('mobileMenuToggle');
  var mainNav    = document.querySelector('.main-nav');

  function closeNav() {
    if (!mainNav) return;
    mainNav.classList.remove('open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      var mi = menuToggle.querySelector('.menu-icon');
      var ci = menuToggle.querySelector('.close-icon');
      if (mi) mi.style.display = '';
      if (ci) ci.style.display = 'none';
    }
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      var mi = menuToggle.querySelector('.menu-icon');
      var ci = menuToggle.querySelector('.close-icon');
      if (mi) mi.style.display = open ? 'none' : '';
      if (ci) ci.style.display = open ? ''     : 'none';
    });

    /* إغلاق عند النقر خارج القائمة */
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        closeNav();
      }
    });

    /* إغلاق عند النقر على أي رابط داخل القائمة (موبايل) */
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) closeNav();
      });
    });

    /* إغلاق بـ Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
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

  /* ── محوّلات محتوى المقال (تلقائية على المقالات القديمة والجديدة) ──
     1) معالج الصور المكسورة (broken external image URLs)
     2) روابط الصور المكشوفة → <img> فعلية
     3) قسم "روابط سريعة / المراجع / Quick Links..." → grid من الـ chips */
  var _postBodyForTransform = document.getElementById('postBody');
  if (_postBodyForTransform) {
    /* 1) معالج الصور المكسورة — يستبدلها بصورة الترويسة أو يخفيها */
    var _heroImgSrc = (document.querySelector('.post-featured-image') || {}).src || '';
    _postBodyForTransform.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        if (_heroImgSrc && this.src !== _heroImgSrc && !this.dataset.fallbackTried) {
          this.dataset.fallbackTried = '1';
          this.src = _heroImgSrc;
          this.classList.add('post-inline-image--fallback');
        } else {
          /* لا fallback متاح → أخفِ الصورة بسلاسة */
          this.style.display = 'none';
        }
      }, { once: false });
    });

    /* 2) أي رابط <a> ينتهي بصيغة صورة → استبدله بـ <img> فعلية */
    var _imgExtRe = /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i;
    _postBodyForTransform.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var isAutoLink = a.textContent.trim() === href.trim();
      if (_imgExtRe.test(href) && isAutoLink) {
        var img = document.createElement('img');
        img.src = href;
        img.alt = '';
        img.loading = 'lazy';
        img.className = 'post-inline-image';
        var p = a.closest('p');
        if (p && p.textContent.trim() === a.textContent.trim()) p.replaceWith(img);
        else a.replaceWith(img);
      }
    });

    /* 3) أي عنوان أو فقرة بنص "روابط/مراجع/Links..." → grid من chips */
    var _linkSectionRe = /^(روابط\s*سريعة|روابط\s*مهمة|روابط\s*خارجية|روابط|المراجع|مراجع|للتحميل|التحميل|روابط\s*التحميل|quick\s*links|useful\s*links|external\s*links|references|sources|resources|downloads?|links)\s*[:：]?\s*$/i;

    /* مرشّحون: h2/h3/h4 + <p><strong>...:</strong></p> */
    var candidates = [];
    _postBodyForTransform.querySelectorAll('h2, h3, h4').forEach(function (h) {
      if (_linkSectionRe.test(h.textContent.trim())) candidates.push(h);
    });
    _postBodyForTransform.querySelectorAll('p').forEach(function (p) {
      /* فقرة تحوي فقط <strong>...:</strong> */
      var strong = p.querySelector('strong');
      if (strong && p.textContent.trim() === strong.textContent.trim()
          && _linkSectionRe.test(strong.textContent.trim())) {
        candidates.push(p);
      }
    });

    candidates.forEach(function (marker) {
      var collected = [];
      var next = marker.nextElementSibling;
      var toRemove = [];
      while (next && !/^H[1-6]$/.test(next.tagName)) {
        /* خذ كل الروابط الخارجية من العنصر */
        var links = next.querySelectorAll('a[href^="http"]');
        if (links.length) {
          links.forEach(function (a) {
            if (!collected.some(function(c){ return c.href === a.href; })) collected.push(a);
          });
          toRemove.push(next);
        } else if (next.tagName === 'P' && !next.textContent.trim()) {
          toRemove.push(next);  /* فقرات فارغة */
        } else {
          break;  /* نص حقيقي — توقف */
        }
        next = next.nextElementSibling;
      }
      if (collected.length < 1) return;
      toRemove.forEach(function (el) { el.remove(); });

      var grid = document.createElement('div');
      grid.className = 'quick-links-grid';
      collected.forEach(function (a) {
        var chip = document.createElement('a');
        chip.href = a.href;
        chip.target = '_blank';
        chip.rel = 'noopener noreferrer';
        chip.className = 'quick-link-chip';
        var host = '';
        try { host = new URL(a.href).hostname.replace(/^www\./, ''); } catch(e) {}
        var label = a.textContent.trim();
        if (label === a.href || /^https?:\/\//.test(label)) label = host || label;
        chip.innerHTML =
          '<i class="fa-solid fa-arrow-up-right-from-square"></i>' +
          '<div class="quick-link-content">' +
            '<span class="quick-link-label">' + label.replace(/</g,'&lt;') + '</span>' +
            (host ? '<span class="quick-link-host">' + host + '</span>' : '') +
          '</div>';
        grid.appendChild(chip);
      });
      marker.insertAdjacentElement('afterend', grid);
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

  /* ── شارات "سينشر قريباً" — تختفي تلقائياً عند بلوغ الموعد ─
     يحلّ مشكلة بقاء الشارة بعد الموعد (Jekyll لا يعيد البناء تلقائياً) */
  function checkScheduledBadges() {
    var now = Date.now();
    var anyRemaining = false;
    document.querySelectorAll('.card-scheduled-badge[data-publish-at]').forEach(function (badge) {
      var target = new Date(badge.dataset.publishAt).getTime();
      if (!isNaN(target) && now >= target) {
        var card = badge.closest('.article-card');
        if (card) card.classList.remove('article-card--scheduled');
        badge.remove();
      } else {
        anyRemaining = true;
      }
    });
    return anyRemaining;
  }
  if (checkScheduledBadges()) {
    /* تابع الفحص كل دقيقة طالما توجد بطاقات مجدولة */
    var scheduledInterval = setInterval(function () {
      if (!checkScheduledBadges()) clearInterval(scheduledInterval);
    }, 60000);
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
