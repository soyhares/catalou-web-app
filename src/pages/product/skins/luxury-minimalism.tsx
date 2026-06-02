import React from 'react';
import { BottomNav } from '@shared/ui/BottomNav';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import type { ProductPageProps } from '../useProductPage';

/* ── Icons ───────────────────────────────────────────────────────────────── */

function IconPlaceholder() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.2 }}>
      <rect x="2" y="2" width="36" height="36" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 30L13 19L20 26L27 17L38 30" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Skin ─────────────────────────────────────────────────────────────────── */

const LuxuryMinimalismProductSkin: React.FC<ProductPageProps> = (props) => {
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
    companyName,
  } = props;

  const { isMobile } = useTheme();
  const galleryImages = product ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--pwa-text)', opacity: 0.4 }}>
          Cargando…
        </p>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <p style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--pwa-text)', opacity: 0.35, marginBottom: '20px' }}>
          {error ?? 'Producto no encontrado'}
        </p>
        <button
          type="button"
          onClick={onGoHome}
          style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Volver al catálogo
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
            style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--pwa-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            ← Colección
          </button>
          <span style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--pwa-text)' }}>
            {companyName}
          </span>
          <div style={{ width: '64px' }} />
        </header>
      ) : (
        <div style={{ padding: '12px 24px' }}>
          <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)', fontSize: '13px' }}>
            ← Volver
          </button>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <nav style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onGoHome}
            style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Catálogo
          </button>
          <span style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.3 }}>›</span>
          <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pwa-text-secondary)', opacity: 0.5, fontWeight: 600 }}>
            {product.name}
          </span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', padding: '0 20px 32px' }}>

          {/* ── Image Panel ─────────────────────────────────────────────── */}
          <div>
            {/* Main image — large, warm background, rounded */}
            <div style={{
              aspectRatio: '3/4',
              backgroundColor: 'var(--pwa-surface-secondary)',
              borderRadius: 'var(--pwa-radius-lg)',
              overflow: 'hidden',
            }}>
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconPlaceholder />
                </div>
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
                      borderRadius: 'var(--pwa-radius-sm)',
                      overflow: 'hidden',
                      opacity: activeImage === product.mainImageUrl ? 1 : 0.5,
                      cursor: 'pointer',
                      padding: 0,
                      background: 'none',
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
                      borderRadius: 'var(--pwa-radius-sm)',
                      overflow: 'hidden',
                      opacity: activeImage === img.url ? 1 : 0.5,
                      cursor: 'pointer',
                      padding: 0,
                      background: 'none',
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Panel ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px' }}>

            {/* Product name — large serif italic */}
            <h1 style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
              fontWeight: 400,
              color: 'var(--pwa-text)',
              letterSpacing: '0.01em',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}>
              {product.name}
            </h1>

            {/* Price — accent color, generous spacing */}
            {showPrices && computedPrice && (
              <p style={{
                fontFamily: 'var(--pwa-font-heading)',
                fontStyle: 'italic',
                fontSize: '1.5rem',
                fontWeight: 500,
                color: 'var(--pwa-accent)',
                letterSpacing: '0.03em',
                marginBottom: '24px',
              }}>
                {formatPrice(Number(computedPrice), currency)}
                {selectedVariant && parseFloat(selectedVariant.priceModifier) > 0 && (
                  <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.8rem', fontWeight: 400, fontStyle: 'normal', color: 'var(--pwa-text-secondary)', marginLeft: '10px' }}>
                    base + variante
                  </span>
                )}
              </p>
            )}

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--pwa-border)', marginBottom: '24px' }} />

            {/* Variant selector — elegant pill selectors */}
            {product.variantType && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.5, marginBottom: '12px' }}>
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
                        padding: '8px 20px',
                        borderRadius: '30px',
                        border: `1px solid ${selectedVariant?.id === v.id ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                        backgroundColor: selectedVariant?.id === v.id ? 'var(--pwa-accent)' : 'transparent',
                        color: selectedVariant?.id === v.id ? 'var(--pwa-bg)' : 'var(--pwa-text)',
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

            {/* Quantity — minimal +/– with wide spacing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
              <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.5 }}>
                Cantidad
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--pwa-border)', paddingBottom: '4px' }}>
                <button
                  type="button"
                  onClick={() => onQuantityChange(quantity - 1)}
                  style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '18px', color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, lineHeight: 1, padding: '0 4px' }}
                >
                  −
                </button>
                <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '14px', color: 'var(--pwa-text)', minWidth: '24px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(quantity + 1)}
                  style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '18px', color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, lineHeight: 1, padding: '0 4px' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA — "Cotizar", full width, large radius, accent background */}
            <button
              type="button"
              disabled={!canAddToCart}
              onClick={onAddToCart}
              style={{
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--pwa-bg)',
                backgroundColor: 'var(--pwa-accent)',
                border: 'none',
                borderRadius: 'var(--pwa-radius-button)',
                padding: '16px 24px',
                width: '100%',
                cursor: canAddToCart ? 'pointer' : 'not-allowed',
                opacity: canAddToCart ? 1 : 0.3,
                transition: 'opacity 0.2s',
                marginBottom: '32px',
              }}
            >
              {addedFeedback ? '¡Añadido!' : canAddToCart ? 'Agregar' : 'Selecciona una opción'}
            </button>

            {/* Description — serif body, generous line height */}
            {product.description && (
              <div style={{ borderTop: '1px solid var(--pwa-border)', paddingTop: '24px', marginBottom: '24px' }}>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.45, marginBottom: '12px' }}>
                  Descripción
                </p>
                <p style={{
                  fontFamily: 'var(--pwa-font-heading)',
                  fontStyle: 'italic',
                  fontSize: '1.05rem',
                  color: 'var(--pwa-text)',
                  opacity: 0.8,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Technical specs */}
            {product.technicalSpecs && (
              <div style={{ borderTop: '1px solid var(--pwa-border)', paddingTop: '24px' }}>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.45, marginBottom: '12px' }}>
                  Especificaciones técnicas
                </p>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.9rem', color: 'var(--pwa-text)', opacity: 0.7, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {product.technicalSpecs}
                </p>
              </div>
            )}
          </div>
        </div>

        <CatalogFooter className="mt-4 px-4" />
      </div>

      <BottomNav />
    </div>
  );
};

export default LuxuryMinimalismProductSkin;
