import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Props {
  id: string;
  name: string;
  durationMinutes: number;
  basePrice: number | null;
  showPrices: boolean;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function ServiceCard({ id, name, durationMinutes, basePrice, showPrices, selected, onToggle }: Props) {
  const { t } = useTranslation();

  return (
    <div
      role="group"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '14px 16px',
        border: selected ? '2px solid var(--pwa-accent)' : '1.5px solid var(--pwa-border)',
        borderRadius: '12px',
        background: selected
          ? 'color-mix(in srgb, var(--pwa-accent) 6%, var(--pwa-bg))'
          : 'var(--pwa-bg)',
        transition: 'border-color 0.15s, background 0.15s',
        boxSizing: 'border-box',
      }}
    >
      {/* Checkbox toggle */}
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-pressed={selected}
        aria-label={name}
        style={{
          flexShrink: 0,
          width: '22px',
          height: '22px',
          borderRadius: '6px',
          border: selected ? 'none' : '1.5px solid var(--pwa-border)',
          background: selected ? 'var(--pwa-accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {selected && (
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true">
            <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Text — clicking también activa el toggle */}
      <button
        type="button"
        onClick={() => onToggle(id)}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: 'var(--pwa-text)', marginBottom: '2px' }}>
          {name}
        </span>
        <span style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--pwa-muted)' }}>
          <span>{durationMinutes} min</span>
          {showPrices && basePrice !== null && <span>${Number(basePrice).toFixed(2)}</span>}
        </span>
      </button>

      {/* Link al detalle del catálogo */}
      <Link
        to={`/products/${id}`}
        className="shrink-0 text-[12px] text-[var(--pwa-accent)] no-underline font-medium whitespace-nowrap"
        aria-label={t('booking.viewDetails', { name })}
      >
        {t('booking.viewDetails')} →
      </Link>
    </div>
  );
}
