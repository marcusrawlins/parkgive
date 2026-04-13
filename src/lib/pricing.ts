import type { DurationOption } from './types';

export const DURATION_OPTIONS: DurationOption[] = [
  { label: '1 Hour',  hours: 1,  priceCents: 200  },
  { label: '2 Hours', hours: 2,  priceCents: 400  },
  { label: '4 Hours', hours: 4,  priceCents: 800  },
  { label: 'All Day', hours: 24, priceCents: 1000 },
];

/** Parking fee in cents: $2/hr, capped at $10/day */
export function calcParkingFee(hours: number): number {
  return Math.min(hours * 200, 1000);
}

/** Stripe processing fee: 2.9% + $0.30, passed to customer */
export function calcStripeFee(subtotalCents: number): number {
  return Math.round(subtotalCents * 0.029 + 30);
}

/** Total charge in cents including Stripe fee */
export function calcTotal(parkingCents: number, donationCents: number): number {
  const subtotal = parkingCents + donationCents;
  return subtotal + calcStripeFee(subtotal);
}

/** Format cents as a dollar string, e.g. 200 → "$2.00" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
