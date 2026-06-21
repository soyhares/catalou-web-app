import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import {
  getBookingByToken,
  confirmBookingAssociation,
  rejectBookingAssociation,
  type BookingSummaryForAssociation,
} from '@entities/booking/bookingAssociationApi';
import { IconCheck, IconWarning, IconX, IconClock, StatusBlock } from '@shared/ui/confirmation-page-icons';

type PageState =
  | { kind: 'loading' }
  | { kind: 'ready'; summary: BookingSummaryForAssociation }
  | { kind: 'already-processed' }
  | { kind: 'expired' }
  | { kind: 'invalid' }
  | { kind: 'approved' }
  | { kind: 'rejected' }
  | { kind: 'reject-form' }
  | { kind: 'error'; message: string };

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ConfirmBookingPage() {
  const { t } = useTranslation();
  const { slug } = useBranding();

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') ?? '';
  const action = params.get('action') ?? '';

  const [state, setState] = useState<PageState>(() => {
    if (!token) return { kind: 'invalid' };
    if (action === 'reject') return { kind: 'reject-form' };
    return { kind: 'loading' };
  });

  const [confirming, setConfirming] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (state.kind !== 'loading') return;
    if (!token) { setState({ kind: 'invalid' }); return; }

    getBookingByToken(slug, token)
      .then((summary) => {
        setState(summary.alreadyProcessed ? { kind: 'already-processed' } : { kind: 'ready', summary });
      })
      .catch((err: { status?: number }) => {
        if (err?.status === 410) setState({ kind: 'expired' });
        else if (err?.status === 404) setState({ kind: 'invalid' });
        else setState({ kind: 'error', message: t('confirmBooking.loadError') });
      });
  }, [slug, token, t, state.kind]);

  async function handleApprove() {
    setConfirming(true);
    try {
      const result = await confirmBookingAssociation(slug, token);
      setState(result.alreadyProcessed ? { kind: 'already-processed' } : { kind: 'approved' });
    } catch {
      setState({ kind: 'error', message: t('confirmBooking.approveError') });
    } finally {
      setConfirming(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) return;
    setRejecting(true);
    try {
      await rejectBookingAssociation(slug, token, rejectionReason.trim());
      setState({ kind: 'rejected' });
    } catch {
      setState({ kind: 'error', message: t('confirmBooking.rejectError') });
    } finally {
      setRejecting(false);
    }
  }

  function handleCancelRejectForm() {
    setRejectionReason('');
    setState({ kind: 'loading' });
  }

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
            {t('confirmBooking.loading')}
          </p>
        )}

        {state.kind === 'invalid' && (
          <StatusBlock
            icon={<IconWarning />} color="var(--pwa-accent)"
            title={t('confirmBooking.invalidTitle')} message={t('confirmBooking.invalidMessage')}
          />
        )}

        {state.kind === 'expired' && (
          <StatusBlock
            icon={<IconClock />} color="var(--pwa-text-secondary)"
            title={t('confirmBooking.expiredTitle')} message={t('confirmBooking.expiredMessage')}
          />
        )}

        {state.kind === 'already-processed' && (
          <StatusBlock
            icon={<IconCheck />} color="var(--pwa-accent)"
            title={t('confirmBooking.alreadyTitle')} message={t('confirmBooking.alreadyMessage')}
          />
        )}

        {state.kind === 'approved' && (
          <StatusBlock
            icon={<IconCheck />} color="var(--pwa-accent)"
            title={t('confirmBooking.approvedTitle')} message={t('confirmBooking.approvedMessage')}
          />
        )}

        {state.kind === 'rejected' && (
          <StatusBlock
            icon={<IconCheck />} color="var(--pwa-text-secondary)"
            title={t('confirmBooking.rejectedTitle')} message={t('confirmBooking.rejectedMessage')}
          />
        )}

        {state.kind === 'error' && (
          <StatusBlock
            icon={<IconX />} color="#EF4444"
            title={t('confirmBooking.errorTitle')} message={state.message}
          />
        )}

        {state.kind === 'reject-form' && (
          <>
            <h1
              style={{
                fontFamily: 'var(--pwa-font-heading)',
                fontStyle: 'italic',
                fontSize: '1.4rem',
                color: 'var(--pwa-text)',
                marginBottom: '16px',
              }}
            >
              {t('confirmBooking.rejectFormTitle')}
            </h1>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder={t('confirmBooking.rejectReasonPlaceholder')}
              rows={4}
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
                marginTop: '12px',
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
              {rejecting ? t('confirmBooking.rejecting') : t('confirmBooking.confirmReject')}
            </button>
            <button
              type="button"
              onClick={handleCancelRejectForm}
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
              {t('confirmBooking.cancelReject')}
            </button>
          </>
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
              {t('confirmBooking.title')}
            </h1>
            <p
              className="uppercase tracking-[0.1em] mb-6"
              style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5 }}
            >
              {t('confirmBooking.reference')}: {state.summary.bookingId.slice(0, 8).toUpperCase()}
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
              <p>
                <span style={{ opacity: 0.5 }}>{t('confirmBooking.visitorName')}:</span>{' '}
                {state.summary.visitorName}
              </p>
              <p>
                <span style={{ opacity: 0.5 }}>{t('confirmBooking.date')}:</span>{' '}
                <span style={{ textTransform: 'capitalize' }}>{formatDate(state.summary.preferredDate)}</span>
              </p>
              <p>
                <span style={{ opacity: 0.5 }}>{t('confirmBooking.time')}:</span>{' '}
                {state.summary.preferredTime}
              </p>
            </div>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--pwa-border)' }}>
                  <th className="pb-2 text-left uppercase tracking-[0.1em]" style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5, fontWeight: 700 }}>{t('confirmBooking.service')}</th>
                  <th className="pb-2 text-center uppercase tracking-[0.1em]" style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5, fontWeight: 700 }}>{t('confirmBooking.qty')}</th>
                  <th className="pb-2 text-right uppercase tracking-[0.1em]" style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5, fontWeight: 700 }}>{t('confirmBooking.duration')}</th>
                </tr>
              </thead>
              <tbody>
                {state.summary.services.map((svc, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--pwa-border)' }}>
                    <td className="py-3" style={{ color: 'var(--pwa-text)', fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic' }}>
                      {svc.productName}
                    </td>
                    <td className="py-3 text-center text-xs" style={{ color: 'var(--pwa-text)' }}>{svc.quantity}</td>
                    <td className="py-3 text-right text-xs" style={{ color: 'var(--pwa-text)' }}>{svc.durationMinutes * svc.quantity} min</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Approve button */}
            <button
              type="button"
              onClick={() => { void handleApprove(); }}
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
              {confirming ? t('confirmBooking.approving') : t('confirmBooking.approveButton')}
            </button>

            {/* Reject button */}
            <button
              type="button"
              onClick={() => setState({ kind: 'reject-form' })}
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
              {t('confirmBooking.rejectButton')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
