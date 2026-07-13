import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui/PriceDisclaimer';

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number | null;
  showPrices: boolean;
  currency?: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  actionLabel: string | null;
  onAction: (id: string) => void;
}

export function ProductCard({ id, name, imageUrl, price, showPrices, currency = 'CRC', businessModel, actionLabel, onAction }: ProductCardProps) {
  const navigate = useNavigate();

  function handleCardClick() {
    navigate(`/products/${id}`);
  }

  function handleActionClick(e: React.MouseEvent) {
    e.stopPropagation();
    onAction(id);
  }

  return (
    <article className="product-card cursor-pointer" style={{ backgroundColor: 'transparent' }} onClick={handleCardClick}>
      <div className="overflow-hidden w-full mb-2 relative" style={{ aspectRatio: '3/4', backgroundColor: 'var(--pwa-surface-secondary)', borderRadius: 'var(--pwa-radius-md)' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" className="product-card__image w-full h-full object-cover" />
        ) : (
          <div className="product-card__image w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--pwa-surface-secondary)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.25 }}>
              <rect x="2" y="2" width="24" height="24" stroke="currentColor" strokeWidth="1" />
              <path d="M2 20L9 13L13 17L18 11L26 20" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        )}
        {showPrices && price !== null && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: 'var(--pwa-accent)', color: 'var(--pwa-on-accent)', borderRadius: 'var(--pwa-radius-sm, 4px)', letterSpacing: '-0.01em' }}>
            {formatPrice(price, currency)}
          </div>
        )}
      </div>

      {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && price !== null && (
        <PriceDisclaimer className="px-0.5 mt-0" />
      )}

      <div className="px-0.5">
        <p className="line-clamp-2 leading-snug mb-1" style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', fontWeight: 400, color: 'var(--pwa-text)', letterSpacing: '0.01em' }}>
          {name}
        </p>
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={handleActionClick}
          className="w-full text-center uppercase"
          style={{
            marginTop: '6px',
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '10px',
            letterSpacing: '0.14em',
            fontWeight: 600,
            color: 'var(--pwa-on-accent)',
            backgroundColor: 'var(--pwa-accent)',
            border: 'none',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '8px 0',
            cursor: 'pointer',
            minHeight: '36px',
          }}
        >
          {actionLabel}
        </button>
      )}
    </article>
  );
}
