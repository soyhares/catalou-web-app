import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import {
  getOrderByToken,
  confirmAssociation,
  type OrderSummaryForAssociation,
} from '@entities/order/api';
import { formatPrice } from '@shared/lib/formatPrice';

function IconCheck() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M8 14.5L12 18.5L20 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3L26 24H2L14 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
      <path d="M14 11V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="20" r="1" fill="currentColor"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M9 9L19 19M19 9L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M14 8V14L18 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type PageState =
  | { kind: 'loading' }
  | { kind: 'ready'; summary: OrderSummaryForAssociation }
  | { kind: 'already-confirmed' }
  | { kind: 'expired' }
  | { kind: 'invalid' }
  | { kind: 'confirmed' }
  | { kind: 'error'; message: string };

interface StatusBlockProps {
  icon: React.ReactElement;
  color: string;
  title: string;
  message: string;
}

function StatusBlock({ icon, color, title, message }: StatusBlockProps) {
  return (
    <div className="text-center py-4">
      <div className="flex justify-center mb-4" style={{ color }}>
        {icon}
      </div>
      <h1
        style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontStyle: 'italic',
          fontSize: '1.3rem',
          color: 'var(--pwa-text)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h1>
      <p className="text-sm" style={{ color: 'var(--pwa-text)', opacity: 0.6, lineHeight: 1.6 }}>
        {message}
      </p>
    </div>
  );
}

export default function ConfirmAssociationPage() {
  const { t } = useTranslation();
  const { slug, branding } = useBranding();

  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) { setState({ kind: 'invalid' }); return; }
    getOrderByToken(slug, token)
      .then((summary) => {
        setState(summary.alreadyConfirmed ? { kind: 'already-confirmed' } : { kind: 'ready', summary });
      })
      .catch((err: { status?: number }) => {
        if (err?.status === 410) setState({ kind: 'expired' });
        else if (err?.status === 404) setState({ kind: 'invalid' });
        else setState({ kind: 'error', message: t('confirm.loadError') });
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

  const ref = state.kind === 'ready' ? `ORD-${state.summary.orderId.slice(0, 8).toUpperCase()}` : '';

  return (
    <div className="min-h-screen flex items-start justify-center py-12 px-4" style={{ backgroundColor: 'var(--pwa-bg)' }}>
      <div
        className="max-w-lg w-full border"
        style={{
          backgroundColor: 'var(--pwa-surface)',
          borderColor: 'var(--pwa-border)',
          borderRadius: 'var(--pwa-radius-lg)',
          padding: '32px 24px',
        }}
      >
        {state.kind === 'loading' && (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--pwa-text)', opacity: 0.5 }}>
            {t('confirm.loading')}
          </p>
        )}

        {state.kind === 'invalid' && (
          <StatusBlock
            icon={<IconWarning />} color="var(--pwa-accent)"
            title={t('confirm.invalidTitle')} message={t('confirm.invalidMessage')}
          />
        )}

        {state.kind === 'expired' && (
          <StatusBlock
            icon={<IconClock />} color="var(--pwa-text-secondary)"
            title={t('confirm.expiredTitle')} message={t('confirm.expiredMessage')}
          />
        )}

        {state.kind === 'already-confirmed' && (
          <StatusBlock
            icon={<IconCheck />} color="var(--pwa-accent)"
            title={t('confirm.alreadyTitle')} message={t('confirm.alreadyMessage')}
          />
        )}

        {state.kind === 'confirmed' && (
          <StatusBlock
            icon={<IconCheck />} color="var(--pwa-accent)"
            title={t('confirm.successTitle')} message={t('confirm.successMessage')}
          />
        )}

        {state.kind === 'error' && (
          <StatusBlock
            icon={<IconX />} color="#EF4444"
            title={t('confirm.errorTitle')} message={state.message}
          />
        )}

        {state.kind === 'ready' && (
          <>
            <h1
              style={{
                fontFamily: 'var(--pwa-font-heading)',
                fontStyle: 'italic',
                fontSize: '1.4rem',
                color: 'var(--pwa-text)',
                marginBottom: '4px',
              }}
            >
              {t('confirm.title')}
            </h1>
            <p
              className="uppercase tracking-[0.1em] mb-6"
              style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5 }}
            >
              {t('confirm.reference')}: {ref}
            </p>

            <div
              className="mb-5 p-4 border text-sm space-y-1.5"
              style={{
                backgroundColor: 'var(--pwa-surface-secondary)',
                borderColor: 'var(--pwa-border)',
                color: 'var(--pwa-text)',
                borderRadius: 'var(--pwa-radius-sm)',
              }}
            >
              <p><span style={{ opacity: 0.5 }}>{t('confirm.visitorName')}:</span> {state.summary.visitorName}</p>
              <p><span style={{ opacity: 0.5 }}>{t('confirm.visitorPhone')}:</span> {state.summary.visitorPhone}</p>
              <p><span style={{ opacity: 0.5 }}>{t('confirm.visitorEmail')}:</span> {state.summary.visitorEmail}</p>
            </div>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--pwa-border)' }}>
                  <th className="pb-2 text-left uppercase tracking-[0.1em]" style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5, fontWeight: 700 }}>{t('confirm.product')}</th>
                  <th className="pb-2 text-center uppercase tracking-[0.1em]" style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5, fontWeight: 700 }}>{t('confirm.qty')}</th>
                  <th className="pb-2 text-right uppercase tracking-[0.1em]" style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5, fontWeight: 700 }}>{t('confirm.price')}</th>
                </tr>
              </thead>
              <tbody>
                {state.summary.items.map((item, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--pwa-border)' }}>
                    <td className="py-3" style={{ color: 'var(--pwa-text)', fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic' }}>
                      {item.productNameSnapshot}
                      {item.variantSnapshot && (
                        <span className="block text-xs not-italic" style={{ color: 'var(--pwa-text-secondary)', opacity: 0.6, fontFamily: 'var(--pwa-font-body)' }}>
                          {item.variantSnapshot}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center text-xs" style={{ color: 'var(--pwa-text)' }}>{item.quantity}</td>
                    <td className="py-3 text-right text-xs" style={{ color: 'var(--pwa-text)' }}>
                      {formatPrice(item.unitPriceSnapshot * item.quantity, branding.currency ?? 'CRC')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="pt-4 uppercase tracking-[0.1em]" style={{ fontSize: '9px', color: 'var(--pwa-text)', fontWeight: 700 }}>{t('confirm.total')}</td>
                  <td className="pt-4 text-right" style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--pwa-accent)' }}>
                    {formatPrice(state.summary.totalAmount, branding.currency ?? 'CRC')}
                  </td>
                </tr>
              </tfoot>
            </table>

            <button
              type="button"
              onClick={() => { void handleConfirm(); }}
              disabled={confirming}
              className="w-full py-4 uppercase tracking-[0.18em] text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--pwa-accent)',
                borderRadius: 'var(--pwa-radius-button)',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: 'var(--pwa-font-body)',
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
