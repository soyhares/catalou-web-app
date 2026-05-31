import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import { getCatalogProfile, type CatalogProfile, type SocialLink } from '@entities/shopper-profile/api';
import { BottomNav } from '@shared/ui/BottomNav';

/* ── SVG icons ───────────────────────────────────────────────────────────── */

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2h3l1.5 3.5L5 7c.9 1.8 2.2 3.1 4 4l1.5-1.5L14 11v3c-6.6 0-12-5.4-12-12z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
      <path d="M4.5 4.5C5.5 3 8.5 3 9.5 5.5C10 6.5 9.5 8 8.5 8.5L9 10.5C7 11 4 10 3.5 7C3.2 5.8 3.7 4.7 4.5 4.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
      <path d="M1 4L7 8L13 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
      <path d="M7 1.5C5.5 3.5 5.5 10.5 7 12.5M7 1.5C8.5 3.5 8.5 10.5 7 12.5M1.5 7h11" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="1.1" fill="none"/>
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
      <circle cx="10.5" cy="3.5" r="0.75" fill="currentColor"/>
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8.5 2H10V0.5H8C6.3 0.5 5 1.8 5 3.5V5H3.5V7H5V13.5H7V7H9L9.5 5H7V3.5C7 2.7 7.7 2 8.5 2Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9.5 1C9.5 3 11 4.5 13 4.5V6.5C11.8 6.5 10.7 6.1 9.8 5.4V9.5C9.8 11.5 8.2 13 6.2 13C4.2 13 2.5 11.5 2.5 9.5C2.5 7.5 4.1 6 6.1 6C6.3 6 6.5 6 6.7 6.1V8.2C6.5 8.1 6.3 8.1 6.1 8.1C5.2 8.1 4.5 8.8 4.5 9.7C4.5 10.6 5.2 11.3 6.1 11.3C7 11.3 7.8 10.6 7.8 9.7V1H9.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

const PLATFORM_ICONS: Record<SocialLink['platform'], () => React.ReactElement> = {
  instagram: IconInstagram,
  facebook: IconFacebook,
  tiktok: IconTikTok,
  website: IconGlobe,
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
    getCatalogProfile(slug).then(setProfile).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-16" style={{ backgroundColor: 'var(--pwa-bg)' }}>
        <BottomNav showAbout />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pb-16" style={{ backgroundColor: 'var(--pwa-bg)' }}>
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
        className="relative w-full h-52 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--pwa-accent)' }}
      >
        {profile.photoUrl ? (
          <img src={profile.photoUrl} alt={profile.displayName} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span
            style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontStyle: 'italic',
              fontSize: '4rem',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
            }}
            aria-hidden="true"
          >
            {profile.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="px-5 py-8 max-w-xl mx-auto flex flex-col gap-8">
        {/* Name + Bio */}
        <div>
          <h1
            style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              color: 'var(--pwa-text)',
              marginBottom: '12px',
              lineHeight: 1.2,
            }}
          >
            {profile.displayName}
          </h1>
          {profile.bio && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--pwa-text-secondary)', lineHeight: 1.75 }}
            >
              {profile.bio}
            </p>
          )}
        </div>

        {/* Contact */}
        {hasContact && (
          <div>
            <p
              className="uppercase tracking-[0.16em] mb-4"
              style={{ fontSize: '9px', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.45 }}
            >
              {t('about.contactTitle', 'Contacto')}
            </p>
            <div className="flex flex-col gap-3">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: 'var(--pwa-text)' }}
                >
                  <span style={{ color: 'var(--pwa-accent)' }}><IconPhone /></span>
                  <span>{profile.phone}</span>
                </a>
              )}
              {profile.whatsappNumber && (
                <a
                  href={`https://wa.me/${profile.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm"
                  style={{ color: 'var(--pwa-text)' }}
                >
                  <span style={{ color: 'var(--pwa-accent)' }}><IconWhatsApp /></span>
                  <span>{profile.whatsappNumber}</span>
                </a>
              )}
              {profile.publicEmail && (
                <a
                  href={`mailto:${profile.publicEmail}`}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: 'var(--pwa-text)' }}
                >
                  <span style={{ color: 'var(--pwa-accent)' }}><IconEmail /></span>
                  <span>{profile.publicEmail}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Social links */}
        {hasLinks && (
          <div>
            <p
              className="uppercase tracking-[0.16em] mb-4"
              style={{ fontSize: '9px', fontWeight: 700, color: 'var(--pwa-text-secondary)', opacity: 0.45 }}
            >
              {t('about.socialLinks')}
            </p>
            <div className="flex flex-wrap gap-3">
              {profile.socialLinks.map((link) => {
                const PlatformIcon = PLATFORM_ICONS[link.platform];
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-opacity hover:opacity-80"
                    style={{
                      borderColor: 'var(--pwa-accent)',
                      color: 'var(--pwa-accent)',
                      backgroundColor: 'transparent',
                      borderRadius: 'var(--pwa-radius-button)',
                      fontSize: '11px',
                      letterSpacing: '0.06em',
                    }}
                  >
                    <PlatformIcon />
                    <span>{PLATFORM_LABELS[link.platform]}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav showAbout />
    </div>
  );
}
