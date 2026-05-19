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
    <div className="min-h-screen bg-[var(--color-background)]" style={{ color: 'var(--color-text)' }}>
      {/* Header */}
      <header className="bg-[var(--color-primary)] px-4 py-3 flex items-center gap-3">
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
        <div className="p-6 text-[var(--color-text)]">Cargando…</div>
      )}

      {!loading && (error || !product) && (
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">{error || 'Producto no encontrado'}</p>
          <Link to="/" className="underline text-sm text-[var(--color-primary)]">
            Volver al catálogo
          </Link>
        </div>
      )}

      {!loading && product && (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:underline text-[var(--color-primary)]">
              Catálogo
            </Link>
            <span className="mx-2">/</span>
            <span>{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image panel */}
            <div>
              <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-3">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
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
                      className={`h-16 w-16 rounded overflow-hidden border-2 ${
                        activeImage === product.mainImageUrl
                          ? 'border-[var(--color-primary)]'
                          : 'border-transparent'
                      }`}
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
                      className={`h-16 w-16 rounded overflow-hidden border-2 ${
                        activeImage === img.url
                          ? 'border-[var(--color-primary)]'
                          : 'border-transparent'
                      }`}
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
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

              {/* Price */}
              {showPrices && (
                <p className="text-xl font-semibold text-[var(--color-primary)] mb-4">
                  ${computedPrice()}
                  {selectedVariant && parseFloat(selectedVariant.priceModifier) > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (precio base + variante)
                    </span>
                  )}
                </p>
              )}

              {/* Variant selector */}
              {hasVariants && product.variantType && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">{product.variantType.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variantType.values.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v)}
                        className={`px-3 py-1.5 rounded border text-sm ${
                          selectedVariant?.id === v.id
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
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
                <label className="text-sm font-medium">Cantidad</label>
                <div className="flex items-center border rounded">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="px-4 py-1 text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 text-lg leading-none"
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
                className="w-full py-3 rounded font-medium text-white bg-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
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
                  <h2 className="font-semibold mb-2">Descripción</h2>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Technical specs */}
              {product.technicalSpecs && (
                <div className="mt-4">
                  <h2 className="font-semibold mb-2">Especificaciones técnicas</h2>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {product.technicalSpecs}
                  </p>
                </div>
              )}
            </div>
          </div>

          <footer className="mt-12 py-6 text-center">
            <p className="text-xs opacity-30">Powered by Catalou</p>
          </footer>
        </div>
      )}
    </div>
  );
}
