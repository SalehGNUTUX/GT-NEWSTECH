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

  /* ── Scroll toggle (أعلى/أسفل) ─────────────────────────────
     - في الأعلى أو قريب منه: السهم متجه للأسفل، النقر يأخذك للأسفل
     - بعد التمرير لـ >400px: السهم متجه للأعلى، النقر يأخذك للأعلى */
  var backBtn = document.getElementById('backToTop');
  var backIcon = document.getElementById('backToTopIcon');
  var SVG_UP = '<polyline points="18 15 12 9 6 15"/>';
  var SVG_DOWN = '<polyline points="6 9 12 15 18 9"/>';
  if (backBtn) {
    var isDown = true; // الحالة الافتراضية: نزول
    function updateScrollButton() {
      var y = window.scrollY;
      var shouldBeUp = y > 400;
      if (shouldBeUp !== !isDown) {
        isDown = !shouldBeUp;
        if (backIcon) backIcon.innerHTML = isDown ? SVG_DOWN : SVG_UP;
        backBtn.setAttribute('aria-label', isDown ? 'انتقال لأسفل الصفحة' : 'العودة للأعلى');
      }
      backBtn.classList.add('visible'); // ظاهر دائماً (مع تبدّل الاتجاه)
    }
    window.addEventListener('scroll', updateScrollButton, { passive: true });
    updateScrollButton();
    backBtn.addEventListener('click', function () {
      window.scrollTo({
        top: isDown ? document.documentElement.scrollHeight : 0,
        behavior: 'smooth',
      });
    });
  }

  /* ── زر مشاركة عائم (Floating Action Button) ────────────────
     يُظهر modal يحوي نسخة من أزرار المشاركة الموجودة في .post-share،
     لتجنّب النزول لأسفل المقال للوصول إليها. */
  var fabShare = document.getElementById('fabShare');
  var postShare = document.querySelector('.post-share');
  if (fabShare && postShare) {
    fabShare.addEventListener('click', function () {
      var modal = document.getElementById('fabShareModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fabShareModal';
        modal.className = 'fab-share-modal';
        modal.innerHTML = '<div class="fab-share-overlay"></div>' +
                          '<div class="fab-share-box">' +
                            '<div class="fab-share-header">' +
                              '<span>' + (document.documentElement.lang === 'en' ? 'Share article' : 'شارك المقال') + '</span>' +
                              '<button class="fab-share-close" aria-label="إغلاق">✕</button>' +
                            '</div>' +
                            '<div class="fab-share-body"></div>' +
                          '</div>';
        document.body.appendChild(modal);

        /* ننسخ المحتوى الفعلي للأزرار من .post-share داخل الـ modal،
           ثم نُعيد إرفاق نفس معالج النقر — يستخدم نفس البيانات (data-*) */
        var cloned = postShare.cloneNode(true);
        cloned.classList.add('post-share--in-modal');
        cloned.removeAttribute('id');
        modal.querySelector('.fab-share-body').appendChild(cloned);

        /* أعد ربط الأحداث على النسخة المنسوخة:
           بدل تكرار الـ handlers، نُشغّل نقر برمجياً على الزر الأصلي
           في .post-share (يحمل نفس data-platform). يحافظ على Shift+Click كذلك. */
        cloned.querySelectorAll('.share-btn[data-platform]').forEach(function (btn) {
          var p = btn.dataset.platform;
          btn.addEventListener('click', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var origBtn = postShare.querySelector('.share-btn[data-platform="' + p + '"]');
            if (origBtn) {
              /* مرّر shiftKey بصياغة event مماثل */
              var fake = new MouseEvent('click', { bubbles: true, shiftKey: ev.shiftKey });
              origBtn.dispatchEvent(fake);
              modal.classList.remove('show');
            }
          });
        });

        function closeModal() { modal.classList.remove('show'); }
        modal.querySelector('.fab-share-close').addEventListener('click', closeModal);
        modal.querySelector('.fab-share-overlay').addEventListener('click', closeModal);
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') closeModal();
        });
      }
      modal.classList.add('show');
    });
  }

  /* ── الروابط الخارجية تفتح في تبويب جديد ──────────────────
     أي رابط لنطاق مختلف عن الموقع الحالي يُضاف له target="_blank"
     مع rel="noopener noreferrer" لأمان أعلى */
  (function () {
    var here = window.location.host;
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      try {
        var u = new URL(a.href);
        if (u.host && u.host !== here) {
          a.setAttribute('target', '_blank');
          var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
          if (rel.indexOf('noopener')   < 0) rel.push('noopener');
          if (rel.indexOf('noreferrer') < 0) rel.push('noreferrer');
          a.setAttribute('rel', rel.join(' '));
        }
      } catch (e) {}
    });
  })();

  /* ── مزامنة ثيم Giscus مع ثيم الموقع (داكن/فاتح) ────────── */
  (function () {
    function sendThemeToGiscus() {
      var iframe = document.querySelector('iframe.giscus-frame');
      if (!iframe || !iframe.contentWindow) return;
      var siteTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: siteTheme === 'dark' ? 'dark' : 'light' } } },
        'https://giscus.app'
      );
    }
    /* تحديث عند تغيير ثيم الموقع */
    new MutationObserver(sendThemeToGiscus).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    /* عند تحميل giscus iframe لأول مرة */
    window.addEventListener('message', function (e) {
      if (e.origin === 'https://giscus.app' && e.data && e.data.giscus) {
        setTimeout(sendThemeToGiscus, 100);
      }
    });
  })();

  /* ── Compact Header on Scroll (mobile) ─────────────────────
     عند التمرير لأكثر من 20px → يضيف class 'compact' على الرأس
     CSS يصغّر الشعار من 30→22px ليُعطي مساحة قراءة أكبر */
  var _siteHeader = document.querySelector('.site-header');
  if (_siteHeader) {
    var _lastCompact = false;
    var _checkCompact = function () {
      var shouldBe = window.scrollY > 20;
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

  /* ── نظام مشاركة المقالات (8 منصات + نسخ النص الكامل) ──── */
  (function () {
    var shareWrap = document.querySelector('.post-share');
    if (!shareWrap) return;

    /* بيانات المشاركة من data-attributes */
    var url     = shareWrap.dataset.shareUrl     || window.location.href;
    var title   = shareWrap.dataset.shareTitle   || document.title;
    var excerpt = shareWrap.dataset.shareExcerpt || '';
    var tags    = shareWrap.dataset.shareTags    || '';
    var isEn    = (document.documentElement.lang || '').startsWith('en');

    /* النص الكامل (للنسخ، Mastodon، Telegram، Instagram، Discord) */
    function buildFullText() {
      var parts = [title];
      if (excerpt) parts.push(excerpt);
      parts.push('🔗 ' + url);
      if (tags) parts.push(tags);
      return parts.join('\n\n');
    }

    /* نص مختصر (لـ X/Twitter — حد 280 حرف).
       الترتيب: عنوان → ملخص (إن وسع) → الرابط → الوسوم (إن وسعت).
       الرابط مضمَّن في النص (لا في &url=) ليأتي بين الملخص والوسوم. */
    function buildShortText() {
      var urlLen = url.length + 4; // \n\n + URL
      var maxLen = 270;
      var t = title;
      var room = maxLen - t.length - urlLen;
      if (excerpt && excerpt.length + 2 < room) {
        t += '\n\n' + excerpt;
        room -= excerpt.length + 2;
      }
      t += '\n\n' + url;
      if (tags && tags.length + 2 < (maxLen - t.length + 20)) {
        t += '\n\n' + tags;
      }
      return t;
    }

    /* إعدادات المنصات المدعومة بـ instance/client */
    var PLATFORMS = {
      mastodon: {
        label: 'Mastodon',
        common: ['mastodon.social', 'fosstodon.org', 'mas.to', 'techhub.social', 'hachyderm.io'],
        default: 'mastodon.social',
        placeholder: 'mastodon.example.com'
      },
      pleroma: {
        label: 'Pleroma',
        common: ['pleroma.social', 'fe.disroot.org', 'spinster.xyz'],
        default: 'pleroma.social',
        placeholder: 'pleroma.example.com'
      },
      nostr: {
        label: 'Nostr',
        common: ['iris.to', 'snort.social', 'primal.net', 'coracle.social', 'nostrudel.ninja'],
        default: 'iris.to',
        placeholder: 'nostr-client.example.com'
      }
    };

    /* جلب الـ instance المحفوظ + حالة الـ "remember" */
    function loadInstance(platform) {
      try {
        var raw = localStorage.getItem('gnt-' + platform + '-instance');
        if (!raw) return null;
        var parts = raw.split('|');
        return { domain: parts[0], remember: parts[1] !== '0' };
      } catch (e) { return null; }
    }
    function saveInstance(platform, domain, remember) {
      if (remember) {
        localStorage.setItem('gnt-' + platform + '-instance', domain + '|1');
      } else {
        localStorage.removeItem('gnt-' + platform + '-instance');
      }
    }

    /* قائمة المنصات المخصصة التي أدخلها المستخدم سابقاً */
    function loadCustomList(platform) {
      try {
        var raw = localStorage.getItem('gnt-' + platform + '-customs');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }
    function addCustom(platform, domain) {
      var list = loadCustomList(platform);
      if (list.indexOf(domain) >= 0) return;     /* موجود مسبقاً */
      list.unshift(domain);                       /* الأحدث أولاً */
      if (list.length > 10) list = list.slice(0, 10);   /* حدّ 10 */
      localStorage.setItem('gnt-' + platform + '-customs', JSON.stringify(list));
    }
    function removeCustom(platform, domain) {
      var list = loadCustomList(platform).filter(function (d) { return d !== domain; });
      localStorage.setItem('gnt-' + platform + '-customs', JSON.stringify(list));
    }

    /* Modal مخصص لاختيار instance */
    function pickInstanceDialog(platform) {
      return new Promise(function (resolve) {
        var cfg = PLATFORMS[platform];
        var saved = loadInstance(platform);
        var customList = loadCustomList(platform);
        var current = saved ? saved.domain : cfg.default;

        function renderOptionRow(domain, deletable) {
          var checked = domain === current ? 'checked' : '';
          var delBtn = deletable
            ? '<button type="button" class="platform-radio-del" data-domain="' + domain +
              '" title="' + (isEn ? 'Remove' : 'حذف') + '">×</button>'
            : '';
          return (
            '<label class="platform-radio">' +
              '<input type="radio" name="_inst" value="' + domain + '" ' + checked + '>' +
              '<span class="platform-radio-dot"></span>' +
              '<span class="platform-radio-label">' + domain + '</span>' +
              delBtn +
            '</label>'
          );
        }

        var commonHtml = cfg.common.map(function (d) { return renderOptionRow(d, false); }).join('');
        var customHtml = customList.length
          ? '<div class="platform-section-label">' +
              (isEn ? 'Your saved options' : 'اختياراتك المحفوظة') +
            '</div>' +
            customList.map(function (d) { return renderOptionRow(d, true); }).join('')
          : '';

        /* هل المحفوظ موجود فعلاً في القوائم؟ */
        var inAnyList = cfg.common.indexOf(current) >= 0 || customList.indexOf(current) >= 0;
        var initialCustomInput = !inAnyList ? current : '';

        var wrap = document.createElement('div');
        wrap.className = 'platform-modal-overlay';
        wrap.innerHTML =
          '<div class="platform-modal">' +
            '<div class="platform-modal-header">' +
              '<i class="fa-solid fa-share-nodes" style="color:var(--gold)"></i>' +
              '<h3>' + (isEn ? 'Pick your ' : 'اختر منصة ') + cfg.label + '</h3>' +
            '</div>' +
            '<p class="platform-modal-sub">' +
              (isEn ? 'Choose a server or add your own (saved for next time):'
                    : 'اختر خادماً أو أضف خاصاً بك (يُحفظ للمرة القادمة):') +
            '</p>' +
            '<div class="platform-options">' +
              commonHtml + customHtml +
              '<label class="platform-radio">' +
                '<input type="radio" name="_inst" value="__custom__" ' +
                       (initialCustomInput ? 'checked' : '') + '>' +
                '<span class="platform-radio-dot"></span>' +
                '<input type="text" id="_inst_custom" class="platform-custom-input" ' +
                       'placeholder="' + cfg.placeholder + '" ' +
                       'value="' + initialCustomInput + '" ' +
                       'dir="ltr">' +
              '</label>' +
            '</div>' +
            '<label class="platform-remember">' +
              '<input type="checkbox" id="_inst_remember" ' +
                     ((saved && saved.remember) ? 'checked' : '') + '>' +
              '<span>' +
                (isEn ? 'Remember my choice (don\'t ask again)' :
                        'تذكَّر اختياري (لا تسألني مجدداً)') +
              '</span>' +
            '</label>' +
            '<div class="platform-modal-actions">' +
              '<button class="platform-btn-gold" id="_inst_ok">' +
                '<i class="fa-solid fa-check"></i> ' +
                (isEn ? 'Continue' : 'متابعة') +
              '</button>' +
              '<button class="platform-btn-ghost" id="_inst_cancel">' +
                (isEn ? 'Cancel' : 'إلغاء') +
              '</button>' +
            '</div>' +
          '</div>';

        document.body.appendChild(wrap);
        var customInp = wrap.querySelector('#_inst_custom');
        customInp.addEventListener('focus', function () {
          wrap.querySelector('input[value="__custom__"]').checked = true;
        });

        /* أزرار حذف الخيارات المخصصة */
        wrap.querySelectorAll('.platform-radio-del').forEach(function (btn) {
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var domain = btn.dataset.domain;
            removeCustom(platform, domain);
            /* احذف الـ row من الـ DOM */
            var row = btn.closest('.platform-radio');
            if (row) row.remove();
          });
        });

        function close(result) {
          wrap.remove();
          resolve(result);
        }

        wrap.querySelector('#_inst_ok').addEventListener('click', function () {
          var picked = wrap.querySelector('input[name="_inst"]:checked');
          if (!picked) return;
          var domain = picked.value === '__custom__'
            ? customInp.value.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
            : picked.value;
          if (!domain) { customInp.focus(); return; }
          var remember = wrap.querySelector('#_inst_remember').checked;

          /* احفظ الإدخال المخصص في القائمة دائماً — حتى لو لم يطلب remember
             يبقى في القائمة المخصصة لاستخدامات لاحقة */
          if (cfg.common.indexOf(domain) < 0) {
            addCustom(platform, domain);
          }

          saveInstance(platform, domain, remember);
          close(domain);
        });
        wrap.querySelector('#_inst_cancel').addEventListener('click', function () {
          close(null);
        });
        wrap.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') close(null);
        });
      });
    }

    /* getInstance — يستخدم المحفوظ أو يفتح Modal */
    async function getInstance(platform, forceAsk) {
      var saved = loadInstance(platform);
      if (saved && saved.remember && !forceAsk) return saved.domain;
      return await pickInstanceDialog(platform);
    }

    /* نسخ للحافظة مع تغذية بصرية على الزر */
    function copyToClipboard(text, btn, msg) {
      var fallbackMsg = msg || (isEn ? '✓ Copied!' : '✓ تم النسخ');
      navigator.clipboard.writeText(text).then(function () {
        if (btn) flashSuccess(btn);
        showToast(fallbackMsg);
      }).catch(function () {
        showToast(isEn ? 'Copy failed — press Ctrl+C' : 'فشل النسخ — اضغط Ctrl+C', true);
      });
    }

    function flashSuccess(btn) {
      var origBg = btn.style.background, origCol = btn.style.color;
      btn.style.background = '#2ea043';
      btn.style.color = '#fff';
      setTimeout(function () {
        btn.style.background = origBg;
        btn.style.color = origCol;
      }, 1200);
    }

    /* Toast بسيط (يستخدم نفس النمط في الموقع) */
    function showToast(text, isError) {
      var existing = document.getElementById('shareToast');
      if (existing) existing.remove();
      var t = document.createElement('div');
      t.id = 'shareToast';
      t.className = 'share-toast' + (isError ? ' is-error' : '');
      t.textContent = text;
      document.body.appendChild(t);
      setTimeout(function () { t.classList.add('show'); }, 10);
      setTimeout(function () { t.classList.remove('show'); setTimeout(function(){t.remove();}, 300); }, 2500);
    }

    /* معالج كل منصة */
    var handlers = {
      x: function () {
        /* URL مضمَّن داخل buildShortText للحفاظ على ترتيب: نص → رابط → وسوم */
        var u = 'https://twitter.com/intent/tweet?text=' +
                encodeURIComponent(buildShortText());
        window.open(u, '_blank', 'noopener');
      },
      facebook: function () {
        /* Facebook لا يقبل نصاً — يقرأ OG من URL */
        var u = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
        window.open(u, '_blank', 'noopener');
      },
      linkedin: function () {
        /* LinkedIn يقرأ OG من URL */
        var u = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
        window.open(u, '_blank', 'noopener');
      },
      telegram: function () {
        var u = 'https://t.me/share/url?url=' + encodeURIComponent(url) +
                '&text=' + encodeURIComponent(buildFullText());
        window.open(u, '_blank', 'noopener');
      },
      mastodon: async function (btn, ev) {
        /* Shift+Click → يفتح Modal لاختيار جديد */
        var inst = await getInstance('mastodon', ev && ev.shiftKey);
        if (!inst) return;
        var u = 'https://' + inst + '/share?text=' + encodeURIComponent(buildFullText());
        window.open(u, '_blank', 'noopener');
      },
      pleroma: async function (btn, ev) {
        var inst = await getInstance('pleroma', ev && ev.shiftKey);
        if (!inst) return;
        var u = 'https://' + inst + '/share?message=' + encodeURIComponent(buildFullText());
        window.open(u, '_blank', 'noopener');
      },
      nostr: async function (btn, ev) {
        var inst = await getInstance('nostr', ev && ev.shiftKey);
        if (!inst) return;
        /* كل واجهة Nostr لها مسار مختلف للنشر */
        var text = encodeURIComponent(buildFullText());
        var u;
        switch (inst) {
          case 'iris.to':            u = 'https://iris.to/post/new?text=' + text; break;
          case 'snort.social':       u = 'https://snort.social/new-note?text=' + text; break;
          case 'primal.net':         u = 'https://primal.net/new?text=' + text; break;
          case 'coracle.social':     u = 'https://coracle.social/notes/new?text=' + text; break;
          case 'nostrudel.ninja':    u = 'https://nostrudel.ninja/n/new?text=' + text; break;
          default:                   u = 'https://' + inst + '/?text=' + text; break;
        }
        window.open(u, '_blank', 'noopener');
      },
      instagram: function (btn) {
        /* Instagram لا يدعم Web Sharing — انسخ النص للمستخدم */
        copyToClipboard(
          buildFullText(),
          btn,
          isEn
            ? '✓ Text copied — paste it in your Instagram post or story'
            : '✓ تم نسخ النص — الصقه في منشور Instagram أو قصة'
        );
      },
      discord: function (btn) {
        /* Discord: نص مع markdown للعنوان */
        var dcText = '**' + title + '**\n\n' + (excerpt ? excerpt + '\n\n' : '') +
                     url + (tags ? '\n\n' + tags : '');
        copyToClipboard(
          dcText,
          btn,
          isEn
            ? '✓ Discord text copied — paste in any channel'
            : '✓ تم نسخ نص Discord — الصقه في أي قناة'
        );
      },
      copy: function (btn) {
        copyToClipboard(
          buildFullText(),
          btn,
          isEn ? '✓ Full article text copied' : '✓ تم نسخ نص المقال كاملاً'
        );
      }
    };

    /* ربط كل الأزرار */
    shareWrap.querySelectorAll('.share-btn[data-platform]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var p = btn.dataset.platform;
        if (handlers[p]) handlers[p](btn, e);
      });
    });
  })();

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

  /* ── Archive Filter + Sort Toggle ──────────────────────────
     قائمة مسطّحة مرتَّبة بالتاريخ. الفلترة تخفي/تُظهر البطاقات،
     والترتيب يعكس ترتيب DOM (Newest ↔ Oldest). */
  var filterBtns   = document.querySelectorAll('.filter-btn:not(.sort-toggle)');
  var archiveGrid  = document.getElementById('archiveGrid');
  var archiveCards = archiveGrid ? Array.from(archiveGrid.querySelectorAll('.article-card')) : [];
  var archiveEmpty = document.getElementById('archiveEmpty');
  var sortBtn      = document.getElementById('archiveSortBtn');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      var visible = 0;
      archiveCards.forEach(function (card) {
        var cat = card.dataset.category;
        var alsoIn = (card.dataset.alsoIn || '').split(' ').filter(Boolean);
        var show = f === 'all' || cat === f || alsoIn.indexOf(f) >= 0;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (archiveEmpty) archiveEmpty.hidden = visible > 0;
    });
  });

  if (sortBtn && archiveGrid) {
    var isDesc = true;
    var descLbl = sortBtn.querySelector('[data-sort="desc"]');
    var ascLbl  = sortBtn.querySelector('[data-sort="asc"]');
    sortBtn.addEventListener('click', function () {
      isDesc = !isDesc;
      /* عكس ترتيب DOM — يُطبّق على كل البطاقات بغضّ النظر عن الفلتر */
      var reordered = archiveCards.slice().reverse();
      archiveCards = reordered;
      var frag = document.createDocumentFragment();
      reordered.forEach(function (c) { frag.appendChild(c); });
      archiveGrid.appendChild(frag);
      if (descLbl) descLbl.hidden = !isDesc;
      if (ascLbl)  ascLbl.hidden  =  isDesc;
    });
  }

  /* ── قائمة مشاركة على بطاقات المقالات ───────────────────
     زر صغير على البطاقة → popup بـ5 منصات + نسخ الرابط.
     يمنع تفعيل رابط المقال (stopPropagation + preventDefault). */
  var openCardMenu = null;
  function closeCardMenu() {
    if (openCardMenu) { openCardMenu.remove(); openCardMenu = null; }
  }

  function buildCardShareText(title, excerpt, url, tags) {
    var parts = [title];
    if (excerpt) parts.push(excerpt);
    parts.push('🔗 ' + url);
    if (tags) parts.push(tags);
    return parts.join('\n\n');
  }

  function openCardShareMenu(btn) {
    closeCardMenu();
    var url     = btn.dataset.shareUrl;
    var title   = btn.dataset.shareTitle   || document.title;
    var excerpt = btn.dataset.shareExcerpt || '';
    var tags    = btn.dataset.shareTags    || '';
    var isEn    = (document.documentElement.lang || '').startsWith('en');

    var menu = document.createElement('div');
    menu.className = 'card-share-menu';
    menu.innerHTML =
      '<button data-p="x" title="X (Twitter)"><i class="fa-brands fa-x-twitter"></i>X</button>' +
      '<button data-p="fb" title="Facebook"><i class="fa-brands fa-facebook-f"></i>FB</button>' +
      '<button data-p="li" title="LinkedIn"><i class="fa-brands fa-linkedin-in"></i>LI</button>' +
      '<button data-p="tg" title="Telegram"><i class="fa-brands fa-telegram"></i>TG</button>' +
      '<button data-p="ws" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i>WA</button>' +
      '<button data-p="copy" title="' + (isEn ? 'Copy link' : 'نسخ الرابط') + '"><i class="fa-solid fa-copy"></i>' + (isEn ? 'Copy' : 'نسخ') + '</button>';
    document.body.appendChild(menu);
    openCardMenu = menu;

    /* موضع القائمة قريباً من الزر */
    var r = btn.getBoundingClientRect();
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    var top = r.top - mh - 8;
    if (top < 8) top = r.bottom + 8;
    var left = r.left + (r.width / 2) - (mw / 2);
    if (left < 8) left = 8;
    if (left + mw > innerWidth - 8) left = innerWidth - mw - 8;
    menu.style.top  = top  + 'px';
    menu.style.left = left + 'px';

    menu.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      ev.preventDefault(); ev.stopPropagation();
      var p = b.dataset.p;
      var short = title + (excerpt ? '\n\n' + excerpt : '') + '\n\n' + url + (tags ? '\n\n' + tags : '');
      if (p === 'x') {
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(short), '_blank', 'noopener');
      } else if (p === 'fb') {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'noopener');
      } else if (p === 'li') {
        window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url), '_blank', 'noopener');
      } else if (p === 'tg') {
        window.open('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(buildCardShareText(title, excerpt, url, tags)), '_blank', 'noopener');
      } else if (p === 'ws') {
        window.open('https://wa.me/?text=' + encodeURIComponent(buildCardShareText(title, excerpt, url, tags)), '_blank', 'noopener');
      } else if (p === 'copy') {
        var textToCopy = buildCardShareText(title, excerpt, url, tags);
        if (navigator.clipboard) navigator.clipboard.writeText(textToCopy);
        var t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#000;color:#fff;padding:10px 18px;border-radius:6px;z-index:1000;font-size:.85rem;box-shadow:0 4px 12px rgba(0,0,0,.4)';
        t.textContent = isEn ? '✓ Link copied' : '✓ نُسخ الرابط';
        document.body.appendChild(t);
        setTimeout(function(){ t.remove(); }, 2000);
      }
      closeCardMenu();
    });
  }

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('.card-share-btn');
    if (btn) {
      ev.preventDefault(); ev.stopPropagation();
      openCardShareMenu(btn);
      return;
    }
    if (openCardMenu && !ev.target.closest('.card-share-menu')) closeCardMenu();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeCardMenu();
  });
  window.addEventListener('scroll', closeCardMenu, { passive: true });

})();
