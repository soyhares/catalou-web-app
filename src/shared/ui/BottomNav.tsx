import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M2 9.5L11 2L20 9.5V19.5C20 20.05 19.55 20.5 19 20.5H14V15H8V20.5H3C2.45 20.5 2 20.05 2 19.5V9.5Z"
        stroke="currentColor"
        strokeWidth={active ? 1.4 : 1.2}
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function IconPerson({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="7" r="4" stroke="currentColor" strokeWidth={active ? 1.4 : 1.2} fill="none"/>
      <path
        d="M2 20C2 16.134 6.03 13 11 13C15.97 13 20 16.134 20 20"
        stroke="currentColor"
        strokeWidth={active ? 1.4 : 1.2}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

interface NavItem {
  to: string;
  label: string;
  end: boolean;
  Icon: (props: { active: boolean }) => React.ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/catalog', label: 'Inicio', end: false, Icon: IconHome },
  { to: '/about', label: 'Contacto', end: true, Icon: IconPerson },
];

// showAbout kept for backward compatibility — ignored, Contacto is always visible
export function BottomNav({ showAbout: _showAbout }: { showAbout?: boolean } = {}) {
  const location = useLocation();

  function isActive(item: NavItem): boolean {
    return item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 h-[68px] flex items-stretch"
      style={{
        backgroundColor: 'var(--pwa-card)',
        borderTop: '1px solid var(--pwa-border)',
      }}
      aria-label="Navegación principal"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="relative flex-1 flex flex-col items-center justify-center gap-1"
            style={{ color: active ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)' }}
          >
            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="nav-hairline"
                  className="absolute top-0 h-[1.5px]"
                  style={{
                    backgroundColor: 'var(--pwa-accent)',
                    left: '20%',
                    right: '20%',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                />
              )}
            </AnimatePresence>

            <item.Icon active={active} />

            <span
              className="uppercase tracking-[0.12em] leading-none"
              style={{
                fontSize: '8px',
                fontFamily: 'var(--pwa-font-body)',
                opacity: active ? 1 : 0.5,
              }}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
