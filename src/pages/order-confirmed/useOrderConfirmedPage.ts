import { useLocation, useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';

export interface NotedItem {
  productName: string;
  variantLabel: string | null;
  note: string;
}

export interface OrderConfirmedPageProps {
  orderId: string | null;
  companyName: string;
  // SPEC-021: lines that carried a customer note, passed via navigate state from checkout
  notedItems: NotedItem[];
  onGoHome: () => void;
}

export function useOrderConfirmedPage(): OrderConfirmedPageProps {
  const { branding } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();
  const notedItems = (location.state as { notedItems?: NotedItem[] } | null)?.notedItems ?? [];

  function onGoHome() {
    void navigate('/', { replace: true });
  }

  return {
    orderId: null,
    companyName: branding.companyName,
    notedItems,
    onGoHome,
  };
}
