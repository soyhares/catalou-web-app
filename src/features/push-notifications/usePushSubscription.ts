import { useState, useEffect } from 'react';
import { useBranding } from '@app/BrandingContext';
import { publicFetch } from '@shared/lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

interface PushSubscriptionHook {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export function usePushSubscription(): PushSubscriptionHook {
  const { slug, branding } = useBranding();
  const vapidPublicKey = branding.vapidPublicKey ?? '';

  const isSupported =
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    'serviceWorker' in navigator;

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : 'denied',
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission);

    void navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      void reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(sub !== null);
      });
    });
  }, [isSupported]);

  const subscribe = async (): Promise<void> => {
    if (!isSupported || !vapidPublicKey) return;

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== 'granted') return;

    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
    });

    const json = subscription.toJSON();
    const endpoint = subscription.endpoint;
    const auth = json.keys?.['auth'] ?? '';
    const p256dh = json.keys?.['p256dh'] ?? '';

    await publicFetch<void>(`/companies/${slug}/push-subscriptions`, {
      method: 'POST',
      body: JSON.stringify({ endpoint, keys: { auth, p256dh } }),
    });

    setIsSubscribed(true);
  };

  const unsubscribe = async (): Promise<void> => {
    if (!isSupported) return;

    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;

    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    await publicFetch<void>(`/companies/${slug}/push-subscriptions`, {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    });

    setIsSubscribed(false);
  };

  return { isSupported, permission, isSubscribed, subscribe, unsubscribe };
}
