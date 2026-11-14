import { describe, it, expect } from 'vitest';
import {
  buildWaLink,
  buildMerchantNoticeMessage,
  buildMerchantNoticeLink,
  buildOrderInquiryMessage,
  type MerchantNotice,
} from './whatsapp-link';
import { formatPrice } from './formatPrice';

describe('buildWaLink', () => {
  it('arma el enlace wa.me con el número y el texto codificado', () => {
    expect(buildWaLink('50688001234', 'Hola')).toBe('https://wa.me/50688001234?text=Hola');
  });

  it('descarta todo lo que no sea dígito del número', () => {
    expect(buildWaLink('+506 8800-1234', 'Hola')).toBe('https://wa.me/50688001234?text=Hola');
  });

  it('codifica espacios, saltos de línea, acentos y caracteres reservados', () => {
    const text = 'Hola, quiero: Café & té?\nhttps://cdn.catalou.com/a.jpg#1';
    const href = buildWaLink('50688001234', text);
    const url = new URL(href);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/50688001234');
    expect(url.searchParams.get('text')).toBe(text);
    expect(href).not.toContain(' ');
    expect(href).not.toContain('\n');
  });

  it('no altera el texto vacío', () => {
    expect(buildWaLink('50688001234', '')).toBe('https://wa.me/50688001234?text=');
  });
});

const baseNotice: MerchantNotice = {
  merchantWhatsappE164: '50687654321',
  businessName: 'Panadería Demo',
  customerName: 'Ana Rodríguez',
  reference: 'ORD-7F3A21C9',
  total: 18500,
  currency: 'CRC',
  fulfillmentType: 'PICKUP',
  paymentTiming: 'UPFRONT',
  paymentMethod: 'SINPE_MOVIL',
};

describe('buildMerchantNoticeMessage (FR-016)', () => {
  it('arma el mensaje completo de un pedido por adelantado con SINPE Móvil', () => {
    expect(buildMerchantNoticeMessage(baseNotice)).toBe(
      'Hola, Panadería Demo. Soy Ana Rodríguez y acabo de hacer el pedido ORD-7F3A21C9 en tu catálogo.\n' +
        '\n' +
        `Total: ${formatPrice(18500, 'CRC')}\n` +
        'Retiro en el local.\n' +
        'Pago por SINPE Móvil, por adelantado. Te mando el comprobante por acá.',
    );
  });

  it('omite la línea de total cuando el negocio oculta precios (US2 AS5)', () => {
    const text = buildMerchantNoticeMessage({ ...baseNotice, total: null });
    expect(text).not.toContain('Total');
    expect(text).not.toContain('₡');
    const noTotal = buildMerchantNoticeMessage({ ...baseNotice, total: undefined });
    expect(noTotal).not.toContain('Total');
  });

  it('muestra el total en dólares cuando la moneda es USD', () => {
    expect(buildMerchantNoticeMessage({ ...baseNotice, total: 25, currency: 'USD' })).toContain(
      `Total: ${formatPrice(25, 'USD')}`,
    );
  });

  it('con envío y pago al recibir no pide comprobante', () => {
    const text = buildMerchantNoticeMessage({
      ...baseNotice,
      fulfillmentType: 'DELIVERY',
      paymentTiming: 'ON_DELIVERY',
      paymentMethod: 'BANK_TRANSFER',
    });
    expect(text).toContain('Envío a domicilio.');
    expect(text).toContain('Pago por transferencia bancaria, al recibir.');
    expect(text).not.toContain('comprobante');
  });

  it('en efectivo dice "Pago en efectivo" y no pide comprobante', () => {
    const text = buildMerchantNoticeMessage({
      ...baseNotice,
      paymentTiming: 'ON_DELIVERY',
      paymentMethod: 'CASH',
    });
    expect(text).toContain('Pago en efectivo, al recibir.');
    expect(text).not.toContain('comprobante');
  });

  it('pide el comprobante en transferencia por adelantado', () => {
    expect(
      buildMerchantNoticeMessage({ ...baseNotice, paymentMethod: 'BANK_TRANSFER' }),
    ).toContain('Pago por transferencia bancaria, por adelantado. Te mando el comprobante por acá.');
  });

  it('no lleva enlaces, datos de cuenta del negocio, emojis ni guion largo', () => {
    const text = buildMerchantNoticeMessage(baseNotice);
    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toContain('87654321');
    expect(text).not.toContain('—');
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });
});

describe('buildMerchantNoticeLink', () => {
  it('apunta al WhatsApp del negocio con el mensaje armado', () => {
    const href = buildMerchantNoticeLink(baseNotice);
    expect(href).not.toBeNull();
    const url = new URL(href!);
    expect(url.pathname).toBe('/50687654321');
    expect(url.searchParams.get('text')).toBe(buildMerchantNoticeMessage(baseNotice));
  });

  it('usa el número de respaldo cuando el aviso no trae uno', () => {
    const href = buildMerchantNoticeLink({ ...baseNotice, merchantWhatsappE164: null }, '50611112222');
    expect(new URL(href!).pathname).toBe('/50611112222');
  });

  it('devuelve null cuando el negocio no tiene WhatsApp válido', () => {
    expect(buildMerchantNoticeLink({ ...baseNotice, merchantWhatsappE164: null })).toBeNull();
    expect(buildMerchantNoticeLink({ ...baseNotice, merchantWhatsappE164: null }, null)).toBeNull();
  });
});

describe('buildOrderInquiryMessage', () => {
  it('nombra al negocio y la referencia', () => {
    expect(buildOrderInquiryMessage('Panadería Demo', 'ORD-7F3A21C9')).toBe(
      'Hola, Panadería Demo. Te escribo por el pedido ORD-7F3A21C9.',
    );
  });
});
