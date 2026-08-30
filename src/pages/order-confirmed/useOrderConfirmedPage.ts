import { useLocation, useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';

export interface NotedItem {
  productName: string;
  variantLabel: string | null;
  note: string;
}

export interface OrderConfirmedPageProps {
  orderId: string | null;
  /** Email typed at checkout, used to anchor the account offer (SPEC-022). */
  email: string | null;
  companyName: string;
  // SPEC-021: lines that carried a customer note, passed via navigate state from checkout
  notedItems: NotedItem[];
  onGoHome: () => void;
}

export function useOrderConfirmedPage(): OrderConfirmedPageProps {
  const { branding } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { notedItems?: NotedItem[]; orderId?: string; email?: string }
    | null;
  const notedItems = state?.notedItems ?? [];

  function onGoHome() {
    void navigate('/', { replace: true });
  }

  return {
    orderId: state?.orderId ?? null,
    email: state?.email ?? null,
    companyName: branding.companyName,
    notedItems,
    onGoHome,
  };
}
