# uza-mobility-fn

**The customer-facing application for UZA Mobility.** Live at
[uzamobility.com](https://uzamobility.com).

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind + shadcn/ui ·
TanStack Query · Auth.js v5 · Zustand.

It is a client of [`uza-mobility-bn`](https://github.com/UZA-SOLUTIONS/uza-mobility-bn).
It holds no database and no business rules of its own — every authorisation decision is
made by the API, and everything here is presentation plus a guard that keeps people off
screens they would only see errors on.

The staff panel is a separate application:
[`uza-mobility-admin`](https://github.com/UZA-SOLUTIONS/uza-mobility-admin).

---

## Running it

```bash
npm ci
cp .env.example .env.local        # then set AUTH_SECRET
npm run dev                       # http://localhost:3000
```

The API must be running on `http://localhost:7000`, or point `NEXT_PUBLIC_API_URL`
elsewhere. Without it the app renders, and every data screen reports that it cannot
reach the server.

| Command | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run verify` | **typecheck → lint → tests.** The same command CI runs |
| `npm test` | Tests only |
| `npm run lint:fix` | Fix what is mechanically fixable |

**`AUTH_SECRET`, not `NEXTAUTH_SECRET`.** Auth.js v5 renamed it. The wrong name builds
green and fails at runtime with an opaque session error, which is a bad half-hour.

---

## Who this application serves

Six audiences, each a route group. The group is the unit of access.

| Route group | Path | Who |
|---|---|---|
| `(marketing)` | `/`, `/vehicles`, `/spare-parts` | Anyone. Public catalogue |
| `(marketing)/my` | `/my/*` | A signed-in buyer: orders, invoices, bookings, payments, financing |
| `(seller)` | `/seller/*` | Third-party vendors listing vehicles and parts |
| `(operator)` | `/operator/*` | Charging-station owners |
| `(lender)` | `/lender/{bank}/*` | A financial institution, seeing **only its own** borrowers |
| `(workshop)` | `/workshop/*` | Mechanics and workshop staff |

`(lender)` and `(workshop)` are new and **their endpoints do not exist yet** — see
"Screens ahead of their API" below.

---

## Adding a bank is one row

`src/config/lenders.ts`:

```ts
export const LENDERS: readonly LenderConfig[] = [
  { key: 'unguka', name: 'Unguka Bank (LOLC)', seesCollateral: true },
  { key: 'equity', name: 'Equity Bank Rwanda' },
  { key: 'ncba',   name: 'NCBA Rwanda' },
  { key: 'bk',     name: 'Bank of Kigali' },   // <- the whole change
];
```

That row produces the route segment, the access guard, the navigation and all five
screens. No page, component or `switch` statement names a bank. The remaining step is a
`LENDER_BK` role in the database, assigned to that bank's users.

`src/config/lenders.test.ts` asserts this for every configured lender, including that
no bank can reach another bank's portal.

**Why it is built this way.** A portal that needs a developer, a pull request and a
deploy every time a lender signs is a portal that gets bypassed by somebody emailing a
spreadsheet — which is the disclosure the whole design prevents.

### The one thing deliberately *not* data

`seesCollateral` controls whether a lender sees the cash-collateral facility. It is
`false` by default and **Unguka is the only entry with it**. Onboarding a bank should be
easy; granting one sight of that facility is a founder's decision and should cost a file
change, a test change, and somebody reviewing both.

For every other bank the facility is **absent, not disabled**. A greyed-out link still
tells Equity the facility exists, and that is itself the disclosure.

It is enforced in `src/proxy.ts`, before rendering and before authentication is
consulted, so the answer cannot vary by who asks. `notFound()` inside the page is not
enough: once React begins streaming the status is already sent, and
`/lender/equity/collateral` answered **HTTP 200** while an invented bank answered 404 —
a difference that told Equity the route was real. Verified on a built server: Equity,
NCBA and a bank that does not exist are indistinguishable 404s.

---

## Layout

```
src/
  app/
    (auth)/          login, register, password reset, email verification
    (marketing)/     public site + the signed-in buyer area under /my
    (seller)/        vendor workspace
    (operator)/      charging-station owner workspace
    (lender)/        one segment, every bank — generated from config/lenders.ts
    (workshop)/      job cards, rescue, mechanics
  components/        one folder per audience, plus shared/ and ui/ (shadcn)
  lib/api/           one module per API area. apiFetch unwraps the response envelope
  queries/           TanStack Query hooks. Keys are namespaced per audience
  config/            lenders.ts, navigation.ts, routes.ts, site.ts
  proxy.ts           middleware: protected prefixes, and the collateral wall
```

**Guards are a convenience, not a control.** Every rule enforced here is enforced again
by the API, which is the only place enforcement counts — hiding a link stops an honest
person clicking it and stops nobody else. Never move an authorisation decision into this
application.

---

## Screens ahead of their API

| | |
|---|---|
| Marketing, vehicles, parts, `/my`, seller, operator | Wired to live endpoints |
| **Lender portals** | **No API.** `/financing/lenders/*` does not exist in `uza-mobility-bn` |
| **Workshop portal** | **No API.** `/workshop/*` does not exist, though the rules and 53 tests do |

Both sets of screens are built and calling nothing. Writing those two controllers is the
most valuable work available on this application.

---

## The linter is a ratchet

```bash
npm run lint    # 0 errors, 46 warnings — and the ceiling is 46
```

Fourteen components call `setState` synchronously inside an effect, which React 19's
compiler rules flag. They are worth fixing and were **not** fixed in a batch: each needs
its component understood and its behaviour re-checked, and a blind rewrite of fourteen
hooks in an application serving real customers is how a live site breaks.

So the build fails if that number goes **up**, and every fix lowers the ceiling. Set it
to `0` in `package.json` when the last one is gone. See `eslint.config.mjs`.

---

## Deployment

`next build` self-hosts fonts by downloading them at build time, so the build needs
network access to `fonts.googleapis.com`. It does **not** fail when that request fails —
it falls back and ships. On a runner without that egress you get a green pipeline and
the wrong typeface.
