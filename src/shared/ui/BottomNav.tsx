import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@shared/lib/use-cart';
import { useBranding } from '@app/BrandingContext';

/* ── Thin-stroke SVG icons ─────────────────────────────────────────────── */

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

function IconBag({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="7.5" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth={active ? 1.4 : 1.2} fill="none"/>
      <path
        d="M7.5 7.5V6C7.5 3.515 9.015 2 11 2C12.985 2 14.5 3.515 14.5 6V7.5"
        stroke="currentColor"
        strokeWidth={active ? 1.4 : 1.2}
        strokeLinecap="round"
        fill="none"
      />
      <AnimatePresence>
        {active && (
          <motion.circle
            cx="11" cy="13.5" r="1.5"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
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
  labelKey: string;
  end: boolean;
  Icon: (props: { active: boolean }) => React.ReactElement;
  isCart?: boolean;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'catalog.navLabel', end: true, Icon: IconHome },
  { to: '/cart', labelKey: 'cart.navLabel', end: true, Icon: IconBag, isCart: true },
];

const ABOUT_NAV_ITEM: NavItem = {
  to: '/about',
  labelKey: 'about.navLabel',
  end: true,
  Icon: IconPerson,
};

interface BottomNavProps {
  showAbout?: boolean;
}

export function BottomNav({ showAbout = false }: BottomNavProps) {
  const { t } = useTranslation();
  const { slug } = useBranding();
  const { items: cartItems } = useCart(slug);
  const location = useLocation();
  const navItems = showAbout ? [...BASE_NAV_ITEMS, ABOUT_NAV_ITEM] : BASE_NAV_ITEMS;
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

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
      {navItems.map((item) => {
        const active = isActive(item);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="relative flex-1 flex flex-col items-center justify-center gap-1"
            style={{ color: active ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)' }}
          >
            {/* Gold hairline indicator */}
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

            {/* Icon with cart badge */}
            <span className="relative">
              <item.Icon active={active} />
              {item.isCart && (
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      className="absolute -top-1 -right-1.5 text-white text-[9px] font-semibold flex items-center justify-center rounded-full"
                      style={{
                        backgroundColor: 'var(--pwa-accent)',
                        minWidth: '15px',
                        height: '15px',
                        lineHeight: 1,
                        padding: '0 3px',
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
            </span>

            {/* Label — all caps, ultra fine tracking */}
            <span
              className="uppercase tracking-[0.12em] leading-none"
              style={{
                fontSize: '8px',
                fontFamily: 'var(--pwa-font-body)',
                opacity: active ? 1 : 0.5,
              }}
            >
              {t(item.labelKey, item.labelKey)}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
