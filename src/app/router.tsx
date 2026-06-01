import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WhatsAppFloatingButton } from '@shared/ui/WhatsAppFloatingButton';
import { PageTransition } from '@shared/ui/PageTransition';
import { AddedToCartToast } from '@shared/ui/AddedToCartToast';

const CatalogPage = lazy(() => import('@pages/catalog'));
const ProductDetailPage = lazy(() => import('@pages/product'));
const CartPage = lazy(() => import('@pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('@pages/checkout/CheckoutPage'));
const OrderConfirmedPage = lazy(() => import('@pages/order-confirmed/OrderConfirmedPage'));
const ConfirmAssociationPage = lazy(
  () => import('@pages/confirm-association/ConfirmAssociationPage'),
);
const AboutPage = lazy(() => import('@pages/about/AboutPage'));
const PrivacyPolicyPage = lazy(() => import('@pages/privacy-policy/PrivacyPolicyPage'));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--pwa-bg)' }} />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><CatalogPage /></PageTransition>} />
          <Route path="/products/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
          <Route path="/order-confirmed" element={<PageTransition><OrderConfirmedPage /></PageTransition>} />
          <Route path="/confirm-association" element={<PageTransition><ConfirmAssociationPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicyPage /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <WhatsAppFloatingButton />
      <AnimatedRoutes />
      <AddedToCartToast />
    </BrowserRouter>
  );
}
