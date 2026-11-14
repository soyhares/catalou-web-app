import { useParams } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { OrderReviewScreen, useOrderReview } from '@features/order-review';

/** SPEC-023 (T077): `/pedido/:token/valoracion`, fuera de guard como el seguimiento. */
export default function OrderReviewPage() {
  const { token = '' } = useParams<{ token: string }>();
  const { slug } = useBranding();
  const controller = useOrderReview(slug, token);
  return <OrderReviewScreen {...controller} orderPath={`/pedido/${encodeURIComponent(token)}`} />;
}
