interface CatalogSearchBarProps {
  value: string;
  onChange: (q: string) => void;
}

export function CatalogSearchBar({ value, onChange }: CatalogSearchBarProps) {
  return (
    <div style={{ padding: '10px 20px' }}>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar"
        aria-label="Buscar en el catálogo"
        className="catalog-search-input"
        style={{
          width: '100%',
          height: '44px',
          padding: '0 16px',
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '14px',
          color: 'var(--pwa-text)',
          backgroundColor: 'var(--pwa-surface)',
          border: '1.5px solid var(--pwa-border)',
          borderRadius: 'var(--pwa-radius-md)',
          outline: 'none',
        }}
      />
    </div>
  );
}
