import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBranding } from '@app/BrandingContext';
import { fetchProduct } from '@entities/product/api';
import { fetchCatalog } from '@entities/catalog/api';
import { useCart } from '@shared/lib/use-cart';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { BottomNav } from '@shared/ui/BottomNav';
import { formatPrice } from '@shared/lib/formatPrice';
import type { ProductPublic, VariantValuePublic } from '@entities/product/api';

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M7 7V6C7 3.79 8.79 2 11 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M7 7V6C7 3.79 8.343 2 10 2C11.657 2 13 3.79 13 6V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const { add: addToCart } = useCart(slug);

  const [product, setProduct] = useState<ProductPublic | null>(null);
  const [showPrices, setShowPrices] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<VariantValuePublic | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!id || !slug) return;
    queueMicrotask(() => {
      setLoading(true);
      setError('');
      Promise.all([fetchProduct(slug, id), fetchCatalog(slug)])
        .then(([p, catalog]) => {
          setProduct(p);
          setShowPrices(catalog.showPrices);
          setActiveImage(p.mainImageUrl);
        })
        .catch(() => setError('Producto no encontrado'))
        .finally(() => setLoading(false));
    });
  }, [id, slug]);

  function handleVariantSelect(variant: VariantValuePublic) {
    setSelectedVariant(variant);
    setActiveImage(variant.imageUrl ?? product?.mainImageUrl ?? null);
  }

  function computedPrice(): string | null {
    if (!product) return null;
    const base = parseFloat(product.basePrice);
    const modifier = selectedVariant ? parseFloat(selectedVariant.priceModifier) : 0;
    return (base + modifier).toFixed(2);
  }

  const hasVariants = !!product?.variantType;
  const canAddToCart = !hasVariants || selectedVariant !== null;
  const galleryImages = product ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--pwa-bg)' }}>

      {/* Minimal header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b"
        style={{
          backgroundColor: 'var(--pwa-bg)',
          borderColor: 'var(--pwa-border)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--pwa-text)' }}
          aria-label="Volver"
        >
          <IconChevronLeft />
        </button>

        {/* Company name center */}
        <span
          style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: 'var(--pwa-text)',
          }}
        >
          {branding.companyName}
        </span>

        {/* Cart */}
        <button
          type="button"
          onClick={() => navigate('/cart')}
          style={{ color: 'var(--pwa-text)', opacity: 0.6 }}
          className="hover:opacity-100 transition-opacity"
          aria-label="Ver carrito"
        >
          <IconBag />
        </button>
      </header>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-16 h-16 border-t"
            style={{ borderColor: 'var(--pwa-accent)', animation: 'spin 1s linear infinite', borderRadius: '50%' }}
          />
        </div>
      )}

      {/* Error state */}
      {!loading && (error || !product) && (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <p
            style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontStyle: 'italic',
              fontSize: '1.4rem',
              color: 'var(--pwa-text)',
              opacity: 0.35,
              marginBottom: '16px',
            }}
          >
            {error || 'Producto no encontrado'}
          </p>
          <Link
            to="/"
            className="uppercase tracking-[0.14em]"
            style={{ fontSize: '10px', color: 'var(--pwa-accent)', fontWeight: 600 }}
          >
            Volver al catálogo
          </Link>
        </div>
      )}

      {/* Product content */}
      {!loading && product && (
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          {/* Breadcrumb */}
          <nav className="px-4 py-3 flex items-center gap-2">
            <Link
              to="/"
              className="uppercase tracking-[0.1em] hover:opacity-100 transition-opacity"
              style={{ fontSize: '9px', color: 'var(--pwa-accent)', fontWeight: 600, opacity: 0.7 }}
            >
              Catálogo
            </Link>
            <span style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.3 }}>›</span>
            <span
              className="uppercase tracking-[0.1em] truncate"
              style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5, fontWeight: 600 }}
            >
              {product.name}
            </span>
          </nav>

          <div className="grid md:grid-cols-2 gap-0 md:gap-10 px-0 md:px-6 pb-8">

            {/* ── Image panel ── */}
            <div>
              {/* Main image */}
              <div
                className="overflow-hidden"
                style={{ aspectRatio: '3/4', backgroundColor: 'var(--pwa-surface-secondary)' }}
              >
                {activeImage ? (
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--pwa-surface-secondary)' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.2 }}>
                      <rect x="2" y="2" width="28" height="28" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M2 24L11 15L16 20L21 13L30 24" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Gallery thumbnails */}
              {(product.mainImageUrl || galleryImages.length > 0) && (
                <div className="flex gap-2 px-4 md:px-0 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {product.mainImageUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveImage(product.mainImageUrl)}
                      className="shrink-0 overflow-hidden transition-opacity"
                      style={{
                        width: '56px',
                        height: '74px',
                        border: `1.5px solid ${activeImage === product.mainImageUrl ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                        opacity: activeImage === product.mainImageUrl ? 1 : 0.55,
                      }}
                    >
                      <img src={product.mainImageUrl} alt="" className="h-full w-full object-cover" loading="lazy"/>
                    </button>
                  )}
                  {galleryImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(img.url)}
                      className="shrink-0 overflow-hidden transition-opacity"
                      style={{
                        width: '56px',
                        height: '74px',
                        border: `1.5px solid ${activeImage === img.url ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                        opacity: activeImage === img.url ? 1 : 0.55,
                      }}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy"/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info panel ── */}
            <div className="flex flex-col px-4 md:px-0 pt-4 md:pt-8">

              {/* Product name — large Cormorant Garamond */}
              <h1
                className="mb-3 leading-tight"
                style={{
                  fontFamily: 'var(--pwa-font-heading)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                  fontWeight: 400,
                  color: 'var(--pwa-text)',
                  letterSpacing: '0.01em',
                }}
              >
                {product.name}
              </h1>

              {/* Price */}
              {showPrices && (
                <p
                  className="mb-5"
                  style={{
                    fontFamily: 'var(--pwa-font-heading)',
                    fontStyle: 'italic',
                    fontSize: '1.4rem',
                    color: 'var(--pwa-accent)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {formatPrice(Number(computedPrice()), branding.currency ?? 'CRC')}
                  {selectedVariant && parseFloat(selectedVariant.priceModifier) > 0 && (
                    <span
                      className="text-sm font-normal ml-2 not-italic"
                      style={{ color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)' }}
                    >
                      base + variante
                    </span>
                  )}
                </p>
              )}

              {/* Divider */}
              <div className="h-px mb-5" style={{ backgroundColor: 'var(--pwa-border)' }} />

              {/* Variant selector */}
              {hasVariants && product.variantType && (
                <div className="mb-5">
                  <p
                    className="uppercase tracking-[0.14em] mb-3"
                    style={{ fontSize: '9px', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.5 }}
                  >
                    {product.variantType.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variantType.values.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v)}
                        className="px-4 py-2 text-sm transition-all"
                        style={{
                          backgroundColor: selectedVariant?.id === v.id ? 'var(--pwa-accent)' : 'transparent',
                          color: selectedVariant?.id === v.id ? '#fff' : 'var(--pwa-text)',
                          border: `1px solid ${selectedVariant?.id === v.id ? 'var(--pwa-accent)' : 'var(--pwa-border)'}`,
                          borderRadius: 'var(--pwa-radius-sm, 4px)',
                        }}
                      >
                        {v.value}
                        {showPrices && parseFloat(v.priceModifier) > 0 && (
                          <span className="ml-1 opacity-70" style={{ fontSize: '11px' }}>+{formatPrice(parseFloat(v.priceModifier), branding.currency ?? 'CRC')}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {!selectedVariant && (
                    <p
                      className="mt-2 uppercase tracking-[0.1em]"
                      style={{ fontSize: '9px', color: 'var(--pwa-accent)', fontWeight: 600 }}
                    >
                      Selecciona una opción para continuar
                    </p>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-5">
                <span
                  className="uppercase tracking-[0.14em]"
                  style={{ fontSize: '9px', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.5 }}
                >
                  Cantidad
                </span>
                <div className="flex items-center gap-4" style={{ borderBottom: '1px solid var(--pwa-border)', paddingBottom: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
                    style={{ color: 'var(--pwa-text)' }}
                  >
                    −
                  </button>
                  <span
                    className="tabular-nums"
                    style={{ fontSize: '14px', color: 'var(--pwa-text)', minWidth: '20px', textAlign: 'center' }}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
                    style={{ color: 'var(--pwa-text)' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart CTA */}
              <motion.button
                type="button"
                disabled={!canAddToCart}
                onClick={() => {
                  if (!canAddToCart || !product) return;
                  void addToCart({
                    companySlug: slug,
                    productId: product.id,
                    productName: product.name,
                    variantTypeId: product.variantType?.id ?? null,
                    variantTypeName: product.variantType?.name ?? null,
                    variantValueId: selectedVariant?.id ?? null,
                    variantValueName: selectedVariant?.value ?? null,
                    quantity,
                    unitPrice: parseFloat(computedPrice() ?? '0'),
                  }).then(() => {
                    // 'cart-updated' is dispatched automatically by useCart.add()
                    window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { name: product.name } }));
                    setAddedFeedback(true);
                    setTimeout(() => setAddedFeedback(false), 2000);
                  });
                }}
                className="w-full py-4 uppercase tracking-[0.2em] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--pwa-accent)',
                  borderRadius: 'var(--pwa-radius-button)',
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'var(--pwa-font-body)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {addedFeedback ? '¡Añadido al carrito!' : canAddToCart ? 'Añadir al carrito' : 'Selecciona una opción'}
              </motion.button>

              {/* Description */}
              {product.description && (
                <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--pwa-border)' }}>
                  <p
                    className="uppercase tracking-[0.14em] mb-3"
                    style={{ fontSize: '9px', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.45 }}
                  >
                    Descripción
                  </p>
                  <p
                    className="whitespace-pre-wrap leading-relaxed"
                    style={{
                      fontFamily: 'var(--pwa-font-heading)',
                      fontStyle: 'italic',
                      fontSize: '1.05rem',
                      color: 'var(--pwa-text)',
                      opacity: 0.8,
                      lineHeight: 1.7,
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              )}

              {/* Technical specs */}
              {product.technicalSpecs && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--pwa-border)' }}>
                  <p
                    className="uppercase tracking-[0.14em] mb-3"
                    style={{ fontSize: '9px', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.45 }}
                  >
                    Especificaciones técnicas
                  </p>
                  <p
                    className="text-sm whitespace-pre-wrap leading-relaxed"
                    style={{ color: 'var(--pwa-text)', opacity: 0.7, lineHeight: 1.7 }}
                  >
                    {product.technicalSpecs}
                  </p>
                </div>
              )}
            </div>
          </div>

          <CatalogFooter className="mt-4 px-4" />
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}
