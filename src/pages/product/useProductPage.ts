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
  selectedVariants: Record<string, string>;   // variantName → selectedValue
  selectedVariant: VariantValuePublic | null; // the selected VariantValuePublic object
  activeImage: string | null;
  quantity: number;
  computedPrice: string | null;
  canAddToCart: boolean;
  addedFeedback: boolean;
  onVariantChange: (variantName: string, value: string) => void;
  onVariantSelect: (variant: VariantValuePublic) => void;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBack: () => void;
  onImageSelect: (url: string) => void;
  showPrices: boolean;
  companyName: string;
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
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
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

  function onVariantChange(_variantName: string, value: string) {
    if (!product?.variantType) return;
    const found = product.variantType.values.find((v) => v.value === value) ?? null;
    setSelectedVariant(found);
    if (found) {
      setActiveImage(found.imageUrl ?? product.mainImageUrl ?? null);
    }
  }

  function onQuantityChange(qty: number) {
    setQuantity(Math.max(1, qty));
  }

  function onBack() {
    navigate(-1);
  }

  function onImageSelect(url: string) {
    setActiveImage(url);
  }

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
    });
  }

  const hasVariants = !!product?.variantType;
  const canAddToCart = !hasVariants || selectedVariant !== null;

  // Build selectedVariants map (variantName → selectedValue)
  const selectedVariants: Record<string, string> = {};
  if (product?.variantType && selectedVariant) {
    selectedVariants[product.variantType.name] = selectedVariant.value;
  }

  return {
    product,
    isLoading: loading,
    error,
    selectedVariants,
    selectedVariant,
    activeImage,
    quantity,
    computedPrice: computePrice(),
    canAddToCart,
    addedFeedback,
    onVariantChange,
    onVariantSelect,
    onQuantityChange,
    onAddToCart,
    onBack,
    onImageSelect,
    showPrices,
    companyName: branding.companyName,
  };
}
