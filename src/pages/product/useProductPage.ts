import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { fetchProduct, type ProductPublic, type VariantValuePublic, type VariantTypePublic } from '@entities/product/api';
import { fetchCatalog } from '@entities/catalog/api';
import { resolveCardActionKind, type CardActionKind } from '../catalog/purpose';
import { useCart } from '@shared/lib/use-cart';
import { usePushSubscription } from '@features/push-notifications/usePushSubscription';

export interface ProductPageProps {
  product: ProductPublic | null;
  isLoading: boolean;
  error: string | null;
  variantTypes: VariantTypePublic[];
  // typeId -> chosen value, one entry per selected variant type
  selectedValueByType: Record<string, VariantValuePublic>;
  // name of the first variant type still missing a selection, for the CTA hint
  missingVariantTypeName: string | null;
  activeImage: string | null;
  quantity: number;
  computedPrice: string | null;
  canProceed: boolean;
  addedFeedback: boolean;
  ctaKind: CardActionKind;
  // SPEC-021: discreet, opt-in per-product note captured at add-to-cart
  noteOpen: boolean;
  note: string;
  onNoteToggle: (open: boolean) => void;
  onNoteChange: (value: string) => void;
  onVariantSelect: (typeId: string, value: VariantValuePublic) => void;
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
  onCartClick: () => void;
  onAppointmentsClick: () => void;
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
  const [selectedValueByType, setSelectedValueByType] = useState<Record<string, VariantValuePublic>>({});
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');

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
    const modifier = Object.values(selectedValueByType).reduce(
      (sum, v) => sum + parseFloat(v.priceModifier),
      0,
    );
    return (base + modifier).toFixed(2);
  }, [product, selectedValueByType]);

  function onVariantSelect(typeId: string, value: VariantValuePublic) {
    setSelectedValueByType((prev) => ({ ...prev, [typeId]: value }));
    if (value.imageUrl) setActiveImage(value.imageUrl);
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

  function onNoteToggle(open: boolean) {
    setNoteOpen(open);
    if (!open) setNote('');
  }

  function onNoteChange(value: string) {
    setNote(value);
  }

  function onCartClick() {
    navigate('/cart');
  }

  const bookingsEnabled = branding.featuresEnabled?.bookings === true;

  // Va derecho a citas. Antes este botón era una campana que, sin suscripción push, abría un
  // modal en vez de llevar a ningún lado: el acceso a reservas quedaba detrás de un permiso
  // que la persona no había pedido. El ofrecimiento de push tiene su lugar tras reservar.
  function onAppointmentsClick() {
    void navigate('/appointments');
  }

  const variantTypes = product?.variantTypes ?? [];
  const firstMissingType = variantTypes.find((t) => !selectedValueByType[t.id]) ?? null;
  const canProceed = firstMissingType === null;
  const missingVariantTypeName = firstMissingType?.name ?? null;

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
    // one value per type, in the product's type order
    const chosen = variantTypes.map((t) => selectedValueByType[t.id]);
    const variantLabel = chosen.length
      ? variantTypes.map((t) => `${t.name}: ${selectedValueByType[t.id].value}`).join(', ')
      : null;
    void addToCart({
      companySlug: slug,
      productId: product.id,
      productName: product.name,
      variantValueIds: chosen.map((v) => v.id),
      variantLabel,
      quantity,
      unitPrice: parseFloat(price),
      note: note.trim() || undefined,
    }).then(() => {
      window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { name: product.name } }));
      setNote('');
      setNoteOpen(false);
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
    variantTypes,
    selectedValueByType,
    missingVariantTypeName,
    activeImage,
    quantity,
    computedPrice: computePrice(),
    canProceed,
    addedFeedback,
    ctaKind,
    noteOpen,
    note,
    onNoteToggle,
    onNoteChange,
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
    onCartClick,
    onAppointmentsClick,
  };
}
