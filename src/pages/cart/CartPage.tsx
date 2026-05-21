import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import { useCart } from '@shared/lib/use-cart';
import { clearCart } from '@shared/lib/cart-store';

export default function CartPage() {
  const { t } = useTranslation();
  const { branding, slug } = useBranding();
  const { items, updateQuantity, remove, refresh } = useCart(slug);
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const isEmpty = items.length === 0;

  async function handleClear() {
    await clearCart(slug);
    await refresh();
    window.dispatchEvent(new Event('cart-updated'));
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pwa-bg)' }}>
      <header
        className="border-b px-4 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface)' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm hover:opacity-80"
          style={{ color: 'var(--pwa-text)' }}
        >
          ← {t('cart.back')}
        </button>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--pwa-text)' }}>
          {t('cart.title')}
        </h1>
        {!isEmpty ? (
          <button
            type="button"
            onClick={() => { void handleClear(); }}
            className="text-sm text-red-500 hover:text-red-700"
          >
            {t('cart.clear')}
          </button>
        ) : (
          <span className="w-10" />
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {isEmpty ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🛒</p>
            <p className="text-lg font-medium" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
              {t('cart.empty')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-4 text-sm underline"
              style={{ color: 'var(--pwa-accent)' }}
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        ) : (
          <>
            <ul className="divide-y" style={{ borderColor: 'var(--pwa-border)' }}>
              {items.map((item) => (
                <li key={item.id} className="py-4 flex gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--pwa-text)' }}>
                      {item.productName}
                    </p>
                    {item.variantValueName && (
                      <p className="text-sm" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
                        {item.variantTypeName}: {item.variantValueName}
                      </p>
                    )}
                    {branding.showPrices && (
                      <p className="text-sm mt-1" style={{ color: 'var(--pwa-text)', opacity: 0.8 }}>
                        ₡{(item.unitPrice * item.quantity).toLocaleString('es-CR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => { void updateQuantity(item.id, item.quantity - 1); }}
                      className="w-7 h-7 rounded border flex items-center justify-center hover:opacity-80"
                      style={{
                        borderColor: 'var(--pwa-border)',
                        color: 'var(--pwa-text)',
                      }}
                      aria-label={t('cart.decreaseQuantity')}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium" style={{ color: 'var(--pwa-text)' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => { void updateQuantity(item.id, item.quantity + 1); }}
                      className="w-7 h-7 rounded border flex items-center justify-center hover:opacity-80"
                      style={{
                        borderColor: 'var(--pwa-border)',
                        color: 'var(--pwa-text)',
                      }}
                      aria-label={t('cart.increaseQuantity')}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => { void remove(item.id); }}
                      className="ml-2 text-red-400 hover:text-red-600 text-lg leading-none"
                      aria-label={t('cart.remove')}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {branding.showPrices && (
              <div
                className="mt-4 flex justify-between border-t pt-4 font-semibold"
                style={{ borderColor: 'var(--pwa-border)', color: 'var(--pwa-text)' }}
              >
                <span>{t('cart.total')}</span>
                <span>₡{subtotal.toLocaleString('es-CR')}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full py-3 text-white font-medium hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--pwa-accent)',
                borderRadius: 'var(--pwa-radius-button)',
              }}
            >
              {t('cart.checkout')}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
