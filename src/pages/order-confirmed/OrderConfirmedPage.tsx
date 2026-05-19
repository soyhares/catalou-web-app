import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function OrderConfirmedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">✅</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {t('orderConfirmed.title')}
        </h1>
        <p className="text-gray-600 text-sm mb-6">{t('orderConfirmed.message')}</p>
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="px-6 py-2 bg-gray-900 text-white rounded font-medium hover:bg-gray-700"
        >
          {t('orderConfirmed.backToCatalog')}
        </button>
      </div>
    </div>
  );
}
