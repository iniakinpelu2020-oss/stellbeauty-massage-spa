export type Category = 'Massages' | 'Facials' | 'Body & Scrubs' | 'VIP Bundles';

export type Treatment = {
  id: string;
  title: string;
  category: Category;
  basePrice: number;
  description: string;
  image: string;
  includes: string[];
};

export type Duration = '60 Mins' | '90 Mins';

export type BookingItem = {
  id: string;
  treatmentId: string;
  duration: Duration;
  coupleSuite: boolean;
  price: number;
  addedAt: number;
};
