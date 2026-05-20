# دليل تفعيل Giscus (التعليقات والتفاعلات)

> هذا الدليل يشرح **خطوات لمرة واحدة فقط** لتفعيل Giscus على GT-NEWSTECH.
> بعدها تظهر التعليقات والتفاعلات تلقائياً في أسفل كل مقال.

---

## ١. تفعيل Discussions في GitHub

1. افتح: https://github.com/SalehGNUTUX/GT-NEWSTECH/settings
2. انزل إلى قسم **Features** (في القائمة الجانبية أو منتصف الصفحة)
3. فعّل ✅ **Discussions**
4. ستظهر تبويبة "Discussions" في أعلى المستودع

---

## ٢. تثبيت تطبيق Giscus على المستودع

1. افتح: **https://github.com/apps/giscus**
2. اضغط **Install** (أو **Configure** إذا كان مثبتاً)
3. اختر حسابك **SalehGNUTUX**
4. اختر **Only select repositories** → **GT-NEWSTECH**
5. اضغط **Install** أو **Save**

---

## ٣. إعداد Discussions Category

1. اذهب إلى تبويب **Discussions** في المستودع:
   https://github.com/SalehGNUTUX/GT-NEWSTECH/discussions

2. في القائمة الجانبية، اضغط **Categories** ثم **New category**

3. أنشئ تصنيفاً جديداً (أو استخدم Announcements الموجود):
   - **Title:** `Announcements`
   - **Description:** `Comments from GT-NEWSTECH website`
   - **Discussion format:** **Announcement** (مهم — يمنع المستخدمين من إنشاء نقاشات يدوياً)

---

## ٤. الحصول على Repo-ID و Category-ID

1. افتح: **https://giscus.app**
2. حدد اللغة في الأعلى: **العربية** (لمعاينة الإعداد بالعربية)
3. في حقل **Repository**: اكتب `SalehGNUTUX/GT-NEWSTECH`
   - يجب أن يظهر ✅ أخضر مع رسالة "Success! This repository meets all of the above criteria"
   - إذا ظهر ❌، راجع الخطوات ١-٢ أعلاه

4. في **Page ↔️ Discussions Mapping**: اختر **Discussion title contains page pathname**

5. في **Discussion Category**: اختر `Announcements` (الذي أنشأته في الخطوة 3)

6. في **Features**: تأكد ✅ من **Enable reactions for the main post**

7. **Theme**: اختر `Default (light)` (سيتغير ديناميكياً مع ثيم الموقع)

8. انزل إلى قسم **Enable giscus** ستجد قطعة كود `<script>` فيها:
   ```html
   data-repo-id="R_kgD0xxxxxx"
   data-category-id="DIC_kwD0xxxxxx"
   ```
   انسخ القيمتين.

---

## ٥. وضع القيم في الكود

افتح ملف:
```
_includes/giscus.html
```

ابحث عن السطرين:
```html
data-repo-id="REPLACE_ME_REPO_ID"
data-category-id="REPLACE_ME_CATEGORY_ID"
```

استبدلهما بالقيم الحقيقية من الخطوة 4:
```html
data-repo-id="R_kgD0xxxxxx"
data-category-id="DIC_kwD0xxxxxx"
```

---

## ٦. ارفع التغيير

```bash
git add _includes/giscus.html
git commit -m "feat: تفعيل Giscus بـ IDs الحقيقية"
git push origin main
```

أو من لوحة التحكم المحلية: **Git → Commit & Push**.

---

## ٧. التحقق

1. انتظر ~دقيقة لـ GitHub Actions
2. افتح أي مقال على الموقع
3. انزل لأسفل المقال — يجب أن ترى:
   - قسم **"التفاعلات والتعليقات"** بخلفية ذهبية
   - زر **"Sign in with GitHub"** أو ردود فعل (👍❤️🎉)
   - مربع التعليق (بعد تسجيل الدخول)

إذا لم يظهر شيء، افتح Console (F12) وابحث عن أخطاء.

---

## كيف يعمل النظام

```
زائر يفتح مقال
       ↓
JS من giscus.app يحمّل widget
       ↓
يبحث في GitHub Discussions عن نقاش بنفس pathname
       ↓
إن وُجد: يعرض التعليقات والتفاعلات
إن لم يوجد: يُنشئ نقاشاً جديداً عند أول تعليق
       ↓
الزائر يضغط 👍 أو يعلّق
       ↓
يحتاج Login بـ GitHub لأول مرة فقط
       ↓
التعليق/التفاعل يُحفظ في GitHub Discussions
```

---

## النسخ الاحتياطي للتعليقات

البيانات تُخزَّن في GitHub Discussions. **تصدير دوري** (اختياري):

```bash
# ثبت GitHub CLI أولاً: https://cli.github.com
gh auth login

# صدّر كل النقاشات (تشمل التعليقات والتفاعلات)
gh api graphql -f query='
{
  repository(owner: "SalehGNUTUX", name: "GT-NEWSTECH") {
    discussions(first: 100) {
      nodes {
        title
        body
        author { login }
        createdAt
        comments(first: 100) {
          nodes { author { login } body createdAt }
        }
        reactions(first: 50) {
          nodes { content user { login } }
        }
      }
    }
  }
}' > backups/discussions-$(date +%Y%m%d).json
```

---

## الإدارة والإشراف

كصاحب المستودع، تستطيع:
- **حذف تعليق:** اذهب للنقاش → علِّم التعليق كـ Off-topic أو احذفه
- **حظر مستخدم:** Settings → Moderation
- **قفل نقاش:** من تبويب Discussions → اضغط Lock conversation
- **تثبيت تعليق ممتاز:** Mark as answer

---

## أسئلة شائعة

**س: هل يمكن التعليق بدون حساب GitHub؟**
ج: لا — Giscus يتطلب GitHub login. للسماح بتعليقات مفتوحة (اسم + بريد) تحتاج نظاماً مختلفاً (Worker مخصص).

**س: ماذا لو نقلت الموقع لـ Cloudflare Pages؟**
ج: التعليقات ستبقى تعمل تلقائياً — مكان استضافة الموقع لا يؤثر، فقط مكان البيانات (وهي GitHub).

**س: هل يمكن حذف Giscus لاحقاً؟**
ج: نعم — احذف include من post.html. التعليقات تبقى محفوظة في Discussions.

**س: هل يدعم RTL والعربية؟**
ج: نعم — `data-lang="ar"` يفعّل الواجهة العربية مع RTL.

**س: كم تكلفته؟**
ج: مجاني تماماً — مفتوح المصدر، بدون حدود استخدام.

---

## رابط سريع

- موقع Giscus: https://giscus.app
- إعدادات Discussions: https://github.com/SalehGNUTUX/GT-NEWSTECH/settings/options
- مشاهدة التعليقات: https://github.com/SalehGNUTUX/GT-NEWSTECH/discussions
