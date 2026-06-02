import React from 'react';
import type { AboutPageProps, CatalogProfile } from '../useAboutPage';

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  website: 'Sitio web',
};

const LuxuryMinimalismAboutSkin: React.FC<AboutPageProps> = ({
  profile,
  isLoading,
  error,
  companyName,
  onGoHome,
}) => {
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: 'var(--pwa-error)', fontFamily: 'var(--pwa-font-body)' }}>No se pudo cargar el perfil</p>
        <button onClick={onGoHome} style={{ color: 'var(--pwa-accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--pwa-font-body)' }}>
          Volver al inicio
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', color: 'var(--pwa-text)', opacity: 0.4, fontSize: '1rem' }}>
          …
        </p>
      </div>
    );
  }

  const p: CatalogProfile | null = profile;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', paddingBottom: '88px' }}>

      {/* Large hero photo or blank accent bar */}
      {p?.photoUrl ? (
        <div style={{ width: '100%', height: '320px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={p.photoUrl}
            alt={p.displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, var(--pwa-bg) 100%)',
          }} />
        </div>
      ) : (
        <div style={{ width: '100%', height: '120px', backgroundColor: 'var(--pwa-border)' }} />
      )}

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 28px 0' }}>

        {/* Company name */}
        <h1 style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontStyle: 'italic',
          fontSize: 'clamp(2rem, 7vw, 3rem)',
          color: 'var(--pwa-text)',
          fontWeight: 400,
          lineHeight: 1.1,
          margin: '0 0 32px',
        }}>
          {p?.displayName ?? companyName}
        </h1>

        {/* Bio */}
        {p?.bio && (
          <p style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontSize: '1rem',
            color: 'var(--pwa-text-secondary)',
            lineHeight: 1.8,
            margin: '0 0 48px',
            fontWeight: 400,
          }}>
            {p.bio}
          </p>
        )}

        {/* Social links — minimal text links */}
        {p && p.socialLinks && p.socialLinks.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <p style={{
              fontSize: '9px',
              color: 'var(--pwa-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontWeight: 700,
              opacity: 0.4,
              marginBottom: '20px',
            }}>
              Redes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {p.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--pwa-font-heading)',
                    fontStyle: 'italic',
                    fontSize: '0.95rem',
                    color: 'var(--pwa-accent)',
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                  }}
                >
                  {PLATFORM_LABELS[link.platform] ?? link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact — subtle */}
        {p && (p.phone || p.publicEmail || p.whatsappNumber) && (
          <div style={{ marginBottom: '48px' }}>
            <p style={{
              fontSize: '9px',
              color: 'var(--pwa-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontWeight: 700,
              opacity: 0.4,
              marginBottom: '20px',
            }}>
              Contacto
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {p.phone && (
                <a href={`tel:${p.phone}`} style={{ fontSize: '0.875rem', color: 'var(--pwa-text-secondary)', textDecoration: 'none' }}>
                  {p.phone}
                </a>
              )}
              {p.whatsappNumber && (
                <a
                  href={`https://wa.me/${p.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.875rem', color: 'var(--pwa-text-secondary)', textDecoration: 'none' }}
                >
                  {p.whatsappNumber}
                </a>
              )}
              {p.publicEmail && (
                <a href={`mailto:${p.publicEmail}`} style={{ fontSize: '0.875rem', color: 'var(--pwa-text-secondary)', textDecoration: 'none' }}>
                  {p.publicEmail}
                </a>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default LuxuryMinimalismAboutSkin;
