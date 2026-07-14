export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse flex items-center" style={{ gap: '14px' }}>
      <div
        className="flex-shrink-0"
        style={{ width: '96px', height: '96px', borderRadius: 'var(--pwa-radius-md)', backgroundColor: 'var(--pwa-surface-secondary)' }}
      />
      <div className="flex-1 min-w-0">
        <div className="h-4 rounded-sm mb-2" style={{ backgroundColor: 'var(--pwa-surface-secondary)', width: '70%' }} />
        <div className="h-3 rounded-sm mb-1.5" style={{ backgroundColor: 'var(--pwa-surface-secondary)', width: '90%' }} />
        <div className="h-3 rounded-sm" style={{ backgroundColor: 'var(--pwa-surface-secondary)', width: '35%' }} />
      </div>
    </div>
  );
}
