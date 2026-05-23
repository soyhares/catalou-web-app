import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import { fetchCatalog, type CatalogData, type PublicCategory } from '@entities/catalog/api';
import { getCatalogProfile } from '@entities/shopper-profile/api';
import { OfflineBanner } from '@shared/ui/OfflineBanner';
import { ProductCard } from '@shared/ui/ProductCard';
import { CategoryChip } from '@shared/ui/CategoryChip';
import { BottomNav } from '@shared/ui/BottomNav';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { CartIcon } from '@widgets/cart/CartIcon';
import { useCart } from '@shared/lib/use-cart';

export default function CatalogPage() {
  const { slug, branding } = useBranding();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { add } = useCart(slug);

  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [error, setError] = useState(false);
  const [q, setQ] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchCatalog(slug, {
        q: q || undefined,
        categoryId: selectedCategoryId ?? undefined,
        subcategoryId: selectedSubcategoryId ?? undefined,
      });
      setCatalog(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, q, selectedCategoryId, selectedSubcategoryId]);

  useEffect(() => {
    queueMicrotask(() => { void load(); });
  }, [load]);

  useEffect(() => {
    getCatalogProfile(slug)
      .then((p) => setShowAbout(p.hasAboutSection))
      .catch(() => {});
  }, [slug]);

  function selectCategory(id: string) {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
  }

  function clearAllFilters() {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
  }

  function handleQuote(productId: string) {
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
    });
    void navigate('/cart');
  }

  const activeCategory: PublicCategory | undefined = catalog?.categories.find(
    (c) => c.id === selectedCategoryId,
  );

  const activeCategoryName = activeCategory?.name;
  const activeSubcategoryName = activeCategory?.subcategories.find(
    (s) => s.id === selectedSubcategoryId,
  )?.name;

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--pwa-bg)' }}
      >
        <div className="text-center max-w-sm px-4">
          <p className="text-sm mb-4" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
            {t('errors.networkErrorMessage')}
          </p>
          <button
            onClick={() => void load()}
            className="text-sm underline"
            style={{ color: 'var(--pwa-accent)' }}
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  const hasAnyProducts = (catalog?.categories.length ?? 0) > 0;
  const showComingSoon =
    !loading &&
    catalog !== null &&
    !hasAnyProducts &&
    !q &&
    !selectedCategoryId &&
    !selectedSubcategoryId;

  if (showComingSoon) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 pb-16"
        style={{ backgroundColor: 'var(--pwa-bg)' }}
      >
        {branding.logoUrl && (
          <img
            src={branding.logoUrl}
            alt={branding.companyName}
            className="h-16 w-auto mb-6 object-contain"
          />
        )}
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--pwa-text)' }}>
          {branding.companyName}
        </h1>
        <p className="text-lg font-semibold mb-1" style={{ color: 'var(--pwa-accent)' }}>
          {t('catalog.comingSoon')}
        </p>
        <p className="text-sm" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
          {t('catalog.comingSoonMessage')}
        </p>
        <CatalogFooter className="mt-8" />
        <BottomNav showAbout={showAbout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: 'var(--pwa-bg)' }}>
      <OfflineBanner />

      {/* Header / topbar */}
      <header
        className="px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'var(--pwa-accent)' }}
      >
        <div className="flex-1 min-w-0">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="text-white font-semibold text-sm">{branding.companyName}</span>
          )}
        </div>
        <CartIcon slug={slug} onClick={() => navigate('/cart')} />
      </header>

      {/* Search bar — catalog-search class enables Clarity sticky positioning via pwa-base.css */}
      <div
        className="catalog-search px-4 py-3 border-b"
        style={{ backgroundColor: 'var(--pwa-surface)', borderColor: 'var(--pwa-border)' }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('catalog.searchPlaceholder')}
          className="w-full rounded-full px-4 py-2 text-sm focus:outline-none border"
          style={{
            borderColor: 'var(--pwa-border)',
            backgroundColor: 'var(--pwa-bg)',
            color: 'var(--pwa-text)',
          }}
        />
      </div>

      {/* Active filter chips — desktop only (mobile uses the horizontal scroll row below) */}
      {(selectedCategoryId || selectedSubcategoryId) && (
        <div
          className="hidden md:flex flex-wrap gap-2 px-4 py-2 border-b"
          style={{
            backgroundColor: 'var(--pwa-surface-secondary)',
            borderColor: 'var(--pwa-border)',
          }}
        >
          {activeCategoryName && (
            <CategoryChip
              label={activeCategoryName}
              active={!selectedSubcategoryId}
              onClick={!selectedSubcategoryId ? clearAllFilters : () => setSelectedSubcategoryId(null)}
            />
          )}
          {activeSubcategoryName && (
            <CategoryChip
              label={activeSubcategoryName}
              active
              onClick={() => setSelectedSubcategoryId(null)}
            />
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs underline hover:opacity-80"
            style={{ color: 'var(--pwa-text)', opacity: 0.5 }}
          >
            {t('catalog.clearFilter')}
          </button>
        </div>
      )}

      {/* Mobile category row — scrollable chips, hidden on md+ */}
      {!q && catalog && catalog.categories.length > 0 && (
        <div
          className="md:hidden border-b"
          style={{ backgroundColor: 'var(--pwa-surface)', borderColor: 'var(--pwa-border)' }}
        >
          <div className="flex gap-2 overflow-x-auto px-4 py-2" style={{ scrollbarWidth: 'none' }}>
            <CategoryChip
              label={t('catalog.allCategories')}
              active={!selectedCategoryId}
              onClick={clearAllFilters}
            />
            {catalog.categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.name}
                active={selectedCategoryId === cat.id}
                onClick={() => selectCategory(cat.id)}
              />
            ))}
          </div>
          {selectedCategoryId && activeCategory && activeCategory.subcategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
              {activeCategory.subcategories.map((sub) => (
                <CategoryChip
                  key={sub.id}
                  label={sub.name}
                  active={selectedSubcategoryId === sub.id}
                  onClick={() => setSelectedSubcategoryId(sub.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar — hidden on mobile */}
        {!q && catalog && catalog.categories.length > 0 && (
          <nav
            className="hidden md:flex w-40 shrink-0 border-r py-4 flex-col gap-1 px-2"
            style={{
              backgroundColor: 'var(--pwa-surface)',
              borderColor: 'var(--pwa-border)',
            }}
          >
            <CategoryChip
              label={t('catalog.allCategories')}
              active={!selectedCategoryId}
              onClick={clearAllFilters}
            />
            {catalog.categories.map((cat) => (
              <div key={cat.id}>
                <CategoryChip
                  label={cat.name}
                  active={selectedCategoryId === cat.id}
                  onClick={() => selectCategory(cat.id)}
                />
                {selectedCategoryId === cat.id &&
                  cat.subcategories.map((sub) => (
                    <div key={sub.id} className="pl-3 mt-0.5">
                      <CategoryChip
                        label={sub.name}
                        active={selectedSubcategoryId === sub.id}
                        onClick={() => setSelectedSubcategoryId(sub.id)}
                      />
                    </div>
                  ))}
              </div>
            ))}
          </nav>
        )}

        <main className="flex-1 p-4">
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--pwa-text)', opacity: 0.5 }}>
              {t('common.loading')}
            </p>
          ) : !catalog || catalog.products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
                {t('catalog.noResults')}
              </p>
              <p className="text-xs" style={{ color: 'var(--pwa-text)', opacity: 0.5 }}>
                {t('catalog.noResultsMessage')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {catalog.products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  imageUrl={product.mainImageUrl}
                  price={product.basePrice !== null ? parseFloat(product.basePrice) : null}
                  showPrices={catalog.showPrices}
                  onQuote={handleQuote}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <CatalogFooter />

      <BottomNav showAbout={showAbout} />
    </div>
  );
}
