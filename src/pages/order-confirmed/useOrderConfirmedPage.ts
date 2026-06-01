import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';

export interface OrderConfirmedPageProps {
  orderId: string | null;
  companyName: string;
  onGoHome: () => void;
}

export function useOrderConfirmedPage(): OrderConfirmedPageProps {
  const { branding } = useBranding();
  const navigate = useNavigate();

  function onGoHome() {
    void navigate('/', { replace: true });
  }

  return {
    orderId: null,
    companyName: branding.companyName,
    onGoHome,
  };
}
