import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@shared/ui/PageTransition';
import { AddedToCartToast } from '@shared/ui/AddedToCartToast';
import { InstallPromptSheet } from '@widgets/install-prompt/InstallPromptSheet';
import Navigation from '@widgets/navigation';

const HeroPage = lazy(() => import('@pages/hero'));
const CatalogPage = lazy(() => import('@pages/catalog'));
const ProductDetailPage = lazy(() => import('@pages/product'));
const CartPage = lazy(() => import('@pages/cart'));
const CheckoutPage = lazy(() => import('@pages/checkout'));
const OrderConfirmedPage = lazy(() => import('@pages/order-confirmed'));
const ConfirmAssociationPage = lazy(
  () => import('@pages/confirm-association/ConfirmAssociationPage'),
);
const AboutPage = lazy(() => import('@pages/about'));
const PrivacyPolicyPage = lazy(() => import('@pages/privacy-policy/PrivacyPolicyPage'));
const AppointmentsPage = lazy(() => import('@pages/appointments'));
const BookPage = lazy(() => import('@pages/book'));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--pwa-bg)' }} />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HeroPage /></PageTransition>} />
          <Route path="/catalog" element={<PageTransition><CatalogPage /></PageTransition>} />
          <Route path="/products/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
          <Route path="/order-confirmed" element={<PageTransition><OrderConfirmedPage /></PageTransition>} />
          <Route path="/confirm-association" element={<PageTransition><ConfirmAssociationPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/appointments" element={<PageTransition><AppointmentsPage /></PageTransition>} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicyPage /></PageTransition>} />
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Navigation />
      <AnimatedRoutes />
      <AddedToCartToast />
      <InstallPromptSheet />
    </BrowserRouter>
  );
}
