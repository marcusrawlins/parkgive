'use client';

import type { DurationOption } from '@/lib/types';
import { formatCents } from '@/lib/pricing';

interface Props {
  options: DurationOption[];
  selected: DurationOption;
  onSelect: (option: DurationOption) => void;
}

export default function DurationSelector({ options, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isSelected = selected.hours === option.hours;
        return (
          <button
            key={option.hours}
            type="button"
            onClick={() => onSelect(option)}
            className={`p-3 rounded-xl border text-left transition-all ${
              isSelected
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50'
            }`}
          >
            <p className={`font-medium text-sm ${isSelected ? 'text-emerald-700' : 'text-gray-600'}`}>
              {option.label}
            </p>
            <p className={`text-xl font-bold mt-0.5 ${isSelected ? 'text-emerald-600' : 'text-gray-900'}`}>
              {formatCents(option.priceCents)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
