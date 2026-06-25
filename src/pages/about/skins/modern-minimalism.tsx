import React from 'react';
import type { AboutPageProps, CatalogProfile } from '../useAboutPage';

function IconInstagram() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="12" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="7" cy="7" r="2.8" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="10.5" cy="3.5" r="0.8" fill="currentColor"/>
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8.5 2H10V0.5H8.5C7 0.5 5.5 1.8 5.5 3.5V5H4V6.5H5.5V13.5H7V6.5H8.5L9 5H7V3.5C7 2.7 7.7 2 8.5 2Z" fill="currentColor"/>
    </svg>
  );
}
function IconTikTok() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 1h-1.5v8a1.5 1.5 0 1 1-1.5-1.5V6a3 3 0 1 0 3 3V4.5a4.5 4.5 0 0 0 2.5.8V3.8A3 3 0 0 1 9 1Z" fill="currentColor"/>
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7 1.5C7 1.5 9 4 9 7C9 10 7 12.5 7 12.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7 1.5C7 1.5 5 4 5 7C5 10 7 12.5 7 12.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1.5 7H12.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

const PLATFORM_SVG: Record<string, () => React.ReactElement> = {
  instagram: IconInstagram,
  facebook: IconFacebook,
  tiktok: IconTikTok,
  website: IconGlobe,
};

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 1.5h2.5l1 2.5-1.5 1c.7 1.5 1.5 2.3 3 3L9.5 6.5l2.5 1V10c0 1-.5 1.5-1.5 1.5C4 11.5 2.5 4.5 3 3V1.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    </svg>
  );
}
function IconWhatsApp() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1a6 6 0 0 1 5.2 9l.8 3-3-.8A6 6 0 1 1 7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M5 5.5C5 5.5 5.5 8.5 9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function IconEmail() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 4L7 8L13 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  website: 'Sitio web',
};

const ModernMinimalismAboutSkin: React.FC<AboutPageProps> = ({
  profile,
  bannerUrl,
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
        <p style={{ fontFamily: 'var(--pwa-font-body)', color: 'var(--pwa-text-secondary)', fontSize: '0.875rem' }}>
          Cargando…
        </p>
      </div>
    );
  }

  const p: CatalogProfile | null = profile;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', paddingBottom: '88px' }}>

      {/* Full-width banner hero */}
      {bannerUrl && (
        <div style={{ width: '100%', aspectRatio: '3/1', maxHeight: '300px', overflow: 'hidden' }}>
          <img
            src={bannerUrl}
            alt={p?.displayName ?? companyName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 20px 0' }}>

        {/* Avatar — only when no banner */}
        {!bannerUrl && p?.photoUrl && (
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
              alt={p?.displayName ?? companyName}
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
                  {(PLATFORM_SVG[link.platform] ?? (() => <span aria-hidden="true">↗</span>))()}
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
                  <IconPhone />
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
                  <IconWhatsApp />
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
                  <IconEmail />
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
