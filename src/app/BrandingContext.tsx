import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import i18n from '@shared/i18n';
import { getBranding, type BrandingData } from '@entities/company/api';
import { ApiError } from '@shared/lib/api';
import { injectDynamicManifest } from '@shared/lib/manifest';

interface BrandingContextValue {
  branding: BrandingData;
  slug: string;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

function resolveSlug(): string {
  const devSlug = import.meta.env.VITE_DEV_SLUG as string;
  if (devSlug) return devSlug;

  const domain = import.meta.env.VITE_CATALOU_DOMAIN as string;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === domain) return '';

  const slug = hostname.split(`.${domain}`)[0] ?? '';

  // Reserved subdomains are not tenant slugs — redirect to apex
  if (slug === 'www') {
    window.location.replace(`https://${domain}${window.location.pathname}${window.location.search}`);
    return '';
  }

  return slug;
}

function applyBrandingCssVars(branding: BrandingData): void {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', branding.colorPrimary);
  root.style.setProperty('--color-secondary', branding.colorSecondary);
  root.style.setProperty('--color-background', branding.colorBackground);
  root.style.setProperty('--color-text', branding.colorText);
}

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

interface BrandingProviderProps {
  children: ReactNode;
}

export function BrandingProvider({ children }: BrandingProviderProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const slug = resolveSlug();

  useEffect(() => {
    if (!slug) {
      queueMicrotask(() => setLoadState('not-found'));
      return;
    }

    getBranding(slug)
      .then((data) => {
        applyBrandingCssVars(data);
        injectDynamicManifest(data);
        void i18n.changeLanguage(data.language.toLowerCase());

        document.title = data.companyName;

        if (data.logoUrl) {
          const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
          const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
          if (icon) icon.href = data.logoUrl;
          if (apple) apple.href = data.logoUrl;
        }

        setBranding(data);
        setLoadState('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setLoadState('not-found');
        } else {
          setLoadState('error');
        }
      });
  }, [slug]);

  if (loadState === 'loading') {
    return <div className="min-h-screen bg-white" />;
  }

  if (loadState === 'not-found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-4">
          <p className="text-xs text-gray-400 mb-2">catalou.com</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Esta tienda no existe</h1>
          <p className="text-sm text-gray-500">
            La dirección que visitaste no corresponde a ninguna tienda activa en Catalou.
          </p>
        </div>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error de conexión</h1>
          <p className="text-sm text-gray-500 mb-4">
            No se pudo cargar la tienda. Verifica tu conexión e intenta de nuevo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline text-gray-600"
            type="button"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrandingContext.Provider value={{ branding: branding!, slug }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextValue {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
}
