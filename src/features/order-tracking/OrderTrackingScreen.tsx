import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { OrderTracking } from '@entities/order/tracking-api';
import { WhatsAppButton } from '@shared/ui/WhatsAppButton';
import { IconCheck } from '@shared/ui/confirmation-page-icons';
import {
  buildMerchantNoticeLink,
  buildOrderInquiryMessage,
  buildWaLink,
} from '@shared/lib/whatsapp-link';
import { orderStatusLabel } from '@entities/order/status-labels';
import type { OrderTrackingLoad } from './useOrderTracking';
import { buildTrackingTimeline } from './timeline';
import { TrackingTimeline } from './TrackingTimeline';
import { PaymentCard } from './PaymentCard';
import { PaymentInstructionsBlock } from './PaymentInstructionsBlock';
import { OrderItemsList } from './OrderItemsList';
import { IconMessage } from './icons';
import { fulfillmentLabel, landingTotal } from './payment';

/**
 * SPEC-023 (T076): la página del pedido en `/pedido/:token`.
 *
 * En Recibido es el aterrizaje después de pedir (D37, FR-013): sobrevive a la recarga al volver
 * de WhatsApp y muestra el botón de aviso, que abre WhatsApp solo con el toque de la persona
 * (FR-017). Después es el seguimiento: línea de tiempo y tarjeta de pago separadas (FR-031).
 * Nunca muestra el aviso de modelo Asociado: los pedidos con seguimiento son Directos (FR-047).
 */

interface OrderTrackingScreenProps {
  load: OrderTrackingLoad;
  onRetry: () => void;
  /** Ruta de la valoración de este pedido. */
  reviewPath: string;
}

const page = 'min-h-screen bg-[var(--pwa-bg)] px-6 pb-28 pt-8 font-[family-name:var(--pwa-font-body)] text-[var(--pwa-text)]';
const column = 'mx-auto max-w-[520px]';
const heading = 'font-[family-name:var(--pwa-font-heading)] font-normal italic text-[var(--pwa-text)]';
const muted = 'text-[var(--pwa-text-secondary)]';
const card = 'mb-2.5 rounded-[var(--pwa-radius-md)] border border-[var(--pwa-border)] bg-[var(--pwa-card)] p-3';
const outlineButton =
  'flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[var(--pwa-radius-button)] border-[1.5px] border-[var(--pwa-border)] bg-transparent px-4 py-3 text-sm font-bold text-[var(--pwa-text)] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pwa-text)]';
const accentButton =
  'flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[var(--pwa-radius-button)] bg-[var(--pwa-accent)] px-4 py-3 text-sm font-bold text-[var(--pwa-on-accent)] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pwa-text)]';

export function OrderTrackingScreen({ load, onRetry, reviewPath }: OrderTrackingScreenProps) {
  return (
    <main className={page}>
      {/* FR-035: la página del pedido no se indexa. React 19 lo sube al <head>. */}
      <meta name="robots" content="noindex, nofollow" />
      <div className={column}>{renderLoad(load, onRetry, reviewPath)}</div>
    </main>
  );
}

function renderLoad(load: OrderTrackingLoad, onRetry: () => void, reviewPath: string): ReactNode {
  switch (load.kind) {
    case 'loading':
      return (
        <div aria-busy="true" aria-live="polite" className="pt-10">
          <span className="sr-only">Cargando tu pedido</span>
          <div className="mx-auto mb-3 h-6 w-2/3 animate-pulse rounded bg-[var(--pwa-border)]" />
          <div className="mx-auto mb-6 h-4 w-1/2 animate-pulse rounded bg-[var(--pwa-border)]" />
          <div className="h-32 animate-pulse rounded-[var(--pwa-radius-md)] bg-[var(--pwa-border)]" />
        </div>
      );
    case 'not-found':
      return (
        <MessageState
          title="No encontramos este pedido"
          body="Revisá que el enlace esté completo, tal como te llegó."
        />
      );
    case 'rate-limited':
      return (
        <MessageState
          title="Hiciste muchos intentos seguidos"
          body="Esperá unos minutos y volvé a abrir el enlace."
        />
      );
    case 'error':
      return (
        <MessageState title="No pudimos cargar tu pedido" body="Revisá tu conexión e intentá de nuevo.">
          <button type="button" onClick={onRetry} className={`${accentButton} mt-6`}>
            Intentar de nuevo
          </button>
        </MessageState>
      );
    case 'ready':
      return load.data.status === 'PENDING' ? (
        <ReceivedLanding tracking={load.data} />
      ) : (
        <TrackingDetail tracking={load.data} reviewPath={reviewPath} />
      );
  }
}

function MessageState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="pt-12 text-center">
      <h1 className={`${heading} mb-2 text-2xl`}>{title}</h1>
      <p className={`${muted} m-0 text-sm`}>{body}</p>
      {children}
      <Link to="/catalog" className={`${outlineButton} mt-3`}>
        Ir al catálogo
      </Link>
    </div>
  );
}

function currencyOf(tracking: OrderTracking): 'USD' | 'CRC' {
  return (tracking.amounts?.currency ?? tracking.noticeData?.currency) === 'USD' ? 'USD' : 'CRC';
}

function ContactBusiness({ tracking }: { tracking: OrderTracking }) {
  const phone = tracking.merchantWhatsappE164 ?? tracking.noticeData?.merchantWhatsappE164 ?? null;
  if (!phone) return null;
  const href = buildWaLink(phone, buildOrderInquiryMessage(tracking.businessName, tracking.reference));
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Escribirle a ${tracking.businessName} por WhatsApp`}
      className={outlineButton}
    >
      <IconMessage />
      Escribirle al negocio
    </a>
  );
}

/** Recibido: aterrizaje tras el pedido (mockup 2). */
function ReceivedLanding({ tracking }: { tracking: OrderTracking }) {
  const total = landingTotal(tracking.amounts);
  const instructions = tracking.payment.status === 'PENDING' ? tracking.payment.instructions : null;
  const notice = tracking.noticeData ?? null;
  // Se arma al renderizar, nunca después de un await (iOS bloquea esa navegación).
  const noticeHref = notice ? buildMerchantNoticeLink(notice, tracking.merchantWhatsappE164) : null;
  const asksForReceipt = tracking.payment.timing === 'UPFRONT' && tracking.payment.method !== 'CASH';

  return (
    <>
      <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[var(--pwa-accent)] text-[var(--pwa-text)]">
        <span className="scale-[0.8]"><IconCheck /></span>
      </div>
      <h1 className={`${heading} m-0 text-center text-[1.6rem]`}>Tu pedido quedó registrado</h1>
      <p className={`${muted} mb-3 mt-0.5 text-center text-xs`}>
        Referencia <span className="font-bold text-[var(--pwa-text)]">{tracking.reference}</span> · {tracking.businessName}
      </p>

      {(total || instructions) && (
        <div className={card}>
          {total && (
            <div className="flex justify-between gap-2.5 py-[3px] text-[13px]">
              <span className={muted}>Total</span>
              <span className="font-bold tabular-nums">{total}</span>
            </div>
          )}
          {instructions && <PaymentInstructionsBlock instructions={instructions} />}
        </div>
      )}

      {notice && (
        <p className="mb-4 rounded-[var(--pwa-radius-sm)] bg-[color-mix(in_srgb,var(--pwa-accent)_16%,var(--pwa-card))] px-3 py-2.5 text-[12.5px] leading-snug text-[var(--pwa-text)]">
          <span className="font-bold">Último paso:</span>{' '}
          {asksForReceipt
            ? 'avisale al negocio por WhatsApp y mandale el comprobante en ese mismo chat.'
            : 'avisale al negocio por WhatsApp para que confirme tu pedido.'}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {notice && noticeHref && (
          <WhatsAppButton href={noticeHref} ariaLabel="Avisar al negocio por WhatsApp, abre WhatsApp" size="lg">
            Avisar al negocio por WhatsApp
          </WhatsAppButton>
        )}
        {notice && !noticeHref && (
          <p role="note" className={`${card} m-0 text-[13px] ${muted}`}>
            Este negocio todavía no tiene un WhatsApp para recibir avisos. Tu pedido igual quedó
            registrado y el negocio ya lo ve en su lista.
          </p>
        )}
        <p className={`${muted} m-0 text-center text-xs`}>Guardá esta página: acá vas a ver cómo avanza tu pedido.</p>
      </div>

      <OrderItemsList items={tracking.items} currency={currencyOf(tracking)} />
    </>
  );
}

/** Seguimiento después de Recibido (mockup 4). */
function TrackingDetail({ tracking, reviewPath }: { tracking: OrderTracking; reviewPath: string }) {
  const steps = buildTrackingTimeline(tracking.status, tracking.timeline, tracking.fulfillmentType);
  return (
    <>
      <p className={`${muted} m-0 text-xs`}>Pedido {tracking.reference}</p>
      <p className={`${muted} m-0 text-xs`}>
        {tracking.businessName} · {fulfillmentLabel(tracking.fulfillmentType)}
      </p>
      <h1 className={`${heading} mb-2.5 mt-0.5 text-[1.6rem]`}>
        {orderStatusLabel(tracking.status, tracking.fulfillmentType)}
      </h1>

      <TrackingTimeline steps={steps} />
      <PaymentCard tracking={tracking} />
      <OrderItemsList items={tracking.items} currency={currencyOf(tracking)} />

      <div className="mt-4 flex flex-col gap-2">
        {tracking.reviewable && (
          <Link to={reviewPath} className={accentButton}>
            Valorar tu pedido
          </Link>
        )}
        {tracking.reviewed && (
          <p className={`${muted} m-0 text-center text-xs`}>Gracias por tu valoración.</p>
        )}
        <ContactBusiness tracking={tracking} />
      </div>
    </>
  );
}
