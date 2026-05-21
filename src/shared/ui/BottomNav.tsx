import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  end: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: '🏠', label: 'Inicio', end: true },
  { to: '/cart', icon: '🛒', label: 'Cotizar', end: true },
];

export function BottomNav() {
  return (
    <nav
      style={{
        backgroundColor: 'var(--pwa-card)',
        borderTop: '1px solid var(--pwa-text)15',
        color: 'var(--pwa-text)',
      }}
      className="fixed bottom-0 inset-x-0 z-20 h-16 flex items-center justify-around"
      aria-label="Navegación principal"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          style={({ isActive }) => ({
            color: isActive ? 'var(--pwa-accent)' : 'var(--pwa-text)',
            opacity: isActive ? 1 : 0.6,
          })}
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-medium"
        >
          <span className="text-xl leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
