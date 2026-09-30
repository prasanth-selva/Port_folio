# Security Assessment — nest.lunablaze.in

**Date:** 2026-09-30
**Scope:** `https://nest.lunablaze.in/` (frontend) and `https://e-com-backend-cxjb.onrender.com/` (API backend)
**Authorization:** Written permission from owner
**Methodology:** Read-only, unauthenticated probing only. No account creation, no writes (POST/PUT/PATCH/DELETE), no destructive actions, no purchases. All tests used plain `curl` with GET/OPTIONS/HEAD plus static analysis of the publicly served JavaScript bundle. (Requested "HexStrike MCP" tooling was not available in this environment; equivalent manual checks were performed.)
**Application identified:** "e-com-frontend" — Vite/React SPA on Vercel, Express API on Render behind Cloudflare, Cloudflare R2 for media, Razorpay referenced for payments.

---

## Executive summary

The application is in good shape for its auth core: every admin and user route correctly rejects unauthenticated access with uniform 401s, input validation is strict (Zod-style, on every public parameter), no secrets leak through the client bundle, no source maps or config files are exposed, and the API ships a solid header set.

The most significant risk is client-side token storage: the SPA keeps **access and refresh JWTs in `localStorage`**, and the frontend serves **no Content-Security-Policy** — so a single XSS anywhere in the app yields full account takeover (including admin accounts), with tokens surviving browser restarts.

| # | Finding | Severity |
|---|---------|----------|
| F1 | Access + refresh JWTs stored in `localStorage` | **High** (standalone Medium) |
| F2 | Missing security headers on frontend (CSP, frame-ancestors, nosniff, referrer-policy) | **Medium** |
| F3 | Wildcard CORS (`*`) with all methods on authenticated API | **Low** (Medium if cookies adopted) |
| F4 | Public product API exposes exact per-variant stock quantities and SKUs | **Low** |
| F5 | Login brute-force protection unverifiable (read-only scope) | **Info / verify** |
| F6 | Refresh-token rotation/reuse-detection unverifiable | **Info / verify** |
| F7 | Housekeeping: no `robots.txt`, no `security.txt` | **Info** |

---

## Detailed findings

### F1 — JWT access and refresh tokens stored in `localStorage` — **High**

**Evidence** (from the public bundle `assets/index-D1FqQLwj.js`):

```js
const Id = "ecom_access_token"/*, Jd = "ecom_profile"*/;
function Ad(a, l) {
  localStorage.setItem(Id, a.accessToken),
  a.refreshToken && localStorage.setItem(Jd, JSON.stringify(l))  // refresh persisted
}
```

The auth flow (`/auth/login`, `/auth/refresh`, `/auth/me`) returns access + refresh tokens; both are persisted in `localStorage` and replayed from it on boot.

**Impact:** Any XSS in the SPA (a compromised dependency, an injected review field rendered unsafely, a malicious admin-time upload) exfiltrates *both* tokens. The refresh token outlives the tab, so theft is persistent — the attacker keeps a session alive past password change unless refresh tokens are server-side revocable and rotated. Admin tokens in `/admin` escalate this to full store compromise (orders, customers, audit logs, catalog, uploads).

**Remediation:**
1. Move refresh tokens to `httpOnly; Secure; SameSite=Lax` cookies scoped to the API; keep only a short-lived access token in memory (never `localStorage`).
2. Implement refresh-token rotation with reuse detection (revoke family on replay).
3. Add short access-token TTL (≤ 15 min).
4. Deploy CSP (see F2) as a compensating control now.

### F2 — Missing security headers on the frontend — **Medium**

`https://nest.lunablaze.in/` response headers include only `strict-transport-security` (no `includeSubDomains`) on Vercel. Absent:

- `Content-Security-Policy` — no script-source restrictions; combined with F1 this makes token theft trivial if any injection exists.
- `X-Frame-Options` / `frame-ancestors` — clickjacking of checkout/admin actions is possible.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`

Notably, the owner's other project (the portfolio repo in this workspace) sets a strict CSP, HSTS with preload, and `frame-ancestors 'none'` — the same should be applied here.

**Remediation:** In `vercel.json` (or host config):

```
Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' https://e-com-backend-cxjb.onrender.com; img-src 'self' https://pub-a1315453a27146d2a04dd2e171650f8c.r2.dev data:; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

(Start CSP in report-only mode and tighten from observed violations.)

### F3 — Wildcard CORS with all methods — **Low** (Medium if/when cookies are adopted)

`OPTIONS` to the API answers:

```
access-control-allow-origin: *
access-control-allow-methods: GET,HEAD,PUT,PATCH,POST,DELETE
```

Today this mainly lets any website read the public catalog from a victim's browser context — low impact. **However**, the moment auth moves to cookies (the F1 fix), wildcard CORS + cross-site requests becomes a credential exposure vector unless `Access-Control-Allow-Credentials` is carefully avoided and origins are allow-listed.

**Remediation:** Allow-list the frontend origin(s) only; echo credentials only for those origins. Restrict allowed methods to what the API actually implements per route.

### F4 — Public over-exposure of inventory data — **Low**

`GET /products/{id}` returns, per variant, the exact `stockQuantity` (e.g. `89`, `40`) and internal SKUs (`ORG-SOAP-100`). Competitors and scrapers can track sell-through in real time; SKU enumeration aids price-comparison scraping.

**Remediation:** Return an availability status (`in_stock` / `low_stock` / `out_of_stock`) or a banded quantity instead of exact counts on the public endpoint; keep exact stock in admin-only responses.

### F5 — Login brute-force protection unverified — **Info (verify)**

`POST /auth/login` and `/auth/admin/login` were not exercised (would require sending credentials = write/active beyond the agreed read-only scope). The API does send `ratelimit-limit: 100` per minute globally, which helps, but dedicated per-IP/per-account limits and lockout on `/auth/admin/login` should be confirmed by the owner (e.g., ensure `express-rate-limit` with stricter windows on auth routes, plus exponential backoff).

### F6 — Refresh-token lifecycle unverified — **Info (verify)**

`GET /auth/refresh` → 404 (route is likely POST-only, which is correct). Whether refresh tokens are rotated on use, have server-side revocation (logout-all, password change), and reuse detection could not be confirmed read-only. Owner should verify — this directly limits the blast radius of F1.

### F7 — Housekeeping — **Info**

- No `robots.txt` on the frontend (404) — cosmetic, but add one.
- No `/.well-known/security.txt` — recommended so researchers can report safely.

---

## What was tested and is solid ✅

- **Auth middleware:** every `/admin/*`, `/orders`, `/cart`, `/returns/me`, `/reviews/me`, `/auth/me` route returns a uniform `401 {"success":false,"message":"Unauthorized"}` — no leaks, no differing errors, no accidental public access found via GET.
- **Forged/malformed tokens** (`garbage`, tampered JWT with `role: admin`): rejected with identical messages; no oracle, no stack traces, no debug output.
- **Input validation:** `page`, `limit`, `sort`, `minPrice` all validated (Zod-style) with structured `400` responses; `999999`, `-1`, `abc`, `1e309`, and SQL-looking strings all handled cleanly.
- **Secret hygiene:** no API keys/JWTs/AWS/Google/Razorpay keys in the bundle; no `.map` sourcemaps; no `/.env`, `/.git/config`, backup files; runtime `/env-config.js` contains no secrets.
- **XSS sinks:** no application use of `dangerouslySetInnerHTML`/`innerHTML` in the bundle (all matches are React internals).
- **API headers:** helmet-style set present (`nosniff`, `X-Frame-Options`, COOP/CORP, HSTS, referrer-policy) plus rate limiting.
- **Public data shapes:** products/categories/hero responses are lean; IDs are UUIDs (non-enumerable); no PII in public responses.

---

## Limitations of this assessment

- Read-only scope per authorization: no account creation, so **IDOR, privilege escalation, order/payment manipulation, review abuse, and upload flaws could not be tested**. These need an authenticated throwaway account (see suggested next step).
- Payment flow untested (no purchases); client bundle references Razorpay only as an asset, so integration appears server-side — owner should confirm server-side signature verification of `razorpay_signature` before `paid` state transitions.
- Single-page crawl depth; deeper SPA route exploration and larger wordlists were deliberately skipped to stay low-noise.

---

## Recommended priority

1. **Now:** add CSP + missing headers (F2) — cheap, immediately blunts F1.
2. **Now:** allow-list CORS origins (F3).
3. **Next release:** move refresh tokens to httpOnly cookies with rotation (F1).
4. **Next release:** band public stock quantities (F4).
5. **Verify:** per-route rate limits/lockout on login (F5); refresh rotation/revocation (F6).
6. **Then:** authorize an authenticated non-destructive pass (throwaway account) to close the IDOR/authz gap this scope could not cover.
