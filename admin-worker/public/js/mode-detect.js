/* mode-detect.js
 * يكتشف وضع التشغيل (محلي vs بعيد) ويُحدّث الواجهة وفقاً لذلك.
 *  - <body data-mode="remote"> لإخفاء التبويبات غير المتاحة في الوضع البعيد
 *  - شارة "بعيد" في الـ topbar
 *  - عنوان التبويب
 *
 * المرحلة 2: الكتابة مفعّلة، فقط Git/Remotes/Trash/Security تبقى مخفية
 *           (Trash/Security ستُفعَّل في المرحلة 2.5/3)
 */
(async () => {
  try {
    const r = await fetch('/api/mode');
    if (!r.ok) return;
    const m = await r.json();
    if (m.mode !== 'remote') return;

    document.body.dataset.mode = 'remote';
    document.body.dataset.phase = String(m.phase || 2);
    if (m.readOnly) document.body.dataset.readonly = 'true';

    // عنوان التبويب
    document.title = '☁ GT-NEWSTECH (بعيد)';

    // شارة في topbar
    const insertBadge = () => {
      const ta = document.querySelector('.topbar-actions');
      if (!ta || document.getElementById('remoteBadge')) return;
      const badge = document.createElement('span');
      badge.id = 'remoteBadge';
      badge.className = 'remote-badge';
      badge.innerHTML = '<i class="fa-solid fa-cloud"></i> وضع بعيد';
      badge.title = 'هذه اللوحة تعمل على Cloudflare Worker. الكتابة عبر GitHub API مباشرةً.';
      ta.prepend(badge);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', insertBadge);
    } else {
      insertBadge();
    }

    // ── إصلاح timezone للتاريخ ──
    // admin.js يرسل "YYYY-MM-DD HH:MM:SS" كوقت محلي (بدون منطقة).
    // الـ Worker يعمل في UTC. التحويل عبر toISOString يفقد دقة DST في بعض الحالات.
    // الحل: نحفظ التاريخ بـ wall-clock للمستخدم مع offset متصفحه صراحةً:
    //   "2026-06-05T18:16:00+0200"
    // - Jekyll يفهم timestamp مع offset → دقيق دائماً
    // - Worker normalizeDate يُبقي offset كما هو
    // - parseDatetime في admin.js يكتشف ISO ويعرضه محلياً عند التحرير
    const pad = n => String(n).padStart(2, '0');
    const origFetch = window.fetch.bind(window);
    window.fetch = async function (input, init = {}) {
      const url = typeof input === 'string' ? input : (input?.url || '');
      const method = (init.method || 'GET').toUpperCase();
      const isArticleWrite = (method === 'POST' || method === 'PUT')
                          && /^\/api\/article(\?|$)/.test(url);
      if (isArticleWrite && init.body && typeof init.body === 'string') {
        try {
          const body = JSON.parse(init.body);
          if (body.date && typeof body.date === 'string') {
            const m = body.date.trim()
              .match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
            // نُحوّل فقط لو ليست ISO Z/offset بالفعل
            if (m && !/Z$|[+-]\d{2}:?\d{2}$/.test(body.date)) {
              const y = +m[1], mo = +m[2], d = +m[3];
              const hh = +(m[4] || 0), mm = +(m[5] || 0), ss = +(m[6] || 0);
              // offset الفعلي للوقت المحدّد (يعتبر DST تلقائياً)
              const refDate = new Date(y, mo - 1, d, hh, mm, ss);
              const offMin = -refDate.getTimezoneOffset(); // مثال +120 لـ UTC+2
              const sign = offMin >= 0 ? '+' : '-';
              const absOff = Math.abs(offMin);
              const offH = pad(Math.floor(absOff / 60));
              const offM = pad(absOff % 60);
              body.date = `${y}-${pad(mo)}-${pad(d)}T${pad(hh)}:${pad(mm)}:${pad(ss)}${sign}${offH}${offM}`;
              init = { ...init, body: JSON.stringify(body) };
            }
          }
        } catch { /* تجاهل، أرسل كما هي */ }
      }
      return origFetch(input, init);
    };
  } catch (_) { /* لا تكسر التحميل لو فشل /api/mode */ }
})();
