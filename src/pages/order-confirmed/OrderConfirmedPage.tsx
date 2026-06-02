import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

function IconCheck() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9 16.5L13.5 21L23 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function OrderConfirmedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--pwa-bg)' }}
    >
      <div className="text-center max-w-sm">
        <motion.div
          className="flex justify-center mb-6"
          style={{ color: 'var(--pwa-accent)' }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <IconCheck />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontStyle: 'italic',
            fontSize: '1.6rem',
            color: 'var(--pwa-text)',
            marginBottom: '8px',
          }}
        >
          {t('orderConfirmed.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-sm mb-8"
          style={{ color: 'var(--pwa-text)', opacity: 0.6, lineHeight: 1.6 }}
        >
          {t('orderConfirmed.message')}
        </motion.p>

        <motion.button
          type="button"
          onClick={() => navigate('/catalog', { replace: true })}
          className="uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--pwa-accent)',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '14px 32px',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'var(--pwa-font-body)',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileTap={{ scale: 0.97 }}
        >
          {t('orderConfirmed.backToCatalog')}
        </motion.button>
      </div>
    </div>
  );
}
