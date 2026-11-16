import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { orderInvoiceUrl } from '@entities/order/tracking-api';

/**
 * SPEC-023 (FR-031a): `/pedido/:token/factura`, fuera de guard como el seguimiento.
 *
 * Es el enlace de la factura que se comparte: queda en el dominio del negocio y nunca expone la
 * URL del almacenamiento. Navega el documento hacia la API, que sirve el PDF con las mismas
 * reglas que el seguimiento. `replace` para que "atrás" no vuelva a esta pantalla de paso.
 */
export default function OrderInvoicePage() {
  const { token = '' } = useParams<{ token: string }>();
  const { slug } = useBranding();

  useEffect(() => {
    window.location.replace(orderInvoiceUrl(slug, token));
  }, [slug, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--pwa-bg)] px-6 font-[family-name:var(--pwa-font-body)] text-[var(--pwa-text)]">
      {/* FR-035: la página del pedido no se indexa. React 19 lo sube al <head>. */}
      <meta name="robots" content="noindex, nofollow" />
      <p aria-busy="true" aria-live="polite" className="text-sm text-[var(--pwa-text-secondary)]">
        Abriendo tu factura…
      </p>
    </main>
  );
}
