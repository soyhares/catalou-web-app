import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { fetchCatalog, type CatalogData, type PublicProduct, type PublicCategory } from '@entities/catalog/api';
import { useCart } from '@shared/lib/use-cart';

export interface CatalogPageProps {
  // Data
  products: PublicProduct[];
  categories: PublicCategory[];
  showPrices: boolean;
  currency: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  selectedCategory: PublicCategory | null;
  selectedSubcategoryId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: boolean;
  cartCount: number;
  companyName: string;
  logoUrl: string | null;

  // Actions
  ordersEnabled: boolean;
  onCategorySelect: (id: string | null) => void;
  onSubcategorySelect: (id: string | null) => void;
  onSearchChange: (q: string) => void;
  onCartClick: () => void;
  onQuote: (productId: string) => void;
  onRetry: () => void;
}

export function useCatalogPage(): CatalogPageProps {
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const { add, items: cartItems } = useCart(slug);

  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchCatalog(slug, {
        q: searchQuery || undefined,
        categoryId: selectedCategoryId ?? undefined,
        subcategoryId: selectedSubcategoryId ?? undefined,
      });
      setCatalog(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, searchQuery, selectedCategoryId, selectedSubcategoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  function onCategorySelect(id: string | null) {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
  }

  function onSubcategorySelect(id: string | null) {
    setSelectedSubcategoryId(id);
  }

  function onSearchChange(q: string) {
    setSearchQuery(q);
  }

  function onCartClick() {
    void navigate('/cart');
  }

  function onQuote(productId: string) {
    const product = catalog?.products.find((p) => p.id === productId);
    if (!product) return;
    void add({
      companySlug: slug,
      productId: product.id,
      productName: product.name,
      variantTypeId: null,
      variantTypeName: null,
      variantValueId: null,
      variantValueName: null,
      quantity: 1,
      unitPrice: parseFloat(product.basePrice) || 0,
    }).then(() => {
      window.dispatchEvent(
        new CustomEvent('cart-item-added', { detail: { name: product.name } }),
      );
    });
  }

  const activeCategory = catalog?.categories.find((c) => c.id === selectedCategoryId) ?? null;

  return {
    products: catalog?.products ?? [],
    categories: catalog?.categories ?? [],
    showPrices: catalog?.showPrices ?? false,
    currency: branding.currency ?? 'CRC',
    businessModel: branding.businessModel,
    ordersEnabled: branding.featuresEnabled?.orders === true,
    selectedCategory: activeCategory,
    selectedSubcategoryId,
    searchQuery,
    isLoading: loading,
    error,
    cartCount,
    companyName: branding.companyName,
    logoUrl: branding.logoUrl,
    onCategorySelect,
    onSubcategorySelect,
    onSearchChange,
    onCartClick,
    onQuote,
    onRetry: () => void load(),
  };
}
