import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineBanner } from '@shared/ui/OfflineBanner';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';
import type { CatalogPageProps } from '../useCatalogPage';

/* ── SVG Icons ──────────────────────────────────────────────────────────── */

function IconBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="7.5" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M7.5 7.5V6C7.5 3.515 9.015 2 11 2C12.985 2 14.5 3.515 14.5 6V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Skin ───────────────────────────────────────────────────────────────── */

const LuxuryMinimalismSkin: React.FC<CatalogPageProps> = ({
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
  bookingsEnabled: _bookingsEnabled,
  typeFilter: _typeFilter,
  hasServices: _hasServices,
  hasProductItems: _hasProductItems,
  cartCount,
  companyName,
  logoUrl,
  onCategorySelect,
  onSubcategorySelect,
  onCartClick,
  onQuote: _onQuote,
  onRetry,
  onTypeFilterChange: _onTypeFilterChange,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useTheme();

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--pwa-bg)' }}>
        <div style={{ textAlign: 'center', maxWidth: '280px', padding: '0 16px' }}>
          <p style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--pwa-text)', opacity: 0.5, marginBottom: '24px' }}>
            No se pudo cargar el catálogo.
          </p>
          <button
            type="button"
            onClick={onRetry}
            style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
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
        backgroundColor: 'var(--pwa-bg)',
        borderBottom: '1px solid var(--pwa-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          {/* Logo / Brand name — italic serif, centered */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} style={{ height: '52px', width: 'auto', objectFit: 'contain' }} />
            ) : (
              <span style={{
                fontFamily: 'var(--pwa-font-heading)',
                fontStyle: 'italic',
                fontSize: '1.35rem',
                fontWeight: 400,
                color: 'var(--pwa-text)',
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}>
                {companyName}
              </span>
            )}
            <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pwa-text-secondary)', opacity: 0.5, marginTop: '2px' }}>
              Catálogo
            </span>
          </div>

          {/* Cart icon — only when orders enabled */}
          {ordersEnabled && (
            <button
              type="button"
              onClick={onCartClick}
              aria-label={`Carrito (${cartCount} artículos)`}
              style={{ position: 'relative', color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <IconBag />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--pwa-accent)',
                  color: 'var(--pwa-bg)',
                  fontSize: '9px',
                  fontWeight: 600,
                  minWidth: '14px',
                  height: '14px',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px',
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div style={{ borderTop: '1px solid var(--pwa-border)', overflowX: 'auto', scrollbarWidth: 'none' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', whiteSpace: 'nowrap' as const }}>
              <button
                type="button"
                onClick={() => onCategorySelect(null)}
                style={{
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  padding: '6px 16px',
                  borderRadius: 'var(--pwa-radius-chip)',
                  border: `1px solid ${!selectedCategory ? 'var(--pwa-text)' : 'var(--pwa-border)'}`,
                  backgroundColor: !selectedCategory ? 'var(--pwa-text)' : 'transparent',
                  color: !selectedCategory ? 'var(--pwa-bg)' : 'var(--pwa-text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  flexShrink: 0,
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
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                    padding: '6px 16px',
                    borderRadius: 'var(--pwa-radius-chip)',
                    border: `1px solid ${selectedCategory?.id === cat.id ? 'var(--pwa-text)' : 'var(--pwa-border)'}`,
                    backgroundColor: selectedCategory?.id === cat.id ? 'var(--pwa-text)' : 'transparent',
                    color: selectedCategory?.id === cat.id ? 'var(--pwa-bg)' : 'var(--pwa-text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

          </div>
        )}
      </header>}

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      {!searchQuery && !selectedCategory && !isLoading && hasProducts && (
        <section style={{
          background: 'linear-gradient(135deg, var(--pwa-surface-secondary) 0%, var(--pwa-bg) 60%)',
          padding: '48px 24px 40px',
          textAlign: 'center' as const,
        }}>
          <h1 style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontStyle: 'italic',
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 400,
            color: 'var(--pwa-text)',
            letterSpacing: '0.01em',
            lineHeight: 1.2,
            marginBottom: '12px',
          }}>
            Nuestra Colección
          </h1>
          <p style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase' as const,
            color: 'var(--pwa-text-secondary)',
            marginBottom: '28px',
          }}>
            Piezas seleccionadas con cuidado
          </p>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('lm-product-list');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase' as const,
              fontWeight: 600,
              color: 'var(--pwa-bg)',
              backgroundColor: 'var(--pwa-text)',
              border: 'none',
              borderRadius: 'var(--pwa-radius-button)',
              padding: '12px 32px',
              cursor: 'pointer',
            }}
          >
            Ver catálogo
          </button>
        </section>
      )}

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main style={{ padding: '32px 20px 0' }} id="lm-product-list">
        {/* Subcategory row */}
        {visibleSubs.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' as const, flexWrap: 'nowrap' as const }}>
              {visibleSubs.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSubcategorySelect(selectedSubcategoryId === sub.id ? null : sub.id)}
                  style={{
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                    padding: '4px 12px',
                    borderRadius: 'var(--pwa-radius-chip)',
                    border: `1px solid ${selectedSubcategoryId === sub.id ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                    backgroundColor: selectedSubcategoryId === sub.id ? 'var(--pwa-accent-soft)' : 'transparent',
                    color: selectedSubcategoryId === sub.id ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {sub.name}
                </button>
              ))}
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '48px', background: 'linear-gradient(to right, transparent, var(--pwa-bg))', pointerEvents: 'none' }} />
          </div>
        )}

        {/* Section label */}
        {hasProducts && (
          <p style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase' as const,
            color: 'var(--pwa-text-secondary)',
            marginBottom: '24px',
          }}>
            {selectedCategory ? selectedCategory.name : 'Selección Editorial'}
          </p>
        )}

        {/* Loading skeleton — mirrors the vertical card layout */}
        {isLoading && (
          <div>
            <style>{`
              @keyframes lux-shimmer {
                0%   { background-position: -200% 0; }
                100% { background-position:  200% 0; }
              }
            `}</style>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '20px 0',
                  borderBottom: '1px solid var(--pwa-border)',
                  alignItems: 'center',
                }}
              >
                {/* Image placeholder */}
                <div style={{
                  flexShrink: 0,
                  width: '88px',
                  height: '110px',
                  borderRadius: 'var(--pwa-radius-sm)',
                  background: `linear-gradient(90deg, var(--pwa-card) 25%, var(--pwa-border) 50%, var(--pwa-card) 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'lux-shimmer 1.5s infinite',
                  animationDelay: `${i * 0.1}s`,
                }} />
                {/* Text lines */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    height: '12px',
                    width: '60%',
                    borderRadius: '4px',
                    background: `linear-gradient(90deg, var(--pwa-card) 25%, var(--pwa-border) 50%, var(--pwa-card) 75%)`,
                    backgroundSize: '200% 100%',
                    animation: 'lux-shimmer 1.5s infinite',
                    animationDelay: `${i * 0.1 + 0.05}s`,
                  }} />
                  <div style={{
                    height: '10px',
                    width: '40%',
                    borderRadius: '4px',
                    background: `linear-gradient(90deg, var(--pwa-card) 25%, var(--pwa-border) 50%, var(--pwa-card) 75%)`,
                    backgroundSize: '200% 100%',
                    animation: 'lux-shimmer 1.5s infinite',
                    animationDelay: `${i * 0.1 + 0.1}s`,
                  }} />
                  <div style={{
                    marginTop: '4px',
                    height: '10px',
                    width: '25%',
                    borderRadius: '4px',
                    background: `linear-gradient(90deg, var(--pwa-card) 25%, var(--pwa-border) 50%, var(--pwa-card) 75%)`,
                    backgroundSize: '200% 100%',
                    animation: 'lux-shimmer 1.5s infinite',
                    animationDelay: `${i * 0.1 + 0.15}s`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div style={{ textAlign: 'center' as const, padding: '80px 0' }}>
            <p style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontStyle: 'italic',
              fontSize: '1.3rem',
              color: 'var(--pwa-text)',
              opacity: 0.35,
            }}>
              Sin resultados
            </p>
          </div>
        )}

        {/* Product list — vertical, horizontal card layout */}
        {hasProducts && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0' }}>
            {products.map((product) => (
              <article
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                  padding: '20px 0',
                  borderBottom: '1px solid var(--pwa-border)',
                  cursor: 'pointer',
                }}
              >
                {/* Image — square, rounded */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  flexShrink: 0,
                  borderRadius: 'var(--pwa-radius-md)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--pwa-surface-secondary)',
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
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.2 }}>
                        <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="1" />
                        <path d="M2 17L7 12L11 15L15 10L22 17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Text content */}
                <div style={{ flex: 1, paddingTop: '4px' }}>
                  <p style={{
                    fontFamily: 'var(--pwa-font-heading)',
                    fontStyle: 'italic',
                    fontSize: '1.1rem',
                    fontWeight: 400,
                    color: 'var(--pwa-text)',
                    marginBottom: '4px',
                    lineHeight: 1.3,
                  }}>
                    {product.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                    {showPrices && product.basePrice && (
                      <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--pwa-accent)', margin: 0 }}>
                        {formatPrice(product.basePrice, currency)}
                      </p>
                    )}
                    {product.type === 'service' && product.durationMinutes && showPrices && (
                      <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '10px', color: 'var(--pwa-text-secondary)', letterSpacing: '0.06em' }}>
                        {product.durationMinutes} min
                      </span>
                    )}
                  </div>
                  {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && product.basePrice && (
                    <PriceDisclaimer className="mt-1 mb-2" />
                  )}
                  {product.description ? (
                    <p style={{
                      fontFamily: 'var(--pwa-font-body)',
                      fontSize: '11px',
                      lineHeight: 1.6,
                      color: 'var(--pwa-text-secondary)',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden',
                    }}>
                      {product.description}
                    </p>
                  ) : null}
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

export default LuxuryMinimalismSkin;
