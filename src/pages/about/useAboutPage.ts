import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { getCatalogProfile, type CatalogProfile } from '@entities/shopper-profile/api';

export type { CatalogProfile };

export interface AboutPageProps {
  profile: CatalogProfile | null;
  bannerUrl: string | null;
  isLoading: boolean;
  error: string | null;
  companyName: string;
  onBack: () => void;
  onGoHome: () => void;
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

  return {
    profile,
    bannerUrl: branding.bannerUrl,
    isLoading,
    error,
    companyName: branding.companyName,
    onBack,
    onGoHome,
  };
}
