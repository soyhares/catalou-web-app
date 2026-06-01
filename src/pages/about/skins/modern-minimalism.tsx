import React from 'react';
import type { AboutPageProps, CatalogProfile } from '../useAboutPage';

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📷',
  facebook: '👤',
  tiktok: '♪',
  website: '🌐',
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  website: 'Sitio web',
};

const ModernMinimalismAboutSkin: React.FC<AboutPageProps> = ({
  profile,
  isLoading,
  companyName,
  onBack,
}) => {
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--pwa-font-body)', color: 'var(--pwa-text-secondary)', fontSize: '0.875rem' }}>
          Cargando…
        </p>
      </div>
    );
  }

  const p: CatalogProfile | null = profile;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', paddingBottom: '64px' }}>

      {/* Standard header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        padding: '0 20px',
        backgroundColor: 'var(--pwa-card)',
        borderBottom: '1px solid var(--pwa-border)',
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--pwa-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0,
          }}
          aria-label="Atrás"
        >
          ← Atrás
        </button>
      </header>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 20px 0' }}>

        {/* Photo card */}
        {p?.photoUrl && (
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--pwa-radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--pwa-border)',
            marginBottom: '24px',
          }}>
            <img
              src={p.photoUrl}
              alt={p.displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Company name */}
        <h1 style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: 'clamp(1.5rem, 5vw, 2rem)',
          fontWeight: 700,
          color: 'var(--pwa-text)',
          margin: '0 0 16px',
          lineHeight: 1.2,
        }}>
          {p?.displayName ?? companyName}
        </h1>

        {/* Bio */}
        {p?.bio && (
          <p style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '0.9375rem',
            color: 'var(--pwa-text-secondary)',
            lineHeight: 1.7,
            margin: '0 0 32px',
          }}>
            {p.bio}
          </p>
        )}

        {/* Social links — clean labeled buttons */}
        {p && p.socialLinks && p.socialLinks.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--pwa-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '12px',
              fontFamily: 'var(--pwa-font-body)',
            }}>
              Redes sociales
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {p.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    border: '1px solid var(--pwa-border)',
                    borderRadius: 'var(--pwa-radius-button)',
                    color: 'var(--pwa-text)',
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    backgroundColor: 'var(--pwa-card)',
                  }}
                >
                  <span aria-hidden="true">{PLATFORM_ICONS[link.platform] ?? '↗'}</span>
                  {PLATFORM_LABELS[link.platform] ?? link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact — structured list */}
        {p && (p.phone || p.publicEmail || p.whatsappNumber) && (
          <div style={{
            backgroundColor: 'var(--pwa-card)',
            border: '1px solid var(--pwa-border)',
            borderRadius: 'var(--pwa-radius-md)',
            overflow: 'hidden',
            marginBottom: '32px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--pwa-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '14px 16px 10px',
              margin: 0,
              fontFamily: 'var(--pwa-font-body)',
              borderBottom: '1px solid var(--pwa-border)',
            }}>
              Contacto
            </p>
            <div>
              {p.phone && (
                <a
                  href={`tel:${p.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 16px',
                    borderBottom: p.whatsappNumber || p.publicEmail ? '1px solid var(--pwa-border)' : 'none',
                    color: 'var(--pwa-text)',
                    textDecoration: 'none',
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '0.875rem',
                  }}
                >
                  <span aria-hidden="true">📞</span>
                  {p.phone}
                </a>
              )}
              {p.whatsappNumber && (
                <a
                  href={`https://wa.me/${p.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 16px',
                    borderBottom: p.publicEmail ? '1px solid var(--pwa-border)' : 'none',
                    color: 'var(--pwa-text)',
                    textDecoration: 'none',
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '0.875rem',
                  }}
                >
                  <span aria-hidden="true">💬</span>
                  {p.whatsappNumber}
                </a>
              )}
              {p.publicEmail && (
                <a
                  href={`mailto:${p.publicEmail}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 16px',
                    color: 'var(--pwa-text)',
                    textDecoration: 'none',
                    fontFamily: 'var(--pwa-font-body)',
                    fontSize: '0.875rem',
                  }}
                >
                  <span aria-hidden="true">✉</span>
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

export default ModernMinimalismAboutSkin;
