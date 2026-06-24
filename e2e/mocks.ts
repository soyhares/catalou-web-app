import type { Page } from '@playwright/test';

const API = process.env.VITE_API_URL ?? 'http://localhost:3000';

export const TENANT_DIRECT = 'test-tenant';
export const TENANT_ASSOC  = 'test-asociado';

// ── Branding fixtures ────────────────────────────────────────────────────────

export const BRANDING_DIRECT = {
  companyName:    'Tienda Demo',
  skin:           'modern-minimalism',
  colorPrimary:   '#1a1a1a',
  colorSecondary: '#555555',
  colorBackground:'#ffffff',
  colorText:      '#1a1a1a',
  logoUrl:        null,
  bannerUrl:      null,
  currency:       'CRC',
  businessModel:  'DIRECT',
  orderType:      'DIRECT',
  associationName: null,
  whatsappNumber: null,
  featuresEnabled: { orders: true, bookings: true, broadcasts: false, analytics: true, loyalty: false, ai: false, wallet: false },
};

export const BRANDING_ASSOC = {
  ...BRANDING_DIRECT,
  companyName:   'Asociado Demo',
  businessModel: 'ASSOCIATED',
  orderType:     'FINANCED',
  associationName: 'Coop Demo',
  featuresEnabled: { orders: true, bookings: false, broadcasts: false, analytics: true, loyalty: false, ai: false, wallet: false },
};

// ── Catalog fixtures ─────────────────────────────────────────────────────────

const CAT_ID  = 'cat-001';
const PROD_ID = 'prod-001';
const SVC_ID  = 'svc-001';

export const CATALOG_WITH_PRODUCT_AND_SERVICE = {
  showPrices: true,
  categories: [{ id: CAT_ID, name: 'General', subcategories: [] }],
  items: [
    {
      id: PROD_ID,
      name: 'Camisa Blanca',
      type: 'product',
      basePrice: '25.00',
      mainImageUrl: null,
      categoryId: CAT_ID,
      subcategoryId: null,
      durationMinutes: null,
      variantType: null,
    },
    {
      id: SVC_ID,
      name: 'Corte de cabello',
      type: 'service',
      basePrice: '15.00',
      mainImageUrl: null,
      categoryId: CAT_ID,
      subcategoryId: null,
      durationMinutes: 30,
      variantType: null,
    },
  ],
};

export const PRODUCT_DETAIL = {
  id: PROD_ID,
  name: 'Camisa Blanca',
  type: 'product',
  description: 'Una camisa blanca clásica.',
  technicalSpecs: null,
  basePrice: '25.00',
  mainImageUrl: null,
  variantType: null,
  images: [],
};

export const SERVICE_DETAIL = {
  id: SVC_ID,
  name: 'Corte de cabello',
  type: 'service',
  description: 'Corte profesional.',
  technicalSpecs: null,
  basePrice: '15.00',
  mainImageUrl: null,
  variantType: null,
  images: [],
};

// ── Slots fixture ────────────────────────────────────────────────────────────

export const AVAILABLE_SLOTS = {
  slots: [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: false },
  ],
};

// ── Mock helpers ─────────────────────────────────────────────────────────────

export async function mockTenant(page: Page, slug: string, branding: object) {
  await page.route(`${API}/companies/${slug}/branding`, route =>
    route.fulfill({ json: branding }),
  );
}

export async function mockCatalog(page: Page, slug: string, catalog: object) {
  await page.route(`${API}/catalog/${slug}**`, route =>
    route.fulfill({ json: catalog }),
  );
}

export async function mockProductDetail(page: Page, slug: string, id: string, detail: object) {
  await page.route(`${API}/catalog/${slug}/products/${id}`, route =>
    route.fulfill({ json: { ...detail, showPrices: true } }),
  );
}

export async function mockAvailability(page: Page, slug: string) {
  await page.route(`${API}/companies/${slug}/availability`, route =>
    route.fulfill({ json: { bookingNoun: 'cita', maxDaysAhead: 30 } }),
  );
  await page.route(`${API}/companies/${slug}/availability/slots**`, route =>
    route.fulfill({ json: AVAILABLE_SLOTS }),
  );
}

export async function mockCreateBooking(page: Page, slug: string) {
  await page.route(`${API}/companies/${slug}/bookings`, route =>
    route.fulfill({
      status: 201,
      json: {
        id: 'booking-001',
        preferredDate: '2026-07-01',
        preferredTime: '09:00',
        status: 'pending',
      },
    }),
  );
}

export async function mockCreateOrder(page: Page, slug: string) {
  await page.route(`${API}/catalog/${slug}/orders`, route =>
    route.fulfill({
      status: 201,
      json: { id: 'order-001', status: 'PENDING' },
    }),
  );
}
