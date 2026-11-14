import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';
import type { CheckoutPageProps, CheckoutStep } from '../useCheckoutPage';
import { FULFILLMENT_LABELS, METHOD_LABELS, timingLabel } from '../delivery-payment';

/* ── Clases compartidas ─────────────────────────────────────────────────── */

// Labels legibles (no la micro-tipografía de 8px): serif itálica, como el resto del checkout.
const LABEL =
  'mb-1.5 block font-[family-name:var(--pwa-font-heading)] text-[0.85rem] italic text-[var(--pwa-text-secondary)]';

// Inputs underline-only (skin_premium.md §6.3): al enfocar solo cambia el color del borde.
const INPUT_BASE =
  'block min-h-[44px] w-full border-0 border-b bg-transparent py-2 font-[family-name:var(--pwa-font-body)] text-base text-[var(--pwa-text)] outline-none transition-colors duration-[var(--pwa-motion)] placeholder:text-[var(--pwa-text-secondary)] placeholder:opacity-60 focus:border-[var(--pwa-accent)]';

function inputClass(hasError: boolean): string {
  return `${INPUT_BASE} ${hasError ? 'border-[var(--pwa-error)]' : 'border-[var(--pwa-border)]'}`;
}

const ERROR_TEXT = 'mt-1.5 text-xs text-[var(--pwa-error)]';

const PRIMARY_BUTTON =
  'flex min-h-[48px] w-full items-center justify-center rounded-[var(--pwa-radius-button)] border-0 bg-[var(--pwa-accent)] px-4 py-3 font-[family-name:var(--pwa-font-body)] text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--pwa-on-accent)] transition-opacity duration-[var(--pwa-motion)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pwa-accent)] disabled:cursor-not-allowed disabled:opacity-50';

/* ── Iconos (SVG, heredan currentColor) ─────────────────────────────────── */

function BackIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ── Indicador de pasos del checkout Directo ────────────────────────────── */

const DIRECT_STEPS: { id: CheckoutStep; label: string }[] = [
  { id: 'delivery', label: 'Entrega y pago' },
  { id: 'details', label: 'Tus datos' },
];

function StepIndicator({ current }: { current: CheckoutStep }) {
  const activeIndex = DIRECT_STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="mb-8 flex items-center gap-3" aria-label="Pasos del pedido">
      {DIRECT_STEPS.map((step, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <li
            key={step.id}
            aria-current={isActive ? 'step' : undefined}
            className="flex flex-1 items-center gap-2"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                isDone || isActive
                  ? 'border-[var(--pwa-accent)] bg-[var(--pwa-accent)] text-[var(--pwa-on-accent)]'
                  : 'border-[var(--pwa-border)] text-[var(--pwa-text-secondary)]'
              }`}
            >
              {isDone ? <CheckIcon /> : i + 1}
            </span>
            <span
              className={`text-xs ${
                isActive ? 'font-semibold text-[var(--pwa-text)]' : 'text-[var(--pwa-text-secondary)]'
              }`}
            >
              {step.label}
            </span>
            {i < DIRECT_STEPS.length - 1 && (
              <span aria-hidden="true" className={`h-px flex-1 ${isDone ? 'bg-[var(--pwa-accent)]' : 'bg-[var(--pwa-border)]'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Grupo de opciones (radio con forma de chip, 44px mínimo) ────────────── */

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  value,
  error,
  onChange,
}: {
  legend: string;
  name: string;
  options: ChoiceOption<T>[];
  value: T | null;
  error?: string;
  onChange: (value: T) => void;
}) {
  const errorId = useId();
  return (
    <fieldset
      className="m-0 min-w-0 border-0 p-0"
      aria-describedby={error ? errorId : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className={LABEL}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex min-h-[44px] min-w-[8.5rem] flex-1 cursor-pointer items-center gap-2.5 rounded-[var(--pwa-radius-chip)] border bg-[var(--pwa-card)] px-3 py-2 font-[family-name:var(--pwa-font-body)] text-sm text-[var(--pwa-text)] transition-colors duration-[var(--pwa-motion)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--pwa-accent)] ${
                selected ? 'border-[var(--pwa-accent)] ring-1 ring-[var(--pwa-accent)]' : 'border-[var(--pwa-border)]'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 rounded-full ${
                  selected ? 'border-[5px] border-[var(--pwa-accent)]' : 'border-[1.5px] border-[var(--pwa-text-secondary)]'
                }`}
              />
              <span className="flex flex-col leading-tight">
                <span>{opt.label}</span>
                {opt.hint && <span className="text-[11px] text-[var(--pwa-text-secondary)]">{opt.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p id={errorId} className={ERROR_TEXT}>{error}</p>}
    </fieldset>
  );
}

function formatCrPhone(digits: string): string {
  return digits.length > 4 ? `+506 ${digits.slice(0, 4)} ${digits.slice(4)}` : `+506 ${digits}`;
}

/* ── Skin ───────────────────────────────────────────────────────────────── */

const LuxuryMinimalismCheckoutSkin: React.FC<CheckoutPageProps> = ({
  items,
  total,
  form,
  errors,
  step,
  checkoutOptions,
  directOrdersBlocked,
  selection,
  fulfillmentChoices,
  timingChoices,
  methodChoices,
  phoneDigits,
  isSubmitting,
  submitError,
  showPrices,
  currency,
  isOnline,
  orderType,
  hasBothOrderTypes,
  businessModel,
  onFieldChange,
  onPhoneDigitsChange,
  onFulfillmentChange,
  onTimingChange,
  onMethodChange,
  onContinue,
  onOrderTypeChange,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useTheme();
  const ids = {
    name: useId(),
    phone: useId(),
    phoneHint: useId(),
    phoneError: useId(),
    email: useId(),
    address: useId(),
    addressError: useId(),
    affiliate: useId(),
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--pwa-bg)]">
        <div className="px-6 text-center">
          <p className="mb-5 font-[family-name:var(--pwa-font-heading)] text-[1.2rem] italic text-[var(--pwa-text)] opacity-50">
            Tu carrito está vacío
          </p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] items-center gap-1.5 border-0 bg-transparent px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pwa-accent)]"
          >
            <BackIcon size={14} />
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const isDirect = orderType === 'DIRECT';
  const isDeliveryStep = isDirect && step === 'delivery';
  const optionsLoading = isDirect && checkoutOptions === undefined;
  const title = isDeliveryStep ? 'Entrega y pago' : 'Confirmá tu pedido';
  // Sin opciones del negocio (API anterior) la dirección se pide siempre, como antes.
  const showAddress = checkoutOptions ? selection.fulfillmentType === 'DELIVERY' : true;

  /* ── Bloques ─────────────────────────────────────────────────────────── */

  const orderTypeTabs = hasBothOrderTypes && (isDeliveryStep || !isDirect) && (
    <div className="mb-7 flex border-b border-[var(--pwa-border)]">
      {(['DIRECT', 'FINANCED'] as const).map((type) => {
        const active = orderType === type;
        return (
          <button
            key={type}
            type="button"
            aria-pressed={active}
            onClick={() => onOrderTypeChange(type)}
            className={`min-h-[44px] flex-1 border-0 border-b-2 bg-transparent px-2.5 font-[family-name:var(--pwa-font-body)] text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-[var(--pwa-motion)] ${
              active
                ? 'border-[var(--pwa-accent)] text-[var(--pwa-accent)]'
                : 'border-transparent text-[var(--pwa-text-secondary)]'
            }`}
          >
            {type === 'DIRECT' ? t('checkout.direct') : t('checkout.associated')}
          </button>
        );
      })}
    </div>
  );

  const addressField = (
    <div>
      <label htmlFor={ids.address} className={LABEL}>Dirección de entrega *</label>
      <textarea
        id={ids.address}
        value={form.deliveryAddress}
        onChange={(e) => onFieldChange('deliveryAddress', e.target.value)}
        rows={2}
        autoComplete="street-address"
        placeholder="Dirección o indicaciones"
        aria-invalid={errors.deliveryAddress ? true : undefined}
        aria-describedby={errors.deliveryAddress ? ids.addressError : undefined}
        className={`${inputClass(Boolean(errors.deliveryAddress))} resize-none`}
      />
      {errors.deliveryAddress && <p id={ids.addressError} className={ERROR_TEXT}>{errors.deliveryAddress}</p>}
    </div>
  );

  // Teléfono de Costa Rica: +506 fijo y visible, 8 dígitos (FR-012).
  const crPhoneField = (
    <div>
      <label htmlFor={ids.phone} className={LABEL}>Tu WhatsApp *</label>
      <div
        className={`flex min-h-[44px] items-center gap-3 border-b transition-colors duration-[var(--pwa-motion)] focus-within:border-[var(--pwa-accent)] ${
          errors.phone ? 'border-[var(--pwa-error)]' : 'border-[var(--pwa-border)]'
        }`}
      >
        <span aria-hidden="true" className="border-r border-[var(--pwa-border)] pr-3 font-[family-name:var(--pwa-font-body)] text-base text-[var(--pwa-text-secondary)]">
          +506
        </span>
        <input
          id={ids.phone}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={phoneDigits}
          onChange={(e) => onPhoneDigitsChange(e.target.value)}
          placeholder="8888 1234"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? `${ids.phoneHint} ${ids.phoneError}` : ids.phoneHint}
          className="min-h-[44px] w-full flex-1 border-0 bg-transparent py-2 font-[family-name:var(--pwa-font-body)] text-base text-[var(--pwa-text)] outline-none placeholder:text-[var(--pwa-text-secondary)] placeholder:opacity-60"
        />
      </div>
      <p id={ids.phoneHint} className="mt-1.5 text-xs text-[var(--pwa-text-secondary)]">
        Número de Costa Rica de 8 dígitos. Por acá te avisa el negocio cómo va tu pedido.
      </p>
      {errors.phone && <p id={ids.phoneError} className={ERROR_TEXT}>{errors.phone}</p>}
    </div>
  );

  const offlineNotice = !isOnline && (
    <div className="mb-6 rounded border border-[var(--pwa-warning-text)] bg-[var(--pwa-warning-bg)] px-4 py-3 text-[13px] text-[var(--pwa-warning-text)]">
      Sin conexión. Tu pedido no puede enviarse ahora.
    </div>
  );

  /* ── Paso 1 del pedido Directo: entrega y pago ───────────────────────── */

  function renderDeliveryStep() {
    if (optionsLoading) {
      return (
        <p role="status" className="py-8 text-center text-sm text-[var(--pwa-text-secondary)]">
          Cargando opciones de entrega y pago…
        </p>
      );
    }

    if (directOrdersBlocked) {
      return (
        <div className="flex flex-col gap-6">
          <div role="status" className="flex gap-3 rounded-[var(--pwa-radius-md)] border border-[var(--pwa-border)] bg-[var(--pwa-card)] p-4 text-sm leading-relaxed text-[var(--pwa-text)]">
            <span className="text-[var(--pwa-text-secondary)]"><InfoIcon /></span>
            <div>
              <p className="font-semibold">Por ahora este negocio no está recibiendo pedidos en línea.</p>
              <p className="mt-1 text-[var(--pwa-text-secondary)]">
                {hasBothOrderTypes
                  ? 'Podés hacer tu pedido por tu asociación o volver a intentarlo más tarde.'
                  : 'Podés escribirle al negocio para coordinar tu compra o volver a intentarlo más tarde.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 self-center border-0 bg-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pwa-accent)]"
          >
            <BackIcon size={14} />
            Volver
          </button>
        </div>
      );
    }

    return (
      <form
        onSubmit={(e) => { e.preventDefault(); onContinue(); }}
        noValidate
        className="flex flex-col gap-7"
      >
        {checkoutOptions && (
          <ChoiceGroup
            legend="¿Cómo lo recibís?"
            name="fulfillmentType"
            value={selection.fulfillmentType}
            error={errors.fulfillmentType}
            onChange={onFulfillmentChange}
            options={fulfillmentChoices.map((f) => ({ value: f, label: FULFILLMENT_LABELS[f] }))}
          />
        )}

        {showAddress && addressField}

        {checkoutOptions && (
          <ChoiceGroup
            legend="¿Cuándo pagás?"
            name="paymentTiming"
            value={selection.paymentTiming}
            error={errors.paymentTiming}
            onChange={onTimingChange}
            options={timingChoices.map((tm) => ({ value: tm, ...timingLabel(tm, selection.fulfillmentType) }))}
          />
        )}

        {checkoutOptions && selection.paymentTiming && (
          <ChoiceGroup
            legend="¿Cómo pagás?"
            name="paymentMethod"
            value={selection.paymentMethod}
            error={errors.paymentMethod}
            onChange={onMethodChange}
            options={methodChoices.map((m) => ({ value: m, label: METHOD_LABELS[m] }))}
          />
        )}

        {crPhoneField}

        <button type="submit" className={PRIMARY_BUTTON}>
          Revisar pedido
        </button>
      </form>
    );
  }

  /* ── Datos y resumen (paso 2 de Directo, formulario único de Asociado) ── */

  function renderDetailsStep() {
    return (
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        noValidate
        className="flex flex-col gap-7"
      >
        {isDirect && (
          <div className="rounded-[var(--pwa-radius-md)] border border-[var(--pwa-border)] bg-[var(--pwa-card)] p-4 text-sm text-[var(--pwa-text)]">
            <div className="flex items-start justify-between gap-3">
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                {checkoutOptions && selection.fulfillmentType && (
                  <>
                    <dt className="text-[var(--pwa-text-secondary)]">Entrega</dt>
                    <dd className="m-0">{FULFILLMENT_LABELS[selection.fulfillmentType]}</dd>
                  </>
                )}
                {showAddress && form.deliveryAddress.trim() && (
                  <>
                    <dt className="text-[var(--pwa-text-secondary)]">Dirección</dt>
                    <dd className="m-0 break-words">{form.deliveryAddress.trim()}</dd>
                  </>
                )}
                {checkoutOptions && selection.paymentTiming && selection.paymentMethod && (
                  <>
                    <dt className="text-[var(--pwa-text-secondary)]">Pago</dt>
                    <dd className="m-0">
                      {METHOD_LABELS[selection.paymentMethod]}, {timingLabel(selection.paymentTiming, selection.fulfillmentType).label.toLowerCase()}
                    </dd>
                  </>
                )}
                <dt className="text-[var(--pwa-text-secondary)]">WhatsApp</dt>
                <dd className="m-0">{formatCrPhone(phoneDigits)}</dd>
              </dl>
              <button
                type="button"
                onClick={onBack}
                aria-label="Cambiar entrega, pago o WhatsApp"
                className="min-h-[44px] shrink-0 border-0 bg-transparent px-2 text-xs font-semibold text-[var(--pwa-accent)] underline underline-offset-4"
              >
                Cambiar
              </button>
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor={ids.name} className={LABEL}>Nombre completo *</label>
          <input
            id={ids.name}
            type="text"
            value={form.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            autoComplete="name"
            placeholder="Tu nombre"
            aria-invalid={errors.name ? true : undefined}
            className={inputClass(Boolean(errors.name))}
          />
          {errors.name && <p className={ERROR_TEXT}>{errors.name}</p>}
        </div>

        {/* Phone: el pedido Asociado sigue igual que antes de SPEC-023 */}
        {!isDirect && (
          <div>
            <label htmlFor={ids.phone} className={LABEL}>Teléfono *</label>
            <input
              id={ids.phone}
              type="tel"
              value={form.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              autoComplete="tel"
              placeholder="+506 8888 0000"
              aria-invalid={errors.phone ? true : undefined}
              className={inputClass(Boolean(errors.phone))}
            />
            {errors.phone && <p className={ERROR_TEXT}>{errors.phone}</p>}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor={ids.email} className={LABEL}>Correo electrónico *</label>
          <input
            id={ids.email}
            type="email"
            value={form.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            aria-invalid={errors.email ? true : undefined}
            className={inputClass(Boolean(errors.email))}
          />
          {errors.email && <p className={ERROR_TEXT}>{errors.email}</p>}
        </div>

        {!isDirect && addressField}

        {/* Per-product notes (SPEC-021) are captured at add-to-cart, not here. */}

        {/* Affiliate number: only for FINANCED orders */}
        {!isDirect && (
          <div>
            <label htmlFor={ids.affiliate} className={LABEL}>{t('checkout.affiliateNumber')} *</label>
            <input
              id={ids.affiliate}
              type="text"
              value={form.affiliateNumber}
              onChange={(e) => onFieldChange('affiliateNumber', e.target.value)}
              placeholder={t('checkout.affiliateNumberPlaceholder')}
              aria-invalid={errors.affiliateNumber ? true : undefined}
              className={inputClass(Boolean(errors.affiliateNumber))}
            />
            {errors.affiliateNumber && <p className={ERROR_TEXT}>{errors.affiliateNumber}</p>}
          </div>
        )}

        {/* Order summary */}
        {showPrices && (
          <div className="border-t border-[var(--pwa-border)] pt-4">
            <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[var(--pwa-text-secondary)]">
              Resumen
            </p>
            {items.map((item) => (
              <div key={item.id} className="mb-1.5 flex justify-between gap-3">
                <span className="text-[13px] text-[var(--pwa-text)] opacity-70">
                  {item.productName} × {item.quantity}
                </span>
                <span className="text-[13px] text-[var(--pwa-text)]">
                  {formatPrice(item.unitPrice * item.quantity, currency)}
                </span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-[var(--pwa-accent)] pt-3">
              <span className="font-[family-name:var(--pwa-font-heading)] text-[0.9rem] italic text-[var(--pwa-text)]">Total</span>
              <span className="font-[family-name:var(--pwa-font-heading)] text-base italic text-[var(--pwa-accent)]">{total}</span>
            </div>
          </div>
        )}
        {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && (
          <PriceDisclaimer className="mt-2" />
        )}

        {submitError && (
          <p role="alert" className="text-[13px] text-[var(--pwa-error)]">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !isOnline || directOrdersBlocked}
          className={PRIMARY_BUTTON}
        >
          {isSubmitting ? 'Enviando…' : 'Enviar pedido'}
        </button>
      </form>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pwa-bg)]">

      {/* Header: mobile only; desktop nav handled by global TopBar */}
      {isMobile ? (
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[var(--pwa-border)] bg-[var(--pwa-bg)] px-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="flex h-11 w-11 items-center justify-center border-0 bg-transparent text-[var(--pwa-text)] opacity-60"
          >
            <BackIcon />
          </button>
          <h1 className="m-0 font-[family-name:var(--pwa-font-heading)] text-[1.1rem] font-normal italic text-[var(--pwa-text)]">
            {title}
          </h1>
          <span aria-hidden="true" className="w-11" />
        </header>
      ) : (
        <div className="px-6 py-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] items-center gap-1.5 border-0 bg-transparent font-[family-name:var(--pwa-font-body)] text-[13px] text-[var(--pwa-text-secondary)]"
          >
            <BackIcon size={14} />
            Volver
          </button>
        </div>
      )}

      <main className="mx-auto max-w-[480px] px-6 pb-[88px] pt-10">
        {!isMobile && (
          <h1 className="mb-6 font-[family-name:var(--pwa-font-heading)] text-2xl font-normal italic text-[var(--pwa-text)]">
            {title}
          </h1>
        )}

        {offlineNotice}
        {orderTypeTabs}
        {isDirect && !directOrdersBlocked && !optionsLoading && <StepIndicator current={step} />}

        {isDeliveryStep ? renderDeliveryStep() : renderDetailsStep()}
      </main>
    </div>
  );
};

export default LuxuryMinimalismCheckoutSkin;
