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
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-sm border max-w-lg w-full p-6">

        {state.kind === 'loading' && (
          <p className="text-gray-500 text-center py-8">{t('confirm.loading')}</p>
        )}

        {state.kind === 'invalid' && (
          <div className="text-center">
            <p className="text-2xl mb-3">⚠️</p>
            <h1 className="text-lg font-semibold text-gray-900">{t('confirm.invalidTitle')}</h1>
            <p className="text-gray-600 text-sm mt-2">{t('confirm.invalidMessage')}</p>
          </div>
        )}

        {state.kind === 'expired' && (
          <div className="text-center">
            <p className="text-2xl mb-3">⏰</p>
            <h1 className="text-lg font-semibold text-gray-900">{t('confirm.expiredTitle')}</h1>
            <p className="text-gray-600 text-sm mt-2">{t('confirm.expiredMessage')}</p>
          </div>
        )}

        {state.kind === 'already-confirmed' && (
          <div className="text-center">
            <p className="text-2xl mb-3">✅</p>
            <h1 className="text-lg font-semibold text-gray-900">{t('confirm.alreadyTitle')}</h1>
            <p className="text-gray-600 text-sm mt-2">{t('confirm.alreadyMessage')}</p>
          </div>
        )}

        {state.kind === 'confirmed' && (
          <div className="text-center">
            <p className="text-2xl mb-3">✅</p>
            <h1 className="text-lg font-semibold text-gray-900">{t('confirm.successTitle')}</h1>
            <p className="text-gray-600 text-sm mt-2">{t('confirm.successMessage')}</p>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="text-center">
            <p className="text-2xl mb-3">❌</p>
            <h1 className="text-lg font-semibold text-gray-900">{t('confirm.errorTitle')}</h1>
            <p className="text-gray-600 text-sm mt-2">{state.message}</p>
          </div>
        )}

        {state.kind === 'ready' && (
          <>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              {t('confirm.title')}
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              {t('confirm.reference')}: {ref}
            </p>

            <div className="mb-4 p-3 bg-gray-50 rounded border text-sm text-gray-700 space-y-1">
              <p><strong>{t('confirm.visitorName')}:</strong> {state.summary.visitorName}</p>
              <p><strong>{t('confirm.visitorPhone')}:</strong> {state.summary.visitorPhone}</p>
              <p><strong>{t('confirm.visitorEmail')}:</strong> {state.summary.visitorEmail}</p>
            </div>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-gray-500 text-xs">
                  <th className="pb-2">{t('confirm.product')}</th>
                  <th className="pb-2 text-center">{t('confirm.qty')}</th>
                  <th className="pb-2 text-right">{t('confirm.price')}</th>
                </tr>
              </thead>
              <tbody>
                {state.summary.items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">
                      {item.productNameSnapshot}
                      {item.variantSnapshot && (
                        <span className="block text-xs text-gray-500">
                          {item.variantSnapshot}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">
                      ₡{(item.unitPriceSnapshot * item.quantity).toLocaleString('es-CR')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td colSpan={2} className="pt-3">{t('confirm.total')}</td>
                  <td className="pt-3 text-right">
                    ₡{state.summary.totalAmount.toLocaleString('es-CR')}
                  </td>
                </tr>
              </tfoot>
            </table>

            <button
              type="button"
              onClick={() => { void handleConfirm(); }}
              disabled={confirming}
              className="w-full py-3 bg-gray-900 text-white rounded font-medium disabled:opacity-50 hover:bg-gray-700"
            >
              {confirming ? t('confirm.confirming') : t('confirm.confirmButton')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
