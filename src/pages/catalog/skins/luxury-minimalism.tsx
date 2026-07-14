import React from 'react';
import { OfflineBanner } from '@shared/ui/OfflineBanner';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { useTheme } from '@shared/ui/ThemeProvider';
import { ProductListCard } from '@shared/ui/ProductListCard';
import { ProductListCardSkeleton } from '@shared/ui/ProductListCardSkeleton';
import { ProductGridCard } from '@shared/ui/ProductGridCard';
import { ProductGridCardSkeleton } from '@shared/ui/ProductGridCardSkeleton';
import { CatalogPicker } from '../CatalogPicker';
import { CatalogSearchBar } from '../CatalogSearchBar';
import { catalogSubtitle } from '../purpose';
import type { CatalogPageProps } from '../useCatalogPage';

function IconBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="7.5" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M7.5 7.5V6C7.5 3.515 9.015 2 11 2C12.985 2 14.5 3.515 14.5 6V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 4L6.5 10L12.5 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const listStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
  gap: isMobile ? '22px' : '20px 32px',
});

const gridStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: isMobile ? '22px' : '24px',
});

const LuxuryMinimalismSkin: React.FC<CatalogPageProps> = ({
  mode,
  catalogs,
  onCatalogSelect,
  activeCatalog,
  products,
  subcategories,
  selectedSubcategoryId,
  showBack,
  onBackToPicker,
  onSubcategorySelect,
  getCardAction,
  showPrices,
  currency,
  businessModel,
  searchQuery,
  isLoading,
  error,
  ordersEnabled,
  cartCount,
  companyName,
  logoUrl,
  bannerUrl,
  onSearchChange,
  onCartClick,
  onRetry,
}) => {
  const { isMobile } = useTheme();

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--pwa-bg)' }}>
        <div style={{ textAlign: 'center', maxWidth: '280px', padding: '0 16px' }}>
          <p style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--pwa-text)', opacity: 0.5, marginBottom: '24px' }}>
            No se pudo cargar el catálogo.
          </p>
          <button type="button" onClick={onRetry} style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const isPicker = mode === 'picker';
  const hasProducts = !isLoading && products.length > 0;
  const isEmpty = !isLoading && products.length === 0;
  const purpose = activeCatalog?.purpose ?? null;
  const useGrid = !isMobile && (purpose === 'menu' || purpose === 'informative');
  const layoutStyle = useGrid ? gridStyle(isMobile) : listStyle(isMobile);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', paddingBottom: '80px' }}>
      <OfflineBanner />

      <header style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'var(--pwa-bg)', borderBottom: '1px solid var(--pwa-border)' }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px', gap: '10px' }}>
            {isPicker ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
                {logoUrl && (
                  <img src={logoUrl} alt={companyName} style={{ height: '28px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
                )}
                <span style={{ fontFamily: 'var(--pwa-font-body)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--pwa-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {companyName}
                </span>
              </div>
            ) : showBack ? (
              <button type="button" onClick={onBackToPicker} aria-label="Volver a los catálogos" style={{ color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
                <IconBack />
              </button>
            ) : (
              <span style={{ width: '28px' }} />
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
              {isPicker ? (
                <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600 }}>
                  Catálogo
                </span>
              ) : (
                <>
                  <span style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--pwa-text)', lineHeight: 1.05, textAlign: 'center' }}>
                    {activeCatalog?.name ?? companyName}
                  </span>
                  <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, marginTop: '3px' }}>
                    {catalogSubtitle(activeCatalog?.purpose ?? null)}
                  </span>
                </>
              )}
            </div>

            {ordersEnabled ? (
              <button type="button" onClick={onCartClick} aria-label={`Carrito (${cartCount} artículos)`} style={{ position: 'relative', color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
                <IconBag />
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: 'var(--pwa-accent)', color: 'var(--pwa-bg)', fontSize: '9px', fontWeight: 600, minWidth: '14px', height: '14px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            ) : (
              <span style={{ width: '28px' }} />
            )}
          </div>
        )}

        {!isPicker && (
          <>
            <CatalogSearchBar value={searchQuery} onChange={onSearchChange} />
            {subcategories.length > 0 && (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                  <button type="button" onClick={() => onSubcategorySelect(null)} style={chipStyle(!selectedSubcategoryId)}>Todo</button>
                  {subcategories.map((sub) => (
                    <button key={sub.id} type="button" onClick={() => onSubcategorySelect(selectedSubcategoryId === sub.id ? null : sub.id)} style={chipStyle(selectedSubcategoryId === sub.id)}>
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </header>

      {isPicker ? (
        <CatalogPicker catalogs={catalogs} bannerUrl={bannerUrl} onSelect={onCatalogSelect} />
      ) : (
        <main style={{ padding: '20px 20px 0' }}>
          {isLoading && (
            <div style={layoutStyle}>
              {Array.from({ length: useGrid ? 8 : 6 }).map((_, i) => (
                useGrid ? <ProductGridCardSkeleton key={i} /> : <ProductListCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isEmpty && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.3rem', color: 'var(--pwa-text)', opacity: 0.35 }}>
                Sin resultados
              </p>
            </div>
          )}

          {hasProducts && (
            <div style={layoutStyle}>
              {products.map((product) => {
                const action = getCardAction(product);
                if (useGrid) {
                  return (
                    <ProductGridCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      imageUrl={product.mainImageUrl}
                      price={product.basePrice ? parseFloat(product.basePrice) : null}
                      showPrices={showPrices}
                      currency={currency}
                      businessModel={businessModel}
                      variant={purpose === 'menu' ? 'shop' : 'info'}
                      actionLabel={action.label}
                      onAction={() => action.run()}
                    />
                  );
                }
                return (
                  <ProductListCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    imageUrl={product.mainImageUrl}
                    price={purpose === 'informative' ? null : (product.basePrice ? parseFloat(product.basePrice) : null)}
                    durationMinutes={purpose === 'informative' ? null : product.durationMinutes}
                    showPrices={showPrices}
                    currency={currency}
                    businessModel={businessModel}
                    actionLabel={action.label}
                    onAction={() => action.run()}
                  />
                );
              })}
            </div>
          )}
        </main>
      )}

      <CatalogFooter />
    </div>
  );
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--pwa-font-body)',
    fontSize: '9px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '12px 14px',
    borderRadius: 'var(--pwa-radius-chip)',
    border: `1px solid ${active ? 'var(--pwa-text)' : 'var(--pwa-border)'}`,
    backgroundColor: active ? 'var(--pwa-text)' : 'transparent',
    color: active ? 'var(--pwa-bg)' : 'var(--pwa-text-secondary)',
    cursor: 'pointer',
    flexShrink: 0,
  };
}

export default LuxuryMinimalismSkin;
