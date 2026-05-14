import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import { fetchCatalog, type CatalogData, type PublicCategory } from '@entities/catalog/api';
import { OfflineBanner } from '@shared/ui/OfflineBanner';
import { CartIcon } from '@widgets/cart/CartIcon';

export default function CatalogPage() {
  const { slug, branding } = useBranding();
  const { t } = useTranslation();

  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
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

  function selectCategory(id: string) {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
  }

  function clearAllFilters() {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center max-w-sm px-4">
          <p className="text-sm text-[var(--color-text)] opacity-70 mb-4">
            {t('errors.networkErrorMessage')}
          </p>
          <button
            onClick={() => void load()}
            className="text-sm underline text-[var(--color-primary)]"
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] px-4">
        {branding.logoUrl && (
          <img
            src={branding.logoUrl}
            alt={branding.companyName}
            className="h-16 w-auto mb-6 object-contain"
          />
        )}
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          {branding.companyName}
        </h1>
        <p className="text-lg font-semibold text-[var(--color-primary)] mb-1">
          {t('catalog.comingSoon')}
        </p>
        <p className="text-sm text-[var(--color-text)] opacity-60">
          {t('catalog.comingSoonMessage')}
        </p>
        <p className="mt-8 text-xs text-[var(--color-text)] opacity-30">{t('common.poweredBy')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <OfflineBanner />

      <header className="bg-[var(--color-primary)] px-4 py-3 flex items-center gap-3">
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
        <CartIcon slug={slug} />
      </header>

      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('catalog.searchPlaceholder')}
          className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      {(selectedCategoryId || selectedSubcategoryId) && (
        <div className="flex flex-wrap gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
          {activeCategoryName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-xs">
              {activeCategoryName}
              {!selectedSubcategoryId && (
                <button
                  onClick={clearAllFilters}
                  className="ml-1 text-white opacity-80 hover:opacity-100"
                >
                  ×
                </button>
              )}
            </span>
          )}
          {activeSubcategoryName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-white text-xs">
              {activeSubcategoryName}
              <button
                onClick={() => setSelectedSubcategoryId(null)}
                className="ml-1 text-white opacity-80 hover:opacity-100"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            {t('catalog.clearFilter')}
          </button>
        </div>
      )}

      <div className="flex">
        {!q && catalog && catalog.categories.length > 0 && (
          <nav className="w-40 shrink-0 border-r border-gray-100 bg-white min-h-screen py-4">
            <button
              onClick={clearAllFilters}
              className={`block w-full text-left px-3 py-2 text-xs font-medium ${!selectedCategoryId ? 'text-[var(--color-primary)] bg-gray-50' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {t('catalog.allCategories')}
            </button>
            {catalog.categories.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => selectCategory(cat.id)}
                  className={`block w-full text-left px-3 py-2 text-xs font-medium ${selectedCategoryId === cat.id ? 'text-[var(--color-primary)] bg-gray-50' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </button>
                {selectedCategoryId === cat.id &&
                  cat.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategoryId(sub.id)}
                      className={`block w-full text-left pl-6 pr-3 py-1.5 text-xs ${selectedSubcategoryId === sub.id ? 'text-[var(--color-primary)] font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {sub.name}
                    </button>
                  ))}
              </div>
            ))}
          </nav>
        )}

        <main className="flex-1 p-4">
          {loading ? (
            <p className="text-sm text-gray-400">{t('common.loading')}</p>
          ) : !catalog || catalog.products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-medium text-[var(--color-text)] opacity-70 mb-1">
                {t('catalog.noResults')}
              </p>
              <p className="text-xs text-[var(--color-text)] opacity-50">
                {t('catalog.noResultsMessage')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {catalog.products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {product.mainImageUrl ? (
                    <img
                      src={product.mainImageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-400">{t('product.noImage')}</span>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-medium text-[var(--color-text)] line-clamp-2">
                      {product.name}
                    </p>
                    {catalog.showPrices && (
                      <p className="text-xs text-[var(--color-primary)] font-semibold mt-1">
                        ${product.basePrice}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="py-6 text-center">
        <p className="text-xs text-[var(--color-text)] opacity-30">{t('common.poweredBy')}</p>
      </footer>
    </div>
  );
}
