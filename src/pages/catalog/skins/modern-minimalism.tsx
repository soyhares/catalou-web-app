import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineBanner } from '@shared/ui/OfflineBanner';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';
import type { CatalogPageProps } from '../useCatalogPage';

/* ── Icons ──────────────────────────────────────────────────────────────── */

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}


function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.5 3 2 4.5 2C6 2 7 3 8 4C9 3 10 2 11.5 2C13 2 14.5 3.5 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}


/* ── Skin ───────────────────────────────────────────────────────────────── */

const ModernMinimalismSkin: React.FC<CatalogPageProps> = ({
  products,
  categories,
  showPrices,
  currency,
  businessModel,
  selectedCategory,
  selectedSubcategoryId,
  searchQuery,
  isLoading,
  error,
  ordersEnabled,
  cartCount: _cartCount,
  companyName: _companyName,
  logoUrl: _logoUrl,
  onCategorySelect,
  onSubcategorySelect,
  onSearchChange,
  onCartClick: _onCartClick,
  onQuote,
  onRetry,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useTheme();
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());

  function toggleWishlist(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setWishlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' as const, maxWidth: '280px', padding: '0 16px' }}>
          <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.875rem', color: 'var(--pwa-text-secondary)', marginBottom: '20px' }}>
            No se pudo cargar el catálogo.
          </p>
          <button
            type="button"
            onClick={onRetry}
            style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--pwa-bg)',
              backgroundColor: 'var(--pwa-accent)',
              border: 'none',
              borderRadius: 'var(--pwa-radius-button)',
              padding: '10px 24px',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const hasProducts = !isLoading && products.length > 0;
  const isEmpty = !isLoading && products.length === 0;
  const resultCount = products.length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', paddingBottom: '80px' }}>
      <OfflineBanner />

      {/* ── Top Bar — mobile only; desktop nav handled by global TopBar ─ */}
      {isMobile && <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: 'var(--pwa-bg)',
        borderBottom: '1px solid var(--pwa-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px' }}>
          {/* Full-width search bar */}
          <label style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--pwa-surface-secondary)',
            borderRadius: 'var(--pwa-radius-md)',
            padding: '10px 14px',
          }}>
            <span style={{ color: 'var(--pwa-text-secondary)', flexShrink: 0 }}><IconSearch /></span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productos…"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '14px',
                color: 'var(--pwa-text)',
              }}
            />
          </label>

          {/* Clear filters button — only visually prominent when a filter is active */}
          <button
            type="button"
            aria-label="Limpiar filtros"
            style={{
              flexShrink: 0,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selectedCategory ? 'var(--pwa-accent)' : 'var(--pwa-surface-secondary)',
              borderRadius: 'var(--pwa-radius-md)',
              border: 'none',
              color: selectedCategory ? 'var(--pwa-bg)' : 'var(--pwa-text-secondary)',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: 1,
            }}
            onClick={() => onCategorySelect(null)}
          >
            ✕
          </button>
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div style={{ overflowX: 'auto', scrollbarWidth: 'none' as const, padding: '4px 16px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' as const }}>
              <button
                type="button"
                onClick={() => onCategorySelect(null)}
                style={{
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '12px',
                  fontWeight: !selectedCategory ? 600 : 400,
                  padding: '5px 12px',
                  borderRadius: 'var(--pwa-radius-chip)',
                  border: `1.5px solid ${!selectedCategory ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                  backgroundColor: !selectedCategory ? 'var(--pwa-accent)' : 'transparent',
                  color: !selectedCategory ? 'var(--pwa-bg)' : 'var(--pwa-text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Todo {!isLoading && !selectedCategory && `(${resultCount})`}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategorySelect(cat.id)}
                  style={{
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '12px',
                    fontWeight: selectedCategory?.id === cat.id ? 600 : 400,
                    padding: '5px 12px',
                    borderRadius: 'var(--pwa-radius-chip)',
                    border: `1.5px solid ${selectedCategory?.id === cat.id ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                    backgroundColor: selectedCategory?.id === cat.id ? 'var(--pwa-accent)' : 'transparent',
                    color: selectedCategory?.id === cat.id ? 'var(--pwa-bg)' : 'var(--pwa-text-secondary)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {cat.name}
                  {selectedCategory?.id === cat.id && !isLoading && ` (${resultCount})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategory row */}
        {selectedCategory && selectedCategory.subcategories.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' as const, padding: '0 16px 10px' }}>
            {selectedCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSubcategorySelect(selectedSubcategoryId === sub.id ? null : sub.id)}
                style={{
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: 'var(--pwa-radius-chip)',
                  border: `1px solid ${selectedSubcategoryId === sub.id ? 'var(--pwa-text)' : 'var(--pwa-border)'}`,
                  backgroundColor: selectedSubcategoryId === sub.id ? 'var(--pwa-text)' : 'transparent',
                  color: selectedSubcategoryId === sub.id ? 'var(--pwa-bg)' : 'var(--pwa-text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </header>}

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main style={{ padding: '16px' }}>
        {/* Loading skeleton — mirrors the 2-column card layout with shimmer */}
        {isLoading && (
          <div>
            <style>{`
              @keyframes mod-shimmer {
                0%   { background-position: -200% 0; }
                100% { background-position:  200% 0; }
              }
            `}</style>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--pwa-radius-md)', overflow: 'hidden', backgroundColor: 'var(--pwa-card)' }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '3/4',
                    background: `linear-gradient(90deg, var(--pwa-border) 25%, var(--pwa-card) 50%, var(--pwa-border) 75%)`,
                    backgroundSize: '200% 100%',
                    animation: 'mod-shimmer 1.4s infinite',
                    animationDelay: `${i * 0.07}s`,
                  }} />
                  {/* Text lines */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      height: '11px',
                      width: '75%',
                      borderRadius: '3px',
                      background: `linear-gradient(90deg, var(--pwa-border) 25%, var(--pwa-card) 50%, var(--pwa-border) 75%)`,
                      backgroundSize: '200% 100%',
                      animation: 'mod-shimmer 1.4s infinite',
                      animationDelay: `${i * 0.07 + 0.08}s`,
                    }} />
                    <div style={{
                      height: '10px',
                      width: '45%',
                      borderRadius: '3px',
                      background: `linear-gradient(90deg, var(--pwa-border) 25%, var(--pwa-card) 50%, var(--pwa-border) 75%)`,
                      backgroundSize: '200% 100%',
                      animation: 'mod-shimmer 1.4s infinite',
                      animationDelay: `${i * 0.07 + 0.15}s`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div style={{ textAlign: 'center' as const, padding: '80px 0' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 16px', display: 'block', color: 'var(--pwa-border)' }}>
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.875rem', color: 'var(--pwa-text-secondary)' }}>
              Sin resultados para tu búsqueda
            </p>
          </div>
        )}

        {/* 2-column product grid */}
        {hasProducts && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {products.map((product) => (
              <article
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                style={{
                  backgroundColor: 'var(--pwa-card)',
                  borderRadius: 'var(--pwa-radius-md)',
                  border: '1px solid var(--pwa-border)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'var(--pwa-shadow)',
                }}
              >
                {/* Image area with heart icon */}
                <div style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative' as const, backgroundColor: 'var(--pwa-surface-secondary)' }}>
                  {product.mainImageUrl ? (
                    <img
                      src={product.mainImageUrl}
                      alt={product.name}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--pwa-border)' }}>
                        <rect x="2" y="2" width="24" height="24" stroke="currentColor" strokeWidth="1" />
                        <path d="M2 20L9 13L13 17L18 11L26 20" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Wishlist heart — top right of image */}
                  {/* wishlist state is local-only until a persistent wishlist feature is implemented */}
                  <button
                    type="button"
                    aria-label={wishlisted.has(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    onClick={(e) => toggleWishlist(product.id, e)}
                    style={{
                      position: 'absolute' as const,
                      top: '8px',
                      right: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--pwa-glass-bg)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: wishlisted.has(product.id) ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
                      boxShadow: 'var(--pwa-shadow-sm)',
                    }}
                  >
                    <IconHeart filled={wishlisted.has(product.id)} />
                  </button>
                </div>

                {/* Product info */}
                <div style={{ padding: '10px 10px 12px' }}>
                  {/* Product name */}
                  <p style={{
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--pwa-text)',
                    marginBottom: '2px',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {product.name}
                  </p>

                  {/* Price */}
                  {showPrices && product.basePrice && (
                    <p style={{
                      fontFamily: 'var(--pwa-font-body)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--pwa-text)',
                      marginBottom: '8px',
                    }}>
                      {formatPrice(product.basePrice, currency)}
                    </p>
                  )}
                  {showPrices && businessModel === 'ASSOCIATED' && product.basePrice && (
                    <PriceDisclaimer className="mt-1 mb-2" />
                  )}

                  {/* Add to cart / view more button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ordersEnabled) { onQuote(product.id); } else { void navigate(`/products/${product.id}`); }
                    }}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--pwa-font-body)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: ordersEnabled ? 'var(--pwa-bg)' : 'var(--pwa-accent)',
                      backgroundColor: ordersEnabled ? 'var(--pwa-accent)' : 'transparent',
                      border: ordersEnabled ? 'none' : '1px solid var(--pwa-border)',
                      borderRadius: 'var(--pwa-radius-sm)',
                      padding: '7px 0',
                      cursor: 'pointer',
                      textAlign: 'center' as const,
                    }}
                  >
                    {ordersEnabled ? 'Agregar' : 'Ver más'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <CatalogFooter />
    </div>
  );
};

export default ModernMinimalismSkin;
