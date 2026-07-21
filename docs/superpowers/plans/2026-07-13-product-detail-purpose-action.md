# B2: Detalle de producto/servicio con acción por propósito Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El detalle de un producto/servicio (`/products/:id` en catalou-web-app) resuelve su acción principal (Reservar / Agregar / ninguna) a partir del `purpose` real de su catálogo — hoy solo mira `product.type`, lo que rompe en catálogos informativos con productos type=`product` y `orders` habilitado globalmente. Se agrega el CTA "Reservar" (ausente hoy) y el botón de WhatsApp gana jerarquía de CTA principal cuando es la única acción posible.

**Architecture:** El backend denormaliza `purpose` en el endpoint público `ProductDetail` (contract-first, mismo patrón que Pista A en B1) para que el cliente no tenga que cruzar dos fetches. El frontend reusa `resolveCardActionKind` (ya escrito y testeado en B1, `pages/catalog/purpose.ts`) para derivar el mismo `'book' | 'add' | 'none'` que ya usan las cards del catálogo — cero lógica de negocio duplicada.

**Tech Stack:** Node.js + TypeScript + Prisma + Express (api-core) · React + TypeScript + Vite (web-app) · OpenAPI 3 (platform-core) · Vitest en ambos repos.

## Global Constraints

- TypeScript exclusivamente — nunca JavaScript.
- Nunca editar `src/generated/` a mano — siempre regenerar con `pnpm generate` / `pnpm generate:catalog`.
- Contract-first: el contrato OpenAPI se actualiza antes que cualquier implementación que lo consuma.
- Tests co-ubicados junto al archivo que prueban (`*.test.ts`).
- TDD: test que falla → implementación mínima → test pasa → commit.
- Rama de feature por repo (`feat/product-detail-purpose-action`), nunca commit directo a `main`, squash-merge, un PR por repo.
- Reusar `resolveCardActionKind`/`CARD_ACTION_LABEL` de `pages/catalog/purpose.ts` — no reimplementar la lógica de qué acción corresponde a cada propósito.
- No tocar `ProductListCard`, `ProductGridCard`, ni `useCatalogPage.ts` (B1 ya resuelto y mergeado, PR #41) — el alcance es exclusivamente el detalle (`pages/product/`).
- No tocar el flujo `/book` en sí (ya existe, gateado por `BookingsGuard`, consume `?itemId=`).

---

### Task 1: Contrato — `purpose` en `ProductDetail`

**Files:**
- Modify: `catalou-platform-core/contracts/openapi/catalog.yaml:353-375` (schema `ProductDetail`)

**Interfaces:**
- Produces: campo `purpose: 'services' | 'menu' | 'informative' | null` en el schema `ProductDetail` (no en `ProductCard` base — el listado del catálogo ya resuelve el propósito vía `categories[]` en el mismo payload, agregarlo ahí sería redundante).

- [ ] **Step 1: Agregar el campo al schema**

En `catalou-platform-core/contracts/openapi/catalog.yaml`, dentro de `ProductDetail.allOf[1].properties` (junto a `description`, `technicalSpecs`), agregar:

```yaml
    ProductDetail:
      allOf:
        - $ref: '#/components/schemas/ProductCard'
        - type: object
          properties:
            description:
              type: [string, 'null']
            technicalSpecs:
              type: [string, 'null']
            purpose:
              type: [string, 'null']
              enum: [services, menu, informative, null]
              description: >-
                Purpose of the catalog (top-level category) this product
                belongs to — denormalized so the detail endpoint doesn't
                require a second fetch. Null for legacy categories.
            galleryImages:
```

(el resto del bloque —`galleryImages`, `variantType`— queda igual, solo se inserta `purpose` antes de `galleryImages`).

- [ ] **Step 2: Lint del contrato**

Run: `cd catalou-platform-core && pnpm lint:yaml`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd catalou-platform-core
git checkout -b feat/product-detail-purpose-action
git add contracts/openapi/catalog.yaml
git commit -m "feat(catalog): denormalize purpose on ProductDetail"
git push -u origin feat/product-detail-purpose-action
gh pr create --title "[B2] feat: purpose en ProductDetail" --body "Denormaliza purpose del catálogo dueño en el endpoint público de detalle de producto, para que el detalle no necesite cruzar dos fetches para saber si el ítem es reservable/agregable/informativo."
```

---

### Task 2: api-core — `purpose`/`categoryId` en `findPublishedProductById`

**Files:**
- Modify: `catalou-api-core/src/infrastructure/db/product.repository.ts` (interfaz `ProductFull`, constante `productFullInclude`, función `mapToProductFull`)
- Test: `catalou-api-core/src/infrastructure/db/product.repository.test.ts` (nuevo)

**Interfaces:**
- Consumes: contrato del Task 1 (campo `purpose` en `ProductDetail`) como referencia de forma, no de tipos generados (api-core no tipa sus responses contra `src/generated/`, ver `res.json(product)` en `catalog.router.ts:52`).
- Produces: `ProductFull` ahora incluye `categoryId: string` y `purpose: string | null`. Estos dos campos llegan a los 3 consumidores de `productFullInclude` (`findProductFullById`, `findByIdWithVariants`, `findPublishedProductById`) sin cambios adicionales en cada uno.

- [ ] **Step 1: Escribir el test que falla**

Crear `catalou-api-core/src/infrastructure/db/product.repository.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findPublishedProductById } from './product.repository';
import { prisma } from './prisma';

vi.mock('./prisma', () => ({
  prisma: {
    company: { findUnique: vi.fn() },
    product: { findFirst: vi.fn() },
  },
}));

const mockCompanyFindUnique = vi.mocked(prisma.company.findUnique);
const mockProductFindFirst = vi.mocked(prisma.product.findFirst);

beforeEach(() => {
  vi.clearAllMocks();
  mockCompanyFindUnique.mockResolvedValue({ id: 'company-1' } as never);
});

describe('findPublishedProductById', () => {
  it('requests categoryId and category.purpose in the include, and flattens them onto the result', async () => {
    mockProductFindFirst.mockResolvedValue({
      id: 'p1',
      companyId: 'company-1',
      subcategoryId: 'sub-1',
      name: 'Corte de cabello',
      description: null,
      technicalSpecs: null,
      basePrice: { toString: () => '25000' },
      status: 'PUBLISHED',
      mainImageUrl: null,
      mainImageSource: null,
      generationAttempts: 0,
      type: 'service',
      durationMinutes: 45,
      createdAt: new Date(),
      updatedAt: new Date(),
      variantType: null,
      images: [],
      subcategory: { categoryId: 'cat-1', category: { purpose: 'services' } },
    } as never);

    const result = await findPublishedProductById('graal', 'p1');

    // the prisma include must request categoryId + category.purpose
    const call = mockProductFindFirst.mock.calls[0][0] as {
      include: { subcategory: { select: { categoryId: boolean; category: { select: { purpose: boolean } } } } };
    };
    expect(call.include.subcategory.select.categoryId).toBe(true);
    expect(call.include.subcategory.select.category.select.purpose).toBe(true);

    // and flow through to the flattened result
    expect(result?.categoryId).toBe('cat-1');
    expect(result?.purpose).toBe('services');
  });

  it('returns null when the product is not found', async () => {
    mockProductFindFirst.mockResolvedValue(null);
    const result = await findPublishedProductById('graal', 'missing');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar el test y confirmar que falla**

Run: `cd catalou-api-core && pnpm vitest run src/infrastructure/db/product.repository.test.ts`
Expected: FAIL — `call.include.subcategory` es `undefined` (el include actual no pide `subcategory`).

- [ ] **Step 3: Extender `productFullInclude`, `ProductFull` y `mapToProductFull`**

En `catalou-api-core/src/infrastructure/db/product.repository.ts`, modificar la interfaz `ProductFull` (agregar los dos campos nuevos justo después de `subcategoryId`):

```typescript
export interface ProductFull {
  id: string;
  companyId: string;
  subcategoryId: string;
  categoryId: string;
  purpose: string | null;
  name: string;
  description: string | null;
  technicalSpecs: string | null;
  basePrice: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  mainImageUrl: string | null;
  mainImageSource: 'AI' | 'MANUAL' | null;
  generationAttempts: number;
  type: 'product' | 'service';
  durationMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
  variantType: {
    id: string;
    name: string;
    values: {
      id: string;
      value: string;
      priceModifier: string;
      imageUrl: string | null;
    }[];
  } | null;
  images: { id: string; url: string; sortOrder: number }[];
}
```

Modificar la firma de `mapToProductFull` (agregar `subcategory` al tipo del parámetro) y su cuerpo:

```typescript
function mapToProductFull(p: {
  id: string;
  companyId: string;
  subcategoryId: string;
  name: string;
  description: string | null;
  technicalSpecs: string | null;
  basePrice: { toString(): string };
  status: ProductStatus;
  mainImageUrl: string | null;
  mainImageSource: string | null;
  generationAttempts: number;
  type: string;
  durationMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
  variantType: {
    id: string;
    name: string;
    values: { id: string; value: string; priceModifier: { toString(): string }; imageUrl: string | null }[];
  } | null;
  images: { id: string; url: string; sortOrder: number }[];
  subcategory: { categoryId: string; category: { purpose: string | null } };
}): ProductFull {
  return {
    id: p.id,
    companyId: p.companyId,
    subcategoryId: p.subcategoryId,
    categoryId: p.subcategory.categoryId,
    purpose: p.subcategory.category.purpose,
    name: p.name,
    description: p.description,
    technicalSpecs: p.technicalSpecs,
    basePrice: p.basePrice.toString(),
    status: p.status,
    mainImageUrl: p.mainImageUrl,
    mainImageSource: p.mainImageSource as 'AI' | 'MANUAL' | null,
    generationAttempts: p.generationAttempts,
    type: p.type as 'product' | 'service',
    durationMinutes: p.durationMinutes,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    variantType: p.variantType
      ? {
          id: p.variantType.id,
          name: p.variantType.name,
          values: p.variantType.values.map((v) => ({
            id: v.id,
            value: v.value,
            priceModifier: v.priceModifier.toString(),
            imageUrl: v.imageUrl,
          })),
        }
      : null,
    images: p.images.map((img) => ({ id: img.id, url: img.url, sortOrder: img.sortOrder })),
  };
}
```

Modificar `productFullInclude`:

```typescript
const productFullInclude = {
  variantType: { include: { values: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
  subcategory: { select: { categoryId: true, category: { select: { purpose: true } } } },
} as const;
```

- [ ] **Step 4: Ejecutar el test y confirmar que pasa**

Run: `cd catalou-api-core && pnpm vitest run src/infrastructure/db/product.repository.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Typecheck del repo completo**

Run: `cd catalou-api-core && pnpm typecheck`
Expected: sin errores (los 3 call sites de `productFullInclude` reciben los campos nuevos automáticamente desde Prisma; ningún consumidor de `ProductFull` construye el objeto a mano — todos lo obtienen de `findProductFullById`/`findByIdWithVariants`/`findPublishedProductById`).

- [ ] **Step 6: Regenerar tipos desde el contrato actualizado y correr el resto de tests**

Run:
```bash
cd catalou-api-core
CONTRACTS_PATH=../catalou-platform-core/contracts/openapi pnpm generate:catalog
pnpm vitest run
```
Expected: `src/generated/catalog.ts` actualizado (incluye `purpose` en `ProductDetail`), suite completa en verde.

- [ ] **Step 7: Commit y PR**

```bash
git checkout -b feat/product-detail-purpose-action
git add src/infrastructure/db/product.repository.ts src/infrastructure/db/product.repository.test.ts src/generated/catalog.ts
git commit -m "feat(catalog): expose categoryId and purpose on public product detail"
git push -u origin feat/product-detail-purpose-action
gh pr create --title "[B2] feat: purpose y categoryId en detalle público de producto" --body "El detalle público de un producto/servicio ahora trae categoryId y purpose denormalizados del catálogo dueño — el frontend deja de necesitar un segundo fetch para resolver la acción principal (reservar/agregar/informativo). Depende de platform-core#<PR del Task 1>."
```

---

### Task 3: web-app — alinear `ProductPublic` con el contrato

**Files:**
- Modify: `catalou-web-app/src/entities/product/api.ts`

**Interfaces:**
- Consumes: respuesta del endpoint `GET /catalog/:slug/products/:id` (Task 2), que ahora trae `categoryId`, `purpose`, `durationMinutes` (este último ya existía en `ProductCard` pero nunca se reflejó en el tipo manual del frontend).
- Produces: `ProductPublic` con `categoryId: string`, `purpose: 'services' | 'menu' | 'informative' | null`, `durationMinutes: number | null` — consumidos por el Task 4.

- [ ] **Step 1: Regenerar tipos del contrato en web-app**

Run: `cd catalou-web-app && pnpm generate:catalog`
Expected: `src/generated/catalog.ts` actualizado con `purpose` en `ProductDetail` (confirma que el contrato del Task 1 ya está mergeado/disponible — si falla, verificar que `CONTRACTS_PATH` apunta a la copia local actualizada de `catalou-platform-core`).

- [ ] **Step 2: Alinear el tipo manual**

En `catalou-web-app/src/entities/product/api.ts`, modificar `ProductPublic`:

```typescript
export interface ProductPublic {
  id: string;
  name: string;
  type: 'product' | 'service';
  description: string | null;
  technicalSpecs: string | null;
  basePrice: string;
  mainImageUrl: string | null;
  categoryId: string;
  purpose: 'services' | 'menu' | 'informative' | null;
  durationMinutes: number | null;
  variantType: VariantTypePublic | null;
  images: ProductImagePublic[];
}
```

- [ ] **Step 3: Typecheck**

Run: `cd catalou-web-app && pnpm typecheck`
Expected: sin errores (el tipo se amplía, no se achica — ningún consumidor existente de `ProductPublic` se rompe por campos nuevos).

- [ ] **Step 4: Commit**

```bash
git checkout -b feat/product-detail-purpose-action
git add src/entities/product/api.ts src/generated/catalog.ts
git commit -m "feat(product): align ProductPublic with categoryId/purpose/durationMinutes from contract"
```

---

### Task 4: web-app — `useProductPage`: resolver la acción principal por propósito

**Files:**
- Modify: `catalou-web-app/src/pages/product/useProductPage.ts`

**Interfaces:**
- Consumes: `resolveCardActionKind` y `CardActionKind` de `../catalog/purpose` (ya existen, ver `catalou-web-app/src/pages/catalog/purpose.ts:20-27`); `ProductPublic.purpose`/`categoryId`/`durationMinutes` del Task 3; `branding.featuresEnabled?.bookings` (mismo patrón que `catalou-web-app/src/pages/catalog/useCatalogPage.ts:65`).
- Produces: `ProductPageProps` gana `ctaKind: CardActionKind` y `onBook: () => void`; `canAddToCart` se renombra a `canProceed` (gatea tanto Agregar como Reservar — misma regla de variante obligatoria). El Task 6 consume estos tres campos.

- [ ] **Step 1: Actualizar `ProductPageProps` y el cuerpo del hook**

En `catalou-web-app/src/pages/product/useProductPage.ts`, reemplazar el archivo completo:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { fetchProduct, type ProductPublic, type VariantValuePublic } from '@entities/product/api';
import { resolveCardActionKind, type CardActionKind } from '../catalog/purpose';
import { useCart } from '@shared/lib/use-cart';

export interface ProductPageProps {
  product: ProductPublic | null;
  isLoading: boolean;
  error: string | null;
  selectedVariant: VariantValuePublic | null; // the selected VariantValuePublic object
  activeImage: string | null;
  quantity: number;
  computedPrice: string | null;
  canProceed: boolean;
  addedFeedback: boolean;
  ctaKind: CardActionKind;
  onVariantSelect: (variant: VariantValuePublic) => void;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBook: () => void;
  onBack: () => void;
  onGoHome: () => void;
  onImageSelect: (url: string) => void;
  showPrices: boolean;
  currency: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  companyName: string;
  ordersEnabled: boolean;
}

export function useProductPage(): ProductPageProps {
  const { id } = useParams<{ id: string }>();
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const { add: addToCart } = useCart(slug);

  const [product, setProduct] = useState<ProductPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantValuePublic | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const ordersEnabled = branding.featuresEnabled?.orders === true;
  const bookingsEnabled = branding.featuresEnabled?.bookings === true;

  useEffect(() => {
    if (!id || !slug) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await fetchProduct(slug, id);
        setProduct(p);
        setActiveImage(p.mainImageUrl);
      } catch {
        setError('Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, slug]);

  const computePrice = useCallback((): string | null => {
    if (!product) return null;
    const base = parseFloat(product.basePrice);
    const modifier = selectedVariant ? parseFloat(selectedVariant.priceModifier) : 0;
    return (base + modifier).toFixed(2);
  }, [product, selectedVariant]);

  function onVariantSelect(variant: VariantValuePublic) {
    setSelectedVariant(variant);
    setActiveImage(variant.imageUrl ?? product?.mainImageUrl ?? null);
  }

  function onQuantityChange(qty: number) {
    setQuantity(Math.max(1, qty));
  }

  function onBack() {
    navigate(-1);
  }

  function onGoHome() {
    navigate('/catalog');
  }

  function onImageSelect(url: string) {
    setActiveImage(url);
  }

  const hasVariants = !!product?.variantType;
  const canProceed = !hasVariants || selectedVariant !== null;

  const ctaKind: CardActionKind = product
    ? resolveCardActionKind({
        purpose: product.purpose,
        productType: product.type,
        ordersEnabled,
        bookingsEnabled,
      })
    : 'none';

  function onAddToCart() {
    const price = computePrice();
    if (!canProceed || !product || !price) return;
    void addToCart({
      companySlug: slug,
      productId: product.id,
      productName: product.name,
      variantTypeId: product.variantType?.id ?? null,
      variantTypeName: product.variantType?.name ?? null,
      variantValueId: selectedVariant?.id ?? null,
      variantValueName: selectedVariant?.value ?? null,
      quantity,
      unitPrice: parseFloat(price),
    }).then(() => {
      window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { name: product.name } }));
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    }).catch((err: unknown) => {
      console.error('[useProductPage] addToCart failed:', err);
    });
  }

  function onBook() {
    if (!canProceed || !product) return;
    void navigate(`/book?itemId=${product.id}`);
  }

  return {
    product,
    isLoading: loading,
    error,
    selectedVariant,
    activeImage,
    quantity,
    computedPrice: computePrice(),
    canProceed,
    addedFeedback,
    ctaKind,
    onVariantSelect,
    onQuantityChange,
    onAddToCart,
    onBook,
    onBack,
    onGoHome,
    onImageSelect,
    showPrices: branding.showPrices,
    currency: branding.currency ?? 'CRC',
    businessModel: branding.businessModel,
    companyName: branding.companyName,
    ordersEnabled,
  };
}
```

Nota: se elimina el `fetchCatalog(slug)` paralelo que antes solo se usaba para leer `catalog.showPrices` — `BrandingData` (ya cargado por `useBranding()`, sin fetch adicional) trae `showPrices: boolean` directamente (`catalou-web-app/src/entities/company/api.ts:12`), la misma fuente que ya usa el resto de la PWA. Como el propósito ahora viene denormalizado en `product.purpose` (Task 3), este hook deja de necesitar el catálogo completo para nada.

- [ ] **Step 2: Typecheck**

Run: `cd catalou-web-app && pnpm typecheck`
Expected: FAIL en `src/pages/product/skins/luxury-minimalism.tsx` — usa `canAddToCart` (renombrado) y no conoce `ctaKind`/`onBook`. Se corrige en el Task 6.

- [ ] **Step 3: Commit**

```bash
git add src/pages/product/useProductPage.ts
git commit -m "feat(product): resolve primary action from catalog purpose instead of product.type alone"
```

(El typecheck sigue en rojo hasta el Task 6 — es esperado, ambos tasks son parte del mismo commit lógico de feature; no se hace push todavía.)

---

### Task 5: web-app — `WhatsAppProductConsultButton`: variante prominente

**Files:**
- Modify: `catalou-web-app/src/shared/ui/WhatsAppProductConsultButton.tsx`

**Interfaces:**
- Produces: prop nueva `variant?: 'primary' | 'secondary'` (default `'secondary'`, preserva el comportamiento actual sin cambios visuales cuando no se pasa). El Task 6 pasa `variant="primary"` cuando `ctaKind === 'none'`.

- [ ] **Step 1: Agregar la prop y las dos variantes de estilo**

Reemplazar `catalou-web-app/src/shared/ui/WhatsAppProductConsultButton.tsx` completo:

```typescript
import { useEffect, useState } from 'react';
import { useBranding } from '@app/BrandingContext';
import { getCatalogProfile } from '@entities/shopper-profile/api';

interface Props {
  productName: string;
  variant?: 'primary' | 'secondary';
}

export function WhatsAppProductConsultButton({ productName, variant = 'secondary' }: Props) {
  const { slug, branding } = useBranding();
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

  useEffect(() => {
    if (branding.businessModel !== 'DIRECT') return;
    getCatalogProfile(slug)
      .then((p) => setWhatsappNumber(p.whatsappNumber))
      .catch(() => {});
  }, [slug, branding.businessModel]);

  if (branding.businessModel !== 'DIRECT' || !whatsappNumber) return null;

  const href = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, me interesa conocer más sobre: ${productName}`)}`;
  const isPrimary = variant === 'primary';

  const link = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Consultar por WhatsApp sobre ${productName}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: isPrimary ? '16px 24px' : '11px 16px',
        border: 'none',
        borderRadius: 'var(--pwa-radius-button)',
        backgroundColor: '#25D366',
        color: '#ffffff',
        fontFamily: 'var(--pwa-font-body)',
        fontSize: isPrimary ? '14px' : '13px',
        fontWeight: 600,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={isPrimary ? 18 : 16} height={isPrimary ? 18 : 16} fill="#ffffff" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      {isPrimary ? 'Consultar por WhatsApp' : 'Consultar por WhatsApp'}
    </a>
  );

  if (isPrimary) {
    return <div style={{ marginBottom: '32px' }}>{link}</div>;
  }

  return (
    <div style={{ borderTop: '1px solid var(--pwa-border)', paddingTop: '16px', marginTop: '4px', marginBottom: '16px' }}>
      {link}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd catalou-web-app && pnpm typecheck`
Expected: mismo estado que al final del Task 4 (este archivo no introduce errores nuevos; sigue en rojo por el skin, se corrige en el Task 6).

- [ ] **Step 3: Commit**

```bash
git add src/shared/ui/WhatsAppProductConsultButton.tsx
git commit -m "feat(product): add primary variant to WhatsApp consult button"
```

---

### Task 6: web-app — skin luxury-minimalism: CTA por propósito

**Files:**
- Modify: `catalou-web-app/src/pages/product/skins/luxury-minimalism.tsx`

**Interfaces:**
- Consumes: `ctaKind`, `onBook`, `canProceed` de `ProductPageProps` (Task 4); prop `variant` de `WhatsAppProductConsultButton` (Task 5); `product.durationMinutes` (Task 3).

- [ ] **Step 1: Reemplazar el bloque de acción y el uso de WhatsApp**

En `catalou-web-app/src/pages/product/skins/luxury-minimalism.tsx`, actualizar la desestructuración de props (línea ~24-45): reemplazar `canAddToCart` por `canProceed`, agregar `ctaKind` y `onBook`:

```typescript
  const {
    product,
    isLoading,
    error,
    selectedVariant,
    activeImage,
    quantity,
    computedPrice,
    canProceed,
    addedFeedback,
    ctaKind,
    onVariantSelect,
    onQuantityChange,
    onAddToCart,
    onBook,
    onBack,
    onGoHome,
    onImageSelect,
    showPrices,
    currency,
    businessModel,
    companyName,
    ordersEnabled,
  } = props;
```

Reemplazar el bloque de precio (líneas ~243-264 en el original: `{showPrices && computedPrice && (...)}` + `PriceDisclaimer`) para incluir la duración cuando `ctaKind === 'book'`:

```tsx
            {/* Price — accent color, generous spacing; duration alongside when bookable */}
            {showPrices && computedPrice && (
              <p style={{
                fontFamily: 'var(--pwa-font-heading)',
                fontStyle: 'italic',
                fontSize: '1.5rem',
                fontWeight: 500,
                color: 'var(--pwa-accent)',
                letterSpacing: '0.03em',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                {formatPrice(Number(computedPrice), currency)}
                {selectedVariant && parseFloat(selectedVariant.priceModifier) > 0 && (
                  <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.8rem', fontWeight: 400, fontStyle: 'normal', color: 'var(--pwa-text-secondary)' }}>
                    base + variante
                  </span>
                )}
                {ctaKind === 'book' && product.durationMinutes !== null && (
                  <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, fontStyle: 'normal', color: 'var(--pwa-text-secondary)', opacity: 0.6 }}>
                    · {product.durationMinutes} min
                  </span>
                )}
              </p>
            )}
            {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && computedPrice && (
              <PriceDisclaimer className="mb-6" />
            )}
```

Reemplazar el bloque condicional de cantidad/CTA (líneas ~308-361 en el original: `{ordersEnabled && product?.type !== 'service' && (...)}`) por el switch sobre `ctaKind`:

```tsx
            {/* Primary action — quantity+Agregar for menu, Reservar for services, nothing for informative */}
            {ctaKind === 'add' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                  <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.5 }}>
                    Cantidad
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--pwa-border)', paddingBottom: '4px' }}>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(quantity - 1)}
                      style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '18px', color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, lineHeight: 1, padding: '0 4px' }}
                    >
                      −
                    </button>
                    <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '14px', color: 'var(--pwa-text)', minWidth: '24px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(quantity + 1)}
                      style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '18px', color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, lineHeight: 1, padding: '0 4px' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={onAddToCart}
                  style={{
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: 'var(--pwa-bg)',
                    backgroundColor: 'var(--pwa-accent)',
                    border: 'none',
                    borderRadius: 'var(--pwa-radius-button)',
                    padding: '16px 24px',
                    width: '100%',
                    cursor: canProceed ? 'pointer' : 'not-allowed',
                    opacity: canProceed ? 1 : 0.3,
                    transition: 'opacity 0.2s',
                    marginBottom: '32px',
                  }}
                >
                  {addedFeedback ? '¡Añadido!' : canProceed ? 'Agregar' : 'Selecciona una opción'}
                </button>
              </>
            )}

            {ctaKind === 'book' && (
              <button
                type="button"
                disabled={!canProceed}
                onClick={onBook}
                style={{
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--pwa-bg)',
                  backgroundColor: 'var(--pwa-accent)',
                  border: 'none',
                  borderRadius: 'var(--pwa-radius-button)',
                  padding: '16px 24px',
                  width: '100%',
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  opacity: canProceed ? 1 : 0.3,
                  transition: 'opacity 0.2s',
                  marginBottom: '32px',
                }}
              >
                {canProceed ? 'Reservar' : 'Selecciona una opción'}
              </button>
            )}
```

Nota: la prop `ordersEnabled` queda sin uso directo en este archivo tras el cambio (la decisión ahora vive en `ctaKind`, ya calculado en el hook) — eliminarla de la desestructuración si el linter marca `no-unused-vars`; queda en `ProductPageProps` porque otras partes del hook la exponen consistentemente con `useCatalogPage`.

Reemplazar la línea final `<WhatsAppProductConsultButton productName={product.name} />` (línea ~395 en el original) por:

```tsx
            {ctaKind !== 'none' && <WhatsAppProductConsultButton productName={product.name} />}
```

E insertar el WhatsApp prominente inmediatamente después del bloque de precio/divider cuando no hay otra acción — agregar este bloque justo antes del comentario `{/* Divider */}` original no aplica; en su lugar, insertarlo **después** del bloque `{ctaKind === 'book' && (...)}` de arriba (mismo nivel, como tercera rama del switch):

```tsx
            {ctaKind === 'none' && (
              <WhatsAppProductConsultButton productName={product.name} variant="primary" />
            )}
```

- [ ] **Step 2: Typecheck y lint**

Run: `cd catalou-web-app && pnpm typecheck && pnpm lint`
Expected: ambos en verde — ya no quedan referencias a `canAddToCart` en el repo.

Run: `grep -rn "canAddToCart" src` — debe devolver vacío.

- [ ] **Step 3: Correr la suite de tests**

Run: `cd catalou-web-app && pnpm test`
Expected: 15/15 en verde (ningún test existente cubre `useProductPage`/el skin de producto — son verificados manualmente en el Task 7, mismo patrón que `useCatalogPage.ts` en B1).

- [ ] **Step 4: Commit**

```bash
git add src/pages/product/skins/luxury-minimalism.tsx
git commit -m "feat(product): switch primary action zone on resolved purpose (book/add/none)"
```

---

### Task 7: Verificación completa + smoke test en navegador

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Verificación estática — ambos repos**

Run:
```bash
cd catalou-api-core && pnpm typecheck && pnpm lint && pnpm test
cd catalou-web-app && pnpm typecheck && pnpm lint && pnpm test
```
Expected: todo en verde en ambos repos.

- [ ] **Step 2: Levantar servidores reales**

Confirmar que `catalou-api-core` corre en `:3000` y `catalou-web-app` en `:5173` contra la base real (mismo tenant ASEALLERGAN usado en B1: Tienda=menu, Servicios=services, Convenios=informative).

- [ ] **Step 3: Smoke test — catálogo `menu` (Tienda)**

Navegar a un producto de Tienda. Verificar en el detalle: precio sin duración, selector de cantidad, botón "Agregar" (mismo estilo que antes — sin regresión visual), WhatsApp secundario al final (si el tenant tiene número configurado).

- [ ] **Step 4: Smoke test — catálogo `services` (Servicios)**

Navegar a un servicio desde Servicios. Verificar: línea de precio + "· 45 min" (o la duración real del servicio) en la misma fila, sin selector de cantidad, botón "Reservar" full-width pill, click navega a `/book?itemId=<id>` y preselecciona el servicio (mismo comportamiento que el botón rápido de la card). WhatsApp secundario al final.

- [ ] **Step 5: Smoke test — catálogo `informative` (Convenios)**

Navegar a un ítem de Convenios. Verificar: sin selector de cantidad, sin botón Agregar/Reservar, el botón "Consultar por WhatsApp" aparece inmediatamente después del precio/divider con el mismo peso visual que los CTA de los otros dos casos, y **no** se repite al final de la página.

- [ ] **Step 6: Regresión — producto con variantes obligatorias**

En un producto (`menu`) o servicio (`services`) con `variantType`, verificar que el botón queda deshabilitado ("Selecciona una opción") hasta elegir una variante, en ambos casos (`Agregar` y `Reservar`).

- [ ] **Step 7: Push y PRs**

```bash
cd catalou-api-core && git push -u origin feat/product-detail-purpose-action
gh pr create --title "[B2] feat: purpose y categoryId en detalle público de producto" --body "..."

cd catalou-web-app && git push -u origin feat/product-detail-purpose-action
gh pr create --title "[B2] feat: acción del detalle de producto resuelta por propósito de catálogo" --body "$(cat <<'EOF'
## Summary
- El detalle de producto/servicio resuelve su acción principal (Reservar/Agregar/ninguna) reusando resolveCardActionKind (B1) con el purpose denormalizado del backend — antes solo miraba product.type, lo que era incorrecto en catálogos informativos con orders habilitado globalmente.
- Nuevo CTA "Reservar" en el detalle de servicios (ausente hasta ahora — solo existía en la card del catálogo).
- WhatsApp se convierte en el CTA principal cuando es la única acción posible (catálogos informativos).

## Test plan
- [ ] tsc/lint/test verdes en api-core y web-app
- [ ] Smoke test navegador: Tienda (menu), Servicios (services), Convenios (informative) — tenant ASEALLERGAN
- [ ] Regresión: producto/servicio con variantes obligatorias bloquea el CTA hasta seleccionar
EOF
)"
```

---

## Self-Review

**Cobertura del spec:** Task 1-2 cubren el backend (contrato + repositorio, TDD). Task 3 alinea el tipo del frontend. Task 4 resuelve la acción reusando `resolveCardActionKind` de B1 sin duplicar lógica. Task 5 agrega la variante prominente de WhatsApp. Task 6 aplica todo en el skin. Task 7 verifica los 3 propósitos + regresión de variantes + PRs. Sin gaps frente al diseño aprobado.

**Placeholders:** ninguno — cada step tiene código completo o comando exacto con output esperado.

**Consistencia de tipos:** `ctaKind: CardActionKind` (Task 4) es el mismo tipo que ya exporta `purpose.ts` desde B1 — no se redefine. `canProceed` reemplaza a `canAddToCart` de forma consistente en Task 4 (definición) y Task 6 (único consumidor). `WhatsAppProductConsultButton`'s prop `variant` (Task 5) se consume con los mismos valores literales (`'primary'`/`'secondary'`) en Task 6.
