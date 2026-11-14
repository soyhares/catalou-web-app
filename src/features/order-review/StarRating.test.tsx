import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from './StarRating';

function Harness({ initial = 0, onChange = () => undefined }: { initial?: number; onChange?: (n: number) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <StarRating
      value={value}
      onChange={(n) => {
        setValue(n);
        onChange(n);
      }}
    />
  );
}

describe('StarRating', () => {
  it('es un radiogroup con 5 radios rotulados "N de 5"', () => {
    render(<Harness />);
    const group = screen.getByRole('radiogroup', { name: 'Calificación de 1 a 5' });
    expect(group).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    radios.forEach((radio, i) => {
      expect(radio.getAttribute('aria-label')).toBe(`${i + 1} de 5`);
      expect(radio.getAttribute('aria-checked')).toBe('false');
      expect(radio.className).toContain('h-12');
      expect(radio.className).toContain('w-12');
      expect(radio.getAttribute('style')).toBeNull();
    });
  });

  it('al tocar una estrella la marca y llena las anteriores con el acento', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '4 de 5' }));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole('radio', { name: '4 de 5' }).getAttribute('aria-checked')).toBe('true');
    const radios = screen.getAllByRole('radio');
    expect(radios.slice(0, 4).every((r) => r.className.includes('text-[var(--pwa-accent)]'))).toBe(true);
    expect(radios[4].className).toContain('text-[var(--pwa-text-secondary)]');
    expect(radios[3].querySelector('svg')?.getAttribute('fill')).toBe('currentColor');
    expect(radios[4].querySelector('svg')?.getAttribute('fill')).toBe('none');
  });

  it('solo un radio es tabulable y las flechas cambian la selección', () => {
    render(<Harness initial={2} />);
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, 0, -1, -1, -1]);
    fireEvent.keyDown(radios[1], { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: '3 de 5' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(screen.getByRole('radio', { name: '3 de 5' }), { key: 'Home' });
    expect(screen.getByRole('radio', { name: '1 de 5' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(screen.getByRole('radio', { name: '1 de 5' }), { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: '5 de 5' }).getAttribute('aria-checked')).toBe('true');
  });
});
