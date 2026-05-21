import { type ReactNode, Suspense } from 'react';
import { BrandingProvider } from './BrandingContext';
import { ThemeProvider } from '@shared/ui/ThemeProvider';
import './sw-registration';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrandingProvider>
      <ThemeProvider>
        <Suspense fallback={<div className="min-h-screen" />}>
          {children}
        </Suspense>
      </ThemeProvider>
    </BrandingProvider>
  );
}
