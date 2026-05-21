import { useBranding } from '@app/BrandingContext';

interface PwaTopBarProps {
  showSearch?: boolean;
  onSearchClick?: () => void;
}

export function PwaTopBar({ showSearch, onSearchClick }: PwaTopBarProps) {
  const { branding } = useBranding();

  return (
    <header
      style={{
        backgroundColor: 'var(--pwa-card)',
        color: 'var(--pwa-text)',
        borderBottom: '1px solid var(--pwa-text)15',
      }}
      className="sticky top-0 z-10 h-14 flex items-center gap-3 px-4"
    >
      {branding.logoUrl ? (
        <img
          src={branding.logoUrl}
          alt={branding.companyName}
          className="h-8 w-auto object-contain flex-shrink-0"
        />
      ) : (
        <div
          style={{
            backgroundColor: 'var(--pwa-accent)',
            color: '#FFFFFF',
          }}
          className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        >
          {branding.companyName.charAt(0).toUpperCase()}
        </div>
      )}
      <span
        style={{ color: 'var(--pwa-text)' }}
        className="flex-1 min-w-0 font-semibold text-sm truncate"
      >
        {branding.companyName}
      </span>
      {showSearch && (
        <button
          type="button"
          onClick={onSearchClick}
          style={{ color: 'var(--pwa-text)' }}
          className="opacity-60 hover:opacity-100 transition-opacity p-1"
          aria-label="Buscar"
        >
          🔍
        </button>
      )}
    </header>
  );
}
