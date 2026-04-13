'use client';

import { useEffect, useState } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';

interface Props {
  endTime: string; // ISO string
}

export default function CountdownTimer({ endTime }: Props) {
  // Initialize as null to avoid hydration mismatch
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const calc = () => {
      const end = parseISO(endTime);
      const diff = differenceInSeconds(end, new Date());
      setSecondsLeft(Math.max(0, diff));
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (secondsLeft === null) {
    return <div className="text-5xl font-mono font-bold text-gray-300">--:--:--</div>;
  }

  if (secondsLeft <= 0) {
    return (
      <div className="text-2xl font-bold text-red-500">Session Expired</div>
    );
  }

  const hours   = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const colorClass =
    secondsLeft > 1800 ? 'text-emerald-600' :
    secondsLeft > 600  ? 'text-yellow-500'  :
                         'text-red-500';

  return (
    <div className={`text-5xl font-mono font-bold tabular-nums ${colorClass}`}>
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
