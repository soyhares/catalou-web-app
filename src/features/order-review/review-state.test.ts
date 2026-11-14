import { describe, it, expect } from 'vitest';
import { ApiError } from '@shared/lib/api';
import { buildReviewRequest, reviewFailureFromError, reviewStateFromTracking } from './review-state';

describe('reviewStateFromTracking', () => {
  it('entregado y valorable: formulario', () => {
    expect(reviewStateFromTracking({ status: 'COMPLETED', reviewable: true, reviewed: false })).toBe('form');
  });
  it('sin entregar: no valorable', () => {
    expect(reviewStateFromTracking({ status: 'PREPARING', reviewable: false })).toBe('not-delivered');
    expect(reviewStateFromTracking({ status: 'CANCELLED', reviewable: false })).toBe('not-delivered');
  });
  it('ya valorado gana sobre cualquier otro estado', () => {
    expect(reviewStateFromTracking({ status: 'COMPLETED', reviewable: false, reviewed: true })).toBe('already-reviewed');
  });
  it('entregado pero no valorable ni valorado: venció', () => {
    expect(reviewStateFromTracking({ status: 'COMPLETED', reviewable: false, reviewed: false })).toBe('expired');
  });
});

describe('reviewFailureFromError', () => {
  it('409: ya valorado', () => {
    expect(reviewFailureFromError(new ApiError(409, 'x', 'REVIEW_ALREADY_EXISTS'))).toEqual({ kind: 'state', state: 'already-reviewed' });
  });
  it('422 REVIEW_WINDOW_CLOSED: vencido', () => {
    expect(reviewFailureFromError(new ApiError(422, 'x', 'REVIEW_WINDOW_CLOSED'))).toEqual({ kind: 'state', state: 'expired' });
  });
  it('422 ORDER_NOT_DELIVERED: no valorable', () => {
    expect(reviewFailureFromError(new ApiError(422, 'x', 'ORDER_NOT_DELIVERED'))).toEqual({ kind: 'state', state: 'not-delivered' });
  });
  it('404: no encontrado', () => {
    expect(reviewFailureFromError(new ApiError(404, 'x'))).toEqual({ kind: 'not-found' });
  });
  it('otros errores: mensaje sin detalles internos', () => {
    const failure = reviewFailureFromError(new Error('boom'));
    expect(failure.kind).toBe('message');
    if (failure.kind === 'message') expect(failure.message).not.toContain('boom');
  });
});

describe('buildReviewRequest', () => {
  it('omite el comentario vacío', () => {
    expect(buildReviewRequest(4, '   ')).toEqual({ rating: 4 });
  });
  it('recorta el comentario', () => {
    expect(buildReviewRequest(5, '  Muy rico  ')).toEqual({ rating: 5, comment: 'Muy rico' });
    expect(buildReviewRequest(5, 'a'.repeat(1200))?.comment).toHaveLength(1000);
  });
  it('rechaza estrellas fuera de rango', () => {
    expect(buildReviewRequest(0, '')).toBeNull();
    expect(buildReviewRequest(6, '')).toBeNull();
    expect(buildReviewRequest(2.5, '')).toBeNull();
  });
});
