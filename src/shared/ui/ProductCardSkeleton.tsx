export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div
        className="w-full mb-3"
        style={{ aspectRatio: '3/4', backgroundColor: 'var(--pwa-surface-secondary)' }}
      />
      <div className="h-4 rounded-sm mb-1.5" style={{ backgroundColor: 'var(--pwa-surface-secondary)', width: '80%' }} />
      <div className="h-3 rounded-sm" style={{ backgroundColor: 'var(--pwa-surface-secondary)', width: '45%' }} />
    </div>
  );
}
