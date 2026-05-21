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
      style={
        active
          ? { backgroundColor: 'var(--pwa-accent)', color: '#FFFFFF', border: 'none' }
          : {
              backgroundColor: 'var(--pwa-card)',
              color: 'var(--pwa-text)',
              border: '1px solid var(--pwa-text)30',
            }
      }
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80 whitespace-nowrap"
    >
      {label}
    </button>
  );
}
