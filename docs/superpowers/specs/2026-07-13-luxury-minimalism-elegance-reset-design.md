# Luxury Minimalism — reset de elegancia y presencia de marca

## Contexto

`luxury-minimalism` es la única base visual de `catalou-web-app` desde el colapso de 3 skins (PR0, `web-app#40`). B1 (catálogo por propósito, `web-app#41`) construyó sobre esa base sin cuestionarla. Verificando en vivo contra un tenant real (ASEALLERGAN — farmacia/cuidado personal), el resultado se siente genérico y desajustado: tipografía editorial de boutique aplicada a artículos de farmacia, la marca real del tenant (logo con 3 tonos: rosa/verde azulado/navy) casi no se refleja fuera del ícono pequeño del header, botones de acción con fill pálido de bajo contraste, y grillas de producto que se sienten apretadas en mobile y desaprovechan el ancho en desktop.

Este documento define el reset de tokens/componentes que corrige eso, sin reabrir la decisión de base única (ya tomada) ni tocar arquitectura de datos, rutas o lógica de negocio.

## Alcance

**Dentro de alcance:**
- `catalou-web-app/src/shared/styles/pwa-themes.ts` — tokens del tema
- `catalou-web-app/src/shared/styles/pwa-base.css` — reglas globales del skin
- `catalou-web-app/src/shared/ui/ProductListCard.tsx`, `ProductGridCard.tsx` (+ sus skeletons)
- `catalou-web-app/src/pages/catalog/skins/luxury-minimalism.tsx` (header del picker, grids)
- `catalou-web-app/src/pages/catalog/CatalogPicker.tsx`
- `catalou-platform-core/design/skin_premium.md` (doc del skin, se actualiza en paralelo — protocolo de cambio de marca)

**Fuera de alcance:**
- B2 (detalle de producto + WhatsApp) — plan ya escrito (`docs/superpowers/plans/2026-07-13-product-detail-purpose-action.md`), se ejecuta después de este reset y hereda estos tokens actualizados sin cambios propios de diseño.
- Extracción automática de paleta desde el logo, controles de marca ampliados en el admin, selección de voz tipográfica por tenant — evaluados y descartados en el brainstorming; el tenant sigue controlando solo `catalogColorBg/Accent/Text/Card` como hoy.
- Páginas fuera del flujo de catálogo (About, checkout, booking) — no tocadas.

## 1. Tipografía

**Regla:** el itálico serif (`Cormorant Garamond`) queda reservado exclusivamente para **nombres** (de catálogo, de producto/servicio) — el único lugar donde una voz editorial suma sin desentonar con cualquier rubro. Todo lo demás (precio, metadatos, labels) usa Lato.

**Cambios concretos:**
- Precio: pasa de `fontFamily: var(--pwa-font-heading); fontStyle: italic` a `fontFamily: var(--pwa-font-body); fontWeight: 700`, mismo color de acento. Aplica en `ProductDetailPage` (skin) y donde se muestre precio destacado — `ProductListCard`/`ProductGridCard` ya usan Lato para precio, no requieren cambio.
- Nombre de producto en `ProductListCard`: baja de `clamp(0.95rem, 2.5vw, 1.05rem)` a `clamp(0.9rem, 2.2vw, 1rem)` — un escalón más contenido.
- Nombre de catálogo en `CatalogPicker`: mantiene itálico (es el lugar correcto para la voz editorial — nombre del negocio/categoría), sin cambio de tamaño.
- Ningún cambio en `pwa-themes.ts` (`headingFont`/`bodyFont` se mantienen — Cormorant Garamond + Lato siguen siendo la pareja tipográfica, solo se usa con más disciplina).

## 2. Header del picker — presencia de marca

**Estado actual** (`CatalogPicker.tsx` invocado desde `luxury-minimalism.tsx`, bloque `isMobile && (...)`): logo a `height: 48px` si existe, si no un `<span>` con el nombre en itálico 1.3rem — nunca ambos a la vez. Sin uso de `bannerUrl`.

**Cambio:**
- Logo sube a `height: 72px` cuando existe.
- El nombre del tenant se muestra **siempre** debajo del logo (no condicional a la ausencia de logo), en `fontFamily: var(--pwa-font-body); fontWeight: 500; fontSize: 0.95rem` — no itálico, lockup logo+nombre.
- Si `branding.bannerUrl` está presente, se renderiza como franja `width: 100%; aspect-ratio: 16/5; object-fit: cover; border-radius: var(--pwa-radius-md)` **arriba** del bloque logo+nombre, con `margin-bottom: 16px`. `BrandingData.bannerUrl` ya viene cargado en `branding` (sin fetch nuevo).
- El header del picker (bloque `isMobile && (...)` cuando `isPicker`) gana padding vertical: de `14px 18px 10px` a `24px 20px 20px` — más alto, se siente entrada de storefront en vez de barra utilitaria.
- Este cambio aplica **solo cuando `isPicker`** — el header compacto de dentro-de-catálogo (con back/cart/nombre de catálogo activo) no cambia, sigue optimizado para espacio en una pantalla sticky de navegación.

## 3. CTA — énfasis dinámico (solid / outline / texto)

**Regla:** el peso visual de un botón de acento (`Agregar`/`Reservar`, no WhatsApp) depende de cuántas acciones compiten en esa pantalla, no de una única decisión global:

| Situación | Tratamiento |
|---|---|
| Único CTA visible (quick-action pill en `ProductListCard`/`ProductGridCard` — ahí nunca compite con otro botón) | **Solid**: `backgroundColor: var(--pwa-accent)`, `color: var(--pwa-on-accent)` |
| Único CTA en el detalle de producto (WhatsApp no disponible — tenant no es `DIRECT` o no tiene número) | **Solid**, mismo tratamiento |
| CTA principal en el detalle cuando WhatsApp SÍ está disponible (conviven 2 acciones) | **Outline**: `background: transparent`, `border: 1.5px solid var(--pwa-accent)`, `color: var(--pwa-accent)` |
| WhatsApp (siempre) | Sin cambio — fill verde `#25D366` sólido, es su propia marca reconocible, no entra en este sistema |
| Terciarias (Volver, breadcrumb, "Selecciona una opción") | Sin cambio — texto acentuado sin fondo, como hoy |

**Implementación:** un helper `ctaEmphasis(hasCompetingAction: boolean): 'solid' | 'outline'` en un archivo compartido (`pages/product/purpose.ts` o extensión de `pages/catalog/purpose.ts` — se decide en el plan de implementación). Las cards de catálogo (`ProductListCard`/`ProductGridCard`) siempre pasan `hasCompetingAction: false` (solid fijo). El detalle de producto pasa `hasCompetingAction` según si `WhatsAppProductConsultButton` va a renderizar (mismo chequeo que ya usa ese componente: `businessModel === 'DIRECT' && whatsappNumber`).

Este punto es ortogonal a la resolución de `ctaKind` (book/add/none) del plan de B2 — B2 decide **qué** botón mostrar, este spec decide **cómo se ve** ese botón.

## 4. Espaciado

**Cambios concretos:**
- Gap entre cards: `listStyle`/`gridStyle` en `luxury-minimalism.tsx` — mobile `18px`→`22px`, desktop se resuelve junto con el cambio de grid (punto 5).
- Padding interno de `ProductListCard`: gap entre imagen y contenido `14px`→`16px`.
- Header del picker: cubierto en el punto 2 (padding vertical `14px 18px 10px`→`24px 20px 20px`).
- Espacio entre buscador/chips/contenido (bloque `!isPicker` del header): `padding: '0 20px 12px'` en el contenedor de chips sube a `'0 20px 16px'`.

## 5. Grillas responsive

**Estado actual** (`gridStyle` en `luxury-minimalism.tsx`, usado para `purpose === 'menu' | 'informative'`):
```ts
const gridStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
  gap: isMobile ? '20px 12px' : '24px',
});
```

**Cambio:**
```ts
const gridStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: isMobile ? '22px' : '24px',
});
```
Mobile pasa de 2 columnas a **1 columna siempre** (`listStyle`, usado por `purpose === 'services'`, ya es 1 columna en mobile — sin cambio ahí). Desktop deja de tener un número fijo de columnas (`repeat(4, 1fr)`) y pasa a `repeat(auto-fit, minmax(200px, 1fr))` — en una laptop de ~1024px caben ~4-5, en un monitor ancho de ~1600px caben 7-8, sin definir el número a mano.

`listStyle` (services) no cambia su lógica de columnas (ya es 1 col mobile / 2 col desktop) — el ajuste de este spec es solo sobre `gridStyle`.

## 6. Tamaño de imagen/botón — tope fijo

**Problema:** en `ProductGridCard`, la imagen es `aspect-ratio: 1/1` dentro de una columna de grid — con el cambio del punto 5 (columnas más anchas en desktop), la imagen crecería proporcionalmente y se volvería "exuberante".

**Cambio:** la card de grid deja de ser una columna que estira su imagen a `width: 100%`. En su lugar:
- El contenedor de card (`<article>`) gana `maxWidth: 190px` y `margin: 0 auto` — se centra dentro de su celda de grid en vez de ocuparla entera.
- La imagen dentro mantiene `aspect-ratio: 1/1` pero ahora escala relativa a ese `maxWidth: 190px`, no al ancho de columna — mismo tamaño visual en mobile (1 columna, celda ancha) y desktop (celda potencialmente mucho más ancha con `auto-fit`).
- `ProductListCard` no cambia (ya usa tamaño fijo `96px × 96px`, no relativo a columna — cumple la regla desde antes).
- Botones (`Agregar`/`Reservar`/quick-action pill): `padding` y `minHeight` quedan en valores fijos en `px` (ya lo son hoy: `padding: '10px 16px'`, `minHeight: '36px'`) — no había un problema real aquí más allá de confirmar que ningún valor use `vw`/`%`; se audita en la implementación pero no se esperan cambios de valores.

## Testing

Sin lógica nueva que amerite tests unitarios — son tokens CSS, JSX de layout y valores de estilo. Verificación por smoke test en navegador (mismo patrón que B1): 3 propósitos × mobile (375px) y desktop (≥1280px), contra el tenant real ASEALLERGAN, confirmando:
- Nombres en itálico, precios en Lato, sin itálico fuera de nombres.
- Header del picker con logo 72px + nombre visible + banner si existe.
- Botones solid en cards de catálogo; outline en detalle cuando WhatsApp está disponible, solid cuando no.
- 1 columna en mobile (grid y lista), `auto-fit` en desktop sin apretar ni sobre-espaciar.
- Imágenes de grid no exceden ~190px de lado en ningún viewport.

## Protocolo de cambio de marca

Este spec modifica reglas de comportamiento del skin `luxury-minimalism` (tipografía, CTA, espaciado, grillas) — activa `protocols/brand-change.md` en `catalou-platform-core`. `design/skin_premium.md` se actualiza como parte del plan de implementación, antes que el código de `catalou-web-app` (regla de orden del protocolo). Impacto en tenants: todos los tenants activos usan `luxury-minimalism` (base única) — el cambio es aditivo/de refinamiento, no rompe la personalización existente (`catalogColorAccent`/`Bg`/`Text`/`Card` siguen funcionando igual).
