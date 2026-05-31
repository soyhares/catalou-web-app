import { useBranding } from '@app/BrandingContext';
import { useScrollY } from '@shared/hooks/useScrollY';

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

interface PwaTopBarProps {
  showSearch?: boolean;
  onSearchClick?: () => void;
}

export function PwaTopBar({ showSearch, onSearchClick }: PwaTopBarProps) {
  const { branding } = useBranding();
  const scrolled = useScrollY(48);

  return (
    <header
      className={`pwa-topbar sticky top-0 z-10 h-14 flex items-center gap-3 px-4 border-b${scrolled ? ' pwa-topbar--glass' : ''}`}
      style={{
        backgroundColor: scrolled ? undefined : 'var(--pwa-card)',
        color: 'var(--pwa-text)',
        borderBottomColor: 'var(--pwa-border)',
      }}
    >
      {branding.logoUrl ? (
        <img
          src={branding.logoUrl}
          alt={branding.companyName}
          className="h-8 w-auto object-contain flex-shrink-0"
        />
      ) : (
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: 'var(--pwa-accent)', color: '#FFFFFF' }}
        >
          {branding.companyName.charAt(0).toUpperCase()}
        </div>
      )}

      <span
        className="flex-1 min-w-0 font-semibold text-sm truncate"
        style={{ color: 'var(--pwa-text)' }}
      >
        {branding.companyName}
      </span>

      {showSearch && (
        <button
          type="button"
          onClick={onSearchClick}
          className="opacity-60 hover:opacity-100 transition-opacity p-1"
          style={{ color: 'var(--pwa-text)' }}
          aria-label="Buscar"
        >
          <IconSearch />
        </button>
      )}
    </header>
  );
}
