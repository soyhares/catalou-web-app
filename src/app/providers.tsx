import { Suspense, type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <Suspense fallback={<div className="min-h-screen bg-white" />}>{children}</Suspense>;
}
