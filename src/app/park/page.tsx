import type { Metadata } from 'next';
import Link from 'next/link';
import { DURATION_OPTIONS } from '@/lib/pricing';
import ParkingForm from '@/components/ParkingForm';

export const metadata: Metadata = {
  title: 'Pay to Park | ParkGive',
};

export default function ParkPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none">
          ←
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl">🅿️</span>
          <span className="text-lg font-bold text-emerald-600">ParkGive</span>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pay to Park</h1>
        <p className="text-gray-500 text-sm mb-8">
          Proceeds support the local youth program. ❤️
        </p>
        <ParkingForm durationOptions={DURATION_OPTIONS} />
      </div>
    </div>
  );
}
