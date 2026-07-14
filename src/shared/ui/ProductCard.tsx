import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui/PriceDisclaimer';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string | null;
  price: number | null;
  durationMinutes?: number | null;
  showPrices: boolean;
  currency?: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  actionLabel: string | null;
  onAction: (id: string) => void;
}

export function ProductCard({ id, name, description, imageUrl, price, durationMinutes, showPrices, currency = 'CRC', businessModel, actionLabel, onAction }: ProductCardProps) {
  const navigate = useNavigate();

  function handleCardClick() {
    navigate(`/products/${id}`);
  }

  function handleActionClick(e: React.MouseEvent) {
    e.stopPropagation();
    onAction(id);
  }

  return (
    <article className="product-card cursor-pointer flex items-center" style={{ backgroundColor: 'transparent', gap: '14px' }} onClick={handleCardClick}>
      <div className="overflow-hidden flex-shrink-0 relative" style={{ width: '96px', height: '96px', backgroundColor: 'var(--pwa-surface-secondary)', borderRadius: 'var(--pwa-radius-md)' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" className="product-card__image w-full h-full object-cover" />
        ) : (
          <div className="product-card__image w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--pwa-surface-secondary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.25 }}>
              <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="1" />
              <path d="M2 17L7 12L11 15L15 10L22 17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col" style={{ alignSelf: 'stretch' }}>
        <p className="line-clamp-1 leading-snug" style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', fontWeight: 400, color: 'var(--pwa-text)', letterSpacing: '0.01em' }}>
          {name}
        </p>
        {description && (
          <p className="line-clamp-2 leading-snug" style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '11px', color: 'var(--pwa-text-secondary)', marginTop: '3px' }}>
            {description}
          </p>
        )}
        {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && price !== null && (
          <PriceDisclaimer className="mt-1" />
        )}

        <div className="flex-1" style={{ minHeight: '4px' }} />

        <div className="flex items-center justify-between" style={{ marginTop: '6px', gap: '8px' }}>
          <div className="flex items-baseline min-w-0" style={{ gap: '6px' }}>
            {showPrices && price !== null && (
              <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--pwa-text)' }}>
                {formatPrice(price, currency)}
              </span>
            )}
            {durationMinutes && (
              <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '10px', color: 'var(--pwa-text-secondary)' }}>
                · {durationMinutes} min
              </span>
            )}
          </div>

          {actionLabel && (
            <button
              type="button"
              onClick={handleActionClick}
              style={{
                flexShrink: 0,
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                fontWeight: 600,
                color: 'var(--pwa-accent)',
                backgroundColor: 'var(--pwa-accent-soft)',
                border: 'none',
                borderRadius: 'var(--pwa-radius-button)',
                padding: '10px 16px',
                cursor: 'pointer',
                minHeight: '36px',
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
