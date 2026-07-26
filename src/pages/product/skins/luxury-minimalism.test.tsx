import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LuxuryMinimalismProductSkin from './luxury-minimalism';
import type { ProductPageProps } from '../useProductPage';

vi.mock('@app/BrandingContext', () => ({ useBranding: () => ({ slug: 'test-tenant', branding: { businessModel: 'DIRECT' } }) }));
vi.mock('@shared/ui/ThemeProvider', () => ({ useTheme: () => ({ isMobile: false }) }));
vi.mock('@shared/ui/CatalogFooter', () => ({ CatalogFooter: () => null }));
vi.mock('@shared/ui/WhatsAppProductConsultButton', () => ({ WhatsAppProductConsultButton: () => null }));
vi.mock('@features/push-notifications/PushPermissionModal', () => ({ PushPermissionModal: () => null }));

const baseProps: ProductPageProps = {
  product: {
    id: 'p1', name: 'Convenio ASEMBIS', type: 'informative', description: null, technicalSpecs: null,
    basePrice: '0', mainImageUrl: null, categoryId: 'c1', purpose: 'informative',
    durationMinutes: null, moreInfoUrl: 'https://example.com/convenio',
    variantType: null, images: [],
  },
  isLoading: false, error: null, selectedVariant: null, activeImage: null, quantity: 1,
  computedPrice: null, canProceed: true, addedFeedback: false, ctaKind: 'none',
  onVariantSelect: vi.fn(), onQuantityChange: vi.fn(), onAddToCart: vi.fn(), onBook: vi.fn(),
  onBack: vi.fn(), onGoHome: vi.fn(), onImageSelect: vi.fn(),
  showPrices: true, currency: 'USD', businessModel: 'DIRECT', companyName: 'ASEALLERGAN',
  categoryName: 'Convenios', logoUrl: null, businessCategory: null,
  ordersEnabled: false, bookingsEnabled: false, cartCount: 0, isPushSubscribed: false, showPushModal: false,
  onCartClick: vi.fn(), onBellClick: vi.fn(), onClosePushModal: vi.fn(),
};

describe('LuxuryMinimalismProductSkin — más información', () => {
  it('muestra el enlace "Más información" cuando type=informative y moreInfoUrl existe', () => {
    render(<LuxuryMinimalismProductSkin {...baseProps} />);
    const link = screen.getByRole('link', { name: /Más información/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.com/convenio');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('no muestra el enlace cuando moreInfoUrl es null', () => {
    render(<LuxuryMinimalismProductSkin {...baseProps} product={{ ...baseProps.product!, moreInfoUrl: null }} />);
    expect(screen.queryByRole('link', { name: /Más información/i })).toBeNull();
  });

  it('no muestra el enlace para type=product aunque moreInfoUrl viniera seteado', () => {
    render(<LuxuryMinimalismProductSkin {...baseProps} product={{ ...baseProps.product!, type: 'product', moreInfoUrl: 'https://example.com/x' }} />);
    expect(screen.queryByRole('link', { name: /Más información/i })).toBeNull();
  });
});
