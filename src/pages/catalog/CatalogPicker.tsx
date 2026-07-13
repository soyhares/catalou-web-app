import type { PublicCategory } from '@entities/catalog/api';
import { catalogSubtitle } from './purpose';

interface CatalogPickerProps {
  catalogs: PublicCategory[];
  onSelect: (id: string) => void;
}

export function CatalogPicker({ catalogs, onSelect }: CatalogPickerProps) {
  return (
    <div style={{ padding: '8px 20px 24px' }}>
      {catalogs.map((c, i) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '18px 0',
            background: 'none',
            border: 'none',
            borderTop: i === 0 ? 'none' : '1px solid var(--pwa-border)',
            cursor: 'pointer',
            textAlign: 'left',
            minHeight: '44px',
          }}
        >
          <span>
            <span style={{ display: 'block', fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--pwa-text)', lineHeight: 1.15 }}>
              {c.name}
            </span>
            <span style={{ display: 'block', fontFamily: 'var(--pwa-font-body)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pwa-accent)', fontWeight: 600, marginTop: '3px' }}>
              {catalogSubtitle(c.purpose)}
            </span>
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--pwa-text-secondary)', flexShrink: 0 }} aria-hidden="true">
            <path d="M6.5 4L11.5 9L6.5 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}
