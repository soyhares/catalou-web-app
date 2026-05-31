interface CategoryChipProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

export function CategoryChip({ label, active, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center whitespace-nowrap transition-all duration-200 group"
      style={{
        fontFamily: 'var(--pwa-font-body)',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: active ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
        padding: '6px 0',
        opacity: active ? 1 : 0.55,
        background: 'none',
        border: 'none',
      }}
    >
      {label}
      {/* Animated underline — only gold when active */}
      <span
        className="absolute bottom-0 left-0 h-[1px] transition-all duration-300"
        style={{
          backgroundColor: 'var(--pwa-accent)',
          width: active ? '100%' : '0%',
        }}
      />
    </button>
  );
}
