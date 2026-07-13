# Catalog Purpose Navigation (PR B1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/catalog` into a purpose-driven experience: when a tenant has 2+ catalogs (categories), the visitor first sees a **catalog picker** listing each catalog by its tenant-assigned name with a purpose subtitle; entering a catalog shows its items, and each item's quick-action follows that catalog's `purpose` — `services` → "Reservar", `menu` → "Agregar", `informative` → view-only. A single-catalog tenant skips the picker.

**Architecture:** The category name is the label; the category `purpose` (now exposed by the public API) is the behavior. `useCatalogPage.ts` gains a two-mode model (`picker` vs `catalog`) driven by `?catalogo=<id>` and the number of categories, plus a per-product action resolver. Pure logic (subtitles, action resolution) lives in a new `purpose.ts` (TDD). Two new presentational components — `CatalogPicker` and `CatalogSearchBar` — join the existing `luxury-minimalism` skin. The item grid reuses the currently-dead `src/shared/ui/ProductCard.tsx`, reshaped to render a visible, purpose-driven action pill instead of its old hardcoded hover "Agregar".

**Tech Stack:** React + TypeScript + React Router (`useSearchParams`) + Vitest. No new dependencies.

## Global Constraints

- TypeScript only. No new npm dependencies (debounce via `setTimeout` in `useEffect`).
- Test convention (per the repo's only test file, `src/shared/lib/cart-store.test.ts`): unit-test pure logic with plain Vitest, no React Testing Library. Follow it — TDD the new pure `purpose.ts`; verify components/hook/skin via `tsc` + `build` + manual smoke at 375px.
- Copy (voseo, confirmed with owner):
  - Picker subtitle: `services` → "Reservá tu cita", `menu` → "Hacé tu pedido", `informative`/`null` → "Conocé más".
  - Card action label: `services` → "Reservar", `menu` → "Agregar", `informative`/`null` → none.
- A category with `purpose: null` (legacy, created before the field) is treated as `informative`.
- Item quick-action is gated by feature flags: "Reservar" only when `bookings` enabled; "Agregar" only when `orders` enabled AND `product.type === 'product'`. Otherwise the item is view-only (tap → detail).
- URL param for the entered catalog is `?catalogo=<categoryId>` (deep-linkable, back-navigable).
- Never hand-edit `src/generated/` — regenerate via `pnpm generate:catalog`.
- No emojis, no generic purpose icons — picker rows and cards are text + the tenant's own images.

---

### Task 1: Expose `purpose` on the hand-written public catalog types

**Files:**
- Modify: `src/entities/catalog/api.ts` (`PublicCategory`)
- Regenerate: `src/generated/catalog.ts` (pipeline, not hand-edited)

**Interfaces:**
- Produces: `PublicCategory.purpose: 'services' | 'menu' | 'informative' | null`. Consumed by Tasks 2 and 6.

- [ ] **Step 1: Add `purpose` to `PublicCategory`**

In `src/entities/catalog/api.ts`:

```ts
export interface PublicCategory {
  id: string;
  name: string;
  purpose: 'services' | 'menu' | 'informative' | null;
  subcategories: PublicSubcategory[];
}
```

- [ ] **Step 2: Regenerate the OpenAPI types**

Run: `pnpm generate:catalog`
Expected: `src/generated/catalog.ts` `CategoryWithSubcategories` now includes `purpose?: "services" | "menu" | "informative" | null`. (Not imported by app code, but the pre-push hook checks it isn't stale.)

- [ ] **Step 3: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/entities/catalog/api.ts src/generated/catalog.ts
git commit -m "feat(catalog): expose category purpose on public catalog types"
```

---

### Task 2: Purpose logic module — subtitles + card-action resolver (TDD)

**Files:**
- Create: `src/pages/catalog/purpose.ts`
- Test: `src/pages/catalog/purpose.test.ts`

**Interfaces:**
- Consumes: `PublicCategory['purpose']` type shape.
- Produces:
  - `catalogSubtitle(purpose: PublicCategory['purpose']): string`
  - `type CardActionKind = 'book' | 'add' | 'none'`
  - `resolveCardActionKind(args: { purpose: PublicCategory['purpose']; productType: 'product' | 'service'; ordersEnabled: boolean; bookingsEnabled: boolean }): CardActionKind`
  - `CARD_ACTION_LABEL: Record<CardActionKind, string | null>`

  Consumed by Task 5 (`CatalogPicker`) and Task 6 (`useCatalogPage`).

- [ ] **Step 1: Write the failing test**

Create `src/pages/catalog/purpose.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { catalogSubtitle, resolveCardActionKind, CARD_ACTION_LABEL } from './purpose';

describe('catalogSubtitle', () => {
  it('maps each purpose to its voseo subtitle', () => {
    expect(catalogSubtitle('services')).toBe('Reservá tu cita');
    expect(catalogSubtitle('menu')).toBe('Hacé tu pedido');
    expect(catalogSubtitle('informative')).toBe('Conocé más');
  });

  it('treats a null (legacy) purpose as informative', () => {
    expect(catalogSubtitle(null)).toBe('Conocé más');
  });
});

describe('resolveCardActionKind', () => {
  const base = { productType: 'product' as const, ordersEnabled: true, bookingsEnabled: true };

  it('returns "book" for a services catalog when bookings are enabled', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'services' })).toBe('book');
  });

  it('returns "none" for a services catalog when bookings are disabled', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'services', bookingsEnabled: false })).toBe('none');
  });

  it('returns "add" for a menu catalog product when orders are enabled', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'menu' })).toBe('add');
  });

  it('returns "none" for a menu catalog when orders are disabled', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'menu', ordersEnabled: false })).toBe('none');
  });

  it('returns "none" for a service-type item inside a menu catalog (never add a service to cart)', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'menu', productType: 'service' })).toBe('none');
  });

  it('returns "none" for an informative catalog', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'informative' })).toBe('none');
    expect(resolveCardActionKind({ ...base, purpose: null })).toBe('none');
  });

  it('labels: book→Reservar, add→Agregar, none→null', () => {
    expect(CARD_ACTION_LABEL.book).toBe('Reservar');
    expect(CARD_ACTION_LABEL.add).toBe('Agregar');
    expect(CARD_ACTION_LABEL.none).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/catalog/purpose.test.ts`
Expected: FAIL — `./purpose` does not exist.

- [ ] **Step 3: Implement `purpose.ts`**

Create `src/pages/catalog/purpose.ts`:

```ts
import type { PublicCategory } from '@entities/catalog/api';

type Purpose = PublicCategory['purpose'];

export function catalogSubtitle(purpose: Purpose): string {
  if (purpose === 'services') return 'Reservá tu cita';
  if (purpose === 'menu') return 'Hacé tu pedido';
  return 'Conocé más';
}

export type CardActionKind = 'book' | 'add' | 'none';

export const CARD_ACTION_LABEL: Record<CardActionKind, string | null> = {
  book: 'Reservar',
  add: 'Agregar',
  none: null,
};

export function resolveCardActionKind(args: {
  purpose: Purpose;
  productType: 'product' | 'service';
  ordersEnabled: boolean;
  bookingsEnabled: boolean;
}): CardActionKind {
  const { purpose, productType, ordersEnabled, bookingsEnabled } = args;
  if (purpose === 'services') return bookingsEnabled ? 'book' : 'none';
  if (purpose === 'menu') return ordersEnabled && productType === 'product' ? 'add' : 'none';
  return 'none';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/catalog/purpose.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/pages/catalog/purpose.ts src/pages/catalog/purpose.test.ts
git commit -m "feat(catalog): add purpose subtitle + card-action resolver logic"
```

---

### Task 3: Reshape `ProductCard` — visible purpose-driven action pill

**Files:**
- Modify: `src/shared/ui/ProductCard.tsx`
- Modify: `src/shared/styles/pwa-base.css` (remove the now-dead `.product-card__cta` hover rules)

**Interfaces:**
- Produces: `ProductCard` props become `{ id, name, imageUrl, price, showPrices, currency?, businessModel, actionLabel: string | null, onAction: (id: string) => void }`. Renders a full-width action pill under the name only when `actionLabel` is non-null; the pill calls `onAction(id)` and stops propagation; tapping the rest of the card still navigates to `/products/:id`. Consumed by Task 7.

- [ ] **Step 1: Rewrite `ProductCard.tsx`**

Replace the whole file `src/shared/ui/ProductCard.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui/PriceDisclaimer';

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number | null;
  showPrices: boolean;
  currency?: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  actionLabel: string | null;
  onAction: (id: string) => void;
}

export function ProductCard({ id, name, imageUrl, price, showPrices, currency = 'CRC', businessModel, actionLabel, onAction }: ProductCardProps) {
  const navigate = useNavigate();

  function handleCardClick() {
    navigate(`/products/${id}`);
  }

  function handleActionClick(e: React.MouseEvent) {
    e.stopPropagation();
    onAction(id);
  }

  return (
    <article className="product-card cursor-pointer" style={{ backgroundColor: 'transparent' }} onClick={handleCardClick}>
      <div className="overflow-hidden w-full mb-2 relative" style={{ aspectRatio: '3/4', backgroundColor: 'var(--pwa-surface-secondary)', borderRadius: 'var(--pwa-radius-md)' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" className="product-card__image w-full h-full object-cover" />
        ) : (
          <div className="product-card__image w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--pwa-surface-secondary)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.25 }}>
              <rect x="2" y="2" width="24" height="24" stroke="currentColor" strokeWidth="1" />
              <path d="M2 20L9 13L13 17L18 11L26 20" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        )}
        {showPrices && price !== null && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: 'var(--pwa-accent)', color: 'var(--pwa-on-accent)', borderRadius: 'var(--pwa-radius-sm, 4px)', letterSpacing: '-0.01em' }}>
            {formatPrice(price, currency)}
          </div>
        )}
      </div>

      {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && price !== null && (
        <PriceDisclaimer className="px-0.5 mt-0" />
      )}

      <div className="px-0.5">
        <p className="line-clamp-2 leading-snug mb-1" style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', fontWeight: 400, color: 'var(--pwa-text)', letterSpacing: '0.01em' }}>
          {name}
        </p>
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={handleActionClick}
          className="w-full text-center uppercase"
          style={{
            marginTop: '6px',
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '10px',
            letterSpacing: '0.14em',
            fontWeight: 600,
            color: 'var(--pwa-on-accent)',
            backgroundColor: 'var(--pwa-accent)',
            border: 'none',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '8px 0',
            cursor: 'pointer',
            minHeight: '36px',
          }}
        >
          {actionLabel}
        </button>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Remove the dead `.product-card__cta` CSS**

In `src/shared/styles/pwa-base.css`, delete the `.product-card__cta` rule block(s) (the hover-reveal CTA — no longer emitted by `ProductCard`). Keep the `.product-card` transition rule, the `.product-card__image` hover-zoom rule, and the `[data-pwa-theme="luxury-minimalism"] .product-card:hover` shadow rule — those still apply.

- [ ] **Step 3: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS (no callers of `ProductCard` yet — Task 7 adds the only one).

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/ProductCard.tsx src/shared/styles/pwa-base.css
git commit -m "feat(catalog): reshape ProductCard with a visible purpose-driven action pill"
```

---

### Task 4: `CatalogSearchBar` component + focus style

**Files:**
- Create: `src/pages/catalog/CatalogSearchBar.tsx`
- Modify: `src/shared/styles/pwa-base.css` (search focus rule)

**Interfaces:**
- Produces: `<CatalogSearchBar value onChange />`. Consumed by Task 7.

- [ ] **Step 1: Create the search bar**

Create `src/pages/catalog/CatalogSearchBar.tsx`:

```tsx
interface CatalogSearchBarProps {
  value: string;
  onChange: (q: string) => void;
}

export function CatalogSearchBar({ value, onChange }: CatalogSearchBarProps) {
  return (
    <div style={{ padding: '10px 20px' }}>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar"
        aria-label="Buscar en el catálogo"
        className="catalog-search-input"
        style={{
          width: '100%',
          height: '44px',
          padding: '0 16px',
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '14px',
          color: 'var(--pwa-text)',
          backgroundColor: 'var(--pwa-surface)',
          border: '1.5px solid var(--pwa-border)',
          borderRadius: 'var(--pwa-radius-md)',
          outline: 'none',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Add the visible focus state**

In `src/shared/styles/pwa-base.css`, add:

```css
.catalog-search-input:focus {
  border-color: var(--pwa-accent);
  box-shadow: 0 0 0 3px var(--pwa-accent-soft);
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/catalog/CatalogSearchBar.tsx src/shared/styles/pwa-base.css
git commit -m "feat(catalog): add CatalogSearchBar with visible focus state"
```

---

### Task 5: `CatalogPicker` component

**Files:**
- Create: `src/pages/catalog/CatalogPicker.tsx`

**Interfaces:**
- Consumes: `catalogSubtitle` from `./purpose` (Task 2), `PublicCategory` from `@entities/catalog/api`.
- Produces: `<CatalogPicker catalogs onSelect />`. Consumed by Task 7.

- [ ] **Step 1: Create the picker**

Create `src/pages/catalog/CatalogPicker.tsx`:

```tsx
import type { PublicCategory } from '@entities/catalog/api';
import { catalogSubtitle } from './purpose';

interface CatalogPickerProps {
  catalogs: PublicCategory[];
  onSelect: (id: string) => void;
}

export function CatalogPicker({ catalogs, onSelect }: CatalogPickerProps) {
  return (
    <div style={{ padding: '8px 20px 24px' }}>
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

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/catalog/CatalogPicker.tsx
git commit -m "feat(catalog): add CatalogPicker (catalogs by name + purpose subtitle)"
```

---

### Task 6: Two-mode navigation + per-product action in `useCatalogPage`

**Files:**
- Modify (full rewrite): `src/pages/catalog/useCatalogPage.ts`

**Interfaces:**
- Consumes: `resolveCardActionKind`, `CARD_ACTION_LABEL` from `./purpose` (Task 2).
- Produces the new `CatalogPageProps` (below). Consumed by Task 7.

- [ ] **Step 1: Rewrite `useCatalogPage.ts`**

Replace the whole file `src/pages/catalog/useCatalogPage.ts`:

```ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import {
  fetchCatalog,
  type CatalogData,
  type PublicProduct,
  type PublicCategory,
  type PublicSubcategory,
} from '@entities/catalog/api';
import { useCart } from '@shared/lib/use-cart';
import { resolveCardActionKind, CARD_ACTION_LABEL } from './purpose';

export interface CardAction {
  label: string | null;
  run: () => void;
}

export interface CatalogPageProps {
  mode: 'picker' | 'catalog';
  // Picker
  catalogs: PublicCategory[];
  onCatalogSelect: (id: string) => void;
  // Catalog
  activeCatalog: PublicCategory | null;
  products: PublicProduct[];
  subcategories: PublicSubcategory[];
  selectedSubcategoryId: string | null;
  showBack: boolean;
  onBackToPicker: () => void;
  onSubcategorySelect: (id: string | null) => void;
  getCardAction: (product: PublicProduct) => CardAction;
  // Common
  showPrices: boolean;
  currency: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  searchQuery: string;
  isLoading: boolean;
  error: boolean;
  cartCount: number;
  companyName: string;
  logoUrl: string | null;
  ordersEnabled: boolean;
  onSearchChange: (q: string) => void;
  onCartClick: () => void;
  onRetry: () => void;
}

export function useCatalogPage(): CatalogPageProps {
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const { add, items: cartItems } = useCart(slug);
  const [searchParams, setSearchParams] = useSearchParams();

  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const selectedCatalogId = searchParams.get('catalogo');
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const ordersEnabled = branding.featuresEnabled?.orders === true;
  const bookingsEnabled = branding.featuresEnabled?.bookings === true;

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchCatalog(slug, {
        q: debouncedQuery || undefined,
        categoryId: selectedCatalogId ?? undefined,
        subcategoryId: selectedSubcategoryId ?? undefined,
      });
      setCatalog(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, debouncedQuery, selectedCatalogId, selectedSubcategoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  // The API always returns the full category list (the categoryId param only
  // scopes products), so `catalog.categories` is reliable for the picker.
  const allCatalogs = catalog?.categories ?? [];
  const singleCatalog = allCatalogs.length === 1 ? allCatalogs[0] : null;
  const activeCatalog =
    allCatalogs.find((c) => c.id === selectedCatalogId) ?? singleCatalog;

  // Picker only when there are 2+ catalogs and none is entered yet.
  const mode: 'picker' | 'catalog' =
    allCatalogs.length >= 2 && !selectedCatalogId ? 'picker' : 'catalog';
  const showBack = allCatalogs.length >= 2 && Boolean(selectedCatalogId);

  function onCatalogSelect(id: string) {
    setSelectedSubcategoryId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('catalogo', id);
      return next;
    });
  }

  function onBackToPicker() {
    setSelectedSubcategoryId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('catalogo');
      return next;
    });
  }

  function onSubcategorySelect(id: string | null) {
    setSelectedSubcategoryId(id);
  }

  function onSearchChange(q: string) {
    setSearchQuery(q);
  }

  function onCartClick() {
    void navigate('/cart');
  }

  function addToCart(product: PublicProduct) {
    void add({
      companySlug: slug,
      productId: product.id,
      productName: product.name,
      variantTypeId: null,
      variantTypeName: null,
      variantValueId: null,
      variantValueName: null,
      quantity: 1,
      unitPrice: parseFloat(product.basePrice) || 0,
    }).then(() => {
      window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { name: product.name } }));
    });
  }

  function getCardAction(product: PublicProduct): CardAction {
    const kind = resolveCardActionKind({
      purpose: activeCatalog?.purpose ?? null,
      productType: product.type,
      ordersEnabled,
      bookingsEnabled,
    });
    if (kind === 'add') return { label: CARD_ACTION_LABEL.add, run: () => addToCart(product) };
    if (kind === 'book') {
      return { label: CARD_ACTION_LABEL.book, run: () => void navigate(`/book?itemId=${product.id}`) };
    }
    return { label: null, run: () => void navigate(`/products/${product.id}`) };
  }

  return {
    mode,
    catalogs: allCatalogs,
    onCatalogSelect,
    activeCatalog,
    products: catalog?.products ?? [],
    subcategories: activeCatalog?.subcategories ?? [],
    selectedSubcategoryId,
    showBack,
    onBackToPicker,
    onSubcategorySelect,
    getCardAction,
    showPrices: catalog?.showPrices ?? false,
    currency: branding.currency ?? 'CRC',
    businessModel: branding.businessModel,
    searchQuery,
    isLoading: loading,
    error,
    cartCount,
    companyName: branding.companyName,
    logoUrl: branding.logoUrl,
    ordersEnabled,
    onSearchChange,
    onCartClick,
    onRetry: () => void load(),
  };
}
```

Note: because the API scopes `products` server-side by `categoryId` (= `?catalogo`), the returned `products` in catalog mode already belong to the active catalog — no client-side purpose filtering needed. In picker mode the products are unused (the skin renders the picker).

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: FAIL — only in `src/pages/catalog/skins/luxury-minimalism.tsx`, which still destructures the old `CatalogPageProps` (removed `typeFilter`, `categories`, `selectedCategory`, `onCategorySelect`, `onQuote`, etc.). Confirm all errors are within that one file; Task 7 rewrites it. If errors appear elsewhere, stop and investigate.

- [ ] **Step 3: Commit**

```bash
git add src/pages/catalog/useCatalogPage.ts
git commit -m "feat(catalog): two-mode (picker/catalog) navigation + per-product action in useCatalogPage"
```

(Committed red — Task 7 is the dependent completion, mirroring how Task 3 landed a prop change with no caller yet.)

---

### Task 7: Rewrite the catalog skin — picker mode + purpose-driven catalog mode

**Files:**
- Modify (full rewrite): `src/pages/catalog/skins/luxury-minimalism.tsx`

**Interfaces:**
- Consumes: `CatalogPicker` (Task 5), `CatalogSearchBar` (Task 4), `ProductCard` + `ProductCardSkeleton` from `@shared/ui`, the new `CatalogPageProps` (Task 6).

- [ ] **Step 1: Rewrite the skin file**

Replace the whole file `src/pages/catalog/skins/luxury-minimalism.tsx`:

```tsx
import React from 'react';
import { OfflineBanner } from '@shared/ui/OfflineBanner';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useTheme } from '@shared/ui/ThemeProvider';
import { ProductCard } from '@shared/ui/ProductCard';
import { ProductCardSkeleton } from '@shared/ui/ProductCardSkeleton';
import { CatalogPicker } from '../CatalogPicker';
import { CatalogSearchBar } from '../CatalogSearchBar';
import { catalogSubtitle } from '../purpose';
import type { CatalogPageProps } from '../useCatalogPage';

function IconBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="7.5" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M7.5 7.5V6C7.5 3.515 9.015 2 11 2C12.985 2 14.5 3.515 14.5 6V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 4L6.5 10L12.5 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const gridStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
  gap: isMobile ? '20px 12px' : '24px',
});

const LuxuryMinimalismSkin: React.FC<CatalogPageProps> = ({
  mode,
  catalogs,
  onCatalogSelect,
  activeCatalog,
  products,
  subcategories,
  selectedSubcategoryId,
  showBack,
  onBackToPicker,
  onSubcategorySelect,
  getCardAction,
  showPrices,
  currency,
  businessModel,
  searchQuery,
  isLoading,
  error,
  ordersEnabled,
  cartCount,
  companyName,
  logoUrl,
  onSearchChange,
  onCartClick,
  onRetry,
}) => {
  const { isMobile } = useTheme();

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--pwa-bg)' }}>
        <div style={{ textAlign: 'center', maxWidth: '280px', padding: '0 16px' }}>
          <p style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--pwa-text)', opacity: 0.5, marginBottom: '24px' }}>
            No se pudo cargar el catálogo.
          </p>
          <button type="button" onClick={onRetry} style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const isPicker = mode === 'picker';
  const hasProducts = !isLoading && products.length > 0;
  const isEmpty = !isLoading && products.length === 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', paddingBottom: '80px' }}>
      <OfflineBanner />

      <header style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'var(--pwa-bg)', borderBottom: '1px solid var(--pwa-border)' }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px', gap: '10px' }}>
            {showBack && !isPicker ? (
              <button type="button" onClick={onBackToPicker} aria-label="Volver a los catálogos" style={{ color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
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
              <button type="button" onClick={onCartClick} aria-label={`Carrito (${cartCount} artículos)`} style={{ position: 'relative', color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <IconBag />
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: 'var(--pwa-accent)', color: 'var(--pwa-bg)', fontSize: '9px', fontWeight: 600, minWidth: '14px', height: '14px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            ) : (
              <span style={{ width: '28px' }} />
            )}
          </div>
        )}

        {!isPicker && (
          <>
            <CatalogSearchBar value={searchQuery} onChange={onSearchChange} />
            {subcategories.length > 0 && (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                  <button type="button" onClick={() => onSubcategorySelect(null)} style={chipStyle(!selectedSubcategoryId)}>Todo</button>
                  {subcategories.map((sub) => (
                    <button key={sub.id} type="button" onClick={() => onSubcategorySelect(selectedSubcategoryId === sub.id ? null : sub.id)} style={chipStyle(selectedSubcategoryId === sub.id)}>
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </header>

      {isPicker ? (
        <CatalogPicker catalogs={catalogs} onSelect={onCatalogSelect} />
      ) : (
        <main style={{ padding: '20px 20px 0' }}>
          {isLoading && (
            <div style={gridStyle(isMobile)}>
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isEmpty && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.3rem', color: 'var(--pwa-text)', opacity: 0.35 }}>
                Sin resultados
              </p>
            </div>
          )}

          {hasProducts && (
            <div style={gridStyle(isMobile)}>
              {products.map((product) => {
                const action = getCardAction(product);
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    imageUrl={product.mainImageUrl}
                    price={product.basePrice ? parseFloat(product.basePrice) : null}
                    showPrices={showPrices}
                    currency={currency}
                    businessModel={businessModel}
                    actionLabel={action.label}
                    onAction={() => action.run()}
                  />
                );
              })}
            </div>
          )}
        </main>
      )}

      <CatalogFooter />
    </div>
  );
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--pwa-font-body)',
    fontSize: '9px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '6px 14px',
    borderRadius: 'var(--pwa-radius-chip)',
    border: `1px solid ${active ? 'var(--pwa-text)' : 'var(--pwa-border)'}`,
    backgroundColor: active ? 'var(--pwa-text)' : 'transparent',
    color: active ? 'var(--pwa-bg)' : 'var(--pwa-text-secondary)',
    cursor: 'pointer',
    flexShrink: 0,
  };
}

export default LuxuryMinimalismSkin;
```

Note the `ProductCard` `onAction` prop is typed `(id: string) => void`; here the resolved `action.run` already closes over the product, so we wrap it as `() => action.run()` — the `id` arg is ignored by design.

- [ ] **Step 2: Typecheck, lint, build**

Run: `pnpm tsc --noEmit`
Expected: PASS everywhere.

Run: `pnpm lint`
Expected: 0 errors (pre-existing warnings elsewhere are fine).

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/catalog/skins/luxury-minimalism.tsx
git commit -m "feat(catalog): render catalog picker + purpose-driven catalog experience"
```

---

### Task 8: Full verification pass

**Files:** none.

- [ ] **Step 1: Full test suite**

Run: `pnpm test`
Expected: all pass, including new `purpose.test.ts` and the existing `cart-store.test.ts`.

- [ ] **Step 2: Full checks**

Run: `pnpm tsc --noEmit && pnpm lint && pnpm build`
Expected: all green.

- [ ] **Step 3: Manual smoke test at 375px**

Dev server in default mode (not `--mode prod`), `VITE_DEV_SLUG` set to a real/seeded tenant. At 375px:

1. **Multi-catalog tenant:** `/catalog` shows the picker with each catalog's name + purpose subtitle. Tapping one sets `?catalogo=<id>`, shows its grid, header shows the catalog name + subtitle, and a back arrow returns to the picker (clearing `?catalogo`). Reloading a `?catalogo=<id>` URL lands directly inside that catalog.
2. **Purpose behavior:** in a `services` catalog, item cards show a "Reservar" pill → tapping it goes to `/book?itemId=<id>`; in a `menu` catalog, cards show "Agregar" → tapping adds to cart (toast fires, cart badge increments); in an `informative` catalog, cards show no pill and tapping the card opens the detail.
3. **Feature gating:** with `bookings` disabled, a `services` catalog's cards show no "Reservar"; with `orders` disabled, a `menu` catalog's cards show no "Agregar".
4. **Single-catalog tenant:** no picker — `/catalog` opens straight into the one catalog, no back arrow.
5. **Search debounce:** typing does not fire a request per keystroke (Network tab shows one request ~300ms after typing stops).
6. No horizontal scroll, no pinch-zoom regression.

- [ ] **Step 4: Report**

If all pass, the plan is complete → `finishing-a-development-branch`. If the smoke test surfaces a real bug, fix on the same branch first.

---

## Self-review

- **Spec coverage:** catalog picker by name + purpose subtitle → Task 5 + Task 6 (`mode`) + Task 7. Purpose-driven behavior (Reservar/Agregar/view-only) → Task 2 (`resolveCardActionKind`) + Task 3 (visible pill) + Task 6 (`getCardAction`) + Task 7. Single-catalog skip → Task 6 (`mode` logic). Search sticky + subcategory chips within a catalog → Task 4 + Task 7. Deep-link/back → Task 6 (`?catalogo`).
- **Placeholder scan:** none — every step has exact paths and complete code.
- **Type consistency:** `CardActionKind` defined once (Task 2), consumed by Task 6. `ProductCard`'s new `actionLabel`/`onAction` (Task 3) match Task 7's call. `CatalogPageProps` rewritten in Task 6 matches exactly what Task 7 destructures and what `CatalogPicker`/`CatalogSearchBar` (Tasks 4–5) expect.
- **Scope check:** removing the old `typeFilter`/`hasServices`/`hasProductItems`/category-chip machinery is in-scope — replaced wholesale by the picker + purpose model. Booking flow internals (B4) and product-detail redesign (B2) are out of scope; this plan only wires the card actions to existing routes (`/book?itemId=`, `/cart`, `/products/:id`).
```
