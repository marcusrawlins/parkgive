'use client';

import { useState } from 'react';
import type { DurationOption } from '@/lib/types';
import { calcStripeFee, formatCents } from '@/lib/pricing';
import DurationSelector from './DurationSelector';

const DONATION_PRESETS = [
  { label: 'None',  cents: 0    },
  { label: '+$2',   cents: 200  },
  { label: '+$5',   cents: 500  },
  { label: '+$10',  cents: 1000 },
];

interface Props {
  durationOptions: DurationOption[];
}

export default function ParkingForm({ durationOptions }: Props) {
  const [licensePlate, setLicensePlate]         = useState('');
  const [selectedDuration, setSelectedDuration] = useState(durationOptions[0]);
  const [donationPreset, setDonationPreset]     = useState(0);
  const [customDonation, setCustomDonation]     = useState('');
  const [isCustom, setIsCustom]                 = useState(false);
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [error, setError]                       = useState('');

  const parking = selectedDuration.priceCents;
  const donation = isCustom
    ? Math.max(0, Math.round(parseFloat(customDonation || '0') * 100))
    : donationPreset;
  const processingFee = calcStripeFee(parking + donation);
  const total = parking + donation + processingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      setError('Please enter your license plate number.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licensePlate: licensePlate.trim().toUpperCase(),
          durationHours: selectedDuration.hours,
          donationCents: donation,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to start checkout.');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* License plate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          License Plate <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          placeholder="ABC 1234"
          maxLength={10}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xl font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
        <DurationSelector
          options={durationOptions}
          selected={selectedDuration}
          onSelect={setSelectedDuration}
        />
      </div>

      {/* Donation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Extra Donation{' '}
          <span className="text-gray-400 font-normal">(optional — goes to the youth program)</span>
        </label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {DONATION_PRESETS.map((preset) => (
            <button
              key={preset.cents}
              type="button"
              onClick={() => { setIsCustom(false); setDonationPreset(preset.cents); setCustomDonation(''); }}
              className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                !isCustom && donationPreset === preset.cents
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={customDonation}
            onChange={(e) => { setIsCustom(true); setCustomDonation(e.target.value); setDonationPreset(0); }}
            onFocus={() => setIsCustom(true)}
            placeholder="Custom amount"
            className={`w-full pl-7 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow ${
              isCustom ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'
            }`}
          />
        </div>
      </div>

      {/* Price summary */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm border border-gray-100">
        <div className="flex justify-between text-gray-600">
          <span>Parking ({selectedDuration.label})</span>
          <span>{formatCents(parking)}</span>
        </div>
        {donation > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Donation ❤️</span>
            <span>{formatCents(donation)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-400 text-xs">
          <span>Processing fee</span>
          <span>{formatCents(processingFee)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-base">
          <span>Total</span>
          <span>{formatCents(total)}</span>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-xl py-2 px-4">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !licensePlate.trim()}
        className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-2xl hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {isSubmitting ? 'Redirecting to payment…' : `Pay ${formatCents(total)}`}
      </button>

      <p className="text-center text-xs text-gray-400">
        🔒 Secured by Stripe · Proceeds support the local youth program
      </p>
    </form>
  );
}
