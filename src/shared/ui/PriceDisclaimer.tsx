import { useTranslation } from 'react-i18next';

interface PriceDisclaimerProps {
  className?: string;
}

export function PriceDisclaimer({ className = '' }: PriceDisclaimerProps) {
  const { t } = useTranslation();
  return (
    <p
      className={`text-xs leading-snug ${className}`}
      style={{ color: 'var(--pwa-text-secondary)', opacity: 0.8 }}
    >
      {t('product.priceDisclaimer')}
    </p>
  );
}
