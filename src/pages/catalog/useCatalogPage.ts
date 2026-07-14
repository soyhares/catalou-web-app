import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import {
  fetchCatalog,
  type CatalogData,
  type PublicProduct,
  type PublicCategory,
  type PublicSubcategory,
} from '@entities/catalog/api';
import { useCart } from '@shared/lib/use-cart';
import { resolveCardActionKind, CARD_ACTION_LABEL } from './purpose';

export interface CardAction {
  label: string | null;
  run: () => void;
}

export interface CatalogPageProps {
  mode: 'picker' | 'catalog';
  // Picker
  catalogs: PublicCategory[];
  onCatalogSelect: (id: string) => void;
  // Catalog
  activeCatalog: PublicCategory | null;
  products: PublicProduct[];
  subcategories: PublicSubcategory[];
  selectedSubcategoryId: string | null;
  showBack: boolean;
  onBackToPicker: () => void;
  onSubcategorySelect: (id: string | null) => void;
  getCardAction: (product: PublicProduct) => CardAction;
  // Common
  showPrices: boolean;
  currency: 'USD' | 'CRC';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  searchQuery: string;
  isLoading: boolean;
  error: boolean;
  cartCount: number;
  companyName: string;
  logoUrl: string | null;
  businessCategory: string | null;
  ordersEnabled: boolean;
  onSearchChange: (q: string) => void;
  onCartClick: () => void;
  onRetry: () => void;
}

export function useCatalogPage(): CatalogPageProps {
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const { add, items: cartItems } = useCart(slug);
  const [searchParams, setSearchParams] = useSearchParams();

  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const selectedCatalogId = searchParams.get('catalogo');
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const ordersEnabled = branding.featuresEnabled?.orders === true;
  const bookingsEnabled = branding.featuresEnabled?.bookings === true;

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    setSelectedSubcategoryId(null);
    setSearchQuery('');
    setDebouncedQuery('');
  }, [selectedCatalogId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchCatalog(slug, {
        q: debouncedQuery || undefined,
        categoryId: selectedCatalogId ?? undefined,
        subcategoryId: selectedSubcategoryId ?? undefined,
      });
      setCatalog(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, debouncedQuery, selectedCatalogId, selectedSubcategoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  // The API always returns the full category list (the categoryId param only
  // scopes products), so `catalog.categories` is reliable for the picker.
  const allCatalogs = catalog?.categories ?? [];
  const singleCatalog = allCatalogs.length === 1 ? allCatalogs[0] : null;
  const activeCatalog =
    allCatalogs.find((c) => c.id === selectedCatalogId) ?? singleCatalog;

  // Picker only when there are 2+ catalogs and none is entered yet.
  const mode: 'picker' | 'catalog' =
    allCatalogs.length >= 2 && !selectedCatalogId ? 'picker' : 'catalog';
  const showBack = allCatalogs.length >= 2 && Boolean(selectedCatalogId);

  function onCatalogSelect(id: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('catalogo', id);
      return next;
    });
  }

  function onBackToPicker() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('catalogo');
      return next;
    });
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

  function addToCart(product: PublicProduct) {
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
      window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { name: product.name } }));
    });
  }

  function getCardAction(product: PublicProduct): CardAction {
    const kind = resolveCardActionKind({
      purpose: activeCatalog?.purpose ?? null,
      productType: product.type,
      ordersEnabled,
      bookingsEnabled,
    });
    if (kind === 'add') return { label: CARD_ACTION_LABEL.add, run: () => addToCart(product) };
    if (kind === 'book') {
      return { label: CARD_ACTION_LABEL.book, run: () => void navigate(`/book?itemId=${product.id}`) };
    }
    return { label: null, run: () => void navigate(`/products/${product.id}`) };
  }

  return {
    mode,
    catalogs: allCatalogs,
    onCatalogSelect,
    activeCatalog,
    products: catalog?.products ?? [],
    subcategories: activeCatalog?.subcategories ?? [],
    selectedSubcategoryId,
    showBack,
    onBackToPicker,
    onSubcategorySelect,
    getCardAction,
    showPrices: catalog?.showPrices ?? false,
    currency: branding.currency ?? 'CRC',
    businessModel: branding.businessModel,
    searchQuery,
    isLoading: loading,
    error,
    cartCount,
    companyName: branding.companyName,
    logoUrl: branding.logoUrl,
    businessCategory: branding.businessCategory,
    ordersEnabled,
    onSearchChange,
    onCartClick,
    onRetry: () => void load(),
  };
}
