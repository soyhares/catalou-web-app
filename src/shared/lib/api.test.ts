import { afterEach, describe, expect, it, vi } from 'vitest';

const emitErrorReportEvent = vi.fn();
vi.mock('./error-report-store', () => ({
  emitErrorReportEvent: (...args: unknown[]) => emitErrorReportEvent(...args),
}));

import { ApiError, publicFetch } from './api';

describe('publicFetch: modal de reporte ante un 5xx', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    emitErrorReportEvent.mockReset();
  });

  const stub503 = () =>
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'caído' }), { status: 503 })));

  it('lo abre por defecto', async () => {
    stub503();
    await expect(publicFetch('/x')).rejects.toBeInstanceOf(ApiError);
    expect(emitErrorReportEvent).toHaveBeenCalledTimes(1);
  });

  it('no lo abre en una consulta de fondo', async () => {
    stub503();
    await expect(publicFetch('/x', {}, { reportServerErrors: false })).rejects.toBeInstanceOf(ApiError);
    expect(emitErrorReportEvent).not.toHaveBeenCalled();
  });
});
