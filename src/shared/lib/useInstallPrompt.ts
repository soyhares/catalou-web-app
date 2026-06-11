import { useState, useEffect } from 'react';

const STORAGE_KEY = 'catalou_install_dismissed';
const DISMISSED_FOREVER = 'forever';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPromptStatus =
  | 'idle'
  | 'available'
  | 'ios'
  | 'dismissed'
  | 'installed';

export function useInstallPrompt() {
  const [status, setStatus] = useState<InstallPromptStatus>('idle');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setStatus('installed');
      return;
    }
    if (localStorage.getItem(STORAGE_KEY) === DISMISSED_FOREVER) {
      setStatus('dismissed');
      return;
    }
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIos && isSafari) {
      setStatus('ios');
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setStatus('available');
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setStatus('installed'));
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const triggerPrompt = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setStatus('installed');
    } else {
      setStatus('dismissed');
    }
    setDeferredPrompt(null);
  };

  const dismiss = (forever = false) => {
    if (forever) localStorage.setItem(STORAGE_KEY, DISMISSED_FOREVER);
    setStatus('dismissed');
  };

  return { status, triggerPrompt, dismiss };
}
