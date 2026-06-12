import { motion } from 'framer-motion';
import { BookingForm } from '@features/booking/BookingForm';
import { BookingConfirmation } from '@features/booking/BookingConfirmation';
import type { BookSkinProps } from '../index';

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L6 8L10 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M6 2V5M14 2V5M2 8H18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function NeoLuxuryBookSkin({ slug, confirmation, onSuccess, onBack, onConfirmationClose }: BookSkinProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--pwa-bg)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Neon bloom background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '120vw',
        height: '50vh',
        background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(232,121,249,0.14) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '-10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Navigation */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {!confirmation ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'rgba(232,121,249,0.65)',
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '12px',
              letterSpacing: '0.06em',
              padding: 0,
              transition: 'color 200ms ease',
            }}
          >
            <IconArrowLeft />
            Volver
          </button>
        ) : <div />}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(167,139,250,0.5)' }}>
          <IconCalendar />
        </div>
      </header>

      {/* Main glass card */}
      <main style={{
        flex: 1,
        position: 'relative',
        zIndex: 10,
        padding: '0 20px 120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'rgba(21,11,42,0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(232,121,249,0.18)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <div style={{
            padding: '28px 28px 0',
            borderBottom: '1px solid rgba(167,139,250,0.1)',
            paddingBottom: '24px',
            marginBottom: '28px',
          }}>
            <p style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'rgba(232,121,249,0.6)',
              margin: '0 0 12px',
            }}>
              Agendar · Cita
            </p>
            <h1 style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontSize: 'clamp(1.6rem, 5vw, 2rem)',
              fontWeight: 600,
              color: 'var(--pwa-text)',
              margin: 0,
              lineHeight: 1.15,
            }}>
              {confirmation ? 'Solicitud enviada' : 'Agenda tu cita'}
            </h1>
            {!confirmation && (
              <p style={{
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '13px',
                color: 'var(--pwa-text-secondary)',
                margin: '10px 0 0',
                lineHeight: 1.6,
              }}>
                Completa el formulario y te confirmamos tu reserva.
              </p>
            )}
          </div>

          {/* Card body */}
          <div style={{ padding: '0 28px 28px' }}>
            {confirmation ? (
              <BookingConfirmation booking={confirmation} onClose={onConfirmationClose} />
            ) : (
              <div className="pwa-book-form">
                <BookingForm slug={slug} onSuccess={onSuccess} onCancel={onBack} />
              </div>
            )}
          </div>
        </motion.div>
      </main>

    </div>
  );
}
