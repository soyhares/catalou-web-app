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
