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
    // اللوحة المحلية ترسل "YYYY-MM-DD HH:MM:SS" كوقت محلي،
    // الـ Worker يعمل في UTC ولا يعرف timezone المتصفح.
    // نعترض POST/PUT لـ /api/article ونُحوّل التاريخ إلى ISO UTC.
    // (parseDatetime في admin.js يعرف كيف يقرأ ISO ويعرضه محلياً عند التحرير)
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
            // نُحوّل فقط لو ليست ISO Z بالفعل (لا تحتوي Z أو offset)
            if (m && !/Z$|[+-]\d{2}:?\d{2}$/.test(body.date)) {
              const local = new Date(
                +m[1], +m[2] - 1, +m[3],
                +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)
              );
              body.date = local.toISOString(); // → "YYYY-MM-DDTHH:MM:SS.sssZ"
              init = { ...init, body: JSON.stringify(body) };
            }
          }
        } catch { /* تجاهل، أرسل كما هي */ }
      }
      return origFetch(input, init);
    };
  } catch (_) { /* لا تكسر التحميل لو فشل /api/mode */ }
})();
