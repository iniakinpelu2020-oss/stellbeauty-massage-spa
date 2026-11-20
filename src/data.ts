import type { Treatment } from './types';

export const TREATMENTS: Treatment[] = [
  {
    id: 'swedish-deep-tissue',
    title: 'Swedish & Deep-Tissue Full Body Massage',
    category: 'Massages',
    basePrice: 30000,
    description:
      'A deeply restorative full-body massage combining long, flowing Swedish strokes with targeted deep-tissue pressure to release tension and restore circulation.',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=85',
    includes: [
      '60 / 90 / 120 min session options',
      'Aromatherapy oil selection',
      'Hot towel finish',
      'Private suite & fresh linens'
    ]
  },
  {
    id: 'hot-stone-aromatherapy',
    title: 'Hot Stone & Aromatherapy Ritual',
    category: 'Massages',
    basePrice: 40000,
    description:
      'Warm basalt stones glide across the body while essential oils calm the mind — a signature ritual for deep relaxation and muscle relief.',
    image:
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1000&q=85',
    includes: [
      'Heated volcanic stones',
      'Custom aromatherapy blend',
      'Scalp & neck focus',
      'Herbal tea service'
    ]
  },
  {
    id: 'glass-skin-facial',
    title: 'Hydrating Glass-Skin Luxury Facial',
    category: 'Facials',
    basePrice: 25000,
    description:
      'A multi-step hydrating facial using gentle exfoliation, serum layering, and cooling masks for a luminous, glass-skin finish.',
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=85',
    includes: [
      'Deep cleanse & gentle peel',
      'Hyaluronic serum infusion',
      'Cooling sheet mask',
      'SPF finishing mist'
    ]
  },
  {
    id: 'moroccan-hammam',
    title: 'Moroccan Hammam Body Scrub & Steam',
    category: 'Body & Scrubs',
    basePrice: 35000,
    description:
      'A traditional hammam experience with steam, black-soap cleansing, and a full-body exfoliating scrub for silky, renewed skin.',
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=85',
    includes: [
      'Steam room session',
      'Black-soap cleanse',
      'Full-body exfoliation',
      'Moisturising body wrap'
    ]
  },
  {
    id: 'full-body-waxing',
    title: 'Silky Smooth Full-Body Waxing',
    category: 'Body & Scrubs',
    basePrice: 18000,
    description:
      'Gentle, long-lasting full-body waxing using premium low-temperature wax for smooth, comfortable results.',
    image:
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=85',
    includes: [
      'Premium low-temp wax',
      'Soothing post-wax oil',
      'Hygiene-first protocol',
      'Optional touch-up'
    ]
  },
  {
    id: 'vip-pamper-package',
    title: 'Signature Wuse 2 VIP Pamper Package',
    category: 'VIP Bundles',
    basePrice: 65000,
    description:
      'Our flagship Wuse 2 experience: massage, facial, and scrub combined into one unhurried VIP session in a private suite.',
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85',
    includes: [
      'Full-body massage',
      'Luxury facial',
      'Body scrub & steam',
      'Private VIP suite'
    ]
  }
];

export const CATEGORIES = ['All', 'Massages', 'Facials', 'Body & Scrubs', 'VIP Bundles'] as const;

export const DURATION_MULTIPLIER: Record<string, number> = {
  '60 Mins': 1,
  '90 Mins': 1.4,
  '120 Mins': 1.8
};

export const GUEST_MULTIPLIER: Record<string, number> = {
  'Solo Session': 1,
  'Couples / Duo': 1.85
};

export const DURATIONS = ['60 Mins', '90 Mins', '120 Mins'] as const;
export const GUESTS = ['Solo Session', 'Couples / Duo'] as const;
