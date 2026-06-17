import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@shared/ui/ThemeProvider';

interface HeroSectionProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export function HeroSection({ title, eyebrow, subtitle }: HeroSectionProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  if (theme === 'luxury-minimalism') {
    return (
      <section
        className="hero-section px-6 py-16 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, var(--pwa-bg) 0%, var(--pwa-surface-secondary) 100%)',
          color: 'var(--pwa-text)',
        }}
      >
        <motion.div
          className="relative z-10 max-w-lg mx-auto"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {eyebrow && (
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
              style={{ color: 'var(--pwa-accent)', fontFamily: 'var(--pwa-font-body)' }}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            variants={fadeUp}
            className="mb-4 font-bold"
            style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
              lineHeight: 1.15,
              color: 'var(--pwa-text)',
              fontStyle: 'italic',
            }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              variants={fadeUp}
              className="text-base mb-10 max-w-sm mx-auto"
              style={{ color: 'var(--pwa-text-secondary)', lineHeight: 1.7 }}
            >
              {subtitle}
            </motion.p>
          )}
          <motion.div variants={fadeUp} className="flex gap-3 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => void navigate('/catalog')}
              className="px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--pwa-accent)',
                color: '#FFFFFF',
                borderRadius: 'var(--pwa-radius-button)',
              }}
            >
              Ver catálogo
            </button>
            <button
              type="button"
              onClick={() => void navigate('/cart')}
              className="px-8 py-3 text-sm font-semibold border-2 transition-opacity hover:opacity-80"
              style={{
                borderColor: 'var(--pwa-accent)',
                color: 'var(--pwa-accent)',
                backgroundColor: 'transparent',
                borderRadius: 'var(--pwa-radius-button)',
              }}
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => void navigate('/book')}
              className="px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                borderColor: 'var(--pwa-accent)',
                color: 'var(--pwa-accent)',
                backgroundColor: 'transparent',
                borderRadius: 'var(--pwa-radius-button)',
                border: '2px solid var(--pwa-accent)',
              }}
            >
              Agendar cita
            </button>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  if (theme === 'modern-minimalism') {
    return (
      <section
        className="hero-section px-6 py-12"
        style={{ backgroundColor: 'var(--pwa-surface-secondary)', color: 'var(--pwa-text)' }}
      >
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <motion.div
            className="flex-1 text-left"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {eyebrow && (
              <motion.p
                variants={fadeUp}
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--pwa-accent)' }}
              >
                {eyebrow}
              </motion.p>
            )}
            <motion.h1
              variants={fadeUp}
              className="font-bold mb-3"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', lineHeight: 1.2, color: 'var(--pwa-text)' }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                variants={fadeUp}
                className="text-base mb-8"
                style={{ color: 'var(--pwa-text-secondary)', lineHeight: 1.65 }}
              >
                {subtitle}
              </motion.p>
            )}
            <motion.div variants={fadeUp} className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => void navigate('/catalog')}
                className="px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--pwa-accent)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--pwa-radius-button)',
                }}
              >
                Ver catálogo
              </button>
              <button
                type="button"
                onClick={() => void navigate('/cart')}
                className="px-6 py-2.5 text-sm font-semibold border transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--pwa-accent)',
                  color: 'var(--pwa-accent)',
                  backgroundColor: 'transparent',
                  borderRadius: 'var(--pwa-radius-button)',
                }}
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={() => void navigate('/book')}
                className="px-6 py-2.5 text-sm font-semibold border transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--pwa-accent)',
                  color: 'var(--pwa-accent)',
                  backgroundColor: 'transparent',
                  borderRadius: 'var(--pwa-radius-button)',
                }}
              >
                Agendar cita
              </button>
            </motion.div>
          </motion.div>
          <motion.div
            className="hidden md:flex flex-1 items-center justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          >
            <div
              className="w-64 h-48 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--pwa-border)' }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.35 }}>
                <rect x="5" y="12" width="30" height="23" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                <path d="M13 12V10C13 6.134 16.134 3 20 3C23.866 3 27 6.134 27 10V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // neo-luxury (default fallback)
  return (
    <section
      className="hero-section px-6 py-14 text-center"
      style={{
        background: 'linear-gradient(135deg, var(--pwa-bg) 0%, var(--pwa-surface-secondary) 100%)',
        color: 'var(--pwa-text)',
      }}
    >
      <motion.div
        className="max-w-lg mx-auto"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {eyebrow && (
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--pwa-accent)' }}
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.div variants={fadeUp} className="flex justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.6 }}>
            <path d="M18 3C18 3 6 10 6 21C6 27.627 11.373 33 18 33C24.627 33 30 27.627 30 21C30 10 18 3 18 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
            <path d="M18 33V15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M18 21C18 21 12 17 9 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M18 25C18 25 23 21 27 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="font-bold mb-3"
          style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontSize: 'clamp(1.9rem, 5vw, 2.8rem)',
            lineHeight: 1.2,
            color: 'var(--pwa-text)',
          }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            variants={fadeUp}
            className="text-base mb-8 max-w-sm mx-auto"
            style={{ color: 'var(--pwa-text-secondary)', lineHeight: 1.65 }}
          >
            {subtitle}
          </motion.p>
        )}
        <motion.div variants={fadeUp} className="flex gap-3 justify-center flex-wrap">
          <button
            type="button"
            onClick={() => void navigate('/catalog')}
            className="px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--pwa-accent)',
              color: '#FFFFFF',
              borderRadius: 'var(--pwa-radius-button)',
            }}
          >
            Ver catálogo
          </button>
          <button
            type="button"
            onClick={() => void navigate('/cart')}
            className="px-8 py-3 text-sm font-semibold border-2 transition-opacity hover:opacity-80"
            style={{
              borderColor: 'var(--pwa-accent)',
              color: 'var(--pwa-accent)',
              backgroundColor: 'transparent',
              borderRadius: 'var(--pwa-radius-button)',
            }}
          >
            Cotizar
          </button>
          <button
            type="button"
            onClick={() => void navigate('/book')}
            className="px-8 py-3 text-sm font-semibold border-2 transition-opacity hover:opacity-80"
            style={{
              borderColor: 'var(--pwa-accent)',
              color: 'var(--pwa-accent)',
              backgroundColor: 'transparent',
              borderRadius: 'var(--pwa-radius-button)',
            }}
          >
            Agendar cita
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
