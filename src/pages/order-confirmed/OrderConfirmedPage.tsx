import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function OrderConfirmedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--pwa-bg)' }}
    >
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">✅</p>
        <h1
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--pwa-text)' }}
        >
          {t('orderConfirmed.title')}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
          {t('orderConfirmed.message')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="px-6 py-2 text-white font-medium hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: 'var(--pwa-accent)',
            borderRadius: 'var(--pwa-radius-button)',
          }}
        >
          {t('orderConfirmed.backToCatalog')}
        </button>
      </div>
    </div>
  );
}
