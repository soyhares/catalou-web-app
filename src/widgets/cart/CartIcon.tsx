import { useEffect, useState } from 'react';
import { cartItemCount } from '@shared/lib/cart-store';

interface CartIconProps {
  slug: string;
  onClick?: () => void;
}

export function CartIcon({ slug, onClick }: CartIconProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    cartItemCount(slug).then(setCount).catch(() => {});
  }, [slug]);

  useEffect(() => {
    function onUpdate() {
      cartItemCount(slug).then(setCount).catch(() => {});
    }
    window.addEventListener('cart-updated', onUpdate);
    return () => window.removeEventListener('cart-updated', onUpdate);
  }, [slug]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-white/20"
      aria-label={`Carrito (${count} artículos)`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-9-4h4"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
