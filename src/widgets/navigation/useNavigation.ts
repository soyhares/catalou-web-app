import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { useCart } from '@shared/lib/use-cart';

export interface NavLink {
  label: string;
  path: string;
}

export interface NavigationProps {
  activeRoute: string;
  cartCount: number;
  companyName: string;
  logoUrl: string | null;
  isDrawerOpen: boolean;
  links: NavLink[];
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
  onNavigate: (path: string) => void;
}

const LINKS: NavLink[] = [
  { label: 'Inicio', path: '/catalog' },
  { label: 'Citas', path: '/appointments' },
  { label: 'Nosotros', path: '/about' },
];

function resolveActiveRoute(pathname: string): string {
  if (pathname.startsWith('/products/')) return '/catalog';
  return pathname;
}

export function useNavigation(): NavigationProps {
  const { slug, branding } = useBranding();
  const { items: cartItems } = useCart(slug);
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const onToggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const onNavigate = useCallback(
    (path: string) => {
      setIsDrawerOpen(false);
      void navigate(path);
    },
    [navigate],
  );

  return {
    activeRoute: resolveActiveRoute(location.pathname),
    cartCount,
    companyName: branding.companyName,
    logoUrl: branding.logoUrl,
    isDrawerOpen,
    links: LINKS,
    onToggleDrawer,
    onCloseDrawer,
    onNavigate,
  };
}
