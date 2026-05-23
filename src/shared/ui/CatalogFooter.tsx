import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface CatalogFooterProps {
  className?: string;
}

export function CatalogFooter({ className = '' }: CatalogFooterProps) {
  const { t } = useTranslation();

  return (
    <footer className={`py-6 text-center ${className}`}>
      <p className="text-xs" style={{ color: 'var(--pwa-text)', opacity: 0.4 }}>
        <Link
          to="/privacy-policy"
          style={{ color: 'var(--pwa-text)' }}
          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {t('common.privacyPolicy')}
        </Link>
        {' · '}
        {t('common.poweredBy')}
      </p>
    </footer>
  );
}
