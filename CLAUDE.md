# catalou-web-app

## Contexto de negocio y diseño

Antes de trabajar en este repo, leer en este orden:
1. `../catalou-platform-core/business/value_proposition.md` — qué es Catalou, usuarios, modelos de negocio, regla `showPrices × businessModel` (disclaimer obligatorio cuando ambos son true)
2. `../catalou-platform-core/design/` — especificación técnica de los 3 skins: `modern-minimalism` (Minimalista), `luxury-minimalism` (Premium), `neo-luxury` (Innovadora). CSS variables, palette, guía de implementación en React + Tailwind
3. `../catalou-platform-core/architecture/system_overview.md` — mapa de los 4 repos

Tipos de API: `src/generated/api-types.ts` — generados desde `../catalou-platform-core/contracts/openapi/`. Nunca definir tipos de API manualmente.

---

## Role
Customer-facing PWA. This is the public catalog that end users of each
Catalou tenant see and interact with.

## Stack
- React + TypeScript
- Tailwind CSS (utility classes only — no CSS-in-JS, no component libraries)
- Vite
- PWA — must include `manifest.json` and service worker at all times

## Architecture — Feature-Sliced Design (FSD)
Layer order (high → low): `app` → `pages` → `widgets` → `features` → `entities` → `shared` → `generated`

Dependency rule: layers may only import from layers below them.
A `feature` can import from `entities` and `shared`.
A `page` can import from `widgets` and `features`.
Never import upward.

```
src/
├── app/        — global config, providers, router, base styles
├── pages/      — route-level composition of widgets
├── widgets/    — composite UI blocks, no business logic
├── features/   — user actions with business logic (e.g. view-catalog, search-product)
├── entities/   — domain models and UI representations (e.g. product, company)
├── shared/     — UI primitives, utils, global types, generic hooks
└── generated/  — auto-generated from OpenAPI — NEVER edit manually
```

## PWA requirements
- `public/manifest.json` must exist at all times
- Service worker must be registered in `src/app/`
- App must be installable and work offline for catalog browsing

## Key rules
- Never communicate directly with `catalou-web-admin`
- All API types come from `src/generated/` — never define API types manually
- All API calls go to `catalou-api-core` exclusively
- Input validation required on every user-facing field before submission
- Never use inline styles — Tailwind classes only
- Environment variables must be prefixed with `VITE_` and documented in `.env.example`

## What Claude must never do in this repo
- Write backend logic or database queries
- Import from `catalou-web-admin` or `catalou-api-core` source code
- Edit files in `src/generated/`
- Introduce CSS-in-JS or external component libraries (MUI, Chakra, Ant Design, etc.)
- Hardcode API URLs — always use environment variables