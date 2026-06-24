import { test, expect } from '@playwright/test';
import {
  TENANT_DIRECT,
  TENANT_ASSOC,
  BRANDING_DIRECT,
  BRANDING_ASSOC,
  CATALOG_WITH_PRODUCT_AND_SERVICE,
  PRODUCT_DETAIL,
  mockTenant,
  mockCatalog,
  mockProductDetail,
  mockCreateOrder,
} from './mocks';

const PROD_ID = CATALOG_WITH_PRODUCT_AND_SERVICE.items[0].id;
const SVC_ID  = CATALOG_WITH_PRODUCT_AND_SERVICE.items[1].id;

test.describe('flujo de pedidos (orders)', () => {
  test.beforeEach(async ({ page }) => {
    await mockTenant(page, TENANT_DIRECT, BRANDING_DIRECT);
    await mockCatalog(page, TENANT_DIRECT, CATALOG_WITH_PRODUCT_AND_SERVICE);
    await mockProductDetail(page, TENANT_DIRECT, PROD_ID, PRODUCT_DETAIL);
    await mockCreateOrder(page, TENANT_DIRECT);
  });

  test('flujo completo: producto → carrito → checkout → orden confirmada', async ({ page }) => {
    // Abrir detalle del producto
    await page.goto(`/products/${PROD_ID}`);
    await expect(page.getByText('Camisa Blanca')).toBeVisible();

    // Añadir al carrito
    const addBtn = page.getByRole('button', { name: /añadir al carrito/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Ir al carrito
    await page.goto('/cart');
    await expect(page.getByText('Camisa Blanca')).toBeVisible();

    // Ir a checkout
    await page.getByRole('link', { name: /finalizar|checkout|pagar/i }).click();
    await expect(page).toHaveURL(/\/checkout/);

    // Rellenar formulario de checkout
    await page.getByPlaceholder(/nombre/i).fill('Ana Gómez');
    const contactInput = page.getByPlaceholder(/correo|teléfono|contacto/i);
    await contactInput.first().fill('ana@ejemplo.com');

    // Enviar pedido
    await page.getByRole('button', { name: /confirmar|enviar|pedir/i }).click();
    await expect(page).toHaveURL(/order-confirmed/, { timeout: 5000 });
  });

  test('servicio no puede añadirse al carrito desde el detalle', async ({ page }) => {
    const API = process.env.VITE_API_URL ?? 'http://localhost:3000';
    await page.route(`${API}/catalog/${TENANT_DIRECT}/products/${SVC_ID}`, route =>
      route.fulfill({
        json: {
          id: SVC_ID,
          name: 'Corte de cabello',
          type: 'service',
          description: null,
          technicalSpecs: null,
          basePrice: '15.00',
          mainImageUrl: null,
          variantType: null,
          images: [],
          showPrices: true,
        },
      }),
    );

    await page.goto(`/products/${SVC_ID}`);
    await expect(page.getByText('Corte de cabello')).toBeVisible();
    // El botón de carrito NO debe existir para un servicio
    await expect(page.getByRole('button', { name: /añadir al carrito/i })).not.toBeVisible();
  });

  test('guard: /cart redirige al catálogo si orders está deshabilitado', async ({ page }) => {
    await mockTenant(page, TENANT_DIRECT, {
      ...BRANDING_DIRECT,
      featuresEnabled: { ...BRANDING_DIRECT.featuresEnabled, orders: false },
    });
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('multi-tenant: tenant asociado ve disclaimer de precio en productos', async ({ page }) => {
    await mockTenant(page, TENANT_ASSOC, BRANDING_ASSOC);
    await mockCatalog(page, TENANT_ASSOC, CATALOG_WITH_PRODUCT_AND_SERVICE);
    await mockProductDetail(page, TENANT_ASSOC, PROD_ID, PRODUCT_DETAIL);

    await page.goto(`/products/${PROD_ID}`);
    await expect(page.getByText('Camisa Blanca')).toBeVisible();
    // Disclaimer de precio para tenants ASSOCIATED
    await expect(page.getByText(/precio referencial|sujeto a/i)).toBeVisible();
  });

  test('multi-tenant: carrito es independiente por tenant (no se mezclan)', async ({ page }) => {
    // Añadir producto para tenant-a
    await page.goto(`/products/${PROD_ID}`);
    await page.getByRole('button', { name: /añadir al carrito/i }).click();

    // Cambiar al tenant asociado (slug distinto → IndexedDB separado)
    await mockTenant(page, TENANT_ASSOC, BRANDING_ASSOC);
    await page.goto('/cart');

    // El carrito de tenant-b debe estar vacío
    await expect(page.getByText('Camisa Blanca')).not.toBeVisible();
  });
});
