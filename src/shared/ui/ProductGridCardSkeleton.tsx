export function ProductGridCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div
        className="w-full mb-2"
        style={{ aspectRatio: '1/1', borderRadius: 'var(--pwa-radius-md)', backgroundColor: 'var(--pwa-surface-secondary)' }}
      />
      <div className="h-4 rounded-sm mx-auto" style={{ backgroundColor: 'var(--pwa-surface-secondary)', width: '70%' }} />
    </div>
  );
}
