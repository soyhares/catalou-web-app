type Props = {
  size?: number;
  className?: string;
};

/** Isotipo Catalou girando — reemplaza los estados de carga de página completa. */
export function CatalouSpinner({ size = 40, className }: Props) {
  return (
    <div role="status" aria-label="Cargando" className={className}>
      <img
        src="/brand/catalou-isotipo.png"
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        className="catalou-spiral-orbit"
      />
    </div>
  );
}
