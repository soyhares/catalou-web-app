import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavItem {
  to: string;
  icon: string;
  labelKey: string;
  end: boolean;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { to: '/', icon: '🏠', labelKey: 'catalog.navLabel', end: true },
  { to: '/cart', icon: '🛒', labelKey: 'cart.navLabel', end: true },
];

const ABOUT_NAV_ITEM: NavItem = { to: '/about', icon: '👤', labelKey: 'about.navLabel', end: true };

interface BottomNavProps {
  showAbout?: boolean;
}

export function BottomNav({ showAbout = false }: BottomNavProps) {
  const { t } = useTranslation();
  const items = showAbout ? [...BASE_NAV_ITEMS, ABOUT_NAV_ITEM] : BASE_NAV_ITEMS;

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
      {items.map((item) => (
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
          <span>{t(item.labelKey, item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
