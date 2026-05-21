interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number | null;
  showPrices: boolean;
  onQuote: (id: string) => void;
}

export function ProductCard({ id, name, imageUrl, price, showPrices, onQuote }: ProductCardProps) {
  return (
    <div
      className="product-card"
      style={{
        backgroundColor: 'var(--pwa-card)',
        border: '1px solid var(--pwa-text)15',
        borderRadius: 'var(--pwa-radius-md, 12px)',
        boxShadow: 'var(--pwa-shadow)',
        transition: 'transform var(--pwa-motion, 200ms) ease',
        overflow: 'hidden',
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div
          style={{ backgroundColor: 'var(--pwa-accent)15' }}
          className="w-full aspect-square flex items-center justify-center"
        >
          <span className="text-3xl">📦</span>
        </div>
      )}
      <div className="p-2 flex flex-col gap-1.5">
        <p
          style={{ color: 'var(--pwa-text)' }}
          className="text-xs font-medium line-clamp-2 leading-snug"
        >
          {name}
        </p>
        {showPrices && price !== null && (
          <p
            style={{ color: 'var(--pwa-accent)' }}
            className="text-xs font-semibold"
          >
            ${price}
          </p>
        )}
        <button
          type="button"
          onClick={() => onQuote(id)}
          style={{ backgroundColor: 'var(--pwa-accent)', color: '#FFFFFF', borderRadius: 'var(--pwa-radius-button)' }}
          className="w-full py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 mt-0.5"
        >
          Cotizar
        </button>
      </div>
    </div>
  );
}
