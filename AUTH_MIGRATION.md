# Auth migration (remove NextAuth, use backend JWT)

## What changed
- Added a token-based client helper that logs in via your backend and stores `accessToken` / `refreshToken` in cookies.
- Replaced `next-auth` session checks in route guards with cookie-based checks.
- Updated the login page to call your backend `/auth/login` endpoint and then redirect.
- Updated the user dropdown to call your backend `/auth/logout` endpoint and then redirect to login.
- Removed the NextAuth provider wrapper and deleted NextAuth-only route/config files.

## Files modified/added
- `src/libs/backendAuth.ts` (new): `loginWithBackend`, `logoutWithBackend`, cookie + localStorage helpers, and JWT payload decoding.
- `src/views/Login.tsx`: submit now calls `loginWithBackend` (POST `/auth/login`) and redirects on success.
- `src/components/layout/shared/UserDropdown.tsx`: removed `next-auth` usage; now shows user email from decoded token/localStorage and logs out via backend.
- `src/hocs/AuthGuard.tsx`: now checks the presence of `accessToken` cookie to allow access.
- `src/hocs/GuestOnlyRoute.tsx`: now redirects logged-in users based on the `accessToken` cookie.
- `src/components/Providers.tsx`: removed `NextAuthProvider` wrapper.
- `package.json`: removed `next-auth` and `@auth/prisma-adapter` dependencies.

## Files deleted
- `src/libs/auth.ts`
- `src/contexts/nextAuthProvider.tsx`
- `src/app/api/auth/[...nextauth]/route.ts`

## Required env / expectations
- `NEXT_PUBLIC_API_URL` must point to your backend base that already includes `/api/v1` (example: `http://localhost:8000/api/v1`), because the frontend calls:
  - `POST ${NEXT_PUBLIC_API_URL}/auth/login`
  - `POST ${NEXT_PUBLIC_API_URL}/auth/logout`
- Optional: `NEXT_PUBLIC_DEFAULT_SHOP_ID` — prefills shop ID on ecommerce product pages.

---

## Axios + refresh + ecommerce products (later update)

**What:** Global axios instance attaches `Authorization: Bearer <accessToken>` from cookies. On `401`, it calls `/auth/refresh`, saves new tokens, retries the same request once. Redirects to login if refresh fails.

**Ecommerce UI:** API-backed catalog lives under **`/[lang]/apps/ecommerce/products/...`** (inside dashboard `apps`): `list` (catalog), `add`, `[id]` (detail/variants), `options` (variant options/values). Uses TanStack Query + `api` client.

**Backend tweak:** `getProductById` / mobile now include `variantOptionValues` on variants so the admin UI can show assigned options.

**Files touched**
- `src/libs/api.ts` — axios + interceptors
- `src/libs/backendAuth.ts` — `persistAuthTokens()` (shared with login + refresh)
- `src/api/ecommerce/productTypes.ts`, `productsApi.ts` — product API wrappers
- `src/hooks/ecommerce/useEcommerceProducts.ts` — queries/mutations
- `src/views/ecommerce/products/*` — UI
- `src/app/[lang]/(dashboard)/(private)/apps/ecommerce/products/**` — pages (`list`, `add`, `[id]`, `options`)
- `src/providers/ReactQueryProvider.tsx` — import order
- `ecommerce_back/src/services/product.service.ts` — include variant option values on product detail

---

## Ecommerce routes under Apps + sidebar (update)

**What:** Moved API product admin from standalone `/ecommerce/products` into **`/apps/ecommerce/products`** next to the template eCommerce app. **List** and **Add** pages now render the backend-connected views. Sidebar / horizontal menu / `verticalMenuData` / `horizontalMenuData` include **Variant options** → `/apps/ecommerce/products/options`. Search palette includes the same route.

**Files changed**
- `src/app/[lang]/(dashboard)/(private)/apps/ecommerce/products/list/page.tsx` — `ProductsListView`
- `src/app/[lang]/(dashboard)/(private)/apps/ecommerce/products/add/page.tsx` — `ProductAddView`
- `src/app/[lang]/(dashboard)/(private)/apps/ecommerce/products/[id]/page.tsx` — `ProductDetailView`
- `src/app/[lang]/(dashboard)/(private)/apps/ecommerce/products/options/page.tsx` — `VariantOptionsView`
- Removed old `(private)/ecommerce/products/**` route files
- `src/views/ecommerce/products/EcommerceProductsNav.tsx`, `ProductsListView.tsx`, `ProductAddView.tsx` — links use `/apps/ecommerce/products/...`
- `src/data/navigation/verticalMenuData.tsx`, `horizontalMenuData.tsx` — Variant options entry
- `src/components/layout/vertical/VerticalMenu.tsx`, `horizontal/HorizontalMenu.tsx` — same
- `src/data/dictionaries/en.json`, `fr.json`, `ar.json` — `navigation.variantOptions`
- `src/data/searchData.ts` — search entry for variant options
