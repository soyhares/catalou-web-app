export function ProductGridCardSkeleton() {
  return (
    <div className="animate-pulse" style={{ maxWidth: '190px', margin: '0 auto', width: '100%' }}>
      <div
        className="w-full mb-2"
        style={{ aspectRatio: '1/1', borderRadius: 'var(--pwa-radius-md)', backgroundColor: 'var(--pwa-surface-secondary)' }}
      />
      <div className="h-4 rounded-sm mx-auto" style={{ backgroundColor: 'var(--pwa-surface-secondary)', width: '70%' }} />
    </div>
  );
}
