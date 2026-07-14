import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui/PriceDisclaimer';

interface ProductGridCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number | null;
  showPrices: boolean;
  currency?: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  variant: 'shop' | 'info';
  actionLabel: string | null;
  onAction: (id: string) => void;
}

export function ProductGridCard({ id, name, imageUrl, price, showPrices, currency = 'CRC', businessModel, variant, actionLabel, onAction }: ProductGridCardProps) {
  const navigate = useNavigate();
  const isInfo = variant === 'info';

  function handleCardClick() {
    navigate(`/products/${id}`);
  }

  function handleActionClick(e: React.MouseEvent) {
    e.stopPropagation();
    onAction(id);
  }

  return (
    <article className="product-card cursor-pointer" style={{ backgroundColor: 'transparent' }} onClick={handleCardClick}>
      <div
        className="overflow-hidden w-full relative"
        style={{
          aspectRatio: '1/1',
          backgroundColor: 'var(--pwa-surface-secondary)',
          borderRadius: 'var(--pwa-radius-md)',
          padding: isInfo ? '16px' : 0,
          display: isInfo ? 'flex' : undefined,
          alignItems: isInfo ? 'center' : undefined,
          justifyContent: isInfo ? 'center' : undefined,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="product-card__image"
            style={isInfo
              ? { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }
              : { width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="product-card__image w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--pwa-surface-secondary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.25 }}>
              <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="1" />
              <path d="M2 17L7 12L11 15L15 10L22 17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        )}

        {!isInfo && showPrices && price !== null && (
          <div
            className="absolute bottom-2 left-2 px-2 py-0.5 text-xs font-bold"
            style={{ backgroundColor: 'var(--pwa-surface)', color: 'var(--pwa-text)', borderRadius: 'var(--pwa-radius-sm, 4px)', letterSpacing: '-0.01em', boxShadow: 'var(--pwa-shadow-sm)' }}
          >
            {formatPrice(price, currency)}
          </div>
        )}
      </div>

      <div className={isInfo ? 'px-0.5 text-center' : 'px-0.5'} style={{ marginTop: '7px' }}>
        <p
          className={isInfo ? 'line-clamp-1 leading-snug' : 'line-clamp-2 leading-snug'}
          style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: 'clamp(0.9rem, 2.4vw, 1rem)', fontWeight: 400, color: 'var(--pwa-text)', letterSpacing: '0.01em' }}
        >
          {name}
        </p>
      </div>

      {!isInfo && showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && price !== null && (
        <PriceDisclaimer className="px-0.5 mt-0.5" />
      )}

      {!isInfo && actionLabel && (
        <button
          type="button"
          onClick={handleActionClick}
          className="w-full text-center uppercase"
          style={{
            marginTop: '6px',
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            fontWeight: 600,
            color: 'var(--pwa-accent)',
            backgroundColor: 'var(--pwa-accent-soft)',
            border: 'none',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '9px 0',
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
