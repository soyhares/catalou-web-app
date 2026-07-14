const BUSINESS_CATEGORY_LABELS: Record<string, string> = {
  BARBERSHOP: 'Barbería',
  BEAUTY_SALON: 'Salón de belleza',
  SPA: 'Spa',
  BOUTIQUE: 'Boutique de ropa',
  JEWELRY: 'Joyería',
  FLORIST: 'Floristería',
  PERFUMERY: 'Perfumería',
  TATTOO_STUDIO: 'Estudio de tatuaje',
  ART_GALLERY: 'Galería de arte',
  RESTAURANT: 'Restaurante',
  PHARMACY: 'Farmacia',
  RETAIL: 'Tienda / Retail',
  PERSONAL_SHOPPER: 'Personal Shopper',
  PROFESSIONAL_SERVICES: 'Servicios profesionales',
  ASSOCIATION: 'Asociación',
  OTHER: 'Otro',
};

export function businessCategoryLabel(category: string | null): string | null {
  if (!category) return null;
  return BUSINESS_CATEGORY_LABELS[category] ?? null;
}
