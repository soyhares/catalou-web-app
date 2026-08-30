import { lazy, Suspense } from 'react';
import { useAccountPage } from './useAccountPage';

const AccountSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function AccountPage() {
  const props = useAccountPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <AccountSkin {...props} />
    </Suspense>
  );
}
