import React, { useState } from 'react';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useTheme } from '@shared/ui/ThemeProvider';
import { useBranding } from '@app/BrandingContext';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';
import { WhatsAppProductConsultButton } from '@shared/ui/WhatsAppProductConsultButton';
import { PushPermissionModal } from '@features/push-notifications/PushPermissionModal';
import { businessCategoryLabel } from '@entities/company/businessCategoryLabels';
import type { ProductPageProps } from '../useProductPage';

function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        <div style={{ aspectRatio: '1/1', borderRadius: 'var(--pwa-radius-lg)', backgroundColor: 'var(--pwa-surface-secondary)' }} />
        <div style={{ paddingTop: '16px' }}>
          <div style={{ height: '32px', width: '70%', borderRadius: 'var(--pwa-radius-sm)', backgroundColor: 'var(--pwa-surface-secondary)', marginBottom: '16px' }} />
          <div style={{ height: '24px', width: '40%', borderRadius: 'var(--pwa-radius-sm)', backgroundColor: 'var(--pwa-surface-secondary)', marginBottom: '24px' }} />
          <div style={{ height: '52px', width: '100%', borderRadius: 'var(--pwa-radius-button)', backgroundColor: 'var(--pwa-surface-secondary)' }} />
        </div>
      </div>
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────── */

function IconPlaceholder() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.2 }}>
      <rect x="2" y="2" width="36" height="36" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 30L13 19L20 26L27 17L38 30" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 4L6.5 10L12.5 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="7.5" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M7.5 7.5V6C7.5 3.515 9.015 2 11 2C12.985 2 14.5 3.515 14.5 6V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M6 8.5C6 5.462 8.239 3 11 3C13.761 3 16 5.462 16 8.5V12.5L17.5 15H4.5L6 12.5V8.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
      <path d="M9 17.5C9 18.605 9.895 19.5 11 19.5C12.105 19.5 13 18.605 13 17.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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
    businessModel,
    companyName,
    logoUrl,
    businessCategory,
    ordersEnabled,
    bookingsEnabled,
    cartCount,
    showPushModal,
    onCartClick,
    onBellClick,
    onClosePushModal,
  } = props;

  const { isMobile } = useTheme();
  const { slug } = useBranding();
  const galleryImages = product ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder) : [];
  const [expanded, setExpanded] = useState(false);

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)' }}>
        <ProductDetailSkeleton />
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
          padding: '14px 18px 10px',
          gap: '10px',
        }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver al catálogo"
            style={{ color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px', flexShrink: 0 }}
          >
            <IconBack />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexShrink: 1 }}>
            {logoUrl && (
              <img src={logoUrl} alt="" aria-hidden="true" style={{ height: '40px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: 'var(--pwa-font-body)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--pwa-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {companyName}
              </span>
              {businessCategoryLabel(businessCategory) && (
                <span style={{ display: 'block', fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pwa-text-secondary)', marginTop: '2px' }}>
                  {businessCategoryLabel(businessCategory)}
                </span>
              )}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {ordersEnabled || bookingsEnabled ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {ordersEnabled && (
                <button type="button" onClick={onCartClick} aria-label={`Carrito (${cartCount} artículos)`} style={{ position: 'relative', color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
                  <IconBag />
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: 'var(--pwa-accent)', color: 'var(--pwa-bg)', fontSize: '9px', fontWeight: 600, minWidth: '14px', height: '14px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              {bookingsEnabled && (
                <button type="button" onClick={onBellClick} aria-label="Notificaciones de citas" style={{ color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
                  <IconBell />
                </button>
              )}
            </div>
          ) : (
            <span style={{ width: '28px' }} />
          )}
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
            {/* Main image — adaptive height, tap to expand */}
            <div
              onClick={() => activeImage && setExpanded(true)}
              style={{
                backgroundColor: 'var(--pwa-surface-secondary)',
                borderRadius: 'var(--pwa-radius-lg)',
                overflow: 'hidden',
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
                <div style={{ padding: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && computedPrice && (
              <PriceDisclaimer className="mb-6" />
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

            {/* Quantity + CTA — only for products (not services) when orders enabled */}
            {ordersEnabled && product?.type !== 'service' && (
              <>
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
              </>
            )}

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

            <WhatsAppProductConsultButton productName={product.name} />
          </div>
        </div>

        <CatalogFooter className="mt-4 px-4" />
      </div>

      {bookingsEnabled && (
        <PushPermissionModal isOpen={showPushModal} onClose={onClosePushModal} slug={slug} />
      )}
    </div>
  );
};

export default LuxuryMinimalismProductSkin;
