import { useRef, type KeyboardEvent } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  /** Id del texto que describe el grupo (p. ej. un error). */
  describedBy?: string;
}

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * Estrellas como grupo de opciones (FR-046): `radiogroup` con 5 `radio` de 48px. Las llenas usan
 * el acento del negocio y las vacías el texto secundario, nunca un oro fijo (mockup 5).
 * Teclado: flechas para moverse y elegir, como un grupo de radios nativo.
 */
export function StarRating({ value, onChange, describedBy }: StarRatingProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusable = value >= 1 ? value : 1;

  function select(next: number) {
    const clamped = Math.min(5, Math.max(1, next));
    onChange(clamped);
    refs.current[clamped - 1]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, star: number) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      select(star === 5 ? 1 : star + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      select(star === 1 ? 5 : star - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      select(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      select(5);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Calificación de 1 a 5"
      aria-required="true"
      aria-describedby={describedBy}
      className="my-3.5 flex justify-center gap-1"
    >
      {STARS.map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            ref={(el) => {
              refs.current[star - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} de 5`}
            tabIndex={star === focusable ? 0 : -1}
            onClick={() => onChange(star)}
            onKeyDown={(e) => onKeyDown(e, star)}
            className={`flex h-12 w-12 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pwa-text)] ${filled ? 'text-[var(--pwa-accent)]' : 'text-[var(--pwa-text-secondary)]'}`}
          >
            <svg
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill={filled ? 'currentColor' : 'none'}
              aria-hidden="true"
              focusable="false"
              className="h-[34px] w-[34px]"
            >
              <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
