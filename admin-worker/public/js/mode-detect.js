/* mode-detect.js
 * يفحص /api/mode عند تحميل الصفحة:
 *  - يضع <body data-mode="remote"> لاستعمالها في CSS لإخفاء أزرار الكتابة
 *  - يُضيف شارة "وضع بعيد — قراءة فقط" بجانب AR/EN في topbar
 *  - يُعدّل عنوان التبويب
 *
 * يعمل قبل admin.js مباشرةً.
 */
(async () => {
  try {
    const r = await fetch('/api/mode');
    if (!r.ok) return;
    const m = await r.json();
    if (m.mode !== 'remote') return;

    document.body.dataset.mode = 'remote';
    document.body.dataset.phase = String(m.phase || 1);
    if (m.readOnly) document.body.dataset.readonly = 'true';

    // عنوان التبويب
    document.title = '🌐 GT-NEWSTECH (بعيد) — قراءة فقط';

    // شارة في topbar
    const insertBadge = () => {
      const ta = document.querySelector('.topbar-actions');
      if (!ta || document.getElementById('remoteBadge')) return;
      const badge = document.createElement('span');
      badge.id = 'remoteBadge';
      badge.className = 'remote-badge';
      badge.innerHTML = '<i class="fa-solid fa-cloud"></i> وضع بعيد — قراءة فقط';
      badge.title = 'هذه اللوحة تقرأ من GitHub عبر Cloudflare Worker. التعديلات تتم من اللوحة المحلية أو في المرحلة 2.';
      ta.prepend(badge);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', insertBadge);
    } else {
      insertBadge();
    }
  } catch (_) { /* لا تكسر التحميل لو فشل /api/mode */ }
})();
