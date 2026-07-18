# MeterVerse Internationalization Architecture
**Date:** 2026-07-17 | **Status:** Draft

---

## Decision: next-intl vs next-i18next

| Criteria | next-intl | next-i18next |
|----------|-----------|--------------|
| **Stars** | 5,500+ | 900+ |
| **Next.js App Router** | ✅ Native | ❌ Pages Router only |
| **RTL Support** | ✅ Built-in | ⚠️ Manual |
| **Server Components** | ✅ Full support | ❌ Client-only |
| **Middleware** | ✅ Built-in | ⚠️ Manual |
| **Formatting** | ✅ Dates, numbers, currencies, relative time | ⚠️ Requires addons (intl) |
| **Plural Rules** | ✅ ICU syntax | ✅ ICU syntax |
| **Lazy Loading** | ✅ Automatic | ⚠️ Manual |
| **Type Safety** | ✅ TypeScript messages | ❌ No types |
| **Bundle Size** | ~5KB | ~15KB |
| **Arabic Support** | ✅ Excellent | ⚠️ Partial |
| **Active Maintenance** | ✅ 2026 active | ⚠️ Slower |

**RECOMMENDED: next-intl** — It's the only i18n library with first-class Next.js App Router support, built-in RTL handling, and full Server Component compatibility.

---

## Architecture

```
src/
├── messages/
│   ├── en.json              # English translations
│   ├── ar.json              # Arabic translations
│   └── index.ts             # Message type generation
├── i18n/
│   ├── routing.ts           # Locale routing config
│   ├── request.ts           # Server-side locale detection
│   └── config.ts            # Locale list, default, settings
├── middleware.ts            # Locale detection + redirect
├── app/
│   ├── [locale]/            # Locale-based routing
│   │   ├── layout.tsx       # Locale-aware root layout
│   │   └── dashboard/       # Dashboard pages (localized)
│   └── page.tsx             # Redirect to /en/dashboard
└── components/
    ├── locale-switcher.tsx  # Language switcher dropdown
    └── providers.tsx        # NextIntlClientProvider
```

---

## Message File Structure

### `messages/en.json`
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "search": "Search",
    "loading": "Loading...",
    "noResults": "No results found",
    "error": "Something went wrong"
  },
  "nav": {
    "dashboard": "Dashboard",
    "customers": "Customers",
    "meters": "Meters",
    "invoices": "Invoices",
    "readings": "Readings",
    "tariffs": "Tariffs",
    "payments": "Payments",
    "reports": "Reports",
    "settings": "Settings",
    "admin": "Administration"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "signOut": "Sign Out",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?"
  },
  "workspace": {
    "selectArea": "Select Area",
    "selectOrganization": "Select Organization",
    "selectProject": "Select Project",
    "october": "October",
    "newCairo": "New Cairo",
    "sodic": "SODIC"
  },
  "sidebar": {
    "expand": "Expand sidebar",
    "collapse": "Collapse sidebar",
    "dock": "Dock mode",
    "search": "Search pages and actions",
    "notifications": "Notifications",
    "aiAssistant": "AI Assistant"
  }
}
```

### `messages/ar.json` (Arabic)
```json
{
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "search": "بحث",
    "loading": "جارٍ التحميل...",
    "noResults": "لا توجد نتائج",
    "error": "حدث خطأ ما"
  },
  "nav": {
    "dashboard": "لوحة القيادة",
    "customers": "العملاء",
    "meters": "العدادات",
    "invoices": "الفواتير",
    "readings": "القراءات",
    "tariffs": "التعريفات",
    "payments": "المدفوعات",
    "reports": "التقارير",
    "settings": "الإعدادات",
    "admin": "الإدارة"
  },
  "auth": {
    "signIn": "تسجيل الدخول",
    "signUp": "إنشاء حساب",
    "signOut": "تسجيل الخروج",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "forgotPassword": "نسيت كلمة المرور؟"
  },
  "sidebar": {
    "expand": "توسيع الشريط الجانبي",
    "collapse": "طي الشريط الجانبي"
  }
}
```

---

## Middleware (Locale Detection)

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always', // /en/dashboard, /ar/dashboard
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

---

## RTL Handling

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { getDirection } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
  direction: locale === 'ar' ? 'rtl' : 'ltr',
}));

// Usage in layout:
// <html dir={direction} lang={locale}>
```

---

## Number & Date Formatting

```typescript
// Automatic via next-intl:
import { useFormatter } from 'next-intl';

function Component() {
  const format = useFormatter();
  
  return (
    <>
      <p>{format.number(1234567.89, { style: 'currency', currency: 'EGP' })}</p>
      <p>{format.dateTime(new Date(), { dateStyle: 'long' })}</p>
      <p>{format.relativeTime(new Date().getTime() - 3600000)}</p>
    </>
  );
}
```

---

## No Hardcoded Strings Rule

**ENFORCED:** All user-facing strings must use `next-intl`'s `t()` function.

```typescript
// ❌ WRONG
<Button>Save Changes</Button>

// ✅ RIGHT  
import { useTranslations } from 'next-intl';
const t = useTranslations('common');
<Button>{t('save')}</Button>
```

**Exception:** Technical strings (ARIA labels, data attributes, error codes) may remain untranslated.

---

## Migration Plan (from current English-only)

| Step | Task | Effort |
|------|------|--------|
| 1 | Install next-intl | 5 min |
| 2 | Create message files (en.json, ar.json) | 2h |
| 3 | Setup middleware with locale routing | 30 min |
| 4 | Move app pages under [locale] | 1h |
| 5 | Create locale switcher component | 30 min |
| 6 | Replace hardcoded strings in layout/sidebar | 2h |
| 7 | Replace hardcoded strings in all pages | 4h |
| 8 | Fix RTL issues in shadcn components | 3h |
| 9 | Test both locales for all pages | 2h |
| 10 | Arabic proofreading | 2h |

**Total estimated effort: ~17 hours**
