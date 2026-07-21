# Luxury Minimalism — elegance reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the luxury-minimalism skin's tokens and layout so it reads as elegant across any tenant vertical (not just editorial/boutique goods), gives the tenant's own brand more presence on the catalog entry screen, and stops product images/CTAs from stretching to exuberant sizes on wide desktop grids.

**Architecture:** Pure design-token and layout changes — no new routes, no new state, no backend calls beyond a field already present in `BrandingData` (`bannerUrl`). Touches the two card components (`ProductListCard`, `ProductGridCard`), the catalog picker screen, the catalog skin's header/grid code, and the `useCatalogPage` hook that feeds them. `design/skin_premium.md` in `catalou-platform-core` is updated in parallel per the brand-change protocol.

**Tech Stack:** React + TypeScript + Vite (web-app), Vitest, plain OpenAPI-adjacent Markdown docs (platform-core).

## Global Constraints

- TypeScript exclusively — never JavaScript.
- Never edit `src/generated/` by hand.
- Tests co-located next to the file they test (`*.test.ts`).
- Feature branch per repo, never commit to `main`, squash-merge, one PR per repo.
- Itálico serif (`Cormorant Garamond`) reserved for **names only** — product/service names, catalog names. Everything else (price, metadata, labels) uses Lato.
- CTA emphasis for catalog cards (`ProductListCard`/`ProductGridCard` quick-action pill): always **solid** (`background: var(--pwa-accent)`, `color: var(--pwa-on-accent)`) — these never compete with another CTA on the card, so the "outline when a second CTA coexists" branch from the spec does not apply here. That branch belongs to the still-pending B2 plan (product detail page) — **no shared emphasis helper is introduced in this plan** (YAGNI); B2 adds it when it actually needs the outline variant.
- Grid layout (`purpose === 'menu' | 'informative'`): mobile is **always 1 column**; desktop uses `repeat(auto-fit, minmax(200px, 1fr))` (no fixed column count).
- Grid card (`ProductGridCard`) never exceeds `190px` wide regardless of its grid column's actual width.
- Testing convention for this codebase: Vitest only, no React Testing Library. Pure logic gets unit tests; presentational/layout components are verified via manual browser smoke test against real tenant data (localhost:5173 + localhost:3000, tenant `aseallergan`) — same pattern as the B1 and B2 plans.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `catalou-web-app/src/shared/ui/ProductListCard.tsx` | Horizontal card (services layout) | Price font Lato bold, name font-size one notch down, button solid fill |
| `catalou-web-app/src/shared/ui/ProductGridCard.tsx` | Square card (shop/info layout) | Button solid fill (shop variant), card capped at 190px wide |
| `catalou-web-app/src/shared/ui/ProductGridCardSkeleton.tsx` | Loading placeholder for grid card | Capped at 190px wide to match the real card (no layout jump on load) |
| `catalou-web-app/src/pages/catalog/CatalogPicker.tsx` | Catalog-selector screen | New optional banner image slot above the catalog list |
| `catalou-web-app/src/pages/catalog/useCatalogPage.ts` | Data/state hook for the catalog page | New `bannerUrl: string | null` field, sourced from `branding.bannerUrl` |
| `catalou-web-app/src/pages/catalog/skins/luxury-minimalism.tsx` | Catalog page skin (header, grids) | Picker header: bigger logo, always-visible name, more padding, passes `bannerUrl` down; `gridStyle()` rewritten for auto-fit desktop / 1-col mobile; chip row bottom padding increased |
| `catalou-platform-core/design/skin_premium.md` | Skin spec doc | Button fill convention note, picker header note — updated first per brand-change protocol |

No new files. No file in this plan exceeds ~120 lines after the change — no split needed.

---

### Task 1: `ProductListCard` — typography and solid CTA

**Files:**
- Modify: `catalou-web-app/src/shared/ui/ProductListCard.tsx`

**Interfaces:**
- No prop signature changes — `ProductListCardProps` stays identical. Pure internal style changes.

- [ ] **Step 1: Replace the price span's style (italic serif → Lato bold)**

In `catalou-web-app/src/shared/ui/ProductListCard.tsx`, find:

```tsx
            {showPrices && price !== null && (
              <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--pwa-text)' }}>
                {formatPrice(price, currency)}
              </span>
            )}
```

This block already uses `var(--pwa-font-body)` (Lato) — it was never italic serif in this card (only the product detail page's price was). No change needed here. Skip to Step 2.

- [ ] **Step 2: Drop the product name font-size one notch**

Find:

```tsx
        <p className="line-clamp-1 leading-snug" style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', fontWeight: 400, color: 'var(--pwa-text)', letterSpacing: '0.01em' }}>
          {name}
        </p>
```

Replace with:

```tsx
        <p className="line-clamp-1 leading-snug" style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: 'clamp(0.9rem, 2.2vw, 1rem)', fontWeight: 400, color: 'var(--pwa-text)', letterSpacing: '0.01em' }}>
          {name}
        </p>
```

- [ ] **Step 3: Switch the quick-action pill from soft-fill to solid**

Find:

```tsx
          {actionLabel && (
            <button
              type="button"
              onClick={handleActionClick}
              style={{
                flexShrink: 0,
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                fontWeight: 600,
                color: 'var(--pwa-accent)',
                backgroundColor: 'var(--pwa-accent-soft)',
                border: 'none',
                borderRadius: 'var(--pwa-radius-button)',
                padding: '10px 16px',
                cursor: 'pointer',
                minHeight: '36px',
              }}
            >
              {actionLabel}
            </button>
          )}
```

Replace with:

```tsx
          {actionLabel && (
            <button
              type="button"
              onClick={handleActionClick}
              style={{
                flexShrink: 0,
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                fontWeight: 600,
                color: 'var(--pwa-on-accent)',
                backgroundColor: 'var(--pwa-accent)',
                border: 'none',
                borderRadius: 'var(--pwa-radius-button)',
                padding: '10px 16px',
                cursor: 'pointer',
                minHeight: '36px',
              }}
            >
              {actionLabel}
            </button>
          )}
```

- [ ] **Step 4: Typecheck and lint**

Run: `cd catalou-web-app && pnpm typecheck && pnpm lint`
Expected: both clean — no prop/type changes were made, only inline style values.

- [ ] **Step 5: Run the test suite**

Run: `cd catalou-web-app && pnpm test`
Expected: 15/15 passing (no test covers this component's inline styles — verified visually in Task 7).

- [ ] **Step 6: Commit**

```bash
cd catalou-web-app
git add src/shared/ui/ProductListCard.tsx
git commit -m "style(catalog): tone down product name size, solid-fill quick-action pill"
```

---

### Task 2: `ProductGridCard` — solid CTA and capped card width

**Files:**
- Modify: `catalou-web-app/src/shared/ui/ProductGridCard.tsx`
- Modify: `catalou-web-app/src/shared/ui/ProductGridCardSkeleton.tsx`

**Interfaces:**
- No prop signature changes to either component.

- [ ] **Step 1: Cap the card's width and center it in its grid cell**

In `catalou-web-app/src/shared/ui/ProductGridCard.tsx`, find:

```tsx
  return (
    <article className="product-card cursor-pointer" style={{ backgroundColor: 'transparent' }} onClick={handleCardClick}>
```

Replace with:

```tsx
  return (
    <article className="product-card cursor-pointer" style={{ backgroundColor: 'transparent', maxWidth: '190px', margin: '0 auto', width: '100%' }} onClick={handleCardClick}>
```

(`width: '100%'` keeps the card filling its grid cell up to the 190px cap — on mobile's single wide column the card still centers at 190px instead of stretching edge-to-edge; on desktop's `auto-fit` columns the same cap applies regardless of how wide the column grows.)

- [ ] **Step 2: Switch the "Agregar" pill from soft-fill to solid**

Find:

```tsx
      {!isInfo && actionLabel && (
        <button
          type="button"
          onClick={handleActionClick}
          className="w-full text-center uppercase"
          style={{
            marginTop: '6px',
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            fontWeight: 600,
            color: 'var(--pwa-accent)',
            backgroundColor: 'var(--pwa-accent-soft)',
            border: 'none',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '9px 0',
            cursor: 'pointer',
            minHeight: '36px',
          }}
        >
          {actionLabel}
        </button>
      )}
```

Replace with:

```tsx
      {!isInfo && actionLabel && (
        <button
          type="button"
          onClick={handleActionClick}
          className="w-full text-center uppercase"
          style={{
            marginTop: '6px',
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            fontWeight: 600,
            color: 'var(--pwa-on-accent)',
            backgroundColor: 'var(--pwa-accent)',
            border: 'none',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '9px 0',
            cursor: 'pointer',
            minHeight: '36px',
          }}
        >
          {actionLabel}
        </button>
      )}
```

- [ ] **Step 3: Cap the skeleton to the same width**

In `catalou-web-app/src/shared/ui/ProductGridCardSkeleton.tsx`, replace the entire file:

```tsx
export function ProductGridCardSkeleton() {
  return (
    <div className="animate-pulse" style={{ maxWidth: '190px', margin: '0 auto', width: '100%' }}>
      <div
        className="w-full mb-2"
        style={{ aspectRatio: '1/1', borderRadius: 'var(--pwa-radius-md)', backgroundColor: 'var(--pwa-surface-secondary)' }}
      />
      <div className="h-4 rounded-sm mx-auto" style={{ backgroundColor: 'var(--pwa-surface-secondary)', width: '70%' }} />
    </div>
  );
}
```

- [ ] **Step 4: Typecheck, lint, test**

Run: `cd catalou-web-app && pnpm typecheck && pnpm lint && pnpm test`
Expected: all clean, 15/15 passing.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/ProductGridCard.tsx src/shared/ui/ProductGridCardSkeleton.tsx
git commit -m "style(catalog): cap grid card width at 190px, solid-fill quick-action pill"
```

---

### Task 3: `useCatalogPage` — expose `bannerUrl`

**Files:**
- Modify: `catalou-web-app/src/pages/catalog/useCatalogPage.ts`

**Interfaces:**
- Produces: `CatalogPageProps.bannerUrl: string | null` — consumed by Task 5 (skin) and passed through to Task 4 (`CatalogPicker`).

- [ ] **Step 1: Add the field to `CatalogPageProps`**

In `catalou-web-app/src/pages/catalog/useCatalogPage.ts`, find:

```typescript
  companyName: string;
  logoUrl: string | null;
  ordersEnabled: boolean;
```

Replace with:

```typescript
  companyName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  ordersEnabled: boolean;
```

- [ ] **Step 2: Populate it in the returned object**

Find:

```typescript
    companyName: branding.companyName,
    logoUrl: branding.logoUrl,
    ordersEnabled,
```

Replace with:

```typescript
    companyName: branding.companyName,
    logoUrl: branding.logoUrl,
    bannerUrl: branding.bannerUrl,
    ordersEnabled,
```

- [ ] **Step 3: Typecheck**

Run: `cd catalou-web-app && pnpm typecheck`
Expected: FAIL in `src/pages/catalog/skins/luxury-minimalism.tsx` — that component destructures `CatalogPageProps` but does not yet know about `bannerUrl` (harmless — TypeScript doesn't require destructuring every field). Actually expected: PASS — adding an extra field to an interface and populating it does not break existing consumers that don't destructure it. If typecheck fails for any other reason, stop and investigate before proceeding.

- [ ] **Step 4: Commit**

```bash
git add src/pages/catalog/useCatalogPage.ts
git commit -m "feat(catalog): expose tenant bannerUrl from useCatalogPage"
```

---

### Task 4: `CatalogPicker` — banner slot

**Files:**
- Modify: `catalou-web-app/src/pages/catalog/CatalogPicker.tsx`

**Interfaces:**
- Consumes: `bannerUrl: string | null` (Task 3).
- Produces: `CatalogPickerProps` gains `bannerUrl: string | null`. Task 5 passes it in.

- [ ] **Step 1: Add the prop and render the banner when present**

Replace the entire file `catalou-web-app/src/pages/catalog/CatalogPicker.tsx`:

```tsx
import type { PublicCategory } from '@entities/catalog/api';
import { catalogSubtitle } from './purpose';

interface CatalogPickerProps {
  catalogs: PublicCategory[];
  bannerUrl: string | null;
  onSelect: (id: string) => void;
}

export function CatalogPicker({ catalogs, bannerUrl, onSelect }: CatalogPickerProps) {
  return (
    <div style={{ padding: '8px 20px 24px' }}>
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt=""
          aria-hidden="true"
          style={{ width: '100%', aspectRatio: '16/5', objectFit: 'cover', borderRadius: 'var(--pwa-radius-md)', marginBottom: '16px' }}
        />
      )}
      {catalogs.map((c, i) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '18px 0',
            background: 'none',
            border: 'none',
            borderTop: i === 0 ? 'none' : '1px solid var(--pwa-border)',
            cursor: 'pointer',
            textAlign: 'left',
            minHeight: '44px',
          }}
        >
          <span>
            <span style={{ display: 'block', fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--pwa-text)', lineHeight: 1.15 }}>
              {c.name}
            </span>
            <span style={{ display: 'block', fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, marginTop: '3px' }}>
              {catalogSubtitle(c.purpose)}
            </span>
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--pwa-text-secondary)', flexShrink: 0 }} aria-hidden="true">
            <path d="M6.5 4L11.5 9L6.5 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}
```

(`alt=""` + `aria-hidden="true"` on the banner: it's decorative brand dressing, not content — the tenant name is already announced by the header above it.)

- [ ] **Step 2: Typecheck**

Run: `cd catalou-web-app && pnpm typecheck`
Expected: FAIL in `src/pages/catalog/skins/luxury-minimalism.tsx` — the existing call `<CatalogPicker catalogs={catalogs} onSelect={onCatalogSelect} />` is now missing the required `bannerUrl` prop. This is fixed in Task 5.

- [ ] **Step 3: Commit**

```bash
git add src/pages/catalog/CatalogPicker.tsx
git commit -m "feat(catalog): add banner image slot to CatalogPicker"
```

(Typecheck stays red until Task 5 — expected, both tasks are part of the same feature slice.)

---

### Task 5: `luxury-minimalism.tsx` skin — header prominence and responsive grid

**Files:**
- Modify: `catalou-web-app/src/pages/catalog/skins/luxury-minimalism.tsx`

**Interfaces:**
- Consumes: `bannerUrl` (Task 3) from `CatalogPageProps`; `CatalogPicker`'s new `bannerUrl` prop (Task 4).

- [ ] **Step 1: Rewrite `gridStyle` for 1-col mobile / auto-fit desktop**

Find:

```typescript
const gridStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
  gap: isMobile ? '20px 12px' : '24px',
});
```

Replace with:

```typescript
const gridStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: isMobile ? '22px' : '24px',
});
```

`listStyle` (used for `purpose === 'services'`) is already 1 column on mobile / 2 on desktop — not touched by this task, but its mobile gap gets the same "more air" treatment in Step 2.

- [ ] **Step 2: Bump `listStyle`'s mobile gap**

Find:

```typescript
const listStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
  gap: isMobile ? '18px' : '20px 32px',
});
```

Replace with:

```typescript
const listStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
  gap: isMobile ? '22px' : '20px 32px',
});
```

- [ ] **Step 3: Destructure `bannerUrl` from props**

Find:

```tsx
  ordersEnabled,
  cartCount,
  companyName,
  logoUrl,
  onSearchChange,
```

Replace with:

```tsx
  ordersEnabled,
  cartCount,
  companyName,
  logoUrl,
  bannerUrl,
  onSearchChange,
```

- [ ] **Step 4: Bigger logo, always-visible name, more header padding**

Find:

```tsx
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px', gap: '10px' }}>
            {showBack && !isPicker ? (
              <button type="button" onClick={onBackToPicker} aria-label="Volver a los catálogos" style={{ color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
                <IconBack />
              </button>
            ) : (
              <span style={{ width: '28px' }} />
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
              {isPicker ? (
                logoUrl ? (
                  <img src={logoUrl} alt={companyName} style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.3rem', color: 'var(--pwa-text)', lineHeight: 1 }}>{companyName}</span>
                )
              ) : (
                <span style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--pwa-text)', lineHeight: 1.05, textAlign: 'center' }}>
                  {activeCatalog?.name ?? companyName}
                </span>
              )}
              <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, marginTop: '3px' }}>
                {isPicker ? 'Catálogo' : catalogSubtitle(activeCatalog?.purpose ?? null)}
              </span>
            </div>

            {ordersEnabled ? (
```

Replace with:

```tsx
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isPicker ? '24px 20px 20px' : '14px 18px 10px', gap: '10px' }}>
            {showBack && !isPicker ? (
              <button type="button" onClick={onBackToPicker} aria-label="Volver a los catálogos" style={{ color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
                <IconBack />
              </button>
            ) : (
              <span style={{ width: '28px' }} />
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
              {isPicker ? (
                <>
                  {logoUrl && (
                    <img src={logoUrl} alt={companyName} style={{ height: '72px', width: 'auto', objectFit: 'contain', marginBottom: '6px' }} />
                  )}
                  <span style={{ fontFamily: 'var(--pwa-font-body)', fontWeight: 500, fontSize: '0.95rem', color: 'var(--pwa-text)', lineHeight: 1.2 }}>{companyName}</span>
                </>
              ) : (
                <span style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--pwa-text)', lineHeight: 1.05, textAlign: 'center' }}>
                  {activeCatalog?.name ?? companyName}
                </span>
              )}
              <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, marginTop: '3px' }}>
                {isPicker ? 'Catálogo' : catalogSubtitle(activeCatalog?.purpose ?? null)}
              </span>
            </div>

            {ordersEnabled ? (
```

(The name now always renders below the logo — previously it only rendered as a substitute *when there was no logo*. `marginBottom: '6px'` on the logo only applies when the logo is actually shown, so the no-logo case still stacks cleanly.)

- [ ] **Step 5: Widen the chip row's bottom padding**

Find:

```tsx
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
```

Replace with:

```tsx
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
```

- [ ] **Step 6: Pass `bannerUrl` to `CatalogPicker`**

Find:

```tsx
      {isPicker ? (
        <CatalogPicker catalogs={catalogs} onSelect={onCatalogSelect} />
      ) : (
```

Replace with:

```tsx
      {isPicker ? (
        <CatalogPicker catalogs={catalogs} bannerUrl={bannerUrl} onSelect={onCatalogSelect} />
      ) : (
```

- [ ] **Step 7: Typecheck, lint, full test suite**

Run: `cd catalou-web-app && pnpm typecheck && pnpm lint && pnpm test`
Expected: all clean, 15/15 passing. This resolves the two typecheck failures left dangling from Tasks 3 and 4.

- [ ] **Step 8: Commit**

```bash
git add src/pages/catalog/skins/luxury-minimalism.tsx
git commit -m "feat(catalog): bigger picker header, 1-col mobile grid, auto-fit desktop grid"
```

---

### Task 6: `design/skin_premium.md` — document the button and header conventions

**Files:**
- Modify: `catalou-platform-core/design/skin_premium.md`

This task runs in the `catalou-platform-core` repo, a separate git history from `catalou-web-app`. Create its own branch first.

- [ ] **Step 1: Create the branch**

```bash
cd catalou-platform-core
git checkout main
git pull
git checkout -b feat/luxury-minimalism-elegance-reset
```

- [ ] **Step 2: Add the button-fill convention to "Filosofía de bordes"**

Find (around line 74):

```markdown
**Filosofía de bordes:** Botones y chips en pillshape (`30px` / `20px`). Cards con radio generoso (`12px`). La geometría redondeada refuerza la calidez y accesibilidad del skin — rompe con la rigidez del minimalismo frío.
```

Replace with:

```markdown
**Filosofía de bordes:** Botones y chips en pillshape (`30px` / `20px`). Cards con radio generoso (`12px`). La geometría redondeada refuerza la calidez y accesibilidad del skin — rompe con la rigidez del minimalismo frío.

**Convención de fill en CTA:** un botón de acento (`--pwa-accent`) usa **solid fill** (`background: var(--pwa-accent)`, `color: var(--pwa-on-accent)`) cuando es la única acción visible en su contexto — el caso de los quick-action pills en las cards del catálogo, que nunca comparten espacio con otro CTA. Cuando un CTA de acento convive con una segunda acción (ej. WhatsApp en el detalle de un producto), el CTA de acento baja a **outline** (`background: transparent`, `border: 1.5px solid var(--pwa-accent)`, `color: var(--pwa-accent)`) para no competir en peso visual. WhatsApp mantiene siempre su verde sólido propio (`#25D366`) — es una marca reconocible aparte, no entra en esta convención.
```

- [ ] **Step 3: Add a picker-header note to "Comportamiento del skin"**

Find (around line 192, the last item of the numbered list):

```markdown
6. **TopBar glass:** Warm frosted — `rgba(250,247,242,0.85)` sobre fondo `#FAF7F2`. El blur crea un efecto de papel translúcido, coherente con la paleta warm del skin.
```

Replace with:

```markdown
6. **TopBar glass:** Warm frosted — `rgba(250,247,242,0.85)` sobre fondo `#FAF7F2`. El blur crea un efecto de papel translúcido, coherente con la paleta warm del skin.
7. **Header del picker de catálogos:** entrada con más presencia de marca que el resto de la navegación — logo a `72px` de alto (vs. `44-56px` en headers internos), nombre del tenant siempre visible debajo del logo (nunca condicional a su ausencia), y banner opcional del tenant (`bannerUrl`, `aspect-ratio: 16/5`) arriba del listado de catálogos cuando está cargado. Es la única pantalla del flujo de compra donde el banner aparece — el resto de la navegación usa el header compacto.
```

- [ ] **Step 4: Lint**

Run: `cd catalou-platform-core && pnpm lint:yaml`
Expected: unaffected (this command only lints `contracts/openapi/*.yaml`, not Markdown) — passes trivially. No Markdown linter is configured in this repo; visually confirm the diff renders correctly.

- [ ] **Step 5: Commit and open the PR**

```bash
git add design/skin_premium.md
git commit -m "docs(design): document CTA fill convention and picker header prominence"
git push -u origin feat/luxury-minimalism-elegance-reset
gh pr create --title "docs(design): CTA fill convention + picker header prominence" --body "Documents two conventions introduced by the luxury-minimalism elegance reset (web-app branch feat/luxury-minimalism-elegance-reset): (1) accent CTAs are solid-fill when they're the only action, outline when a second CTA coexists; (2) the catalog picker header gets more brand presence (bigger logo, always-visible tenant name, optional banner) than the rest of the navigation."
```

---

### Task 7: Verification + smoke test

**Files:** none — verification only.

- [ ] **Step 1: Full static verification**

Run: `cd catalou-web-app && pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: all green, 15/15 tests, build succeeds with no `src/generated/` drift.

- [ ] **Step 2: Confirm real servers are running**

Confirm `catalou-api-core` on `:3000` and `catalou-web-app` on `:5173`, both against the tenant `aseallergan` used throughout B1/B2.

- [ ] **Step 3: Smoke test — picker header (mobile, 375px)**

Navigate to `/`. Verify: logo renders at a visibly larger size than before (72px vs the old 48px), tenant name is visible below the logo even though a logo exists, header has noticeably more vertical padding, and if the tenant has a `bannerUrl` set, a rounded banner strip appears above "Tienda / Servicios / Convenios". If `aseallergan` has no banner configured, confirm the picker still renders cleanly without a gap where the banner would go (the `bannerUrl && (...)` guard should render nothing, not an empty box).

- [ ] **Step 4: Smoke test — Tienda (menu, grid layout), mobile then desktop**

Mobile (375px): confirm the grid is a single column (no more 2-up grid), cards are centered and don't exceed ~190px wide, "Agregar" pill has a solid fill in the tenant's accent color (not the previous pale wash).

Desktop (≥1280px): confirm the grid shows more than 4 columns if the viewport is wide enough (auto-fit behavior), each card still caps at ~190px (doesn't stretch to fill its column), and the overall grid doesn't look sparse or misaligned.

- [ ] **Step 5: Smoke test — Servicios (list layout)**

Confirm the horizontal list cards still render correctly: product name is now visibly a touch smaller than before, price is unchanged (already Lato), and the "Reservar" pill has a solid accent fill.

- [ ] **Step 6: Smoke test — Convenios (informative)**

Confirm the info-variant grid cards (no action button) still render correctly at the capped width — this variant has no button to check, only image/name.

- [ ] **Step 7: Regression — cart flow**

Add a product to cart from Tienda (menu), confirm the cart badge increments and the "added to cart" toast still fires — this task changed button fill colors but not `onClick` handlers; regression risk is low but must be confirmed.

- [ ] **Step 8: Push web-app and open the PR**

```bash
cd catalou-web-app
git push -u origin feat/luxury-minimalism-elegance-reset
gh pr create --title "[Design] feat: luxury-minimalism elegance reset" --body "$(cat <<'EOF'
## Summary
- Tones down the editorial voice so it works across any tenant vertical: italic serif reserved for names only, product name size one notch down.
- Gives the tenant's brand more presence on the catalog picker: bigger logo, always-visible name, optional banner slot.
- Catalog card CTAs switch from pale soft-fill to solid accent fill (they're always the single action on their card).
- Catalog grids: mobile is always 1 column (was 2 for menu/informative), desktop auto-fits column count to screen width instead of a fixed 4.
- Grid cards are capped at 190px wide so images/buttons stay elegant instead of stretching on wide desktop grids.

Depends on catalou-platform-core#<PR from Task 6> for the doc update (brand-change protocol).

## Test plan
- [ ] tsc/lint/test/build green
- [ ] Smoke test on aseallergan: picker header, Tienda (menu grid), Servicios (list), Convenios (informative grid) — mobile 375px and desktop ≥1280px
- [ ] Cart add-to-cart regression check
EOF
)"
```

---

## Self-Review

**Spec coverage:** Section 1 (tipografía) → Task 1. Section 2 (header/marca) → Tasks 3, 4, 5. Section 3 (CTA énfasis) → Tasks 1, 2 for the "solid when alone" branch (catalog cards); the "outline when WhatsApp coexists" branch is explicitly deferred to B2, as decided in Global Constraints. Section 4 (espaciado) → Task 5 (gaps, header padding, chip padding). Section 5 (grillas responsive) → Task 5. Section 6 (tamaño imagen/botón) → Task 2. Protocolo de cambio de marca → Task 6. No gaps.

**Placeholders:** none — every step has exact code or an exact command with expected output.

**Type consistency:** `bannerUrl: string | null` is introduced once in `CatalogPageProps` (Task 3) and consumed with the identical name and type in `CatalogPickerProps` (Task 4) and the skin's destructuring (Task 5) — no renaming across tasks. `ProductGridCardProps`/`ProductListCardProps` are unchanged throughout (style-only edits), confirmed by re-reading both files before writing this plan.
