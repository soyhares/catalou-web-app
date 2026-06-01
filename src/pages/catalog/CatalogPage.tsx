import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranding } from '@app/BrandingContext';
import { fetchCatalog, type CatalogData, type PublicCategory } from '@entities/catalog/api';
import { getCatalogProfile } from '@entities/shopper-profile/api';
import { OfflineBanner } from '@shared/ui/OfflineBanner';
import { ProductCard } from '@shared/ui/ProductCard';
import { ProductCardSkeleton } from '@shared/ui/ProductCardSkeleton';
import { CategoryChip } from '@shared/ui/CategoryChip';
import { BottomNav } from '@shared/ui/BottomNav';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useScrollY } from '@shared/hooks/useScrollY';
import { useCart } from '@shared/lib/use-cart';

/* ── SVG icons ─────────────────────────────────────────────────────────── */

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="7.5" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M7.5 7.5V6C7.5 3.515 9.015 2 11 2C12.985 2 14.5 3.515 14.5 6V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function CatalogPage() {
  const { slug, branding } = useBranding();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { add, items: cartItems } = useCart(slug);
  const scrolled = useScrollY(60);

  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [error, setError] = useState(false);
  const [q, setQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

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

  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);
  useEffect(() => {
    getCatalogProfile(slug).then((p) => setShowAbout(p.hasAboutSection)).catch(() => {});
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
      companySlug: slug, productId: product.id, productName: product.name,
      variantTypeId: null, variantTypeName: null, variantValueId: null, variantValueName: null,
      quantity: 1, unitPrice: parseFloat(product.basePrice) || 0,
    }).then(() => {
      // 'cart-updated' is dispatched automatically by useCart.add()
      window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { name: product.name } }));
    });
  }

  const activeCategory: PublicCategory | undefined = catalog?.categories.find((c) => c.id === selectedCategoryId);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--pwa-bg)' }}>
        <div className="text-center max-w-xs px-4">
          <p className="mb-6 text-sm" style={{ color: 'var(--pwa-text)', opacity: 0.5 }}>{t('errors.networkErrorMessage')}</p>
          <button onClick={() => void load()} style={{ color: 'var(--pwa-accent)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  const hasAnyProducts = (catalog?.categories.length ?? 0) > 0;
  const showComingSoon = !loading && catalog !== null && !hasAnyProducts && !q && !selectedCategoryId;

  if (showComingSoon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-20" style={{ backgroundColor: 'var(--pwa-bg)' }}>
        {branding.logoUrl && <img src={branding.logoUrl} alt={branding.companyName} className="h-14 w-auto mb-8 object-contain opacity-80" />}
        <h1 style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '2rem', color: 'var(--pwa-text)' }} className="mb-2">{branding.companyName}</h1>
        <p style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pwa-accent)' }}>{t('catalog.comingSoon')}</p>
        <BottomNav showAbout={showAbout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--pwa-bg)' }}>
      <OfflineBanner />

      {/* ── EDITORIAL HEADER ──────────────────────────────────────────── */}
      <header
        className="pwa-topbar sticky top-0 z-20"
        style={{
          backgroundColor: scrolled ? undefined : 'var(--pwa-bg)',
          borderBottom: `1px solid ${scrolled ? 'var(--pwa-glass-border)' : 'var(--pwa-border)'}`,
        }}
      >
        {/* Search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="absolute inset-0 z-30 flex items-center px-4 gap-3"
              style={{ backgroundColor: 'var(--pwa-bg)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span style={{ color: 'var(--pwa-text-secondary)' }}><IconSearch /></span>
              <input
                autoFocus
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('catalog.searchPlaceholder')}
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{
                  fontFamily: 'var(--pwa-font-body)',
                  color: 'var(--pwa-text)',
                  borderBottom: '1px solid var(--pwa-accent)',
                  paddingBottom: '4px',
                }}
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setQ(''); }}
                style={{ color: 'var(--pwa-text-secondary)' }}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <IconClose />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main header row */}
        <div className="flex items-center justify-between px-5 py-4">
          {/* Search trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            style={{ color: 'var(--pwa-text-secondary)' }}
            className="opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Buscar"
          >
            <IconSearch />
          </button>

          {/* Company name — centered, editorial serif */}
          <div className="flex-1 flex flex-col items-center">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.companyName} className="h-7 w-auto object-contain" />
            ) : (
              <span
                style={{
                  fontFamily: 'var(--pwa-font-heading)',
                  fontStyle: 'italic',
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  color: 'var(--pwa-text)',
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                }}
              >
                {branding.companyName}
              </span>
            )}
            <span
              className="mt-0.5 uppercase tracking-[0.2em]"
              style={{ fontSize: '8px', color: 'var(--pwa-text-secondary)', opacity: 0.5 }}
            >
              Catálogo
            </span>
          </div>

          {/* Cart */}
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="relative"
            style={{ color: 'var(--pwa-text)' }}
            aria-label={`Carrito (${cartCount} artículos)`}
          >
            <IconBag />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-white rounded-full"
                  style={{
                    backgroundColor: 'var(--pwa-accent)',
                    fontSize: '9px',
                    fontWeight: 600,
                    minWidth: '14px',
                    height: '14px',
                    padding: '0 2px',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Category nav — editorial text links, horizontal scroll */}
        {!q && catalog && catalog.categories.length > 0 && (
          <div className="border-t" style={{ borderColor: 'var(--pwa-border)' }}>
            <div
              className="flex items-center gap-6 overflow-x-auto px-5 py-2"
              style={{ scrollbarWidth: 'none' }}
            >
              <CategoryChip label="Todo" active={!selectedCategoryId} onClick={clearAllFilters} />
              {catalog.categories.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  label={cat.name}
                  active={selectedCategoryId === cat.id}
                  onClick={() => selectCategory(cat.id)}
                />
              ))}
            </div>

            {/* Subcategory row */}
            <AnimatePresence>
              {selectedCategoryId && activeCategory && activeCategory.subcategories.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t"
                  style={{ borderColor: 'var(--pwa-border)' }}
                >
                  <div className="flex items-center gap-5 overflow-x-auto px-5 py-2" style={{ scrollbarWidth: 'none' }}>
                    {activeCategory.subcategories.map((sub) => (
                      <CategoryChip
                        key={sub.id}
                        label={sub.name}
                        active={selectedSubcategoryId === sub.id}
                        onClick={() => setSelectedSubcategoryId(sub.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {/* ── Desktop sidebar + main grid ───────────────────────────────── */}
      <div className="flex">
        {/* Desktop sidebar — text links, no background */}
        {!q && catalog && catalog.categories.length > 0 && (
          <nav
            className="hidden md:flex w-40 shrink-0 border-r flex-col gap-0.5 px-4 py-6"
            style={{ borderColor: 'var(--pwa-border)' }}
          >
            <p
              className="uppercase tracking-[0.14em] mb-4"
              style={{ fontSize: '9px', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.4 }}
            >
              Categorías
            </p>
            <CategoryChip label="Todo" active={!selectedCategoryId} onClick={clearAllFilters} />
            {catalog.categories.map((cat) => (
              <div key={cat.id} className="flex flex-col gap-0.5">
                <CategoryChip label={cat.name} active={selectedCategoryId === cat.id} onClick={() => selectCategory(cat.id)} />
                {selectedCategoryId === cat.id && cat.subcategories.map((sub) => (
                  <div key={sub.id} className="pl-3">
                    <CategoryChip label={sub.name} active={selectedSubcategoryId === sub.id} onClick={() => setSelectedSubcategoryId(sub.id)} />
                  </div>
                ))}
              </div>
            ))}
          </nav>
        )}

        {/* Product grid */}
        <main className="flex-1 px-4 md:px-6 py-6">
          {/* Active filter label */}
          {(selectedCategoryId) && (
            <div className="flex items-center gap-3 mb-5">
              <span
                className="uppercase tracking-[0.12em]"
                style={{ fontSize: '10px', color: 'var(--pwa-accent)', fontWeight: 600 }}
              >
                {activeCategory?.name}
              </span>
              <button
                onClick={clearAllFilters}
                style={{ color: 'var(--pwa-text-secondary)', fontSize: '10px', opacity: 0.5 }}
                className="uppercase tracking-wider"
              >
                ✕ Limpiar
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-8">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : !catalog || catalog.products.length === 0 ? (
            <div className="text-center py-20">
              <p
                style={{
                  fontFamily: 'var(--pwa-font-heading)',
                  fontStyle: 'italic',
                  fontSize: '1.4rem',
                  color: 'var(--pwa-text)',
                  opacity: 0.35,
                }}
              >
                Sin resultados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-8">
              {catalog.products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: 'easeOut' }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    imageUrl={product.mainImageUrl}
                    price={product.basePrice !== null ? parseFloat(product.basePrice) : null}
                    showPrices={catalog.showPrices}
                    onQuote={handleQuote}
                  />
                </motion.div>
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
