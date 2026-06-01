import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number | null;
  showPrices: boolean;
  onQuote: (id: string) => void;
}

export function ProductCard({ id, name, imageUrl, price, showPrices, onQuote }: ProductCardProps) {
  const navigate = useNavigate();

  function handleCardClick() {
    navigate(`/products/${id}`);
  }

  function handleQuoteClick(e: React.MouseEvent) {
    e.stopPropagation();
    onQuote(id);
  }

  return (
    <article
      className="product-card group cursor-pointer"
      style={{ backgroundColor: 'transparent' }}
      onClick={handleCardClick}
    >
      {/* Portrait image — 3:4 aspect */}
      <div
        className="overflow-hidden w-full mb-3 relative"
        style={{ aspectRatio: '3/4', backgroundColor: 'var(--pwa-surface-secondary)' }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="product-card__image w-full h-full object-cover"
          />
        ) : (
          <div
            className="product-card__image w-full h-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--pwa-surface-secondary)' }}
          >
            <svg
              width="28" height="28" viewBox="0 0 28 28" fill="none"
              style={{ color: 'var(--pwa-accent)', opacity: 0.25 }}
            >
              <rect x="2" y="2" width="24" height="24" stroke="currentColor" strokeWidth="1"/>
              <path d="M2 20L9 13L13 17L18 11L26 20" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>
        )}

        {/* Price badge overlay */}
        {showPrices && price !== null && (
          <div
            className="absolute bottom-2 left-2 px-2 py-0.5 text-xs font-bold text-white"
            style={{
              backgroundColor: 'var(--pwa-accent)',
              borderRadius: 'var(--pwa-radius-sm, 4px)',
              letterSpacing: '-0.01em',
            }}
          >
            ₡{price.toLocaleString('es-CR')}
          </div>
        )}

        {/* Hover CTA — adds to cart (stops card navigation) */}
        <div className="product-card__cta">
          <button
            type="button"
            onClick={handleQuoteClick}
            className="tracking-[0.2em] uppercase text-white w-full text-center transition-opacity hover:opacity-90"
            style={{ fontSize: '10px', fontFamily: 'var(--pwa-font-body)', fontWeight: 600 }}
          >
            Cotizar
          </button>
        </div>
      </div>

      {/* Name in Cormorant Garamond italic */}
      <div className="px-0.5">
        <p
          className="line-clamp-2 leading-snug mb-1"
          style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontStyle: 'italic',
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            fontWeight: 400,
            color: 'var(--pwa-text)',
            letterSpacing: '0.01em',
          }}
        >
          {name}
        </p>

      </div>
    </article>
  );
}
