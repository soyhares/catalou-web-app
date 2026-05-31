import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useBranding } from '@app/BrandingContext';
import { useCart } from '@shared/lib/use-cart';
import { clearCart } from '@shared/lib/cart-store';

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconRemove() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 5H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 2V8M2 5H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function CartPage() {
  const { t } = useTranslation();
  const { branding, slug } = useBranding();
  const { items, updateQuantity, remove, refresh } = useCart(slug);
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const servicePercentage = branding.servicePercentage ?? 0;
  const serviceAmount = (subtotal * servicePercentage) / 100;
  const grandTotal = subtotal + serviceAmount;
  const isEmpty = items.length === 0;

  async function handleClear() {
    await clearCart(slug);
    await refresh();
    window.dispatchEvent(new Event('cart-updated'));
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pwa-bg)' }}>

      {/* Header — minimal, elegant */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 h-14 border-b"
        style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-bg)' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--pwa-text)' }}
          aria-label="Volver"
        >
          <IconChevronLeft />
        </button>

        <div className="text-center">
          <p
            style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: 'var(--pwa-text)',
            }}
          >
            {t('cart.title')}
          </p>
          {!isEmpty && (
            <p
              className="uppercase tracking-[0.14em] mt-0.5"
              style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.5 }}
            >
              {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
            </p>
          )}
        </div>

        {!isEmpty ? (
          <button
            type="button"
            onClick={() => { void handleClear(); }}
            className="uppercase tracking-[0.1em] opacity-40 hover:opacity-70 transition-opacity"
            style={{ fontSize: '9px', color: 'var(--pwa-text)', fontWeight: 600 }}
          >
            Vaciar
          </button>
        ) : (
          <span className="w-10" />
        )}
      </header>

      <main className="max-w-lg mx-auto px-5 py-8">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            /* Empty state — refined */
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Decorative bag outline */}
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--pwa-text)', opacity: 0.12 }} className="mb-6">
                <rect x="5" y="14" width="30" height="22" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M14 14V11C14 7.69 16.69 5 20 5C23.31 5 26 7.69 26 11V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <p
                className="mb-2"
                style={{
                  fontFamily: 'var(--pwa-font-heading)',
                  fontStyle: 'italic',
                  fontSize: '1.4rem',
                  color: 'var(--pwa-text)',
                  opacity: 0.4,
                }}
              >
                {t('cart.empty')}
              </p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-6 uppercase tracking-[0.16em]"
                style={{ fontSize: '10px', color: 'var(--pwa-accent)', fontWeight: 600 }}
              >
                {t('cart.continueShopping')}
              </button>
            </motion.div>
          ) : (
            <motion.div key="items" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Items — thin rule table style */}
              <div
                className="border-t"
                style={{ borderColor: 'var(--pwa-border)' }}
              >
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.22 }}
                      className="py-5 border-b flex items-start gap-4"
                      style={{ borderColor: 'var(--pwa-border)' }}
                    >
                      <div className="flex-1 min-w-0">
                        {/* Product name in italic serif */}
                        <p
                          className="mb-0.5"
                          style={{
                            fontFamily: 'var(--pwa-font-heading)',
                            fontStyle: 'italic',
                            fontSize: '1.05rem',
                            color: 'var(--pwa-text)',
                            lineHeight: 1.3,
                          }}
                        >
                          {item.productName}
                        </p>
                        {item.variantValueName && (
                          <p
                            className="uppercase tracking-[0.1em]"
                            style={{ fontSize: '9px', color: 'var(--pwa-text-secondary)', opacity: 0.55 }}
                          >
                            {item.variantTypeName} — {item.variantValueName}
                          </p>
                        )}
                        {branding.showPrices && (
                          <p
                            className="mt-2 tracking-wide"
                            style={{ fontSize: '11px', color: 'var(--pwa-accent)', fontWeight: 500, letterSpacing: '0.06em' }}
                          >
                            ₡{(item.unitPrice * item.quantity).toLocaleString('es-CR')}
                          </p>
                        )}
                      </div>

                      {/* Quantity + remove */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => { void remove(item.id); }}
                          className="opacity-30 hover:opacity-60 transition-opacity"
                          style={{ color: 'var(--pwa-text)' }}
                          aria-label={t('cart.remove')}
                        >
                          <IconRemove />
                        </button>

                        {/* Qty stepper — minimal */}
                        <div
                          className="flex items-center gap-3"
                          style={{ borderBottom: '1px solid var(--pwa-border)', paddingBottom: '2px' }}
                        >
                          <button
                            type="button"
                            onClick={() => { void updateQuantity(item.id, item.quantity - 1); }}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--pwa-text)' }}
                            aria-label={t('cart.decreaseQuantity')}
                          >
                            <IconMinus />
                          </button>
                          <span
                            className="tabular-nums"
                            style={{ fontSize: '12px', color: 'var(--pwa-text)', minWidth: '16px', textAlign: 'center' }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => { void updateQuantity(item.id, item.quantity + 1); }}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--pwa-text)' }}
                            aria-label={t('cart.increaseQuantity')}
                          >
                            <IconPlus />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order summary — elegant totals */}
              {branding.showPrices && (
                <div className="mt-6 space-y-2">
                  {servicePercentage > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span
                          className="uppercase tracking-[0.1em]"
                          style={{ fontSize: '10px', color: 'var(--pwa-text-secondary)', opacity: 0.55 }}
                        >
                          {t('cart.subtotal')}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--pwa-text)' }}>
                          ₡{subtotal.toLocaleString('es-CR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className="uppercase tracking-[0.1em]"
                          style={{ fontSize: '10px', color: 'var(--pwa-text-secondary)', opacity: 0.55 }}
                        >
                          {t('cart.serviceFee', { pct: servicePercentage })}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--pwa-text)' }}>
                          ₡{serviceAmount.toLocaleString('es-CR')}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Total with gold accent divider */}
                  <div
                    className="flex justify-between pt-4"
                    style={{ borderTop: '1px solid var(--pwa-accent)', marginTop: '12px' }}
                  >
                    <span
                      className="uppercase tracking-[0.14em]"
                      style={{ fontSize: '10px', fontWeight: 700, color: 'var(--pwa-text)' }}
                    >
                      {t('cart.total')}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--pwa-font-heading)',
                        fontStyle: 'italic',
                        fontSize: '1.15rem',
                        color: 'var(--pwa-accent)',
                        fontWeight: 400,
                      }}
                    >
                      ₡{grandTotal.toLocaleString('es-CR')}
                    </span>
                  </div>
                </div>
              )}

              {/* CTA — full width, elegant */}
              <motion.button
                type="button"
                onClick={() => navigate('/checkout')}
                className="mt-8 w-full py-4 uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--pwa-accent)',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--pwa-font-body)',
                  borderRadius: 'var(--pwa-radius-button)',
                  letterSpacing: '0.2em',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {t('cart.checkout')}
              </motion.button>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
