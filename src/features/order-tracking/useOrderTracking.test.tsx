import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OrderTracking } from '@entities/order/tracking-api';
import { TRACKING_REFRESH_MS, useOrderTracking } from './useOrderTracking';

const getOrderTracking = vi.fn();
vi.mock('@entities/order/tracking-api', () => ({
  getOrderTracking: (...args: unknown[]) => getOrderTracking(...args),
}));

const tracking = (status: string) => ({ status }) as unknown as OrderTracking;

describe('useOrderTracking: refresco silencioso', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    getOrderTracking.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it('trae el estado nuevo cada TRACKING_REFRESH_MS y no vuelve a "loading"', async () => {
    getOrderTracking.mockResolvedValueOnce(tracking('CONFIRMED')).mockResolvedValueOnce(tracking('SHIPPED'));
    const { result } = renderHook(() => useOrderTracking('demo', 'tok'));
    await waitFor(() => expect(result.current.load).toEqual({ kind: 'ready', data: tracking('CONFIRMED') }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(TRACKING_REFRESH_MS);
    });
    expect(result.current.load).toEqual({ kind: 'ready', data: tracking('SHIPPED') });
  });

  it('un fallo del refresco deja los datos que ya había', async () => {
    getOrderTracking.mockResolvedValueOnce(tracking('CONFIRMED')).mockRejectedValueOnce(new Error('red'));
    const { result } = renderHook(() => useOrderTracking('demo', 'tok'));
    await waitFor(() => expect(result.current.load.kind).toBe('ready'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(TRACKING_REFRESH_MS);
    });
    expect(result.current.load).toEqual({ kind: 'ready', data: tracking('CONFIRMED') });
  });

  it('con el pedido cerrado deja de consultar', async () => {
    getOrderTracking.mockResolvedValue(tracking('COMPLETED'));
    const { result } = renderHook(() => useOrderTracking('demo', 'tok'));
    await waitFor(() => expect(result.current.load.kind).toBe('ready'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(TRACKING_REFRESH_MS * 3);
    });
    expect(getOrderTracking).toHaveBeenCalledTimes(1);
  });
});

describe('useOrderTracking: frescura para el indicador en vivo', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    getOrderTracking.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it('marca la última respuesta buena, el refresco en curso y el fallo', async () => {
    let resolveRefresh: (v: OrderTracking) => void = () => {};
    getOrderTracking
      .mockResolvedValueOnce(tracking('CONFIRMED'))
      .mockImplementationOnce(() => new Promise<OrderTracking>((r) => (resolveRefresh = r)))
      .mockRejectedValueOnce(new Error('red'))
      .mockResolvedValueOnce(tracking('PREPARING'));
    const { result } = renderHook(() => useOrderTracking('demo', 'tok'));
    await waitFor(() => expect(result.current.load.kind).toBe('ready'));
    const firstAt = result.current.lastUpdatedAt;
    expect(firstAt).not.toBeNull();
    expect(result.current.isRefreshing).toBe(false);

    // Refresco en curso.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TRACKING_REFRESH_MS);
    });
    expect(result.current.isRefreshing).toBe(true);
    // El refresco es silencioso: un 5xx no abre el modal de reporte (lo muestra el indicador).
    expect(getOrderTracking).toHaveBeenNthCalledWith(1, 'demo', 'tok');
    expect(getOrderTracking).toHaveBeenNthCalledWith(2, 'demo', 'tok', { silent: true });
    await act(async () => {
      resolveRefresh(tracking('CONFIRMED'));
    });
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.lastUpdatedAt).toBeGreaterThan(firstAt as number);
    const okAt = result.current.lastUpdatedAt;

    // Falla: no toca la última respuesta buena.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TRACKING_REFRESH_MS);
    });
    expect(result.current.lastRefreshFailed).toBe(true);
    expect(result.current.lastUpdatedAt).toBe(okAt);

    // Vuelve a andar.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TRACKING_REFRESH_MS);
    });
    expect(result.current.lastRefreshFailed).toBe(false);
    expect(result.current.load).toEqual({ kind: 'ready', data: tracking('PREPARING') });
  });
});
