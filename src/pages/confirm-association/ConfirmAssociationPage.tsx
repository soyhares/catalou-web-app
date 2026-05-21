import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import {
  getOrderByToken,
  confirmAssociation,
  type OrderSummaryForAssociation,
} from '@entities/order/api';

type PageState =
  | { kind: 'loading' }
  | { kind: 'ready'; summary: OrderSummaryForAssociation }
  | { kind: 'already-confirmed' }
  | { kind: 'expired' }
  | { kind: 'invalid' }
  | { kind: 'confirmed' }
  | { kind: 'error'; message: string };

export default function ConfirmAssociationPage() {
  const { t } = useTranslation();
  const { slug } = useBranding();

  const token = new URLSearchParams(window.location.search).get('token') ?? '';

  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) {
      setState({ kind: 'invalid' });
      return;
    }
    getOrderByToken(slug, token)
      .then((summary) => {
        if (summary.alreadyConfirmed) {
          setState({ kind: 'already-confirmed' });
        } else {
          setState({ kind: 'ready', summary });
        }
      })
      .catch((err: { status?: number }) => {
        if (err?.status === 410) {
          setState({ kind: 'expired' });
        } else if (err?.status === 404) {
          setState({ kind: 'invalid' });
        } else {
          setState({ kind: 'error', message: t('confirm.loadError') });
        }
      });
  }, [slug, token, t]);

  async function handleConfirm() {
    setConfirming(true);
    try {
      const result = await confirmAssociation(slug, token);
      setState(result.alreadyConfirmed ? { kind: 'already-confirmed' } : { kind: 'confirmed' });
    } catch {
      setState({ kind: 'error', message: t('confirm.confirmError') });
    } finally {
      setConfirming(false);
    }
  }

  const ref =
    state.kind === 'ready'
      ? `ORD-${state.summary.orderId.slice(0, 8).toUpperCase()}`
      : '';

  return (
    <div
      className="min-h-screen flex items-start justify-center py-12 px-4"
      style={{ backgroundColor: 'var(--pwa-bg)' }}
    >
      <div
        className="rounded-lg shadow-sm border max-w-lg w-full p-6"
        style={{
          backgroundColor: 'var(--pwa-surface)',
          borderColor: 'var(--pwa-border)',
        }}
      >
        {state.kind === 'loading' && (
          <p className="text-center py-8" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
            {t('confirm.loading')}
          </p>
        )}

        {state.kind === 'invalid' && (
          <div className="text-center">
            <p className="text-2xl mb-3">⚠️</p>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--pwa-text)' }}>
              {t('confirm.invalidTitle')}
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
              {t('confirm.invalidMessage')}
            </p>
          </div>
        )}

        {state.kind === 'expired' && (
          <div className="text-center">
            <p className="text-2xl mb-3">⏰</p>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--pwa-text)' }}>
              {t('confirm.expiredTitle')}
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
              {t('confirm.expiredMessage')}
            </p>
          </div>
        )}

        {state.kind === 'already-confirmed' && (
          <div className="text-center">
            <p className="text-2xl mb-3">✅</p>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--pwa-text)' }}>
              {t('confirm.alreadyTitle')}
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
              {t('confirm.alreadyMessage')}
            </p>
          </div>
        )}

        {state.kind === 'confirmed' && (
          <div className="text-center">
            <p className="text-2xl mb-3">✅</p>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--pwa-text)' }}>
              {t('confirm.successTitle')}
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
              {t('confirm.successMessage')}
            </p>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="text-center">
            <p className="text-2xl mb-3">❌</p>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--pwa-text)' }}>
              {t('confirm.errorTitle')}
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
              {state.message}
            </p>
          </div>
        )}

        {state.kind === 'ready' && (
          <>
            <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--pwa-text)' }}>
              {t('confirm.title')}
            </h1>
            <p className="text-sm mb-4" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
              {t('confirm.reference')}: {ref}
            </p>

            <div
              className="mb-4 p-3 rounded border text-sm space-y-1"
              style={{
                backgroundColor: 'var(--pwa-surface-secondary)',
                borderColor: 'var(--pwa-border)',
                color: 'var(--pwa-text)',
              }}
            >
              <p><strong>{t('confirm.visitorName')}:</strong> {state.summary.visitorName}</p>
              <p><strong>{t('confirm.visitorPhone')}:</strong> {state.summary.visitorPhone}</p>
              <p><strong>{t('confirm.visitorEmail')}:</strong> {state.summary.visitorEmail}</p>
            </div>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-xs" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
                  <th className="pb-2">{t('confirm.product')}</th>
                  <th className="pb-2 text-center">{t('confirm.qty')}</th>
                  <th className="pb-2 text-right">{t('confirm.price')}</th>
                </tr>
              </thead>
              <tbody>
                {state.summary.items.map((item, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: 'var(--pwa-border)' }}>
                    <td className="py-2" style={{ color: 'var(--pwa-text)' }}>
                      {item.productNameSnapshot}
                      {item.variantSnapshot && (
                        <span className="block text-xs" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
                          {item.variantSnapshot}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center" style={{ color: 'var(--pwa-text)' }}>
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right" style={{ color: 'var(--pwa-text)' }}>
                      ₡{(item.unitPriceSnapshot * item.quantity).toLocaleString('es-CR')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold" style={{ borderColor: 'var(--pwa-border)' }}>
                  <td colSpan={2} className="pt-3" style={{ color: 'var(--pwa-text)' }}>
                    {t('confirm.total')}
                  </td>
                  <td className="pt-3 text-right" style={{ color: 'var(--pwa-text)' }}>
                    ₡{state.summary.totalAmount.toLocaleString('es-CR')}
                  </td>
                </tr>
              </tfoot>
            </table>

            <button
              type="button"
              onClick={() => { void handleConfirm(); }}
              disabled={confirming}
              className="w-full py-3 text-white font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--pwa-accent)',
                borderRadius: 'var(--pwa-radius-button)',
              }}
            >
              {confirming ? t('confirm.confirming') : t('confirm.confirmButton')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
