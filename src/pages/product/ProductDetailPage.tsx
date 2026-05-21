import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { fetchProduct } from '@entities/product/api';
import { fetchCatalog } from '@entities/catalog/api';
import { useCart } from '@shared/lib/use-cart';
import { CartIcon } from '@widgets/cart/CartIcon';
import type { ProductPublic, VariantValuePublic } from '@entities/product/api';

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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pwa-bg)', color: 'var(--pwa-text)' }}>
      {/* Header */}
      <header
        className="px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'var(--pwa-accent)' }}
      >
        <Link to="/" className="flex items-center gap-3 flex-1 min-w-0">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="text-white font-semibold text-sm truncate">
              {branding.companyName}
            </span>
          )}
        </Link>
        <CartIcon slug={slug} onClick={() => navigate('/cart')} />
      </header>

      {loading && (
        <div className="p-6" style={{ color: 'var(--pwa-text)' }}>Cargando…</div>
      )}

      {!loading && (error || !product) && (
        <div className="p-6 text-center">
          <p className="mb-4" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
            {error || 'Producto no encontrado'}
          </p>
          <Link to="/" className="underline text-sm" style={{ color: 'var(--pwa-accent)' }}>
            Volver al catálogo
          </Link>
        </div>
      )}

      {!loading && product && (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Breadcrumb */}
          <nav className="text-sm mb-4" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
            <Link to="/" className="hover:underline" style={{ color: 'var(--pwa-accent)' }}>
              Catálogo
            </Link>
            <span className="mx-2">/</span>
            <span>{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image panel */}
            <div>
              <div
                className="aspect-square rounded overflow-hidden mb-3"
                style={{ backgroundColor: 'var(--pwa-surface-secondary)' }}
              >
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-sm"
                    style={{ color: 'var(--pwa-text)', opacity: 0.4 }}
                  >
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Gallery thumbnails */}
              {(product.mainImageUrl || galleryImages.length > 0) && (
                <div className="flex gap-2 flex-wrap">
                  {product.mainImageUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveImage(product.mainImageUrl)}
                      className="h-16 w-16 rounded overflow-hidden border-2"
                      style={{
                        borderColor: activeImage === product.mainImageUrl
                          ? 'var(--pwa-accent)'
                          : 'transparent',
                      }}
                    >
                      <img
                        src={product.mainImageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  )}
                  {galleryImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(img.url)}
                      className="h-16 w-16 rounded overflow-hidden border-2"
                      style={{
                        borderColor: activeImage === img.url
                          ? 'var(--pwa-accent)'
                          : 'transparent',
                      }}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--pwa-text)' }}>
                {product.name}
              </h1>

              {/* Price */}
              {showPrices && (
                <p className="text-xl font-semibold mb-4" style={{ color: 'var(--pwa-accent)' }}>
                  ${computedPrice()}
                  {selectedVariant && parseFloat(selectedVariant.priceModifier) > 0 && (
                    <span
                      className="text-sm font-normal ml-2"
                      style={{ color: 'var(--pwa-text)', opacity: 0.6 }}
                    >
                      (precio base + variante)
                    </span>
                  )}
                </p>
              )}

              {/* Variant selector */}
              {hasVariants && product.variantType && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--pwa-text)' }}>
                    {product.variantType.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variantType.values.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v)}
                        className="px-3 py-1.5 border text-sm transition-opacity"
                        style={{
                          backgroundColor: selectedVariant?.id === v.id
                            ? 'var(--pwa-accent)'
                            : 'var(--pwa-surface)',
                          color: selectedVariant?.id === v.id ? '#fff' : 'var(--pwa-text)',
                          borderColor: selectedVariant?.id === v.id
                            ? 'var(--pwa-accent)'
                            : 'var(--pwa-border)',
                          borderRadius: 'var(--pwa-radius-chip)',
                        }}
                      >
                        {v.value}
                        {showPrices && parseFloat(v.priceModifier) > 0 && (
                          <span className="ml-1 text-xs opacity-75">+${v.priceModifier}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {!selectedVariant && (
                    <p className="text-sm text-amber-600 mt-2">
                      Selecciona una opción para continuar
                    </p>
                  )}
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm font-medium" style={{ color: 'var(--pwa-text)' }}>
                  Cantidad
                </label>
                <div className="flex items-center border rounded" style={{ borderColor: 'var(--pwa-border)' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-lg leading-none"
                    style={{ color: 'var(--pwa-text)' }}
                  >
                    −
                  </button>
                  <span className="px-4 py-1 text-sm" style={{ color: 'var(--pwa-text)' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 text-lg leading-none"
                    style={{ color: 'var(--pwa-text)' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <button
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
                    window.dispatchEvent(new Event('cart-updated'));
                    setAddedFeedback(true);
                    setTimeout(() => setAddedFeedback(false), 2000);
                  });
                }}
                className="w-full py-3 font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--pwa-accent)',
                  borderRadius: 'var(--pwa-radius-button)',
                }}
              >
                {addedFeedback
                  ? '¡Añadido!'
                  : canAddToCart
                    ? 'Añadir al carrito'
                    : 'Selecciona una opción'}
              </button>

              {/* Description */}
              {product.description && (
                <div className="mt-6">
                  <h2 className="font-semibold mb-2" style={{ color: 'var(--pwa-text)' }}>
                    Descripción
                  </h2>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--pwa-text)', opacity: 0.8 }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Technical specs */}
              {product.technicalSpecs && (
                <div className="mt-4">
                  <h2 className="font-semibold mb-2" style={{ color: 'var(--pwa-text)' }}>
                    Especificaciones técnicas
                  </h2>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--pwa-text)', opacity: 0.8 }}>
                    {product.technicalSpecs}
                  </p>
                </div>
              )}
            </div>
          </div>

          <footer className="mt-12 py-6 text-center">
            <p className="text-xs" style={{ color: 'var(--pwa-text)', opacity: 0.3 }}>
              Powered by Catalou
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}
