import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const ROUTE_UNAVAILABLE_EVENT = 'route-unavailable';

export function dispatchRouteUnavailable(message: string) {
  window.dispatchEvent(new CustomEvent(ROUTE_UNAVAILABLE_EVENT, { detail: { message } }));
}

// ponytail: reuses the same fixed-toast pattern as AddedToCartToast instead of a shared toast context
export function RouteNoticeToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onNotice(e: Event) {
      const msg = (e as CustomEvent<{ message: string }>).detail?.message ?? '';
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      timerRef.current = setTimeout(() => setMessage(null), 3200);
    }
    window.addEventListener(ROUTE_UNAVAILABLE_EVENT, onNotice);
    return () => {
      window.removeEventListener(ROUTE_UNAVAILABLE_EVENT, onNotice);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed top-4 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            className="pointer-events-auto px-4 py-2.5 rounded-full max-w-xs w-full text-center"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--pwa-text) 92%, transparent)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: 'var(--pwa-shadow-md)',
              fontSize: '0.8rem',
              color: 'var(--pwa-bg)',
            }}
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' as const }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
