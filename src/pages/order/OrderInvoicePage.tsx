import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { orderInvoiceUrl } from '@entities/order/tracking-api';

type InvoiceState = 'checking' | 'not-found' | 'rate-limited' | 'error';

const MESSAGES: Record<Exclude<InvoiceState, 'checking'>, string> = {
  'not-found': 'Esta factura ya no está disponible. Si la necesitás, escribile al negocio.',
  'rate-limited': 'Hubo demasiados intentos. Probá de nuevo en unos minutos.',
  error: 'No pudimos abrir la factura. Intentá de nuevo en un momento.',
};

/**
 * SPEC-023 (FR-031a): `/pedido/:token/factura`, fuera de guard como el seguimiento.
 *
 * Es el enlace de la factura que se comparte: queda en el dominio del negocio y nunca expone la
 * URL del almacenamiento. Primero pregunta con HEAD si la factura existe, para no dejar a la
 * persona frente al JSON de error de la API; si existe, navega el documento hacia la API, que
 * sirve el PDF. `replace` para que "atrás" no vuelva a esta pantalla de paso.
 */
export default function OrderInvoicePage() {
  const { token = '' } = useParams<{ token: string }>();
  const { slug } = useBranding();
  const [state, setState] = useState<InvoiceState>('checking');

  useEffect(() => {
    const url = orderInvoiceUrl(slug, token);
    let cancelled = false;
    fetch(url, { method: 'HEAD', cache: 'no-store' })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) window.location.replace(url);
        else setState(res.status === 404 ? 'not-found' : res.status === 429 ? 'rate-limited' : 'error');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [slug, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--pwa-bg)] px-6 font-[family-name:var(--pwa-font-body)] text-[var(--pwa-text)]">
      {/* FR-035: la página del pedido no se indexa. React 19 lo sube al <head>. */}
      <meta name="robots" content="noindex, nofollow" />
      {state === 'checking' ? (
        <p aria-busy="true" aria-live="polite" className="text-sm text-[var(--pwa-text-secondary)]">
          Abriendo tu factura…
        </p>
      ) : (
        <div role="alert" className="max-w-sm text-center">
          <p className="text-sm">{MESSAGES[state]}</p>
          <Link
            to={`/pedido/${encodeURIComponent(token)}`}
            className="mt-4 inline-flex min-h-[44px] items-center text-sm text-[var(--pwa-text)] underline underline-offset-4"
          >
            Ver el seguimiento del pedido
          </Link>
        </div>
      )}
    </main>
  );
}
