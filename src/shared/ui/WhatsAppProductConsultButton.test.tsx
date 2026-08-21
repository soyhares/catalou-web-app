import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WhatsAppProductConsultButton } from './WhatsAppProductConsultButton';

vi.mock('@app/BrandingContext', () => ({
  useBranding: () => ({ slug: 'test-tenant', branding: { businessModel: 'DIRECT' } }),
}));
vi.mock('@entities/shopper-profile/api', () => ({
  getCatalogProfile: vi.fn().mockResolvedValue({ whatsappNumber: '50688001234' }),
}));

describe('WhatsAppProductConsultButton', () => {
  it('includes the image URL in the message when imageUrl is provided', async () => {
    render(<WhatsAppProductConsultButton productName="Widget A" imageUrl="https://cdn.catalou.com/widget-a.jpg" />);
    const link = await waitFor(() => screen.getByRole('link'));
    const text = decodeURIComponent(new URL(link.getAttribute('href')!).search);
    expect(text).toContain('Widget A');
    expect(text).toContain('https://cdn.catalou.com/widget-a.jpg');
  });

  it('omits the image URL when imageUrl is not provided', async () => {
    render(<WhatsAppProductConsultButton productName="Widget A" />);
    const link = await waitFor(() => screen.getByRole('link'));
    const text = decodeURIComponent(new URL(link.getAttribute('href')!).search);
    expect(text).toContain('Widget A');
    expect(text).not.toContain('http');
  });
});
