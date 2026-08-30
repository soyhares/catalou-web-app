import React from 'react';
import type { ActivateAccountPageProps } from '../useActivateAccountPage';

const shell: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--pwa-bg)',
  padding: '0 24px',
};

const accentRule: React.CSSProperties = {
  width: '40px',
  height: '1px',
  backgroundColor: 'var(--pwa-accent)',
  margin: '0 auto 32px',
};

const primaryButton: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  fontSize: '14px',
  fontWeight: 600,
  backgroundColor: 'var(--pwa-accent)',
  color: 'var(--pwa-on-accent)',
  border: 'none',
  borderRadius: 'var(--pwa-radius-button)',
  cursor: 'pointer',
};

const LuxuryMinimalismActivateAccountSkin: React.FC<ActivateAccountPageProps> = ({
  email,
  code,
  isVerifying,
  error,
  linkedOrderCount,
  onCodeChange,
  onSubmit,
  onCancel,
  onDone,
}) => linkedOrderCount !== null ? (
  <div style={shell}>
    <div style={{ width: '100%', maxWidth: '340px', textAlign: 'center' }}>
      <div style={accentRule} />
      <h1 style={{ fontFamily: 'var(--pwa-font-heading)', fontSize: '1.6rem', fontWeight: 400, color: 'var(--pwa-text)', margin: '0 0 12px' }}>
        Tu cuenta está lista
      </h1>
      <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '13px', color: 'var(--pwa-text-secondary)', lineHeight: 1.6, margin: '0 0 28px' }}>
        {/* T062: the account must not look empty when the order that motivated it is in it */}
        {linkedOrderCount === 0
          ? 'La próxima vez no vas a tener que escribir tus datos otra vez'
          : linkedOrderCount === 1
            ? 'Tu pedido ya quedó en tu historial'
            : `Tus ${linkedOrderCount} pedidos ya quedaron en tu historial`}
      </p>
      <button type="button" onClick={onDone} style={primaryButton}>
        Seguir explorando
      </button>
    </div>
  </div>
) : (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--pwa-bg)',
      padding: '0 24px',
    }}
  >
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      style={{ width: '100%', maxWidth: '340px', textAlign: 'center' }}
    >
      <div
        style={{
          width: '40px',
          height: '1px',
          backgroundColor: 'var(--pwa-accent)',
          margin: '0 auto 32px',
        }}
      />

      <h1
        style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontSize: '1.6rem',
          fontWeight: 400,
          color: 'var(--pwa-text)',
          margin: '0 0 12px',
        }}
      >
        Ingresá tu código
      </h1>

      <p
        style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '13px',
          color: 'var(--pwa-text-secondary)',
          lineHeight: 1.6,
          margin: '0 0 28px',
        }}
      >
        Te enviamos un código de 6 dígitos {email ? `a ${email}` : 'a tu correo'}
      </p>

      <label htmlFor="activation-code" className="sr-only">
        Código de activación
      </label>
      <input
        id="activation-code"
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'activation-error' : undefined}
        style={{
          width: '100%',
          padding: '14px',
          textAlign: 'center',
          fontSize: '22px',
          letterSpacing: '0.4em',
          fontFamily: 'var(--pwa-font-body)',
          color: 'var(--pwa-text)',
          backgroundColor: 'var(--pwa-surface)',
          border: '1px solid var(--pwa-border)',
          borderRadius: 'var(--pwa-radius-button)',
        }}
      />

      {error && (
        <p
          id="activation-error"
          role="alert"
          style={{ fontSize: '12px', color: '#b42318', margin: '10px 0 0' }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isVerifying || code.length !== 6 || !email}
        style={{
          width: '100%',
          marginTop: '20px',
          padding: '14px',
          fontSize: '14px',
          fontWeight: 600,
          backgroundColor: 'var(--pwa-accent)',
          color: 'var(--pwa-on-accent)',
          border: 'none',
          borderRadius: 'var(--pwa-radius-button)',
          opacity: isVerifying || code.length !== 6 || !email ? 0.6 : 1,
          cursor: 'pointer',
        }}
      >
        {isVerifying ? 'Verificando...' : 'Activar mi cuenta'}
      </button>

      <p
        style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '11px',
          color: 'var(--pwa-text-secondary)',
          opacity: 0.75,
          lineHeight: 1.6,
          margin: '18px 0 0',
        }}
      >
        Guardamos tu nombre, correo y teléfono junto al historial de tus pedidos en este
        negocio.{' '}
        <a
          href="https://catalou.com/privacidad"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--pwa-accent)', textDecoration: 'underline' }}
        >
          Cómo tratamos tus datos
        </a>
      </p>

      <button
        type="button"
        onClick={onCancel}
        style={{
          marginTop: '16px',
          fontSize: '11px',
          color: 'var(--pwa-text)',
          opacity: 0.6,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--pwa-font-body)',
        }}
      >
        Ahora no
      </button>
    </form>
  </div>
);

export default LuxuryMinimalismActivateAccountSkin;
