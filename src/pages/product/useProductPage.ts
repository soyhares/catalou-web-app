import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { fetchProduct, type ProductPublic, type VariantValuePublic } from '@entities/product/api';
import { fetchCatalog } from '@entities/catalog/api';
import { useCart } from '@shared/lib/use-cart';

export interface ProductPageProps {
  product: ProductPublic | null;
  isLoading: boolean;
  error: string | null;
  selectedVariant: VariantValuePublic | null; // the selected VariantValuePublic object
  activeImage: string | null;
  quantity: number;
  computedPrice: string | null;
  canAddToCart: boolean;
  addedFeedback: boolean;
  onVariantSelect: (variant: VariantValuePublic) => void;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBack: () => void;
  onGoHome: () => void;
  onImageSelect: (url: string) => void;
  showPrices: boolean;
  currency: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  companyName: string;
  ordersEnabled: boolean;
}

export function useProductPage(): ProductPageProps {
  const { id } = useParams<{ id: string }>();
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const { add: addToCart } = useCart(slug);

  const [product, setProduct] = useState<ProductPublic | null>(null);
  const [showPrices, setShowPrices] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantValuePublic | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!id || !slug) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, catalog] = await Promise.all([fetchProduct(slug, id), fetchCatalog(slug)]);
        setProduct(p);
        setShowPrices(catalog.showPrices);
        setActiveImage(p.mainImageUrl);
      } catch {
        setError('Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, slug]);

  const computePrice = useCallback((): string | null => {
    if (!product) return null;
    const base = parseFloat(product.basePrice);
    const modifier = selectedVariant ? parseFloat(selectedVariant.priceModifier) : 0;
    return (base + modifier).toFixed(2);
  }, [product, selectedVariant]);

  function onVariantSelect(variant: VariantValuePublic) {
    setSelectedVariant(variant);
    setActiveImage(variant.imageUrl ?? product?.mainImageUrl ?? null);
  }

  function onQuantityChange(qty: number) {
    setQuantity(Math.max(1, qty));
  }

  function onBack() {
    navigate(-1);
  }

  function onGoHome() {
    navigate('/catalog');
  }

  function onImageSelect(url: string) {
    setActiveImage(url);
  }

  const hasVariants = !!product?.variantType;
  const canAddToCart = !hasVariants || selectedVariant !== null;

  function onAddToCart() {
    const price = computePrice();
    if (!canAddToCart || !product || !price) return;
    void addToCart({
      companySlug: slug,
      productId: product.id,
      productName: product.name,
      variantTypeId: product.variantType?.id ?? null,
      variantTypeName: product.variantType?.name ?? null,
      variantValueId: selectedVariant?.id ?? null,
      variantValueName: selectedVariant?.value ?? null,
      quantity,
      unitPrice: parseFloat(price),
    }).then(() => {
      window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { name: product.name } }));
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    }).catch((err: unknown) => {
      console.error('[useProductPage] addToCart failed:', err);
    });
  }

  return {
    product,
    isLoading: loading,
    error,
    selectedVariant,
    activeImage,
    quantity,
    computedPrice: computePrice(),
    canAddToCart,
    addedFeedback,
    onVariantSelect,
    onQuantityChange,
    onAddToCart,
    onBack,
    onGoHome,
    onImageSelect,
    showPrices,
    currency: branding.currency ?? 'CRC',
    businessModel: branding.businessModel,
    companyName: branding.companyName,
    ordersEnabled: branding.featuresEnabled?.orders === true,
  };
}
