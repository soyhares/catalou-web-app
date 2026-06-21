export interface BookingServiceItem {
  itemId: string;
  quantity: number;
}

export interface BookingServiceDetail {
  itemId: string;
  name: string;
  durationMinutes: number;
  quantity: number;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: AvailableSlot[];
  nextAvailableSlot: { date: string; time: string } | null;
}

export interface CreateBookingPayload {
  visitorName: string;
  visitorContact: string;
  visitorContactType: 'email' | 'phone';
  preferredDate: string;
  preferredTime: string;
  message?: string;
  affiliateNumber?: string;
  services: BookingServiceItem[];
}

export interface BookingPublicResponse {
  id: string;
  status: 'pending';
  preferredDate: string;
  preferredTime: string;
  services: BookingServiceDetail[];
  totalDurationMinutes: number;
}

export interface SelectedService {
  itemId: string;
  name: string;
  durationMinutes: number;
  basePrice: number | null;
  quantity: number;
}
