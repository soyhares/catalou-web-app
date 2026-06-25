import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineBanner } from '@shared/ui/OfflineBanner';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';
import type { CatalogPageProps } from '../useCatalogPage';

/* ── Icons ──────────────────────────────────────────────────────────────── */

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="6.5" width="14" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M6.5 6.5V5.5C6.5 3.3 8 2 9.5 2C11 2 12.5 3.3 12.5 5.5V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Skin ───────────────────────────────────────────────────────────────── */

const NeoLuxurySkin: React.FC<CatalogPageProps> = ({
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
  bookingsEnabled,
  typeFilter,
  hasServices,
  hasProductItems,
  cartCount,
  companyName,
  logoUrl,
  onCategorySelect,
  onSubcategorySelect,
  onSearchChange,
  onCartClick,
  onQuote,
  onRetry,
  onTypeFilterChange,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useTheme();

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' as const, maxWidth: '280px', padding: '0 16px' }}>
          <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.9rem', color: 'var(--pwa-text-secondary)', marginBottom: '24px' }}>
            Error de conexión. Intenta de nuevo.
          </p>
          <button
            type="button"
            onClick={onRetry}
            style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color: 'var(--pwa-accent)',
              background: 'none',
              border: '1px solid var(--pwa-accent)',
              borderRadius: 'var(--pwa-radius-button)',
              padding: '8px 20px',
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
  const visibleSubs = selectedCategory
    ? selectedCategory.subcategories
    : categories.flatMap((c) => c.subcategories);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', paddingBottom: '80px' }}>
      <OfflineBanner />

      {/* ── Top Bar — mobile only; desktop nav handled by global TopBar ─ */}
      {isMobile && <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: 'var(--pwa-card)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--pwa-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          {/* Logo with gradient text */}
          <div style={{ flex: 1 }}>
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
            ) : (
              <span style={{
                fontFamily: 'var(--pwa-font-heading)',
                fontSize: '1.2rem',
                fontWeight: 700,
                background: `linear-gradient(90deg, var(--pwa-accent), var(--pwa-text-secondary))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.04em',
              }}>
                {companyName}
              </span>
            )}
          </div>

          {/* Cart icon — only when orders enabled */}
          {ordersEnabled && (
            <button
              type="button"
              onClick={onCartClick}
              aria-label={`Carrito (${cartCount} artículos)`}
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--pwa-border)',
                backgroundColor: 'var(--pwa-bg)',
                color: 'var(--pwa-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconCart />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--pwa-accent)',
                  color: 'var(--pwa-bg)',
                  fontSize: '9px',
                  fontWeight: 700,
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Search bar */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--pwa-bg)',
            border: '1px solid var(--pwa-border)',
            borderRadius: '24px',
            padding: '10px 16px',
          }}>
            <span style={{ color: 'var(--pwa-text-secondary)', flexShrink: 0 }}><IconSearch /></span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productos..."
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
          </div>
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div style={{ overflowX: 'auto', scrollbarWidth: 'none' as const, borderTop: '1px solid var(--pwa-border)', padding: '10px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' as const }}>
              <button
                type="button"
                onClick={() => onCategorySelect(null)}
                style={{
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '11px',
                  padding: '6px 16px',
                  borderRadius: 'var(--pwa-radius-chip)',
                  border: !selectedCategory ? '1px solid var(--pwa-accent)' : '1px solid var(--pwa-border)',
                  backgroundColor: !selectedCategory ? 'var(--pwa-accent-soft)' : 'transparent',
                  color: !selectedCategory ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  fontWeight: !selectedCategory ? 600 : 400,
                }}
              >
                Todo
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategorySelect(cat.id)}
                  style={{
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '11px',
                    padding: '6px 16px',
                    borderRadius: 'var(--pwa-radius-chip)',
                    border: selectedCategory?.id === cat.id ? '1px solid var(--pwa-accent)' : '1px solid var(--pwa-border)',
                    backgroundColor: selectedCategory?.id === cat.id ? 'var(--pwa-accent-soft)' : 'transparent',
                    color: selectedCategory?.id === cat.id ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontWeight: selectedCategory?.id === cat.id ? 600 : 400,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>}

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main style={{ padding: '24px 16px 0' }}>
        {/* Type filter tabs */}
        {hasServices && hasProductItems && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {(['all', 'product', 'service'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTypeFilterChange(t)}
                style={{
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '11px',
                  fontWeight: typeFilter === t ? 700 : 400,
                  letterSpacing: '0.06em',
                  padding: '5px 14px',
                  borderRadius: 'var(--pwa-radius-sm)',
                  border: `1px solid ${typeFilter === t ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                  backgroundColor: typeFilter === t ? 'var(--pwa-accent)' : 'transparent',
                  color: typeFilter === t ? 'var(--pwa-bg)' : 'var(--pwa-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {t === 'all' ? 'Todo' : t === 'product' ? 'Productos' : 'Servicios'}
              </button>
            ))}
          </div>
        )}

        {/* Section title */}
        {hasProducts && (
          <h2 style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--pwa-text)',
            marginBottom: '16px',
            letterSpacing: '0.02em',
          }}>
            <span style={{ color: 'var(--pwa-accent)' }} aria-hidden="true">✦</span>{' '}
            {selectedCategory ? selectedCategory.name : 'Destacados'}
          </h2>
        )}

        {/* Subcategory row */}
        {visibleSubs.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' as const, marginBottom: '16px' }}>
            {visibleSubs.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSubcategorySelect(selectedSubcategoryId === sub.id ? null : sub.id)}
                style={{
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '10px',
                  padding: '5px 12px',
                  borderRadius: 'var(--pwa-radius-chip)',
                  border: selectedSubcategoryId === sub.id ? '1px solid var(--pwa-accent)' : '1px solid var(--pwa-border)',
                  backgroundColor: selectedSubcategoryId === sub.id ? 'var(--pwa-accent-soft)' : 'transparent',
                  color: selectedSubcategoryId === sub.id ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
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

        {/* Loading skeleton — mirrors the 2-column card layout with shimmer */}
        {isLoading && (
          <div>
            <style>{`
              @keyframes neo-shimmer {
                0%   { background-position: -200% 0; }
                100% { background-position:  200% 0; }
              }
            `}</style>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--pwa-card)',
                    borderRadius: 'var(--pwa-radius-md)',
                    border: '1px solid var(--pwa-border)',
                    overflow: 'hidden',
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '3/4',
                    background: `linear-gradient(90deg, var(--pwa-card) 25%, var(--pwa-bg) 50%, var(--pwa-card) 75%)`,
                    backgroundSize: '200% 100%',
                    animation: 'neo-shimmer 1.6s infinite',
                    animationDelay: `${i * 0.08}s`,
                  }} />
                  {/* Text area */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      height: '11px',
                      width: '70%',
                      borderRadius: '4px',
                      background: `linear-gradient(90deg, var(--pwa-card) 25%, var(--pwa-bg) 50%, var(--pwa-card) 75%)`,
                      backgroundSize: '200% 100%',
                      animation: 'neo-shimmer 1.6s infinite',
                      animationDelay: `${i * 0.08 + 0.1}s`,
                    }} />
                    <div style={{
                      height: '10px',
                      width: '40%',
                      borderRadius: '4px',
                      background: `linear-gradient(90deg, var(--pwa-card) 25%, var(--pwa-bg) 50%, var(--pwa-card) 75%)`,
                      backgroundSize: '200% 100%',
                      animation: 'neo-shimmer 1.6s infinite',
                      animationDelay: `${i * 0.08 + 0.18}s`,
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
            <p style={{ fontFamily: 'var(--pwa-font-body)', color: 'var(--pwa-text-secondary)', fontSize: '0.9rem' }}>
              Sin resultados
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
                  boxShadow: '0 0 0 0 var(--pwa-accent)',
                  transition: 'box-shadow 0.2s',
                  position: 'relative' as const,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px var(--pwa-accent-soft)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 var(--pwa-accent)'; }}
              >
                {/* Image area */}
                <div style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  backgroundColor: 'var(--pwa-bg)',
                  position: 'relative' as const,
                  overflow: 'hidden',
                }}>
                  {product.mainImageUrl ? (
                    <img
                      src={product.mainImageUrl}
                      alt={product.name}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.2 }}>
                        <rect x="2" y="2" width="24" height="24" stroke="currentColor" strokeWidth="1" />
                        <path d="M2 20L9 13L13 17L18 11L26 20" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Text area */}
                <div style={{ padding: '12px' }}>
                  <p style={{
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'var(--pwa-text)',
                    marginBottom: '6px',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {product.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2px' }}>
                      {showPrices && product.basePrice ? (
                        <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--pwa-text)', margin: 0 }}>
                          {formatPrice(product.basePrice, currency)}
                        </p>
                      ) : (
                        <span />
                      )}
                      {product.type === 'service' && product.durationMinutes && (
                        <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '10px', color: 'var(--pwa-text-secondary)', fontWeight: 500 }}>
                          {product.durationMinutes} min
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.type === 'service' && bookingsEnabled) {
                          void navigate('/book');
                        } else if (product.type === 'product' && ordersEnabled) {
                          onQuote(product.id);
                        } else {
                          void navigate(`/products/${product.id}`);
                        }
                      }}
                      style={{
                        background: 'var(--pwa-accent)',
                        border: 'none',
                        borderRadius: 'var(--pwa-radius-sm)',
                        padding: '6px 10px',
                        color: 'var(--pwa-bg)',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase' as const,
                        fontFamily: 'var(--pwa-font-body)',
                        cursor: 'pointer',
                      }}
                    >
                      {product.type === 'service' ? (bookingsEnabled ? '›' : '›') : (ordersEnabled ? '+' : '›')}
                    </button>
                  </div>
                  {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && product.basePrice && (
                    <PriceDisclaimer className="mt-1" />
                  )}
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

export default NeoLuxurySkin;
