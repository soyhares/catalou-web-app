import { motion } from 'framer-motion';
import { BookingForm } from '@features/booking/BookingForm';
import { BookingConfirmation } from '@features/booking/BookingConfirmation';
import { useTheme } from '@shared/ui/ThemeProvider';
import type { BookSkinProps } from '../index';

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L6 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendarLarge() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <rect x="6" y="14" width="60" height="52" rx="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M22 6V20M50 6V20M6 30H66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="18" y="40" width="10" height="10" rx="2" fill="currentColor" opacity="0.4" />
      <rect x="31" y="40" width="10" height="10" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="44" y="40" width="10" height="10" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="18" y="54" width="10" height="8" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="31" y="54" width="10" height="8" rx="2" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

export default function ModernBookSkin({ slug, confirmation, onSuccess, onBack, onConfirmationClose }: BookSkinProps) {
  const { isMobile } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Header — breadcrumb style */}
      <header style={{
        borderBottom: '1px solid var(--pwa-border)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--pwa-bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {!confirmation && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              color: 'var(--pwa-text-secondary)', padding: '2px',
              borderRadius: '4px',
            }}
          >
            <IconArrowLeft />
          </button>
        )}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '13px',
          color: 'var(--pwa-text-secondary)',
        }}>
          <span
            onClick={onBack}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onBack()}
          >
            Citas
          </span>
          {!confirmation && (
            <>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: 'var(--pwa-text)', fontWeight: 500 }}>Nueva cita</span>
            </>
          )}
          {confirmation && (
            <>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: 'var(--pwa-text)', fontWeight: 500 }}>Confirmación</span>
            </>
          )}
        </nav>
      </header>

      {/* Content */}
      <main style={{
        flex: 1,
        padding: '40px 24px 120px',
        maxWidth: confirmation ? '500px' : '900px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {confirmation ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <BookingConfirmation booking={confirmation} onClose={onConfirmationClose} />
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '40px' : '80px',
            alignItems: 'flex-start',
          }}>
            {/* Left: info panel */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ color: 'var(--pwa-text-secondary)', marginBottom: '28px' }}>
                <IconCalendarLarge />
              </div>

              <h1 style={{
                fontFamily: 'var(--pwa-font-heading)',
                fontSize: 'clamp(1.6rem, 4vw, 2.1rem)',
                fontWeight: 700,
                color: 'var(--pwa-text)',
                margin: '0 0 12px',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}>
                Agenda tu cita
              </h1>

              <p style={{
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '14px',
                lineHeight: 1.65,
                color: 'var(--pwa-text-secondary)',
                margin: '0 0 32px',
              }}>
                Completa el formulario y nos pondremos en contacto contigo dentro de las próximas horas hábiles para confirmar la cita.
              </p>

              {/* Info bullets */}
              {[
                'Confirmación en menos de 24 horas',
                'Puedes cancelar hasta 24h antes',
                'Sin costo por reservar tu cita',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    backgroundColor: 'var(--pwa-accent)',
                    marginTop: '7px', flexShrink: 0,
                  }} />
                  <p style={{
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '13px',
                    color: 'var(--pwa-text-secondary)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {item}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Right: form */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <div style={{
                border: '1px solid var(--pwa-border)',
                borderRadius: '12px',
                padding: '28px 24px',
                backgroundColor: 'var(--pwa-surface)',
              }}>
                <h2 style={{
                  fontFamily: 'var(--pwa-font-heading)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--pwa-text)',
                  margin: '0 0 20px',
                  letterSpacing: '-0.01em',
                }}>
                  Datos de la solicitud
                </h2>
                <div className="pwa-book-form">
                  <BookingForm slug={slug} onSuccess={onSuccess} onCancel={onBack} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>

    </div>
  );
}
