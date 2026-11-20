export type Treatment = {
  id: string;
  title: string;
  category: 'Massages' | 'Facials' | 'Body & Scrubs' | 'VIP Bundles';
  basePrice: number;
  description: string;
  image: string;
  includes: string[];
};

export type Duration = '60 Mins' | '90 Mins' | '120 Mins';
export type GuestCount = 'Solo Session' | 'Couples / Duo';

export type BookingItem = {
  id: string;
  treatmentId: string;
  duration: Duration;
  guests: GuestCount;
  price: number;
  addedAt: number;
};
