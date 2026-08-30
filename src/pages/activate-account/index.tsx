import { lazy, Suspense } from 'react';
import { useActivateAccountPage } from './useActivateAccountPage';

const ActivateAccountSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function ActivateAccountPage() {
  const props = useActivateAccountPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <ActivateAccountSkin {...props} />
    </Suspense>
  );
}
