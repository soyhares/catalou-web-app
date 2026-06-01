import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ToastState {
  id: number;
  name: string;
}

function BagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M4.5 5V3.5C4.5 2.12 5.62 1 7 1C8.38 1 9.5 2.12 9.5 3.5V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function AddedToCartToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    function onAdded(e: Event) {
      const name = (e as CustomEvent<{ name: string }>).detail?.name ?? '';
      if (timerRef.current) clearTimeout(timerRef.current);
      idRef.current += 1;
      setToast({ id: idRef.current, name });
      timerRef.current = setTimeout(() => setToast(null), 2200);
    }
    window.addEventListener('cart-item-added', onAdded);
    return () => {
      window.removeEventListener('cart-item-added', onAdded);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-[76px] inset-x-0 z-30 flex justify-center pointer-events-none px-4">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full max-w-xs w-full"
            style={{
              backgroundColor: 'var(--pwa-glass-bg)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--pwa-glass-border)',
              boxShadow: 'var(--pwa-shadow-md)',
            }}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' as const }}
          >
            {/* Icon */}
            <span style={{ color: 'var(--pwa-accent)', flexShrink: 0 }}>
              <BagIcon />
            </span>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p
                className="uppercase tracking-[0.1em] leading-none"
                style={{ fontSize: '8px', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.6 }}
              >
                Agregado
              </p>
              <p
                className="truncate leading-snug mt-0.5"
                style={{
                  fontFamily: 'var(--pwa-font-heading)',
                  fontStyle: 'italic',
                  fontSize: '0.9rem',
                  color: 'var(--pwa-text)',
                }}
              >
                {toast.name}
              </p>
            </div>

            {/* Go to cart */}
            <button
              type="button"
              onClick={() => {
                setToast(null);
                void navigate('/cart');
              }}
              className="flex items-center gap-1 shrink-0 uppercase tracking-[0.1em] hover:opacity-80 transition-opacity"
              style={{ fontSize: '8px', fontWeight: 700, color: 'var(--pwa-accent)' }}
            >
              Ver
              <ChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
