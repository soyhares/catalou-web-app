import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { getCatalogProfile, type CatalogProfile } from '@entities/shopper-profile/api';
import { readSession } from '@shared/lib/customer-session';

export type { CatalogProfile };

export interface AboutPageProps {
  profile: CatalogProfile | null;
  bannerUrl: string | null;
  isLoading: boolean;
  error: string | null;
  companyName: string;
  /**
   * Esta pantalla es el estado sin sesión del segundo tab, así que también es de donde se
   * vuelve a entrar. Sin esto, quien perdía su sesión no tenía ninguna puerta: la PWA no
   * tiene login y el ofrecimiento de cuenta solo aparece al confirmar un pedido.
   */
  showSignIn: boolean;
  onBack: () => void;
  onGoHome: () => void;
  onSignIn: () => void;
}

export function useAboutPage(): AboutPageProps {
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CatalogProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getCatalogProfile(slug)
      .then((data) => {
        setProfile(data);
      })
      .catch(() => {
        setError('No se pudo cargar el perfil');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onGoHome = useCallback(() => {
    void navigate('/');
  }, [navigate]);

  const onSignIn = useCallback(() => {
    // Sin state: la pantalla arranca por el paso del correo.
    void navigate('/activate-account');
  }, [navigate]);

  return {
    profile,
    bannerUrl: branding.bannerUrl,
    isLoading,
    error,
    companyName: branding.companyName,
    showSignIn: readSession(slug) === null,
    onBack,
    onGoHome,
    onSignIn,
  };
}
