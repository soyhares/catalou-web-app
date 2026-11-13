import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhatsAppProductConsultButton } from './WhatsAppProductConsultButton';

function messageOf(link: HTMLElement): string {
  return new URL(link.getAttribute('href')!).searchParams.get('text') ?? '';
}

describe('WhatsAppProductConsultButton', () => {
  it('includes the image URL in the message when imageUrl is provided', () => {
    render(
      <WhatsAppProductConsultButton
        productName="Widget A"
        whatsappNumber="50688001234"
        imageUrl="https://cdn.catalou.com/widget-a.jpg"
      />,
    );
    const link = screen.getByRole('link');
    const text = messageOf(link);
    expect(text).toContain('Widget A');
    expect(text).toContain('https://cdn.catalou.com/widget-a.jpg');
  });

  it('omits the image URL when imageUrl is not provided', () => {
    render(<WhatsAppProductConsultButton productName="Widget A" whatsappNumber="50688001234" />);
    const text = messageOf(screen.getByRole('link'));
    expect(text).toContain('Widget A');
    expect(text).not.toContain('http');
  });

  it('points to the business number on wa.me with an accessible name', () => {
    render(<WhatsAppProductConsultButton productName="Widget A" whatsappNumber="+506 8800-1234" />);
    const link = screen.getByRole('link', { name: 'Consultar por WhatsApp sobre Widget A' });
    const url = new URL(link.getAttribute('href')!);
    expect(url.origin + url.pathname).toBe('https://wa.me/50688001234');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('uses the WhatsApp exception palette with no inline styles', () => {
    render(<WhatsAppProductConsultButton productName="Widget A" whatsappNumber="50688001234" variant="primary" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('bg-[#25D366]');
    expect(link.className).toContain('text-[#0B3D20]');
    expect(link.className).toContain('min-h-[44px]');
    expect(link.getAttribute('style')).toBeNull();
    expect(link.querySelector('svg')?.getAttribute('fill')).toBe('currentColor');
  });

  it('renders nothing without a business number', () => {
    const { container } = render(<WhatsAppProductConsultButton productName="Widget A" whatsappNumber={null} />);
    expect(container.innerHTML).toBe('');
  });
});
