import { lazy, Suspense } from 'react';
import { useTheme } from '@shared/ui/ThemeProvider';
import { useNavigation } from './useNavigation';
import type { NavigationProps } from './useNavigation';
import type { CatalogTheme } from '@shared/styles/pwa-themes';

/* ── Lazy-load each skin component ─────────────────────────────────────── */

interface SkinSet {
  BottomBar: React.LazyExoticComponent<React.FC<NavigationProps>>;
  TopBar: React.LazyExoticComponent<React.FC<NavigationProps>>;
  Drawer: React.LazyExoticComponent<React.FC<NavigationProps>>;
}

const SKINS: Record<CatalogTheme, SkinSet> = {
  'luxury-minimalism': {
    BottomBar: lazy(() => import('./skins/luxury-minimalism/BottomBar')),
    TopBar: lazy(() => import('./skins/luxury-minimalism/TopBar')),
    Drawer: lazy(() => import('./skins/luxury-minimalism/Drawer')),
  },
  'neo-luxury': {
    BottomBar: lazy(() => import('./skins/neo-luxury/BottomBar')),
    TopBar: lazy(() => import('./skins/neo-luxury/TopBar')),
    Drawer: lazy(() => import('./skins/neo-luxury/Drawer')),
  },
  'modern-minimalism': {
    BottomBar: lazy(() => import('./skins/modern-minimalism/BottomBar')),
    TopBar: lazy(() => import('./skins/modern-minimalism/TopBar')),
    Drawer: lazy(() => import('./skins/modern-minimalism/Drawer')),
  },
};

export default function Navigation() {
  const { theme, isMobile } = useTheme();
  const props = useNavigation(isMobile);
  const skins = SKINS[theme] ?? SKINS['modern-minimalism'];

  if (isMobile) {
    return (
      <Suspense fallback={null}>
        <skins.BottomBar {...props} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <skins.TopBar {...props} />
      {props.isDrawerOpen && <skins.Drawer {...props} />}
    </Suspense>
  );
}
