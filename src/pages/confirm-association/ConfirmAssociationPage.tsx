import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import {
  getOrderByToken,
  confirmAssociation,
  rejectAssociation,
  type OrderSummaryForAssociation,
} from '@entities/order/api';
import { formatPrice } from '@shared/lib/formatPrice';
import { IconCheck, IconWarning, IconX, IconClock, StatusBlock } from '@shared/ui/confirmation-page-icons';

type PageState =
  | { kind: 'loading' }
  | { kind: 'ready'; summary: OrderSummaryForAssociation }
  | { kind: 'already-confirmed' }
  | { kind: 'expired' }
  | { kind: 'invalid' }
  | { kind: 'confirmed' }
  | { kind: 'rejected' }
  | { kind: 'rejecting' }
  | { kind: 'error'; message: string };

export default function ConfirmAssociationPage() {
  const { t } = useTranslation();
  const { slug, branding } = useBranding();

  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [confirming, setConfirming] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejecting, setRejecting] = useState(false);

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

  async function handleReject() {
    if (!rejectionReason.trim()) return;
    setRejecting(true);
    try {
      await rejectAssociation(slug, token, rejectionReason.trim());
      setState({ kind: 'rejected' });
    } catch {
      setState({ kind: 'error', message: t('confirm.rejectError') });
    } finally {
      setRejecting(false);
    }
  }

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

        {state.kind === 'rejected' && (
          <StatusBlock
            icon={<IconCheck />} color="var(--pwa-text-secondary)"
            title={t('confirm.rejectedTitle')} message={t('confirm.rejectedMessage')}
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

            {!showRejectForm ? (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '14px',
                  border: '1.5px solid var(--pwa-border)',
                  background: 'transparent',
                  color: 'var(--pwa-text)',
                  borderRadius: 'var(--pwa-radius-button)',
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'var(--pwa-font-body)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  cursor: 'pointer',
                }}
              >
                {t('confirm.rejectButton')}
              </button>
            ) : (
              <div style={{ marginTop: '12px' }}>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder={t('confirm.rejectReasonPlaceholder')}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1.5px solid var(--pwa-border)',
                    borderRadius: 'var(--pwa-radius-sm)',
                    background: 'var(--pwa-bg)',
                    color: 'var(--pwa-text)',
                    fontSize: '14px',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => { void handleReject(); }}
                  disabled={!rejectionReason.trim() || rejecting}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '14px',
                    background: '#EF4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--pwa-radius-button)',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'var(--pwa-font-body)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    cursor: rejectionReason.trim() && !rejecting ? 'pointer' : 'default',
                    opacity: !rejectionReason.trim() || rejecting ? 0.5 : 1,
                  }}
                >
                  {rejecting ? t('confirm.rejecting') : t('confirm.confirmReject')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}
                  style={{
                    marginTop: '6px',
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    color: 'var(--pwa-text-secondary)',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {t('confirm.cancelReject')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
