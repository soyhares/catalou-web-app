# Business Category Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed-list `businessCategory` field to the tenant (Company) model — editable by the tenant in the admin's "Mi Perfil" page, and displayed publicly below the tenant name in the catalog picker header of `catalou-web-app`.

**Architecture:** Contract-first, 4 repos in this order: `catalou-platform-core` (OpenAPI schema) → `catalou-api-core` (Prisma migration + routes) → `catalou-web-admin` (editable field in Mi Perfil) → `catalou-web-app` (public display). This is unrelated to the onboarding wizard's existing (currently broken/silently-dropped) `categoryType` question in `catalou-web-admin`'s `Step1Business.tsx` — that field is out of scope for this plan; it stays as-is.

**Tech Stack:** Node.js + TypeScript + Prisma + Express (api-core) · React + TypeScript + Vite (admin, web-app) · OpenAPI 3.

## Global Constraints

- TypeScript exclusively — never JavaScript.
- Never edit `src/generated/` by hand — always regenerate via `pnpm generate:admin` / `pnpm generate:catalog`.
- Contract-first: the OpenAPI schema changes before any code that consumes it.
- `businessCategory` is a fixed enum with exactly these 16 values (approved list, do not add/remove/rename): `BARBERSHOP, BEAUTY_SALON, SPA, BOUTIQUE, JEWELRY, FLORIST, PERFUMERY, TATTOO_STUDIO, ART_GALLERY, RESTAURANT, PHARMACY, RETAIL, PERSONAL_SHOPPER, PROFESSIONAL_SERVICES, ASSOCIATION, OTHER`.
- The field is **nullable** everywhere (existing tenants have none set) — never required, never defaulted to a specific category.
- It goes through the **operational** config endpoint (`/admin/company/config/operational`, `rbacGuard('ADMIN')` only), not the structural one (`/admin/company/config`, which requires `requireOperatorOrOnboarding` and is reserved for billing-sensitive fields like `orderType`/`servicePercentage`/`currency`/`association`) — `businessCategory` is cosmetic/informational, not structural.
- Feature branch per repo (`feat/business-category-field`), never commit to `main`, squash-merge, one PR per repo.
- Testing convention: `catalou-api-core` uses Vitest with real unit tests for repository/use-case logic (see `catalog.repository.test.ts`, `product.repository.test.ts` for the pattern this codebase follows — mock `prisma`, assert on the `select`/`data` shape passed to it). `catalou-web-admin` and `catalou-web-app` are verified via manual browser smoke test (no test infra changes needed for a single new field + select input).

---

## File Structure

| File | Repo | Responsibility | Change |
|---|---|---|---|
| `contracts/openapi/admin.yaml` | platform-core | Admin API contract | New `BusinessCategory` reusable schema; add field to `CompanyProfile` and `UpdateCompanyConfigOperationalRequest` |
| `contracts/openapi/catalog.yaml` | platform-core | Public API contract | Add field to `CompanyBranding` |
| `prisma/schema.prisma` | api-core | Data model | New `BusinessCategory` enum; new `businessCategory` field on `Company` |
| `src/shared/domain-types.ts` | api-core | Hand-rolled domain types | Add `businessCategory` to `CompanyDomain` |
| `src/infrastructure/db/company.repository.ts` | api-core | Company persistence | Add field to `UpdateConfigInput`, conditional spread in `updateCompanyConfig` |
| `src/presentation/routes/admin.router.ts` | api-core | Admin HTTP routes | Add field to `operationalConfigSchema` (Zod) |
| `src/presentation/routes/companies.router.ts` | api-core | Public HTTP routes | Add field to the public branding JSON response |
| `src/pages/profile/ProfilePage.tsx` | web-admin | Mi Perfil UI | New "Tipo de negocio" select, wired into the existing save flow |
| `src/entities/company/api.ts` | web-app | Public branding client | Add field to `BrandingData` |
| `src/entities/company/businessCategoryLabels.ts` | web-app | Display labels (new file) | Spanish label per enum value |
| `src/pages/catalog/useCatalogPage.ts` | web-app | Catalog page hook | Expose `businessCategory` in `CatalogPageProps` |
| `src/pages/catalog/skins/luxury-minimalism.tsx` | web-app | Catalog skin | Render the label below the tenant name in the picker header |

No new files in api-core or web-admin — the enum lives in the existing schema/contract files. One new file in web-app (label map), justified because both the admin (for its own select options, task 6) and web-app (for display, task 9) need the same 16-value list independently — no shared package exists between repos per the workspace's dependency rule, so each repo defines its own copy; this file isolates web-app's copy from the rest of `entities/company/api.ts`.

---

### Task 1: Contract — `BusinessCategory` schema (platform-core)

**Files:**
- Modify: `catalou-platform-core/contracts/openapi/admin.yaml`
- Modify: `catalou-platform-core/contracts/openapi/catalog.yaml`

**Interfaces:**
- Produces: a reusable `BusinessCategory` schema in `admin.yaml`, and the same enum values inlined in `catalog.yaml` (OpenAPI schemas don't share `$ref`s across separate contract files in this codebase — confirm by checking whether `catalog.yaml` already `$ref`s anything from `admin.yaml`; if not, inline the enum in `CompanyBranding` directly, matching how `orderType`/`businessModel` are already inlined there rather than shared).

- [ ] **Step 1: Add the `BusinessCategory` schema to `admin.yaml`**

In `catalou-platform-core/contracts/openapi/admin.yaml`, find the `CompanyProfile` schema (starts at line 1218) and insert a new schema immediately before it:

```yaml
    BusinessCategory:
      type: [string, 'null']
      enum:
        - BARBERSHOP
        - BEAUTY_SALON
        - SPA
        - BOUTIQUE
        - JEWELRY
        - FLORIST
        - PERFUMERY
        - TATTOO_STUDIO
        - ART_GALLERY
        - RESTAURANT
        - PHARMACY
        - RETAIL
        - PERSONAL_SHOPPER
        - PROFESSIONAL_SERVICES
        - ASSOCIATION
        - OTHER
        - null
      description: >-
        Tenant's business vertical, tenant-selected from a fixed list.
        Null for tenants that haven't set one (all tenants prior to this
        field's introduction, and any new tenant that skips it).

    CompanyProfile:
```

- [ ] **Step 2: Add the field to `CompanyProfile`**

Still in `admin.yaml`, find (within the `CompanyProfile` schema you just placed the new schema before):

```yaml
        association:
          oneOf:
            - $ref: '#/components/schemas/AssociationData'
            - type: 'null'

    AssociationData:
```

Replace with:

```yaml
        association:
          oneOf:
            - $ref: '#/components/schemas/AssociationData'
            - type: 'null'
        businessCategory:
          $ref: '#/components/schemas/BusinessCategory'

    AssociationData:
```

- [ ] **Step 3: Add the field to `UpdateCompanyConfigOperationalRequest`**

Find:

```yaml
    UpdateCompanyConfigOperationalRequest:
      type: object
      required: [language]
      properties:
        language:
          type: string
          enum: [ES, EN]
```

Replace with:

```yaml
    UpdateCompanyConfigOperationalRequest:
      type: object
      required: [language]
      properties:
        language:
          type: string
          enum: [ES, EN]
        businessCategory:
          $ref: '#/components/schemas/BusinessCategory'
```

- [ ] **Step 4: Add the field to `CompanyBranding` in `catalog.yaml`**

In `catalou-platform-core/contracts/openapi/catalog.yaml`, find (within `CompanyBranding`, starting line 242):

```yaml
        businessModel:
          type: string
          enum: [DIRECT, ASSOCIATED, BOTH]
          description: >
            Tenant-level business model. DIRECT = sells directly to end users.
            ASSOCIATED = operates through an association (orders require affiliate membership number
            and go through an association approval flow). BOTH = tenant operates under both models
```

Add immediately after that block (same indentation level as `businessModel`, still inside `CompanyBranding.properties`):

```yaml
        businessCategory:
          type: [string, 'null']
          enum:
            - BARBERSHOP
            - BEAUTY_SALON
            - SPA
            - BOUTIQUE
            - JEWELRY
            - FLORIST
            - PERFUMERY
            - TATTOO_STUDIO
            - ART_GALLERY
            - RESTAURANT
            - PHARMACY
            - RETAIL
            - PERSONAL_SHOPPER
            - PROFESSIONAL_SERVICES
            - ASSOCIATION
            - OTHER
            - null
          description: >-
            Tenant's business vertical, tenant-selected from a fixed list.
            Null for tenants that haven't set one.
```

(Inlined rather than `$ref`'d to `admin.yaml` — confirm no existing cross-file `$ref` pattern exists in this repo before deviating; if you find one during Step 4, use it instead and note the deviation in your report.)

- [ ] **Step 5: Lint**

Run: `cd catalou-platform-core && pnpm lint:yaml`
Expected: no errors introduced by this change (pre-existing unrelated warnings in other contract files, if any, are not this task's concern).

- [ ] **Step 6: Commit and PR**

```bash
cd catalou-platform-core
git checkout main && git pull
git checkout -b feat/business-category-field
git add contracts/openapi/admin.yaml contracts/openapi/catalog.yaml
git commit -m "feat(contracts): add businessCategory to CompanyProfile, operational config, and public branding"
git push -u origin feat/business-category-field
gh pr create --title "feat: businessCategory contract (admin + public branding)" --body "Adds a fixed 16-value businessCategory enum (nullable) to CompanyProfile, UpdateCompanyConfigOperationalRequest, and the public CompanyBranding schema — tenant-selected business vertical (Barbería, Spa, Restaurante, etc.), editable in admin's Mi Perfil, displayed in the public PWA header."
```

---

### Task 2: Prisma schema + migration (api-core)

**Files:**
- Modify: `catalou-api-core/prisma/schema.prisma`
- Create: a new migration folder under `catalou-api-core/prisma/migrations/` (generated by Prisma CLI, not hand-written)

**Interfaces:**
- Produces: `Company.businessCategory: BusinessCategory | null` — consumed by every task after this one.

- [ ] **Step 1: Create the branch**

```bash
cd catalou-api-core
git checkout main && git pull
git checkout -b feat/business-category-field
```

- [ ] **Step 2: Add the enum and field**

In `catalou-api-core/prisma/schema.prisma`, find:

```prisma
enum BusinessModel {
  DIRECT
  ASSOCIATED
}
```

Add immediately after it:

```prisma
enum BusinessCategory {
  BARBERSHOP
  BEAUTY_SALON
  SPA
  BOUTIQUE
  JEWELRY
  FLORIST
  PERFUMERY
  TATTOO_STUDIO
  ART_GALLERY
  RESTAURANT
  PHARMACY
  RETAIL
  PERSONAL_SHOPPER
  PROFESSIONAL_SERVICES
  ASSOCIATION
  OTHER
}
```

Then find, in the `Company` model:

```prisma
  catalogColorCard   String  @default("") @db.VarChar(7)
  servicePercentage  Decimal @default(0) @db.Decimal(5, 2)
  currency           String  @default("USD") @db.VarChar(3)
  createdAt       DateTime  @default(now())
```

Replace with:

```prisma
  catalogColorCard   String  @default("") @db.VarChar(7)
  servicePercentage  Decimal @default(0) @db.Decimal(5, 2)
  currency           String  @default("USD") @db.VarChar(3)
  businessCategory   BusinessCategory?
  createdAt       DateTime  @default(now())
```

- [ ] **Step 3: Generate and apply the migration**

Run: `cd catalou-api-core && npx prisma migrate dev --name add_company_business_category`
(Use the explicit `--name` flag, not the interactive `pnpm db:migrate` wrapper — this must run non-interactively.)
Expected: a new folder `prisma/migrations/<timestamp>_add_company_business_category/migration.sql` is created, containing a `CREATE TYPE "BusinessCategory" AS ENUM (...)` statement followed by `ALTER TABLE "companies" ADD COLUMN "businessCategory" "BusinessCategory"` (nullable — no `NOT NULL`, no `DEFAULT`). Prisma Client is regenerated automatically as part of this command.

- [ ] **Step 4: Verify the generated Prisma Client picked up the field**

Run: `cd catalou-api-core && pnpm typecheck`
Expected: clean (the generated `Company` type now includes `businessCategory: BusinessCategory | null`).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): add businessCategory enum and column to Company"
```

---

### Task 3: Domain type + repository (api-core)

**Files:**
- Modify: `catalou-api-core/src/shared/domain-types.ts`
- Modify: `catalou-api-core/src/infrastructure/db/company.repository.ts`
- Test: `catalou-api-core/src/infrastructure/db/company.repository.test.ts` (new)

**Interfaces:**
- Consumes: `Company.businessCategory` (Task 2).
- Produces: `CompanyDomain.businessCategory: string | null`; `UpdateConfigInput.businessCategory?: string | null`; `updateCompanyConfig()` persists it.

- [ ] **Step 1: Add the field to `CompanyDomain`**

In `catalou-api-core/src/shared/domain-types.ts`, find:

```typescript
export type BusinessModel = 'DIRECT' | 'ASSOCIATED';

export interface CompanyDomain {
  id: string;
  name: string;
  email: string;
  country: string;
  orderType: OrderType;
  showPrices: boolean;
  language: Language;
  slug: string;
  logoUrl: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorBackground: string;
  colorText: string;
  servicePercentage: { toNumber(): number } | number;
  currency: string;
  createdAt: Date;
}
```

Replace with:

```typescript
export type BusinessModel = 'DIRECT' | 'ASSOCIATED';

export type BusinessCategory =
  | 'BARBERSHOP'
  | 'BEAUTY_SALON'
  | 'SPA'
  | 'BOUTIQUE'
  | 'JEWELRY'
  | 'FLORIST'
  | 'PERFUMERY'
  | 'TATTOO_STUDIO'
  | 'ART_GALLERY'
  | 'RESTAURANT'
  | 'PHARMACY'
  | 'RETAIL'
  | 'PERSONAL_SHOPPER'
  | 'PROFESSIONAL_SERVICES'
  | 'ASSOCIATION'
  | 'OTHER';

export interface CompanyDomain {
  id: string;
  name: string;
  email: string;
  country: string;
  orderType: OrderType;
  showPrices: boolean;
  language: Language;
  slug: string;
  logoUrl: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorBackground: string;
  colorText: string;
  servicePercentage: { toNumber(): number } | number;
  currency: string;
  businessCategory: BusinessCategory | null;
  createdAt: Date;
}
```

- [ ] **Step 2: Write the failing test for `updateCompanyConfig`**

Create `catalou-api-core/src/infrastructure/db/company.repository.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateCompanyConfig } from './company.repository';
import { prisma } from './prisma';

vi.mock('./prisma', () => ({
  prisma: {
    $transaction: vi.fn((cb: (tx: unknown) => unknown) => cb({
      company: { update: vi.fn() },
      association: { upsert: vi.fn() },
    })),
  },
}));

describe('updateCompanyConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes businessCategory in the update data when provided', async () => {
    const mockUpdate = vi.fn();
    vi.mocked(prisma.$transaction).mockImplementation((cb: (tx: unknown) => unknown) =>
      Promise.resolve(cb({
        company: { update: mockUpdate },
        association: { upsert: vi.fn() },
      })),
    );

    await updateCompanyConfig('company-1', { businessCategory: 'BARBERSHOP' });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'company-1' },
      data: { businessCategory: 'BARBERSHOP' },
    });
  });

  it('omits businessCategory from the update data when not provided', async () => {
    const mockUpdate = vi.fn();
    vi.mocked(prisma.$transaction).mockImplementation((cb: (tx: unknown) => unknown) =>
      Promise.resolve(cb({
        company: { update: mockUpdate },
        association: { upsert: vi.fn() },
      })),
    );

    await updateCompanyConfig('company-1', { showPrices: true });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'company-1' },
      data: { showPrices: true },
    });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd catalou-api-core && pnpm vitest run src/infrastructure/db/company.repository.test.ts`
Expected: FAIL — `businessCategory` is not yet a recognized field on `UpdateConfigInput`, and the actual `data` object won't include it.

- [ ] **Step 4: Add the field to `UpdateConfigInput` and `updateCompanyConfig`**

In `catalou-api-core/src/infrastructure/db/company.repository.ts`, find:

```typescript
export interface UpdateConfigInput {
  orderType?: 'DIRECT' | 'FINANCED' | 'BOTH';
  showPrices?: boolean;
  language?: 'ES' | 'EN';
  association?: { name: string; email: string } | null;
  servicePercentage?: number;
  currency?: 'USD' | 'CRC';
}
```

Replace with:

```typescript
export interface UpdateConfigInput {
  orderType?: 'DIRECT' | 'FINANCED' | 'BOTH';
  showPrices?: boolean;
  language?: 'ES' | 'EN';
  association?: { name: string; email: string } | null;
  servicePercentage?: number;
  currency?: 'USD' | 'CRC';
  businessCategory?: string | null;
}
```

Find, inside `updateCompanyConfig`:

```typescript
        ...(input.servicePercentage !== undefined
          ? { servicePercentage: input.servicePercentage }
          : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
      },
    });
```

Replace with:

```typescript
        ...(input.servicePercentage !== undefined
          ? { servicePercentage: input.servicePercentage }
          : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.businessCategory !== undefined
          ? { businessCategory: input.businessCategory as BusinessCategory | null }
          : {}),
      },
    });
```

Find the top-of-file import:

```typescript
import type { Language, OrderType } from '../../generated/prisma/enums';
```

Replace with:

```typescript
import type { BusinessCategory, Language, OrderType } from '../../generated/prisma/enums';
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd catalou-api-core && pnpm vitest run src/infrastructure/db/company.repository.test.ts`
Expected: PASS (2/2).

- [ ] **Step 6: Typecheck and full test suite**

Run: `cd catalou-api-core && pnpm typecheck && pnpm test`
Expected: both clean.

- [ ] **Step 7: Commit**

```bash
git add src/shared/domain-types.ts src/infrastructure/db/company.repository.ts src/infrastructure/db/company.repository.test.ts
git commit -m "feat(company): persist businessCategory through updateCompanyConfig"
```

---

### Task 4: Zod validation + admin route (api-core)

**Files:**
- Modify: `catalou-api-core/src/presentation/routes/admin.router.ts`

**Interfaces:**
- Consumes: `UpdateConfigInput.businessCategory` (Task 3).

- [ ] **Step 1: Add the field to `operationalConfigSchema`**

Find:

```typescript
const operationalConfigSchema = z.object({ language: z.enum(['ES', 'EN']) });
```

Replace with:

```typescript
const operationalConfigSchema = z.object({
  language: z.enum(['ES', 'EN']),
  businessCategory: z
    .enum([
      'BARBERSHOP', 'BEAUTY_SALON', 'SPA', 'BOUTIQUE', 'JEWELRY', 'FLORIST',
      'PERFUMERY', 'TATTOO_STUDIO', 'ART_GALLERY', 'RESTAURANT', 'PHARMACY',
      'RETAIL', 'PERSONAL_SHOPPER', 'PROFESSIONAL_SERVICES', 'ASSOCIATION', 'OTHER',
    ])
    .nullable()
    .optional(),
});
```

Note: `language` is `required` in the OpenAPI schema (Task 1) but this Zod schema doesn't mark it `.optional()` either — consistent, no change needed there. `businessCategory` is optional/nullable, matching Task 1's contract.

- [ ] **Step 2: Typecheck and lint**

Run: `cd catalou-api-core && pnpm typecheck && pnpm lint`
Expected: both clean.

- [ ] **Step 3: Regenerate types from the (now-merged) contract**

Run: `cd catalou-api-core && CONTRACTS_PATH=../catalou-platform-core/contracts/openapi pnpm generate:admin && pnpm generate:catalog`
Expected: `src/generated/admin.ts` and `src/generated/catalog.ts` updated to include `BusinessCategory`/`businessCategory`. If Task 1's PR isn't merged yet, point `CONTRACTS_PATH` at the local platform-core checkout on its feature branch instead — the contract content is identical either way.

- [ ] **Step 4: Full test suite**

Run: `cd catalou-api-core && pnpm test`
Expected: all green (no existing test asserts the exact shape of `operationalConfigSchema`, so this is a pure addition with no expected regressions — confirm by running the suite, not by assumption).

- [ ] **Step 5: Commit**

```bash
git add src/presentation/routes/admin.router.ts src/generated/admin.ts src/generated/catalog.ts
git commit -m "feat(admin): validate businessCategory in operational config endpoint"
```

---

### Task 5: Public branding route (api-core)

**Files:**
- Modify: `catalou-api-core/src/presentation/routes/companies.router.ts`

**Interfaces:**
- Consumes: `company.businessCategory` (Task 2, available on the `CompanyWithAssociation` object `findCompanyBySlug` already returns — no query change needed since that function has no `select`).
- Produces: `businessCategory` field in the public `GET /companies/:slug/branding` JSON response — consumed by `catalou-web-app` (Task 9).

- [ ] **Step 1: Add the field to the response object**

Find:

```typescript
      featuresEnabled: (company.featuresEnabled ?? {}) as Record<string, boolean>,
      businessModel: company.orderType === 'DIRECT' ? 'DIRECT' : company.orderType === 'BOTH' ? 'BOTH' : 'ASSOCIATED',
    });
```

Replace with:

```typescript
      featuresEnabled: (company.featuresEnabled ?? {}) as Record<string, boolean>,
      businessModel: company.orderType === 'DIRECT' ? 'DIRECT' : company.orderType === 'BOTH' ? 'BOTH' : 'ASSOCIATED',
      businessCategory: company.businessCategory ?? null,
    });
```

- [ ] **Step 2: Typecheck, lint, test**

Run: `cd catalou-api-core && pnpm typecheck && pnpm lint && pnpm test`
Expected: all clean.

- [ ] **Step 3: Commit, push, and open the PR**

```bash
git add src/presentation/routes/companies.router.ts
git commit -m "feat(public): expose businessCategory on the public branding endpoint"
git push -u origin feat/business-category-field
gh pr create --title "feat: businessCategory field (Company model + admin config + public branding)" --body "$(cat <<'EOF'
## Summary
- New `BusinessCategory` enum (16 fixed values: barbershop, spa, restaurant, personal shopper, etc.) + nullable `businessCategory` column on Company.
- Editable via the existing operational config endpoint (`PUT /admin/company/config/operational`, admin-only, no operator gate — this is cosmetic, not billing-structural).
- Exposed on the public branding endpoint for the customer PWA to display.

Depends on catalou-platform-core#<PR from Task 1>.

## Test plan
- [x] typecheck/lint/test green
- [x] new repository test covers businessCategory inclusion/omission in the update payload
EOF
)"
```

---

### Task 6: Mi Perfil — editable field (web-admin)

**Files:**
- Modify: `catalou-web-admin/src/pages/profile/ProfilePage.tsx`

**Interfaces:**
- Consumes: `CompanyProfile.businessCategory` and `UpdateConfigOperationalInput.businessCategory` — both come from `@generated/admin` (regenerated types, Task 4's contract), already re-exported by `entities/company/api.ts` as `CompanyProfile`/`UpdateConfigOperationalInput` — no changes needed to `entities/company/api.ts` itself, only regeneration.
- Produces: the field is now part of `handleSave()`'s save flow, alongside the existing `updateProfile()` call.

- [ ] **Step 1: Regenerate types**

Run: `cd catalou-web-admin && pnpm generate:admin`
Expected: `src/generated/admin.ts` picks up `BusinessCategory`/`businessCategory` from the (by now merged, or locally-pointed via `CONTRACTS_PATH`) contract.

- [ ] **Step 2: Add local state, a label map, and load logic**

In `catalou-web-admin/src/pages/profile/ProfilePage.tsx`, find:

```typescript
import { getCompanyProfile, type CompanyProfile } from '@entities/company/api';

const PLATFORMS = ['instagram', 'facebook', 'tiktok', 'website'] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  website: 'Sitio web',
};
```

Replace with:

```typescript
import {
  getCompanyProfile,
  updateCompanyConfigOperational,
  type CompanyProfile,
} from '@entities/company/api';

const PLATFORMS = ['instagram', 'facebook', 'tiktok', 'website'] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  website: 'Sitio web',
};

const BUSINESS_CATEGORIES = [
  'BARBERSHOP', 'BEAUTY_SALON', 'SPA', 'BOUTIQUE', 'JEWELRY', 'FLORIST',
  'PERFUMERY', 'TATTOO_STUDIO', 'ART_GALLERY', 'RESTAURANT', 'PHARMACY',
  'RETAIL', 'PERSONAL_SHOPPER', 'PROFESSIONAL_SERVICES', 'ASSOCIATION', 'OTHER',
] as const;

const BUSINESS_CATEGORY_LABELS: Record<(typeof BUSINESS_CATEGORIES)[number], string> = {
  BARBERSHOP: 'Barbería',
  BEAUTY_SALON: 'Salón de belleza',
  SPA: 'Spa',
  BOUTIQUE: 'Boutique de ropa',
  JEWELRY: 'Joyería',
  FLORIST: 'Floristería',
  PERFUMERY: 'Perfumería',
  TATTOO_STUDIO: 'Estudio de tatuaje',
  ART_GALLERY: 'Galería de arte',
  RESTAURANT: 'Restaurante',
  PHARMACY: 'Farmacia',
  RETAIL: 'Tienda / Retail',
  PERSONAL_SHOPPER: 'Personal Shopper',
  PROFESSIONAL_SERVICES: 'Servicios profesionales',
  ASSOCIATION: 'Asociación',
  OTHER: 'Otro',
};
```

Find:

```typescript
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const load = useCallback(() => {
    setError(null);
    getCompanyProfile().then((cp) => setCompanyProfile(cp)).catch(() => {});
```

Replace with:

```typescript
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [businessCategory, setBusinessCategory] = useState<string>('');

  const load = useCallback(() => {
    setError(null);
    getCompanyProfile()
      .then((cp) => {
        setCompanyProfile(cp);
        setBusinessCategory(cp.businessCategory ?? '');
      })
      .catch(() => {});
```

- [ ] **Step 3: Include it in `handleSave`**

Find:

```typescript
  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const socialLinks: SocialLink[] = PLATFORMS.flatMap((p) => {
        const url = socialUrls[p].trim();
        return url ? [{ platform: p, url }] : [];
      });

      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
        publicEmail: publicEmail.trim() || null,
        socialLinks,
      });

      toast('Perfil actualizado', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el perfil.';
      toast(message, 'error');
    } finally {
      setSaving(false);
    }
  }
```

Replace with:

```typescript
  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const socialLinks: SocialLink[] = PLATFORMS.flatMap((p) => {
        const url = socialUrls[p].trim();
        return url ? [{ platform: p, url }] : [];
      });

      await Promise.all([
        updateProfile({
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          whatsappNumber: whatsappNumber.trim() || null,
          publicEmail: publicEmail.trim() || null,
          socialLinks,
        }),
        updateCompanyConfigOperational({
          language: companyProfile?.language ?? 'ES',
          businessCategory: businessCategory || null,
        }),
      ]);

      toast('Perfil actualizado', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el perfil.';
      toast(message, 'error');
    } finally {
      setSaving(false);
    }
  }
```

Note: `updateCompanyConfigOperational` requires `language` (contract-required field, Task 1 — unchanged). Since this page doesn't otherwise manage `language`, pass through the value already loaded on `companyProfile` so this save never silently resets it to a default.

- [ ] **Step 4: Add the select input to the "Información básica" card**

Find:

```typescript
              {errors.displayName && (
                <p className="text-xs text-danger-500 mt-1">{errors.displayName}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-text-secondary">
                  Descripción del negocio
                </label>
```

Replace with:

```typescript
              {errors.displayName && (
                <p className="text-xs text-danger-500 mt-1">{errors.displayName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Tipo de negocio
              </label>
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:border-primary-500"
              >
                <option value="">Sin especificar</option>
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {BUSINESS_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-text-secondary">
                  Descripción del negocio
                </label>
```

- [ ] **Step 5: Typecheck, lint**

Run: `cd catalou-web-admin && pnpm typecheck && pnpm lint`
Expected: both clean.

- [ ] **Step 6: Manual smoke test**

Start the admin dev server, log in as a test tenant admin, go to "Mi Perfil". Confirm: the "Tipo de negocio" select appears right after "Nombre visible del negocio", defaults to "Sin especificar" for a tenant with no value set, selecting a category and clicking "Guardar" shows the success toast, and reloading the page shows the selected category persisted (re-fetches from `getCompanyProfile()`).

- [ ] **Step 7: Commit, push, PR**

```bash
cd catalou-web-admin
git checkout main && git pull
git checkout -b feat/business-category-field
git add src/pages/profile/ProfilePage.tsx src/generated/admin.ts
git commit -m "feat(profile): add editable business category field to Mi Perfil"
git push -u origin feat/business-category-field
gh pr create --title "feat: editable business category in Mi Perfil" --body "Adds a 'Tipo de negocio' select (16 fixed categories + sin especificar) to Mi Perfil, saved through the existing operational config endpoint alongside language. Depends on catalou-api-core#<PR from Task 5>."
```

---

### Task 7: Public display types (web-app)

**Files:**
- Modify: `catalou-web-app/src/entities/company/api.ts`
- Create: `catalou-web-app/src/entities/company/businessCategoryLabels.ts`

**Interfaces:**
- Produces: `BrandingData.businessCategory: string | null`; `businessCategoryLabel(category: string | null): string | null` — consumed by Task 9.

- [ ] **Step 1: Write the failing test for the label helper**

Create `catalou-web-app/src/entities/company/businessCategoryLabels.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { businessCategoryLabel } from './businessCategoryLabels';

describe('businessCategoryLabel', () => {
  it('maps a known category to its Spanish label', () => {
    expect(businessCategoryLabel('BARBERSHOP')).toBe('Barbería');
    expect(businessCategoryLabel('RESTAURANT')).toBe('Restaurante');
    expect(businessCategoryLabel('PERSONAL_SHOPPER')).toBe('Personal Shopper');
  });

  it('returns null for null or an unrecognized value', () => {
    expect(businessCategoryLabel(null)).toBeNull();
    expect(businessCategoryLabel('NOT_A_REAL_CATEGORY')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd catalou-web-app && pnpm vitest run src/entities/company/businessCategoryLabels.test.ts`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Create the label map**

Create `catalou-web-app/src/entities/company/businessCategoryLabels.ts`:

```typescript
const BUSINESS_CATEGORY_LABELS: Record<string, string> = {
  BARBERSHOP: 'Barbería',
  BEAUTY_SALON: 'Salón de belleza',
  SPA: 'Spa',
  BOUTIQUE: 'Boutique de ropa',
  JEWELRY: 'Joyería',
  FLORIST: 'Floristería',
  PERFUMERY: 'Perfumería',
  TATTOO_STUDIO: 'Estudio de tatuaje',
  ART_GALLERY: 'Galería de arte',
  RESTAURANT: 'Restaurante',
  PHARMACY: 'Farmacia',
  RETAIL: 'Tienda / Retail',
  PERSONAL_SHOPPER: 'Personal Shopper',
  PROFESSIONAL_SERVICES: 'Servicios profesionales',
  ASSOCIATION: 'Asociación',
  OTHER: 'Otro',
};

export function businessCategoryLabel(category: string | null): string | null {
  if (!category) return null;
  return BUSINESS_CATEGORY_LABELS[category] ?? null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd catalou-web-app && pnpm vitest run src/entities/company/businessCategoryLabels.test.ts`
Expected: PASS (2/2).

- [ ] **Step 5: Add the field to `BrandingData`**

In `catalou-web-app/src/entities/company/api.ts`, find:

```typescript
  vapidPublicKey: string | null;
  featuresEnabled: Record<string, boolean>;
}
```

Replace with:

```typescript
  vapidPublicKey: string | null;
  featuresEnabled: Record<string, boolean>;
  businessCategory: string | null;
}
```

- [ ] **Step 6: Typecheck and full test suite**

Run: `cd catalou-web-app && pnpm typecheck && pnpm test`
Expected: both clean, test count increases by 2.

- [ ] **Step 7: Commit**

```bash
cd catalou-web-app
git checkout main && git pull
git checkout -b feat/business-category-field
git add src/entities/company/api.ts src/entities/company/businessCategoryLabels.ts src/entities/company/businessCategoryLabels.test.ts
git commit -m "feat(company): add businessCategory to BrandingData with a label helper"
```

---

### Task 8: Expose through `useCatalogPage` (web-app)

**Files:**
- Modify: `catalou-web-app/src/pages/catalog/useCatalogPage.ts`

**Interfaces:**
- Consumes: `branding.businessCategory` (Task 7).
- Produces: `CatalogPageProps.businessCategory: string | null` — consumed by Task 9.

- [ ] **Step 1: Add the field to `CatalogPageProps`**

Find:

```typescript
  companyName: string;
  logoUrl: string | null;
  ordersEnabled: boolean;
  bookingsEnabled: boolean;
```

Replace with:

```typescript
  companyName: string;
  logoUrl: string | null;
  businessCategory: string | null;
  ordersEnabled: boolean;
  bookingsEnabled: boolean;
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
    businessCategory: branding.businessCategory,
    ordersEnabled,
```

- [ ] **Step 3: Typecheck**

Run: `cd catalou-web-app && pnpm typecheck`
Expected: clean (adding a field to an interface and populating it doesn't break existing consumers).

- [ ] **Step 4: Commit**

```bash
git add src/pages/catalog/useCatalogPage.ts
git commit -m "feat(catalog): expose businessCategory from useCatalogPage"
```

---

### Task 9: Display in the picker header (web-app)

**Files:**
- Modify: `catalou-web-app/src/pages/catalog/skins/luxury-minimalism.tsx`

**Interfaces:**
- Consumes: `businessCategory` (Task 8), `businessCategoryLabel` (Task 7).

- [ ] **Step 1: Import the label helper**

Find:

```typescript
import { catalogSubtitle } from '../purpose';
import type { CatalogPageProps } from '../useCatalogPage';
```

Replace with:

```typescript
import { catalogSubtitle } from '../purpose';
import { businessCategoryLabel } from '@entities/company/businessCategoryLabels';
import type { CatalogPageProps } from '../useCatalogPage';
```

- [ ] **Step 2: Destructure the new prop**

Find:

```typescript
  companyName,
  logoUrl,
  onSearchChange,
  onCartClick,
  onBellClick,
  onClosePushModal,
  onRetry,
}) => {
```

Replace with:

```typescript
  companyName,
  logoUrl,
  businessCategory,
  onSearchChange,
  onCartClick,
  onBellClick,
  onClosePushModal,
  onRetry,
}) => {
```

- [ ] **Step 3: Render the label below the tenant name in the picker header**

Find (the `isPicker` left-slot block):

```tsx
            {isPicker ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexShrink: 1 }}>
                {logoUrl && (
                  <img src={logoUrl} alt="" aria-hidden="true" style={{ height: '56px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
                )}
                <span style={{ fontFamily: 'var(--pwa-font-body)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--pwa-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {companyName}
                </span>
              </div>
            ) : showBack ? (
```

Replace with:

```tsx
            {isPicker ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexShrink: 1 }}>
                {logoUrl && (
                  <img src={logoUrl} alt="" aria-hidden="true" style={{ height: '56px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--pwa-font-body)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--pwa-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {companyName}
                  </span>
                  {businessCategoryLabel(businessCategory) && (
                    <span style={{ display: 'block', fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pwa-text-secondary)', marginTop: '2px' }}>
                      {businessCategoryLabel(businessCategory)}
                    </span>
                  )}
                </div>
              </div>
            ) : showBack ? (
```

- [ ] **Step 4: Typecheck, lint, full test suite**

Run: `cd catalou-web-app && pnpm typecheck && pnpm lint && pnpm test`
Expected: all clean.

- [ ] **Step 5: Manual smoke test**

With a test tenant that has `businessCategory` set (via the Mi Perfil change from Task 6, against the same dev API), confirm the label renders below the tenant name in the picker header, correctly capitalized/styled, and doesn't appear at all for a tenant with no category set (no empty gap).

- [ ] **Step 6: Commit, push, PR**

```bash
git add src/pages/catalog/skins/luxury-minimalism.tsx
git commit -m "feat(catalog): show business category label below tenant name in picker header"
git push -u origin feat/business-category-field
gh pr create --title "feat: display business category in catalog picker header" --body "Shows the tenant's business category (Barbería, Spa, Restaurante, etc.) below the tenant name in the picker header, when set. Depends on catalou-web-admin#<PR from Task 6> for the field to actually be settable, and catalou-api-core#<PR from Task 5> for it to be readable publicly."
```

---

## Self-Review

**Spec coverage:** Contract (Task 1) → Prisma + persistence (Tasks 2-3) → validation/route (Task 4) → public exposure (Task 5) → admin edit UI (Task 6) → web-app types/label (Task 7) → hook (Task 8) → display (Task 9). Every layer from database to UI is covered, in dependency order, across all 4 repos. No gaps.

**Scope boundary:** the pre-existing onboarding `categoryType` question (`Step1Business.tsx`, silently dropped before reaching the API) is explicitly called out as out of scope in Global Constraints — flagged separately, not folded into this plan, since the user specified "Mi Perfil" as the edit location and fixing two different broken/new things in one plan would blur the review.

**Placeholders:** none — every step has exact code, exact file paths, exact commands with expected output.

**Type consistency:** the 16-value list appears in 4 places (contract enum ×2, Zod schema, TS union type, two label maps) — every occurrence in this plan uses the identical spelling/order; a fresh implementer should copy them verbatim rather than retyping, to avoid a mismatched value slipping through undetected until runtime.
