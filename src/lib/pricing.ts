import type { DurationOption } from './types';

export const DURATION_OPTIONS: DurationOption[] = [
  { label: '1 Hour',  hours: 1,  priceCents: 200  },
  { label: '2 Hours', hours: 2,  priceCents: 400  },
  { label: '4 Hours', hours: 4,  priceCents: 800  },
  { label: 'All Day', hours: 24, priceCents: 1000 },
];

export function calcParkingFee(hours: number): number {
  return Math.min(hours * 200, 1000);
}

export function calcStripeFee(subtotalCents: number): number {
  return Math.round(subtotalCents * 0.029 + 30);
}

export function formatCents(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}
