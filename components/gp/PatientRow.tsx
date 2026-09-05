'use client';

import type { Flag, FlagKind, Patient } from '@/lib/types';
import FlagBadge from './FlagBadge';

export interface PatientRowProps {
  patient: Patient;
  /** Active (non-reviewed) flags for this patient. */
  flags: Flag[];
  /** 14-day adherence percentage, or null when the patient has no logged doses yet. */
  pct: number | null;
  /** Epoch ms of the most recent dose.loggedAt, or null when nothing has been logged. */
  lastLogged: number | null;
  onSelect: () => void;
}

const KIND_ORDER: FlagKind[] = ['stopped', 'missed_pattern', 'side_effect', 'low_supply'];

function relativeTime(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PatientRow({ patient, flags, pct, lastLogged, onSelect }: PatientRowProps) {
  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    count: flags.filter((f) => f.kind === kind).length,
  })).filter((g) => g.count > 0);

  const fill =
    pct !== null && pct >= 90 ? 'bg-taken' : pct !== null && pct >= 70 ? 'bg-due' : 'bg-missed';

  return (
    <tr
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className="cursor-pointer border-b border-rule hover:bg-white"
    >
      <td className="px-4 py-2">
        <span className="font-medium">{patient.name}</span>
        <span className="ml-2 text-slate">{patient.age}</span>
      </td>
      <td className="px-3 py-2 text-right">{patient.medicines.length}</td>
      <td className="whitespace-nowrap px-3 py-2">
        {pct === null ? (
          <span className="block text-right text-slate">No data yet</span>
        ) : (
          <span className="flex items-center justify-end gap-2">
            <span>{pct}%</span>
            <span className="inline-block h-1.5 w-12 overflow-hidden rounded-sm bg-rule">
              <span className={`block h-full ${fill}`} style={{ width: `${pct}%` }} />
            </span>
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        {grouped.length ? (
          <span className="flex flex-wrap gap-1">
            {grouped.map((g) => (
              <FlagBadge key={g.kind} kind={g.kind} count={g.count} />
            ))}
          </span>
        ) : (
          <span className="text-slate">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right text-slate">
        {lastLogged === null ? '—' : relativeTime(lastLogged)}
      </td>
    </tr>
  );
}
