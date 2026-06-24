import { test, expect } from '@playwright/test';
import {
  TENANT_DIRECT,
  BRANDING_DIRECT,
  CATALOG_WITH_PRODUCT_AND_SERVICE,
  mockTenant,
  mockCatalog,
  mockAvailability,
  mockCreateBooking,
} from './mocks';

test.describe('flujo de citas (bookings)', () => {
  test.beforeEach(async ({ page }) => {
    await mockTenant(page, TENANT_DIRECT, BRANDING_DIRECT);
    await mockCatalog(page, TENANT_DIRECT, CATALOG_WITH_PRODUCT_AND_SERVICE);
    await mockAvailability(page, TENANT_DIRECT);
    await mockCreateBooking(page, TENANT_DIRECT);
  });

  test('el catálogo muestra servicios con badge de duración', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByText('Corte de cabello')).toBeVisible();
    await expect(page.getByText('30 min')).toBeVisible();
  });

  test('flujo completo: servicio → fecha → contacto → confirmación', async ({ page }) => {
    await page.goto('/book');

    // Step 1 — seleccionar servicio
    await expect(page.getByText('Corte de cabello')).toBeVisible();
    await page.getByText('Corte de cabello').click();

    // El footer con "Elegir fecha y hora" debe aparecer
    await expect(page.getByText('Elegir fecha y hora')).toBeVisible();
    await page.getByText('Elegir fecha y hora').click();

    // Step 2 — seleccionar slot (el NextSlotBanner o calendario)
    // El banner de próximo slot o "Ver fechas disponibles" debe aparecer
    const slotOrCalendar = page.getByText(/09:00|Ver fechas disponibles/);
    await expect(slotOrCalendar.first()).toBeVisible({ timeout: 5000 });

    // Si aparece el banner de próximo slot, confirmar directamente
    const confirmBtn = page.getByText(/Confirmar|Elegir esta|09:00/);
    if (await confirmBtn.count() > 0) {
      await confirmBtn.first().click();
    } else {
      // Abrir calendario y seleccionar el primer slot disponible
      await page.getByText('Ver fechas disponibles').click();
      await page.getByText('09:00').first().click();
    }

    // Step 3 — formulario de contacto
    await expect(page.getByPlaceholder(/nombre/i)).toBeVisible({ timeout: 3000 });
    await page.getByPlaceholder(/nombre/i).fill('Juan Pérez');
    await page.getByPlaceholder(/correo|email/i).fill('juan@ejemplo.com');

    // Enviar
    const submitBtn = page.getByRole('button', { name: /confirmar|agendar/i });
    await submitBtn.click();

    // Confirmación
    await expect(page.getByText(/confirmad|agendad|reservad/i)).toBeVisible({ timeout: 5000 });
  });

  test('guard: /book redirige al catálogo si bookings está deshabilitado', async ({ page }) => {
    // Tenant sin bookings
    await mockTenant(page, TENANT_DIRECT, {
      ...BRANDING_DIRECT,
      featuresEnabled: { ...BRANDING_DIRECT.featuresEnabled, bookings: false },
    });
    await page.goto('/book');
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('un servicio no muestra botón de carrito en su detalle', async ({ page }) => {
    await mockTenant(page, TENANT_DIRECT, BRANDING_DIRECT);
    const svcId = CATALOG_WITH_PRODUCT_AND_SERVICE.items[1].id;

    // Mock del endpoint de detalle del servicio
    const API = process.env.VITE_API_URL ?? 'http://localhost:3000';
    await page.route(`${API}/catalog/${TENANT_DIRECT}/products/${svcId}`, route =>
      route.fulfill({
        json: {
          id: svcId,
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

    await page.goto(`/products/${svcId}`);
    await expect(page.getByText('Corte de cabello')).toBeVisible();
    await expect(page.getByText(/añadir al carrito/i)).not.toBeVisible();
  });
});
