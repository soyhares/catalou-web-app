import { useCallback, useEffect, useState } from 'react';
import { getOrderTracking, submitOrderReview, type OrderTracking } from '@entities/order/tracking-api';
import { ApiError } from '@shared/lib/api';
import {
  buildReviewRequest,
  reviewFailureFromError,
  reviewStateFromTracking,
  type ReviewScreenState,
} from './review-state';

export type OrderReviewLoad =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'error' }
  | { kind: 'ready'; order: Pick<OrderTracking, 'businessName' | 'reference'>; state: ReviewScreenState };

export interface OrderReviewController {
  load: OrderReviewLoad;
  rating: number;
  comment: string;
  isSubmitting: boolean;
  submitError: string | null;
  setRating: (n: number) => void;
  setComment: (s: string) => void;
  submit: () => void;
  retry: () => void;
}

export function useOrderReview(slug: string, token: string): OrderReviewController {
  const [load, setLoad] = useState<OrderReviewLoad>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [rating, setRatingState] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!slug || !token) {
      setLoad({ kind: 'not-found' });
      return;
    }
    setLoad({ kind: 'loading' });
    getOrderTracking(slug, token)
      .then((data) => {
        if (cancelled) return;
        setLoad({
          kind: 'ready',
          order: { businessName: data.businessName, reference: data.reference },
          state: reviewStateFromTracking(data),
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoad(err instanceof ApiError && err.status === 404 ? { kind: 'not-found' } : { kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, token, attempt]);

  const setRating = useCallback((n: number) => {
    setRatingState(n);
    setSubmitError(null);
  }, []);

  function submit() {
    if (isSubmitting || load.kind !== 'ready' || load.state !== 'form') return;
    const body = buildReviewRequest(rating, comment);
    if (!body) {
      setSubmitError('Elegí de 1 a 5 estrellas para enviar tu valoración.');
      return;
    }
    const order = load.order;
    setIsSubmitting(true);
    setSubmitError(null);
    submitOrderReview(slug, token, body)
      .then(() => setLoad({ kind: 'ready', order, state: 'sent' }))
      .catch((err: unknown) => {
        const failure = reviewFailureFromError(err);
        if (failure.kind === 'state') setLoad({ kind: 'ready', order, state: failure.state });
        else if (failure.kind === 'not-found') setLoad({ kind: 'not-found' });
        else setSubmitError(failure.message);
      })
      .finally(() => setIsSubmitting(false));
  }

  return {
    load,
    rating,
    comment,
    isSubmitting,
    submitError,
    setRating,
    setComment,
    submit,
    retry: () => setAttempt((n) => n + 1),
  };
}
