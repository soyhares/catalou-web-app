import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@shared/ui/ThemeProvider';
import { useNavigation } from './useNavigation';

const BottomBar = lazy(() => import('./skins/luxury-minimalism/BottomBar'));
const TopBar = lazy(() => import('./skins/luxury-minimalism/TopBar'));

export default function Navigation() {
  const { isMobile } = useTheme();
  const props = useNavigation();
  const { pathname } = useLocation();

  // Hero landing page — no navigation chrome
  if (pathname === '/') return null;

  if (isMobile) {
    return (
      <Suspense fallback={null}>
        <BottomBar {...props} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <TopBar {...props} />
    </Suspense>
  );
}
