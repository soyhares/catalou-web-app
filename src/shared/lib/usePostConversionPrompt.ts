import { useEffect, useSyncExternalStore } from 'react';

/**
 * SPEC-022 (T036) — single coordinator for the prompts that interrupt the shopper after a
 * conversion (FR-003b, FR-003c).
 *
 * Before this, `InstallPromptSheet` decided on its own and was mounted globally in
 * `router.tsx`, outside `<Routes>`, so it could sit on top of the booking push modal or of
 * the account offer. The decision now lives here: fixed priority, one surface visible at a
 * time, one shared waiting period.
 *
 * Only AUTOMATIC surfaces register. A prompt the shopper asked for (the notification bell)
 * is not an interruption and is never coordinated.
 */

export type PromptSurface = 'notifications' | 'account' | 'install';

/** Highest priority first. The order is the product decision, not an implementation detail. */
const PRIORITY: readonly PromptSurface[] = ['notifications', 'account', 'install'];

const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const cooldownKey = (slug: string) => `catalou_prompt_cooldown_${slug}`;

interface Cooldown {
  at: number;
  /** Superficie que la inició. Una de baja prioridad no puede callar a una de más alta. */
  by: PromptSurface;
}

const wanting = new Set<PromptSurface>();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** The surface allowed to show right now, or null when nothing wants to. */
function winner(): PromptSurface | null {
  return PRIORITY.find((s) => wanting.has(s)) ?? null;
}

/**
 * La espera compartida solo silencia superficies de prioridad IGUAL O MENOR que la que la
 * inició.
 *
 * Sin esta asimetría, descartar la barra de instalación —que en iOS aparece al abrir la app,
 * antes de cualquier conversión— callaría el ofrecimiento de cuenta durante 24 horas. Y ese
 * ofrecimiento está anclado al pedido de esa navegación: no vuelve nunca para ese pedido.
 */
function inCooldown(slug: string, surface: PromptSurface): boolean {
  try {
    const raw = localStorage.getItem(cooldownKey(slug));
    if (!raw) return false;
    const cooldown = JSON.parse(raw) as Cooldown;
    if (!cooldown?.at || Date.now() - cooldown.at >= COOLDOWN_MS) return false;
    return PRIORITY.indexOf(surface) >= PRIORITY.indexOf(cooldown.by);
  } catch {
    return false;
  }
}

/**
 * Starts the shared waiting period. Call it when the shopper dismisses any coordinated
 * surface: having just said no to one, they should not immediately get the next one.
 */
export function startPromptCooldown(slug: string, by: PromptSurface): void {
  try {
    localStorage.setItem(cooldownKey(slug), JSON.stringify({ at: Date.now(), by } satisfies Cooldown));
  } catch {
    // ignore
  }
  emit();
}

/**
 * Declares that `surface` would like to be visible, and answers whether it may.
 * `wants: false` withdraws the claim so a lower-priority surface can take its turn.
 */
export function usePostConversionPrompt(
  slug: string,
  surface: PromptSurface,
  wants: boolean,
): boolean {
  useEffect(() => {
    if (!wants) return;
    wanting.add(surface);
    emit();
    return () => {
      wanting.delete(surface);
      emit();
    };
  }, [surface, wants]);

  const current = useSyncExternalStore(subscribe, winner, () => null);

  return wants && current === surface && !inCooldown(slug, surface);
}
