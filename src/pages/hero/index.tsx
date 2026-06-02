import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBranding } from '@app/BrandingContext';
import { useTheme } from '@shared/ui/ThemeProvider';

const AUTO_ADVANCE_MS = 1500;

/* ── Animation helpers ───────────────────────────────────────────────────── */

function fi(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const, delay },
  };
}

function fis(delay: number) {
  return {
    initial: { opacity: 0, scale: 0.88 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const, delay },
  };
}

/* ── Progressive fill button ─────────────────────────────────────────────── */

function ProgressButton({
  onEnter,
  fillColor,
  style,
  children,
}: {
  onEnter: () => void;
  fillColor: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      {...fi(0.42)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={onEnter}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', ...style }}
    >
      {/* Progressive fill that sweeps left → right over AUTO_ADVANCE_MS */}
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear', delay: 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: fillColor,
          transformOrigin: 'left center',
          pointerEvents: 'none',
        }}
      />
      {/* Label stays on top */}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </motion.button>
  );
}

/* ── Powered by Catalou ──────────────────────────────────────────────────── */

function PoweredBy({ style }: { style?: React.CSSProperties }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      style={{
        padding: '20px',
        textAlign: 'center',
        fontSize: '9px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        userSelect: 'none' as const,
        ...style,
      }}
    >
      Powered by <span style={{ fontWeight: 700 }}>Catalou</span>
    </motion.p>
  );
}

/* ── luxury-minimalism ───────────────────────────────────────────────────── */

function LuxuryHero({ companyName, onEnter }: { companyName: string; onEnter: () => void }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        textAlign: 'center',
      }}>
        <motion.h1 {...fis(0.05)} style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontStyle: 'italic',
          fontSize: 'clamp(2.4rem, 8vw, 4rem)',
          fontWeight: 400,
          color: 'var(--pwa-text)',
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          margin: '0 0 28px',
        }}>
          {companyName}
        </motion.h1>

        <motion.p {...fi(0.2)} style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '9px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.28em',
          color: 'var(--pwa-accent)',
          fontWeight: 600,
          marginBottom: '16px',
        }}>
          Catálogo
        </motion.p>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '48px', opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 }}
          style={{ height: '1px', backgroundColor: 'var(--pwa-accent)', marginBottom: '44px' }}
        />

        <ProgressButton
          onEnter={onEnter}
          fillColor="var(--pwa-accent-soft)"
          style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '10px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.22em',
            fontWeight: 600,
            color: 'var(--pwa-accent)',
            background: 'none',
            border: '1px solid var(--pwa-accent)',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '14px 36px',
          }}
        >
          Explorar la colección
        </ProgressButton>
      </div>

      <PoweredBy style={{ color: 'var(--pwa-text-secondary)', opacity: 0.35, fontFamily: 'var(--pwa-font-body)' }} />
    </div>
  );
}

/* ── neo-luxury ──────────────────────────────────────────────────────────── */

function NeoHero({ companyName, onEnter }: { companyName: string; onEnter: () => void }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        textAlign: 'center',
      }}>
        <motion.p
          initial={{ opacity: 0, letterSpacing: '1em' }}
          animate={{ opacity: 0.7, letterSpacing: '0.6em' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0 }}
          style={{ color: 'var(--pwa-accent)', fontSize: '10px', marginBottom: '32px' }}
          aria-hidden="true"
        >
          ✦ ✦ ✦
        </motion.p>

        <motion.h1 {...fis(0.1)} style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontSize: 'clamp(2.2rem, 8vw, 3.8rem)',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--pwa-accent) 0%, var(--pwa-text) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.03em',
          lineHeight: 1.1,
          margin: '0 0 20px',
        }}>
          {companyName}
        </motion.h1>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '56px', opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.28 }}
          style={{
            height: '1px',
            backgroundColor: 'var(--pwa-accent)',
            boxShadow: '0 0 8px var(--pwa-accent)',
            marginBottom: '44px',
          }}
        />

        <ProgressButton
          onEnter={onEnter}
          fillColor="rgba(255,255,255,0.18)"
          style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '11px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.2em',
            fontWeight: 700,
            color: 'var(--pwa-on-accent)',
            backgroundColor: 'var(--pwa-accent)',
            border: 'none',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '16px 40px',
            boxShadow: '0 0 24px var(--pwa-accent)',
          }}
        >
          Entrar al catálogo
        </ProgressButton>
      </div>

      <PoweredBy style={{ color: 'var(--pwa-accent)', opacity: 0.4, fontFamily: 'var(--pwa-font-body)' }} />
    </div>
  );
}

/* ── modern-minimalism ───────────────────────────────────────────────────── */

function ModernHero({ companyName, onEnter }: { companyName: string; onEnter: () => void }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.05 }}
          style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontSize: 'clamp(2.2rem, 8vw, 3.2rem)',
            fontWeight: 700,
            color: 'var(--pwa-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: '0 0 12px',
          }}
        >
          {companyName}
        </motion.h1>

        <motion.p {...fi(0.2)} style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--pwa-text-secondary)',
          marginBottom: '44px',
        }}>
          Catálogo de productos
        </motion.p>

        <ProgressButton
          onEnter={onEnter}
          fillColor="rgba(255,255,255,0.18)"
          style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--pwa-on-accent)',
            backgroundColor: 'var(--pwa-accent)',
            border: 'none',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '14px 40px',
            width: '100%',
            maxWidth: '280px',
          }}
        >
          Ver productos
        </ProgressButton>
      </div>

      <PoweredBy style={{ color: 'var(--pwa-text-secondary)', opacity: 0.35, fontFamily: 'var(--pwa-font-body)' }} />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function HeroPage() {
  const { branding } = useBranding();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const onEnter = useCallback(() => navigate('/catalog'), [navigate]);

  // Auto-advance if user doesn't interact — timer starts after button fill completes
  useEffect(() => {
    const id = setTimeout(onEnter, AUTO_ADVANCE_MS + 500);
    return () => clearTimeout(id);
  }, [onEnter]);

  const companyName = branding.companyName;

  if (theme === 'luxury-minimalism') {
    return <LuxuryHero companyName={companyName} onEnter={onEnter} />;
  }
  if (theme === 'neo-luxury') {
    return <NeoHero companyName={companyName} onEnter={onEnter} />;
  }
  return <ModernHero companyName={companyName} onEnter={onEnter} />;
}
