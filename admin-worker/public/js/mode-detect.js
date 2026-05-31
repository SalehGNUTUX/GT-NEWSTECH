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
  } catch (_) { /* لا تكسر التحميل لو فشل /api/mode */ }
})();
