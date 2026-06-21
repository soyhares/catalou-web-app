export function IconCheck() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M8 14.5L12 18.5L20 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconWarning() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3L26 24H2L14 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
      <path d="M14 11V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="20" r="1" fill="currentColor"/>
    </svg>
  );
}

export function IconX() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M9 9L19 19M19 9L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconClock() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M14 8V14L18 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface StatusBlockProps {
  icon: React.ReactElement;
  color: string;
  title: string;
  message: string;
}

export function StatusBlock({ icon, color, title, message }: StatusBlockProps) {
  return (
    <div className="text-center py-4">
      <div className="flex justify-center mb-4" style={{ color }}>
        {icon}
      </div>
      <h1
        style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontStyle: 'italic',
          fontSize: '1.3rem',
          color: 'var(--pwa-text)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h1>
      <p className="text-sm" style={{ color: 'var(--pwa-text)', opacity: 0.6, lineHeight: 1.6 }}>
        {message}
      </p>
    </div>
  );
}
