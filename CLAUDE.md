# catalou-web-app

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
- Never communicate directly with `catalou-admin-web`
- All API types come from `src/generated/` — never define API types manually
- All API calls go to `catalou-core-api` exclusively
- Input validation required on every user-facing field before submission
- Never use inline styles — Tailwind classes only
- Environment variables must be prefixed with `VITE_` and documented in `.env.example`

## What Claude must never do in this repo
- Write backend logic or database queries
- Import from `catalou-admin-web` or `catalou-core-api` source code
- Edit files in `src/generated/`
- Introduce CSS-in-JS or external component libraries (MUI, Chakra, Ant Design, etc.)
- Hardcode API URLs — always use environment variables