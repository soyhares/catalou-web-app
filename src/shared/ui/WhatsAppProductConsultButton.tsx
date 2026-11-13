import { buildWaLink } from '@shared/lib/whatsapp-link';
import { WhatsAppButton } from './WhatsAppButton';

interface Props {
  productName: string;
  /** Número de WhatsApp del negocio (dígitos E.164). Sin número no se muestra nada. */
  whatsappNumber: string | null;
  imageUrl?: string | null;
  variant?: 'primary' | 'secondary';
}

function buildProductConsultMessage(productName: string, imageUrl?: string | null): string {
  return imageUrl
    ? `Hola, me interesa conocer más sobre: ${productName}\n${imageUrl}`
    : `Hola, me interesa conocer más sobre: ${productName}`;
}

export function WhatsAppProductConsultButton({ productName, whatsappNumber, imageUrl, variant = 'secondary' }: Props) {
  if (!whatsappNumber) return null;

  const href = buildWaLink(whatsappNumber, buildProductConsultMessage(productName, imageUrl));
  const isPrimary = variant === 'primary';

  return (
    <div className={isPrimary ? 'mb-8' : 'mb-4 mt-1 border-t border-[var(--pwa-border)] pt-4'}>
      <WhatsAppButton
        href={href}
        ariaLabel={`Consultar por WhatsApp sobre ${productName}`}
        size={isPrimary ? 'lg' : 'md'}
      >
        Consultar por WhatsApp
      </WhatsAppButton>
    </div>
  );
}
