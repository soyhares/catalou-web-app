import { Suspense, type ReactNode } from 'react';
import { BrandingProvider } from './BrandingContext';
import './sw-registration';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrandingProvider>
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        {children}
      </Suspense>
    </BrandingProvider>
  );
}
