import { motion } from 'framer-motion';
import { BookingForm } from '@features/booking/BookingForm';
import { BookingConfirmation } from '@features/booking/BookingConfirmation';
import type { BookSkinProps } from '../index';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L6 8L10 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LuxuryBookSkin({ slug, confirmation, onSuccess, onBack, onConfirmationClose }: BookSkinProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Top rule */}
      <div style={{ height: '1px', backgroundColor: 'var(--pwa-border)' }} />

      {/* Navigation bar */}
      <header style={{ padding: '22px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!confirmation ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              color: 'var(--pwa-text-secondary)',
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.18em',
              padding: 0,
              transition: 'color 200ms ease',
            }}
          >
            <IconArrowLeft />
            Volver
          </button>
        ) : <div />}

        <span style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          color: 'var(--pwa-text-secondary)',
          opacity: 0.5,
        }}>
          Reservas
        </span>
      </header>

      {/* Content */}
      <main style={{
        flex: 1,
        padding: '48px 32px 120px',
        maxWidth: '480px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {confirmation ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <BookingConfirmation booking={confirmation} onClose={onConfirmationClose} />
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible">

            {/* Eyebrow */}
            <motion.p variants={fadeUp} style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.24em',
              color: 'var(--pwa-accent)',
              margin: '0 0 20px',
            }}>
              Consultas · Citas
            </motion.p>

            {/* Headline — two lines, italic, light */}
            <motion.h1 variants={fadeUp} style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontSize: 'clamp(2.6rem, 8vw, 3.4rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.0,
              color: 'var(--pwa-text)',
              margin: '0 0 28px',
              letterSpacing: '-0.01em',
            }}>
              Agendar<br />cita
            </motion.h1>

            {/* Gold separator */}
            <motion.div variants={fadeUp} style={{
              width: '40px',
              height: '1px',
              backgroundColor: 'var(--pwa-accent)',
              marginBottom: '40px',
            }} />

            {/* Subtitle */}
            <motion.p variants={fadeUp} style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '13px',
              lineHeight: 1.7,
              color: 'var(--pwa-text-secondary)',
              margin: '0 0 40px',
            }}>
              Completa el formulario y nos pondremos en contacto contigo para confirmar tu cita.
            </motion.p>

            {/* Form */}
            <motion.div variants={fadeUp} className="pwa-book-form">
              <BookingForm slug={slug} onSuccess={onSuccess} onCancel={onBack} />
            </motion.div>

          </motion.div>
        )}
      </main>

    </div>
  );
}
