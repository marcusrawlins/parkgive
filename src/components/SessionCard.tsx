import type { Session } from '@/lib/types';
import { formatCents } from '@/lib/pricing';
import { differenceInMinutes, parseISO } from 'date-fns';

interface Props {
  session: Session;
}

export default function SessionCard({ session }: Props) {
  const minutesLeft = session.end_time
    ? Math.max(0, differenceInMinutes(parseISO(session.end_time), new Date()))
    : null;

  const durationLabel =
    session.duration_hours === 24 ? 'All Day' : `${session.duration_hours}hr`;

  const timeColor =
    minutesLeft === null ? 'text-gray-400' :
    minutesLeft > 30     ? 'text-emerald-600' :
    minutesLeft > 10     ? 'text-yellow-500'  :
                           'text-red-500';

  const timeLabel =
    minutesLeft === null  ? '—' :
    minutesLeft === 0     ? 'Expiring' :
    minutesLeft > 60      ? `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m left` :
                            `${minutesLeft}m left`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <span className="font-mono font-bold text-gray-900 text-lg tracking-wider">
          {session.license_plate}
        </span>
        <span className="text-gray-400 text-sm ml-2">{durationLabel}</span>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm ${timeColor}`}>{timeLabel}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {formatCents(session.parking_amount_cents + session.donation_amount_cents)}
        </p>
      </div>
    </div>
  );
}
