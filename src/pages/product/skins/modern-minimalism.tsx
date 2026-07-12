import React, { useState } from 'react';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';
import { WhatsAppProductConsultButton } from '@shared/ui/WhatsAppProductConsultButton';
import { CatalouSpinner } from '@shared/ui/CatalouSpinner';
import type { ProductPageProps } from '../useProductPage';

/* ── Icons ───────────────────────────────────────────────────────────────── */

function IconPlaceholder() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--pwa-text-secondary)', opacity: 0.2 }}>
      <rect x="2" y="2" width="36" height="36" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 30L13 19L20 26L27 17L38 30" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Skin ─────────────────────────────────────────────────────────────────── */

const ModernMinimalismProductSkin: React.FC<ProductPageProps> = (props) => {
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
  const [expanded, setExpanded] = useState(false);

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CatalouSpinner size={40} />
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '1.1rem', color: 'var(--pwa-text)', marginBottom: '16px' }}>
          {error ?? 'Producto no encontrado'}
        </p>
        <button
          type="button"
          onClick={onGoHome}
          style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '13px', color: 'var(--pwa-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', paddingBottom: '80px' }}>

      {/* Lightbox */}
      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          onClick={() => setExpanded(false)}
        >
          <img src={activeImage!} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '16px' }} />
        </div>
      )}

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
          height: '52px',
        }}>
          <button
            type="button"
            onClick={onBack}
            style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '13px', color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            ← Atrás
          </button>
          <span style={{ fontFamily: 'var(--pwa-font-heading)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--pwa-text)' }}>
            {companyName}
          </span>
          <div style={{ width: '52px' }} />
        </header>
      ) : (
        <div style={{ padding: '12px 24px' }}>
          <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)', fontSize: '13px' }}>
            ← Volver
          </button>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 0 32px' }}>

        {/* Breadcrumb */}
        <nav style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--pwa-border)' }}>
          <button
            type="button"
            onClick={onGoHome}
            style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', color: 'var(--pwa-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Catálogo
          </button>
          <span style={{ fontSize: '12px', color: 'var(--pwa-border)' }}>/</span>
          <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', color: 'var(--pwa-text)', fontWeight: 500 }}>
            {product.name}
          </span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', padding: '20px 20px 0' }}>

          {/* ── Image Panel ─────────────────────────────────────────────── */}
          <div>
            {/* Main image — adaptive height, tap to expand */}
            <div
              onClick={() => activeImage && setExpanded(true)}
              style={{
                backgroundColor: 'var(--pwa-surface-secondary)',
                borderRadius: 'var(--pwa-radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--pwa-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                cursor: activeImage ? 'zoom-in' : 'default',
              }}
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
                  loading="lazy"
                />
              ) : (
                <div style={{ padding: '48px' }}>
                  <IconPlaceholder />
                </div>
              )}
            </div>


            {/* Gallery thumbnails */}
            {(product.mainImageUrl || galleryImages.length > 0) && (
              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {product.mainImageUrl && (
                  <button
                    type="button"
                    onClick={() => onImageSelect(product.mainImageUrl!)}
                    style={{
                      flexShrink: 0,
                      width: '60px',
                      height: '60px',
                      border: `2px solid ${activeImage === product.mainImageUrl ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                      borderRadius: 'var(--pwa-radius-sm)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: 0,
                      background: 'var(--pwa-surface-secondary)',
                    }}
                  >
                    <img src={product.mainImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} loading="lazy" />
                  </button>
                )}
                {galleryImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => onImageSelect(img.url)}
                    style={{
                      flexShrink: 0,
                      width: '60px',
                      height: '60px',
                      border: `2px solid ${activeImage === img.url ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                      borderRadius: 'var(--pwa-radius-sm)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: 0,
                      background: 'var(--pwa-surface-secondary)',
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Panel ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Product name — semibold, dark, clean sans-serif */}
            <h1 style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
              fontWeight: 600,
              color: 'var(--pwa-text)',
              lineHeight: 1.3,
              marginBottom: '8px',
            }}>
              {product.name}
            </h1>

            {/* Price — bold, large, dark */}
            {showPrices && computedPrice && (
              <p style={{
                fontFamily: 'var(--pwa-font-heading)',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--pwa-text)',
                marginBottom: '16px',
              }}>
                {formatPrice(Number(computedPrice), currency)}
                {selectedVariant && parseFloat(selectedVariant.priceModifier) > 0 && (
                  <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.8rem', fontWeight: 400, color: 'var(--pwa-text-secondary)', marginLeft: '8px' }}>
                    base + variante
                  </span>
                )}
              </p>
            )}
            {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && computedPrice && (
              <PriceDisclaimer className="mb-6" />
            )}

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--pwa-border)', marginBottom: '16px' }} />

            {/* Variant selectors — squared/rounded pill buttons, active = dark fill, white text */}
            {product.variantType && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--pwa-text)', marginBottom: '8px' }}>
                  {product.variantType.name}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {product.variantType.values.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onVariantSelect(v)}
                      style={{
                        fontFamily: 'var(--pwa-font-body)',
                        fontSize: '13px',
                        fontWeight: 500,
                        padding: '7px 16px',
                        borderRadius: 'var(--pwa-radius-sm)',
                        border: `1.5px solid ${selectedVariant?.id === v.id ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                        backgroundColor: selectedVariant?.id === v.id ? 'var(--pwa-accent)' : 'var(--pwa-bg)',
                        color: selectedVariant?.id === v.id ? 'var(--pwa-bg)' : 'var(--pwa-text)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {v.value}
                      {showPrices && parseFloat(v.priceModifier) > 0 && (
                        <span style={{ fontSize: '11px', marginLeft: '4px', opacity: 0.75 }}>+{formatPrice(parseFloat(v.priceModifier), currency)}</span>
                      )}
                    </button>
                  ))}
                </div>
                {!selectedVariant && (
                  <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', color: 'var(--pwa-text-secondary)', marginTop: '6px' }}>
                    Selecciona una opción para continuar
                  </p>
                )}
              </div>
            )}

            {/* Quantity + CTA — only for products (not services) when orders enabled */}
            {ordersEnabled && product?.type !== 'service' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--pwa-text)' }}>
                    Cantidad:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--pwa-border)', borderRadius: 'var(--pwa-radius-sm)', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(quantity - 1)}
                      style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '16px', color: 'var(--pwa-text)', backgroundColor: 'var(--pwa-surface-secondary)', border: 'none', borderRight: '1px solid var(--pwa-border)', cursor: 'pointer', padding: '6px 12px', lineHeight: 1 }}
                    >
                      −
                    </button>
                    <span style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--pwa-text)', padding: '6px 16px', minWidth: '40px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(quantity + 1)}
                      style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '16px', color: 'var(--pwa-text)', backgroundColor: 'var(--pwa-surface-secondary)', border: 'none', borderLeft: '1px solid var(--pwa-border)', cursor: 'pointer', padding: '6px 12px', lineHeight: 1 }}
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
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--pwa-bg)',
                    backgroundColor: canAddToCart ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--pwa-radius-button)',
                    padding: '13px 24px',
                    width: '100%',
                    cursor: canAddToCart ? 'pointer' : 'not-allowed',
                    opacity: canAddToCart ? 1 : 0.4,
                    transition: 'all 0.15s',
                    marginBottom: '24px',
                  }}
                >
                  {addedFeedback ? '¡Añadido al carrito!' : canAddToCart ? 'Agregar al carrito' : 'Selecciona una opción'}
                </button>
              </>
            )}

            {/* Description — regular weight, readable, compact */}
            {product.description && (
              <div style={{ borderTop: '1px solid var(--pwa-border)', paddingTop: '16px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--pwa-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Descripción
                </p>
                <p style={{
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '0.9rem',
                  color: 'var(--pwa-text)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Technical specs */}
            {product.technicalSpecs && (
              <div style={{ borderTop: '1px solid var(--pwa-border)', paddingTop: '16px' }}>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--pwa-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Especificaciones técnicas
                </p>
                <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '0.85rem', color: 'var(--pwa-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {product.technicalSpecs}
                </p>
              </div>
            )}

            <WhatsAppProductConsultButton productName={product.name} />
          </div>
        </div>

        <CatalogFooter className="mt-4 px-4" />
      </div>
    </div>
  );
};

export default ModernMinimalismProductSkin;
