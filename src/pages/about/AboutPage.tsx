import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import { getCatalogProfile, type CatalogProfile, type SocialLink } from '@entities/shopper-profile/api';
import { BottomNav } from '@shared/ui/BottomNav';

const PLATFORM_ICONS: Record<SocialLink['platform'], string> = {
  instagram: '📷',
  facebook: '📘',
  tiktok: '🎵',
  website: '🌐',
};

const PLATFORM_LABELS: Record<SocialLink['platform'], string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  website: 'Sitio web',
};

export default function AboutPage() {
  const { slug } = useBranding();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<CatalogProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCatalogProfile(slug)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center pb-16"
        style={{ backgroundColor: 'var(--pwa-bg)' }}
      >
        <p className="text-sm" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
          {t('common.loading')}
        </p>
        <BottomNav showAbout />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="min-h-screen pb-16"
        style={{ backgroundColor: 'var(--pwa-bg)' }}
      >
        <BottomNav showAbout />
      </div>
    );
  }

  const hasContact = !!(profile.phone || profile.publicEmail || profile.whatsappNumber);
  const hasLinks = profile.socialLinks && profile.socialLinks.length > 0;

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--pwa-bg)' }}>
      {/* Hero banner */}
      <div
        className="relative w-full h-48 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--pwa-accent)' }}
      >
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.displayName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl select-none" aria-hidden="true">
            {profile.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="px-5 py-6 max-w-xl mx-auto flex flex-col gap-6">
        {/* Name + Bio */}
        <div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--pwa-text)' }}
          >
            {profile.displayName}
          </h1>
          {profile.bio && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--pwa-text)', opacity: 0.8 }}
            >
              {profile.bio}
            </p>
          )}
        </div>

        {/* Contact */}
        {hasContact && (
          <div className="flex flex-col gap-3">
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-3 text-sm font-medium"
                style={{ color: 'var(--pwa-accent)' }}
              >
                <span>📞</span>
                <span>{t('about.phone')}: {profile.phone}</span>
              </a>
            )}
            {profile.whatsappNumber && (
              <a
                href={`https://wa.me/${profile.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-medium"
                style={{ color: 'var(--pwa-accent)' }}
              >
                <span>💬</span>
                <span>{t('about.whatsapp')}: {profile.whatsappNumber}</span>
              </a>
            )}
            {profile.publicEmail && (
              <a
                href={`mailto:${profile.publicEmail}`}
                className="flex items-center gap-3 text-sm font-medium"
                style={{ color: 'var(--pwa-accent)' }}
              >
                <span>✉️</span>
                <span>{t('about.email')}: {profile.publicEmail}</span>
              </a>
            )}
          </div>
        )}

        {/* Social links */}
        {hasLinks && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--pwa-text)', opacity: 0.5 }}
            >
              {t('about.socialLinks')}
            </p>
            <div className="flex flex-wrap gap-3">
              {profile.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                  style={{
                    borderColor: 'var(--pwa-accent)',
                    color: 'var(--pwa-accent)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <span>{PLATFORM_ICONS[link.platform]}</span>
                  <span>{PLATFORM_LABELS[link.platform]}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav showAbout />
    </div>
  );
}
