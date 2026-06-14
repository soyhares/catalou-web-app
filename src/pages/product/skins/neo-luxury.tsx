import React from 'react';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';
import type { ProductPageProps } from '../useProductPage';

/* ── Icons ───────────────────────────────────────────────────────────────── */

function IconPlaceholder() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.3 }}>
      <rect x="2" y="2" width="36" height="36" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 30L13 19L20 26L27 17L38 30" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Skin ─────────────────────────────────────────────────────────────────── */

const NeoLuxuryProductSkin: React.FC<ProductPageProps> = (props) => {
  const {
    product,
    isLoading,
    error,
    selectedVariant,
    activeImage,
    quantity,
    computedPrice,
    canAddToCart,
    addedFeedback,
    onVariantSelect,
    onQuantityChange,
    onAddToCart,
    onBack,
    onGoHome,
    onImageSelect,
    showPrices,
    currency,
    businessModel,
    companyName,
    ordersEnabled,
  } = props;

  const { isMobile } = useTheme();
  const galleryImages = product ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--pwa-font-heading)', fontSize: '1.2rem', color: 'var(--pwa-accent)', opacity: 0.7 }}>
          Cargando…
        </p>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <p style={{ fontFamily: 'var(--pwa-font-heading)', fontSize: '1.4rem', color: 'var(--pwa-text)', opacity: 0.5, marginBottom: '20px' }}>
          {error ?? 'Producto no encontrado'}
        </p>
        <button
          type="button"
          onClick={onGoHome}
          style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', paddingBottom: '80px' }}>

      {/* ── Header — mobile only; desktop nav handled by global TopBar ── */}
      {isMobile ? (
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backgroundColor: 'var(--pwa-bg)',
          borderBottom: '1px solid var(--pwa-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: '56px',
        }}>
          <button
            type="button"
            onClick={onBack}
            style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '11px', letterSpacing: '0.08em', color: 'var(--pwa-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            ← Volver
          </button>
          <span style={{ fontFamily: 'var(--pwa-font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--pwa-text)', letterSpacing: '0.05em' }}>
            {companyName}
          </span>
          <div style={{ width: '60px' }} />
        </header>
      ) : (
        <div style={{ padding: '12px 24px' }}>
          <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)', fontSize: '13px' }}>
            ← Volver
          </button>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

          {/* ── Image Panel ─────────────────────────────────────────────── */}
          <div>
            {/* Main image — dark card, neon border/glow */}
            <div style={{
              aspectRatio: '3/4',
              backgroundColor: 'var(--pwa-card)',
              borderRadius: 'var(--pwa-radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--pwa-accent)',
              boxShadow: '0 0 24px var(--pwa-accent), 0 0 2px var(--pwa-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              ) : (
                <IconPlaceholder />
              )}
            </div>

            {/* Gallery thumbnails */}
            {(product.mainImageUrl || galleryImages.length > 0) && (
              <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {product.mainImageUrl && (
                  <button
                    type="button"
                    onClick={() => onImageSelect(product.mainImageUrl!)}
                    style={{
                      flexShrink: 0,
                      width: '56px',
                      height: '74px',
                      border: `1.5px solid ${activeImage === product.mainImageUrl ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                      boxShadow: activeImage === product.mainImageUrl ? '0 0 8px var(--pwa-accent)' : 'none',
                      borderRadius: 'var(--pwa-radius-sm)',
                      overflow: 'hidden',
                      opacity: activeImage === product.mainImageUrl ? 1 : 0.5,
                      cursor: 'pointer',
                      padding: 0,
                      background: 'var(--pwa-card)',
                    }}
                  >
                    <img src={product.mainImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </button>
                )}
                {galleryImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => onImageSelect(img.url)}
                    style={{
                      flexShrink: 0,
                      width: '56px',
                      height: '74px',
                      border: `1.5px solid ${activeImage === img.url ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                      boxShadow: activeImage === img.url ? '0 0 8px var(--pwa-accent)' : 'none',
                      borderRadius: 'var(--pwa-radius-sm)',
                      overflow: 'hidden',
                      opacity: activeImage === img.url ? 1 : 0.5,
                      cursor: 'pointer',
                      padding: 0,
                      background: 'var(--pwa-card)',
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Panel ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Product name — bold Space Grotesk, white text */}
            <h1 style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              fontWeight: 700,
              color: 'var(--pwa-text)',
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              marginBottom: '12px',
            }}>
              {product.name}
            </h1>

            {/* Price — large, bright, accent color */}
            {showPrices && computedPrice && (
              <p style={{
                fontFamily: 'var(--pwa-font-heading)',
                fontSize: '1.8rem',
                fontWeight: 700,
                color: 'var(--pwa-accent)',
                letterSpacing: '0.02em',
                marginBottom: '20px',
                textShadow: '0 0 12px var(--pwa-accent)',
              }}>
                {formatPrice(Number(computedPrice), currency)}
                {selectedVariant && parseFloat(selectedVariant.priceModifier) > 0 && (
                  <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.75rem', fontWeight: 400, color: 'var(--pwa-text-secondary)', marginLeft: '10px', textShadow: 'none' }}>
                    base + variante
                  </span>
                )}
              </p>
            )}
            {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && computedPrice && (
              <PriceDisclaimer className="mb-6" />
            )}

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--pwa-border)', marginBottom: '20px' }} />

            {/* Variant selectors — dark pill buttons, active = accent border + glow */}
            {product.variantType && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pwa-text-secondary)', marginBottom: '10px' }}>
                  {product.variantType.name}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.variantType.values.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onVariantSelect(v)}
                      style={{
                        fontFamily: 'var(--pwa-font-body)',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '8px 18px',
                        borderRadius: 'var(--pwa-radius-chip)',
                        border: `1.5px solid ${selectedVariant?.id === v.id ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                        backgroundColor: 'var(--pwa-card)',
                        color: selectedVariant?.id === v.id ? 'var(--pwa-accent)' : 'var(--pwa-text)',
                        boxShadow: selectedVariant?.id === v.id ? '0 0 10px var(--pwa-accent)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {v.value}
                      {showPrices && parseFloat(v.priceModifier) > 0 && (
                        <span style={{ fontSize: '10px', marginLeft: '6px', opacity: 0.7 }}>+{formatPrice(parseFloat(v.priceModifier), currency)}</span>
                      )}
                    </button>
                  ))}
                </div>
                {!selectedVariant && (
                  <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, marginTop: '8px' }}>
                    Selecciona una opción para continuar
                  </p>
                )}
              </div>
            )}

            {/* Quantity + CTA — only when orders enabled */}
            {ordersEnabled && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pwa-text-secondary)' }}>
                    Cantidad
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid var(--pwa-border)', borderRadius: 'var(--pwa-radius-md)', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(quantity - 1)}
                      style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '18px', color: 'var(--pwa-accent)', background: 'var(--pwa-card)', border: 'none', cursor: 'pointer', padding: '8px 14px', lineHeight: 1 }}
                    >
                      −
                    </button>
                    <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--pwa-text)', padding: '8px 14px', backgroundColor: 'var(--pwa-bg)', minWidth: '32px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(quantity + 1)}
                      style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '18px', color: 'var(--pwa-accent)', background: 'var(--pwa-card)', border: 'none', cursor: 'pointer', padding: '8px 14px', lineHeight: 1 }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canAddToCart}
                  onClick={onAddToCart}
                  style={{
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: 'var(--pwa-bg)',
                    background: canAddToCart
                      ? 'linear-gradient(135deg, var(--pwa-accent) 0%, var(--pwa-text-secondary) 100%)'
                      : 'var(--pwa-card)',
                    border: 'none',
                    borderRadius: 'var(--pwa-radius-button)',
                    padding: '16px 24px',
                    width: '100%',
                    cursor: canAddToCart ? 'pointer' : 'not-allowed',
                    opacity: canAddToCart ? 1 : 0.4,
                    boxShadow: canAddToCart ? `0 0 20px var(--pwa-accent), var(--pwa-shadow-lg)` : 'none',
                    transition: 'all 0.2s',
                    marginBottom: '28px',
                  }}
                >
                  {addedFeedback ? '¡Añadido!' : canAddToCart ? 'Añadir al carrito' : 'Selecciona una opción'}
                </button>
              </>
            )}

            {/* Description — Space Grotesk, text-secondary color */}
            {product.description && (
              <div style={{ borderTop: '1px solid var(--pwa-border)', paddingTop: '20px', marginBottom: '20px' }}>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pwa-text-secondary)', marginBottom: '10px' }}>
                  Descripción
                </p>
                <p style={{
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '0.9rem',
                  color: 'var(--pwa-text-secondary)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Technical specs */}
            {product.technicalSpecs && (
              <div style={{ borderTop: '1px solid var(--pwa-border)', paddingTop: '20px' }}>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pwa-text-secondary)', marginBottom: '10px' }}>
                  Especificaciones técnicas
                </p>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.85rem', color: 'var(--pwa-text-secondary)', opacity: 0.8, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {product.technicalSpecs}
                </p>
              </div>
            )}
          </div>
        </div>

        <CatalogFooter className="mt-4 px-4" />
      </div>
    </div>
  );
};

export default NeoLuxuryProductSkin;
