import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import { getPrivacyPolicy, type PrivacyPolicyDto } from '@entities/shopper-profile/api';
import { CatalogFooter } from '@shared/ui/CatalogFooter';
import { BottomNav } from '@shared/ui/BottomNav';

export default function PrivacyPolicyPage() {
  const { slug } = useBranding();
  const { t } = useTranslation();
  const [policy, setPolicy] = useState<PrivacyPolicyDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPrivacyPolicy(slug)
      .then((data) => { setPolicy(data); })
      .catch(() => { setError(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  const pageTitle = policy?.language === 'EN' ? 'Privacy Policy' : t('common.privacyPolicy');

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--pwa-bg)' }}>
      <div className="max-w-xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--pwa-text)' }}>
          {pageTitle}
        </h1>

        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div
                  className="h-4 rounded mb-2 w-1/3"
                  style={{ backgroundColor: 'var(--pwa-text)', opacity: 0.1 }}
                />
                <div
                  className="h-16 rounded"
                  style={{ backgroundColor: 'var(--pwa-text)', opacity: 0.06 }}
                />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
            La política de privacidad no está disponible en este momento.
          </p>
        )}

        {policy && !loading && (
          <>
            <p
              className="text-xs mb-8"
              style={{ color: 'var(--pwa-text)', opacity: 0.4 }}
            >
              {policy.language === 'EN' ? 'Last updated: ' : 'Última actualización: '}
              {new Date(policy.generatedAt).toLocaleDateString(
                policy.language === 'EN' ? 'en-US' : 'es-CR',
                { year: 'numeric', month: 'long', day: 'numeric' },
              )}
            </p>

            {policy.sections.map((section) => (
              <section key={section.title} className="mb-6">
                <h2
                  className="text-base font-semibold mb-2"
                  style={{ color: 'var(--pwa-text)' }}
                >
                  {section.title}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--pwa-text)', opacity: 0.7 }}
                >
                  {section.content}
                </p>
              </section>
            ))}
          </>
        )}
      </div>

      <CatalogFooter />
      <BottomNav />
    </div>
  );
}
