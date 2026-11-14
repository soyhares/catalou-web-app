import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { OrderReviewController } from './useOrderReview';
import { StarRating } from './StarRating';
import { REVIEW_COMMENT_MAX, type ReviewScreenState } from './review-state';

/**
 * SPEC-023 (T077): valoración privada en `/pedido/:token/valoracion` (mockup 5, FR-037, FR-038).
 * Estrellas obligatorias, comentario opcional, una vez por pedido y sin edición posterior.
 */

interface OrderReviewScreenProps extends OrderReviewController {
  /** Vuelve a la página del pedido ("Ahora no", "Ver tu pedido"). */
  orderPath: string;
}

const page = 'min-h-screen bg-[var(--pwa-bg)] px-6 pb-28 pt-8 font-[family-name:var(--pwa-font-body)] text-[var(--pwa-text)]';
const heading = 'font-[family-name:var(--pwa-font-heading)] font-normal italic text-[var(--pwa-text)]';
const muted = 'text-[var(--pwa-text-secondary)]';
const accentButton =
  'flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[var(--pwa-radius-button)] border-0 bg-[var(--pwa-accent)] px-4 py-3 text-sm font-bold text-[var(--pwa-on-accent)] no-underline disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pwa-text)]';
const outlineButton =
  'flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[var(--pwa-radius-button)] border-[1.5px] border-[var(--pwa-border)] bg-transparent px-4 py-3 text-sm font-bold text-[var(--pwa-text)] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pwa-text)]';

const STATE_COPY: Record<Exclude<ReviewScreenState, 'form'>, { title: string; body: (business: string) => string }> = {
  'not-delivered': {
    title: 'Todavía no podés valorar este pedido',
    body: () => 'Vas a poder valorarlo cuando el negocio lo marque como entregado.',
  },
  'already-reviewed': {
    title: 'Ya valoraste este pedido',
    body: () => 'Gracias por contarnos. La valoración no se puede cambiar después de enviarla.',
  },
  expired: {
    title: 'El plazo para valorar este pedido terminó',
    body: () => 'Las valoraciones se reciben hasta 30 días después de la entrega.',
  },
  sent: {
    title: 'Gracias por tu valoración',
    body: (business) => `La recibió ${business}. Solo la ve el negocio.`,
  },
};

export function OrderReviewScreen(props: OrderReviewScreenProps) {
  return (
    <main className={page}>
      <meta name="robots" content="noindex, nofollow" />
      <div className="mx-auto max-w-[520px]">{renderBody(props)}</div>
    </main>
  );
}

function Message({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div role="status" className="pt-12 text-center">
      <h1 className={`${heading} mb-2 text-2xl`}>{title}</h1>
      <p className={`${muted} m-0 mb-6 text-sm`}>{body}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function renderBody(props: OrderReviewScreenProps): ReactNode {
  const { load, orderPath } = props;
  switch (load.kind) {
    case 'loading':
      return (
        <div aria-busy="true" className="pt-10">
          <span className="sr-only">Cargando</span>
          <div className="mx-auto mb-3 h-6 w-2/3 animate-pulse rounded bg-[var(--pwa-border)]" />
          <div className="mx-auto h-12 w-3/4 animate-pulse rounded bg-[var(--pwa-border)]" />
        </div>
      );
    case 'not-found':
      return (
        <Message title="No encontramos este pedido" body="Revisá que el enlace esté completo, tal como te llegó.">
          <Link to="/catalog" className={outlineButton}>Ir al catálogo</Link>
        </Message>
      );
    case 'error':
      return (
        <Message title="No pudimos cargar tu pedido" body="Revisá tu conexión e intentá de nuevo.">
          <button type="button" onClick={props.retry} className={accentButton}>Intentar de nuevo</button>
        </Message>
      );
    case 'ready': {
      if (load.state !== 'form') {
        const copy = STATE_COPY[load.state];
        return (
          <Message title={copy.title} body={copy.body(load.order.businessName)}>
            <Link to={orderPath} className={outlineButton}>Ver tu pedido</Link>
          </Message>
        );
      }
      return <ReviewForm {...props} businessName={load.order.businessName} reference={load.order.reference} />;
    }
  }
}

function ReviewForm({
  businessName,
  reference,
  rating,
  comment,
  isSubmitting,
  submitError,
  setRating,
  setComment,
  submit,
  orderPath,
}: OrderReviewScreenProps & { businessName: string; reference: string }) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <h1 className={`${heading} mb-0 mt-2 text-center text-[1.6rem]`}>¿Cómo te fue con {businessName}?</h1>
      <p className={`${muted} m-0 mt-1 text-center text-xs`}>Pedido {reference}</p>

      <StarRating value={rating} onChange={setRating} describedBy={submitError ? 'review-error' : undefined} />

      <label htmlFor="review-comment" className={`${muted} mb-1.5 mt-3 block font-[family-name:var(--pwa-font-heading)] text-[0.95rem] italic`}>
        Contanos más (opcional)
      </label>
      <textarea
        id="review-comment"
        value={comment}
        maxLength={REVIEW_COMMENT_MAX}
        rows={4}
        onChange={(e) => setComment(e.target.value)}
        aria-describedby="review-comment-count"
        className="block min-h-[86px] w-full resize-y rounded-[var(--pwa-radius-sm)] border border-[var(--pwa-border)] bg-[var(--pwa-card)] p-2.5 text-[13px] text-[var(--pwa-text)] placeholder:text-[var(--pwa-text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pwa-text)]"
      />
      <p id="review-comment-count" className={`${muted} m-0 mt-1 text-right text-[11px]`}>
        {comment.length} de {REVIEW_COMMENT_MAX} caracteres
      </p>

      <p className={`${muted} m-0 mt-2.5 text-xs`}>
        Tu valoración la ve solo el negocio. No se publica y no se puede cambiar después de enviarla.
      </p>

      {submitError && (
        <p id="review-error" role="alert" className="m-0 mt-3 text-[13px] text-[var(--pwa-text)]">
          {submitError}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <button type="submit" disabled={isSubmitting} className={accentButton}>
          {isSubmitting ? 'Enviando...' : 'Enviar valoración'}
        </button>
        <Link to={orderPath} className={outlineButton}>Ahora no</Link>
      </div>
    </form>
  );
}
