import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
}

export function HeroSection({ title, eyebrow, subtitle }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section
      style={{ backgroundColor: 'var(--pwa-bg)', color: 'var(--pwa-text)' }}
      className="px-4 py-12 text-center"
    >
      {eyebrow && (
        <p
          style={{ color: 'var(--pwa-accent)' }}
          className="text-xs font-semibold uppercase tracking-widest mb-3"
        >
          {eyebrow}
        </p>
      )}
      <h1
        style={{ color: 'var(--pwa-text)' }}
        className="text-3xl font-bold mb-3"
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{ color: 'var(--pwa-text)', opacity: 0.7 }}
          className="text-base mb-8 max-w-sm mx-auto"
        >
          {subtitle}
        </p>
      )}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          type="button"
          onClick={() => void navigate('/')}
          style={{ backgroundColor: 'var(--pwa-accent)', color: '#FFFFFF' }}
          className="px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
        >
          Ver catálogo
        </button>
        <button
          type="button"
          onClick={() => void navigate('/cart')}
          style={{
            borderColor: 'var(--pwa-accent)',
            color: 'var(--pwa-accent)',
            backgroundColor: 'transparent',
          }}
          className="px-6 py-2.5 rounded-full text-sm font-semibold border-2 transition-opacity hover:opacity-80"
        >
          Cotizar
        </button>
      </div>
    </section>
  );
}
