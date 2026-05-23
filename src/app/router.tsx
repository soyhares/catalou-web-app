import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { WhatsAppFloatingButton } from '@shared/ui/WhatsAppFloatingButton';

const CatalogPage = lazy(() => import('@pages/catalog/CatalogPage'));
const ProductDetailPage = lazy(() => import('@pages/product/ProductDetailPage'));
const CartPage = lazy(() => import('@pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('@pages/checkout/CheckoutPage'));
const OrderConfirmedPage = lazy(() => import('@pages/order-confirmed/OrderConfirmedPage'));
const ConfirmAssociationPage = lazy(
  () => import('@pages/confirm-association/ConfirmAssociationPage'),
);
const AboutPage = lazy(() => import('@pages/about/AboutPage'));
const PrivacyPolicyPage = lazy(() => import('@pages/privacy-policy/PrivacyPolicyPage'));

export function AppRouter() {
  return (
    <BrowserRouter>
      <WhatsAppFloatingButton />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
          <Route path="/confirm-association" element={<ConfirmAssociationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
