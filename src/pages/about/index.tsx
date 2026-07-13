import { lazy, Suspense } from 'react';
import { useAboutPage } from './useAboutPage';

const AboutSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function AboutPage() {
  const props = useAboutPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <AboutSkin {...props} />
    </Suspense>
  );
}
