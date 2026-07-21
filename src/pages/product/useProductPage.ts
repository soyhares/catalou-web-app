import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { fetchProduct, type ProductPublic, type VariantValuePublic } from '@entities/product/api';
import { fetchCatalog } from '@entities/catalog/api';
import { resolveCardActionKind, type CardActionKind } from '../catalog/purpose';
import { useCart } from '@shared/lib/use-cart';
import { usePushSubscription } from '@features/push-notifications/usePushSubscription';

export interface ProductPageProps {
  product: ProductPublic | null;
  isLoading: boolean;
  error: string | null;
  selectedVariant: VariantValuePublic | null; // the selected VariantValuePublic object
  activeImage: string | null;
  quantity: number;
  computedPrice: string | null;
  canProceed: boolean;
  addedFeedback: boolean;
  ctaKind: CardActionKind;
  onVariantSelect: (variant: VariantValuePublic) => void;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBook: () => void;
  onBack: () => void;
  onGoHome: () => void;
  onImageSelect: (url: string) => void;
  showPrices: boolean;
  currency: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  companyName: string;
  categoryName: string | null;
  logoUrl: string | null;
  businessCategory: string | null;
  ordersEnabled: boolean;
  bookingsEnabled: boolean;
  cartCount: number;
  isPushSubscribed: boolean;
  showPushModal: boolean;
  onCartClick: () => void;
  onBellClick: () => void;
  onClosePushModal: () => void;
}

export function useProductPage(): ProductPageProps {
  const { id } = useParams<{ id: string }>();
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const { add: addToCart, items: cartItems } = useCart(slug);
  const { isSubscribed: isPushSubscribed } = usePushSubscription();

  const [product, setProduct] = useState<ProductPublic | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantValuePublic | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);

  useEffect(() => {
    if (!id || !slug) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, catalog] = await Promise.all([fetchProduct(slug, id), fetchCatalog(slug)]);
        setProduct(p);
        setActiveImage(p.mainImageUrl);
        const matchedProduct = catalog.products.find((cp) => cp.id === id);
        const category = matchedProduct ? catalog.categories.find((c) => c.id === matchedProduct.categoryId) : undefined;
        setCategoryName(category?.name ?? null);
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

  function onCartClick() {
    navigate('/cart');
  }

  const bookingsEnabled = branding.featuresEnabled?.bookings === true;

  function onBellClick() {
    if (isPushSubscribed) {
      navigate('/appointments');
    } else {
      setShowPushModal(true);
    }
  }

  function onClosePushModal() {
    setShowPushModal(false);
  }

  const hasVariants = !!product?.variantType;
  const canProceed = !hasVariants || selectedVariant !== null;

  const ordersEnabled = branding.featuresEnabled?.orders === true;

  const ctaKind: CardActionKind = product
    ? resolveCardActionKind({
        purpose: product.purpose,
        productType: product.type,
        ordersEnabled,
        bookingsEnabled,
      })
    : 'none';

  function onAddToCart() {
    const price = computePrice();
    if (!canProceed || !product || !price) return;
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

  function onBook() {
    if (!canProceed || !product) return;
    void navigate(`/book?itemId=${product.id}`);
  }

  return {
    product,
    isLoading: loading,
    error,
    selectedVariant,
    activeImage,
    quantity,
    computedPrice: computePrice(),
    canProceed,
    addedFeedback,
    ctaKind,
    onVariantSelect,
    onQuantityChange,
    onAddToCart,
    onBook,
    onBack,
    onGoHome,
    onImageSelect,
    showPrices: branding.showPrices,
    currency: branding.currency ?? 'CRC',
    businessModel: branding.businessModel,
    companyName: branding.companyName,
    categoryName,
    logoUrl: branding.logoUrl,
    businessCategory: branding.businessCategory,
    ordersEnabled,
    bookingsEnabled,
    cartCount: cartItems.reduce((s, i) => s + i.quantity, 0),
    isPushSubscribed,
    showPushModal,
    onCartClick,
    onBellClick,
    onClosePushModal,
  };
}
