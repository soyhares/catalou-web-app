import type { PublicCategory } from '@entities/catalog/api';
import { useTheme } from '@shared/ui/ThemeProvider';
import { catalogSubtitle } from './purpose';

interface CatalogPickerProps {
  catalogs: PublicCategory[];
  onSelect: (id: string) => void;
}

function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 7V5.5C7 3.567 8.567 2 10.5 2C12.433 2 14 3.567 14 5.5V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="14" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 8.5H17" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 2.5V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M13.5 2.5V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 9V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="10" cy="6.3" r="0.9" fill="currentColor" />
    </svg>
  );
}

function purposeIcon(purpose: PublicCategory['purpose']) {
  if (purpose === 'menu') return <IconBag />;
  if (purpose === 'services') return <IconCalendar />;
  return <IconInfo />;
}

export function CatalogPicker({ catalogs, onSelect }: CatalogPickerProps) {
  const { isMobile } = useTheme();

  return (
    <div
      style={{
        padding: isMobile ? '16px 20px 24px' : '32px 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: isMobile ? '10px' : '20px',
        maxWidth: isMobile ? undefined : '900px',
        margin: isMobile ? undefined : '0 auto',
      }}
    >
      {catalogs.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: isMobile ? 'center' : undefined,
            flexDirection: isMobile ? 'row' : 'column',
            textAlign: isMobile ? 'left' : 'center',
            gap: isMobile ? '14px' : undefined,
            padding: isMobile ? '16px 14px' : '28px 20px',
            backgroundColor: 'var(--pwa-surface)',
            borderRadius: 'var(--pwa-radius-md)',
            border: 'none',
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          <div
            style={{
              width: isMobile ? '44px' : '56px',
              height: isMobile ? '44px' : '56px',
              borderRadius: isMobile ? '12px' : '14px',
              backgroundColor: 'var(--pwa-accent-soft)',
              color: 'var(--pwa-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginBottom: isMobile ? 0 : '16px',
            }}
          >
            {purposeIcon(c.purpose)}
          </div>
          <div style={{ flex: isMobile ? 1 : undefined, minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: isMobile ? '1.15rem' : '1.3rem', color: 'var(--pwa-text)', lineHeight: 1.15 }}>
              {c.name}
            </span>
            <span style={{ display: 'block', fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 700, marginTop: '4px' }}>
              {catalogSubtitle(c.purpose)}
            </span>
          </div>
          {isMobile && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--pwa-text-secondary)', flexShrink: 0 }} aria-hidden="true">
              <path d="M6.5 4L11.5 9L6.5 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
