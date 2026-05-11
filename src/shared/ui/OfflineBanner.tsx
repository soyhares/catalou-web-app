import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-50 bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center"
    >
      <p className="text-xs font-medium text-yellow-800">{t('errors.offline')}</p>
    </div>
  );
}
