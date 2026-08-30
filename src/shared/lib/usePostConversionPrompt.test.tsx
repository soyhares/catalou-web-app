import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  usePostConversionPrompt,
  startPromptCooldown,
} from './usePostConversionPrompt';

/**
 * The point of the coordinator is that two surfaces are never visible at once and that the
 * order between them is fixed, so that is what is checked here.
 */
describe('post-conversion prompt coordinator (SPEC-022 T036)', () => {
  beforeEach(() => localStorage.clear());

  it('shows a surface when nothing else wants the screen', () => {
    const { result } = renderHook(() => usePostConversionPrompt('demo', 'install', true));
    expect(result.current).toBe(true);
  });

  it('never shows a surface that does not want to be shown', () => {
    const { result } = renderHook(() => usePostConversionPrompt('demo', 'account', false));
    expect(result.current).toBe(false);
  });

  it('gives the account offer priority over the install sheet', () => {
    const account = renderHook(() => usePostConversionPrompt('demo', 'account', true));
    const install = renderHook(() => usePostConversionPrompt('demo', 'install', true));

    account.rerender();
    install.rerender();

    expect(account.result.current).toBe(true);
    expect(install.result.current).toBe(false);
  });

  it('lets the install sheet through once the account offer withdraws', () => {
    const account = renderHook(() => usePostConversionPrompt('demo', 'account', true));
    const install = renderHook(() => usePostConversionPrompt('demo', 'install', true));
    install.rerender();
    expect(install.result.current).toBe(false);

    account.unmount();
    install.rerender();
    expect(install.result.current).toBe(true);
  });

  it('holds surfaces of equal or lower priority during the waiting period, per slug', () => {
    startPromptCooldown('demo', 'account');

    const held = renderHook(() => usePostConversionPrompt('demo', 'install', true));
    expect(held.result.current).toBe(false);

    const other = renderHook(() => usePostConversionPrompt('otro', 'install', true));
    expect(other.result.current).toBe(true);
  });

  // On iOS the install sheet appears on first open, before any conversion. If dismissing it
  // silenced the account offer, that offer would be lost for good: it is anchored to the
  // order in that navigation's state and never comes back for it.
  it('a lower-priority dismissal never silences a higher-priority surface', () => {
    startPromptCooldown('demo', 'install');

    const account = renderHook(() => usePostConversionPrompt('demo', 'account', true));
    expect(account.result.current).toBe(true);

    const install = renderHook(() => usePostConversionPrompt('demo', 'install', true));
    expect(install.result.current).toBe(false);
  });
});
