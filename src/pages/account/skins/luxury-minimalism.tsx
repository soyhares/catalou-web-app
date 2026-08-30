import React, { useState } from 'react';
import { formatPrice } from '@shared/lib/formatPrice';
import type { AccountPageProps } from '../useAccountPage';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  ASSOCIATION_CONFIRMED: 'Aprobado',
  COMPLETED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const rule: React.CSSProperties = {
  width: '40px',
  height: '1px',
  backgroundColor: 'var(--pwa-accent)',
  margin: '0 0 28px',
};

const label: React.CSSProperties = {
  fontFamily: 'var(--pwa-font-body)',
  fontSize: '11px',
  color: 'var(--pwa-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  margin: '0 0 8px',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const LuxuryMinimalismAccountSkin: React.FC<AccountPageProps> = ({
  profile,
  orders,
  currency,
  isLoading,
  error,
  isDeleting,
  onRetry,
  onSignOut,
  onDeleteAccount,
  onGoBack,
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', padding: '32px 24px 96px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={rule} />

        <h1 style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontSize: '1.8rem',
          fontWeight: 400,
          color: 'var(--pwa-text)',
          margin: '0 0 6px',
        }}>
          Tu cuenta
        </h1>
        <p style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '13px',
          color: 'var(--pwa-text-secondary)',
          margin: '0 0 32px',
        }}>
          {profile?.name ?? ''}
        </p>

        {error && (
          <div role="alert" style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: '#b42318', margin: '0 0 8px' }}>{error}</p>
            <button
              type="button"
              onClick={onRetry}
              style={{
                fontSize: '12px',
                color: 'var(--pwa-accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        <p style={label}>Tus datos</p>
        <dl style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '13px',
          color: 'var(--pwa-text)',
          margin: '0 0 32px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <dt style={{ color: 'var(--pwa-text-secondary)' }}>Correo</dt>
            <dd style={{ margin: 0, wordBreak: 'break-all' }}>{profile?.email ?? '—'}</dd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <dt style={{ color: 'var(--pwa-text-secondary)' }}>Teléfono</dt>
            <dd style={{ margin: 0 }}>{profile?.phone ?? '—'}</dd>
          </div>
        </dl>

        <p style={label}>Tus pedidos</p>
        {isLoading ? (
          <p style={{ fontSize: '13px', color: 'var(--pwa-text-secondary)' }}>Cargando...</p>
        ) : orders.length === 0 ? (
          <p style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '13px',
            color: 'var(--pwa-text-secondary)',
            margin: '0 0 32px',
          }}>
            Todavía no tenés pedidos con este negocio.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
            {orders.map((order) => (
              <li
                key={order.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--pwa-border)',
                }}
              >
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--pwa-text)', margin: 0 }}>
                    {formatDate(order.createdAt)}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--pwa-text-secondary)', margin: '2px 0 0' }}>
                    {STATUS_LABELS[order.status] ?? order.status}
                    {order.itemCount ? ` · ${order.itemCount} ítems` : ''}
                  </p>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--pwa-text)' }}>
                  {formatPrice(order.total, currency as 'USD' | 'CRC')}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={onGoBack}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: 'var(--pwa-accent)',
              color: 'var(--pwa-on-accent)',
              border: 'none',
              borderRadius: 'var(--pwa-radius-button)',
              cursor: 'pointer',
            }}
          >
            Seguir explorando
          </button>

          <button
            type="button"
            onClick={onSignOut}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '13px',
              color: 'var(--pwa-text)',
              background: 'none',
              border: '1px solid var(--pwa-border)',
              borderRadius: 'var(--pwa-radius-button)',
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Baja self-service (gate legal §3). Dice qué pasa con los pedidos ANTES de
            confirmar, en vez de dejar creer que se borra el historial del negocio. */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--pwa-border)' }}>
          {confirmingDelete ? (
            <>
              <p style={{
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '12px',
                color: 'var(--pwa-text-secondary)',
                lineHeight: 1.6,
                margin: '0 0 14px',
              }}>
                Se elimina tu cuenta en este negocio y tus datos de contacto. Tus pedidos no se
                borran: quedan en el registro del negocio sin tu cuenta asociada. Si tenés
                cuenta en otros negocios, esas no se tocan.
              </p>
              <button
                type="button"
                onClick={onDeleteAccount}
                disabled={isDeleting}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#b42318',
                  background: 'none',
                  border: '1px solid #b42318',
                  borderRadius: 'var(--pwa-radius-button)',
                  cursor: 'pointer',
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                  fontSize: '12px',
                  color: 'var(--pwa-text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              style={{
                fontSize: '12px',
                color: 'var(--pwa-text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Eliminar mi cuenta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuxuryMinimalismAccountSkin;
