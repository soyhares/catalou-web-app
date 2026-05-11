import type { BrandingData } from '@entities/company/api';

export function injectDynamicManifest(branding: BrandingData): void {
  const shortName = branding.companyName.slice(0, 12);

  const icons = branding.logoUrl
    ? [
        { src: branding.logoUrl, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: branding.logoUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ]
    : [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ];

  const manifest = {
    name: branding.companyName,
    short_name: shortName,
    start_url: '/',
    display: 'standalone',
    background_color: branding.colorBackground,
    theme_color: branding.colorPrimary,
    icons,
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
  const blobUrl = URL.createObjectURL(blob);

  let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }

  const previous = link.href;
  link.href = blobUrl;

  // Revoke the previous blob URL to avoid memory leaks on branding updates
  if (previous.startsWith('blob:')) {
    URL.revokeObjectURL(previous);
  }
}
