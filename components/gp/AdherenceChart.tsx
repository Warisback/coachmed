'use client';
import { Patient } from '@/lib/types';

const DAY = 86400000;

/**
 * A 14-day dose strip: one small square per dose, oldest to newest.
 * Not a chart library, not a line chart — just the record, legible at a glance.
 */
export default function AdherenceChart({ patient, medicineId }: { patient: Patient; medicineId: string }) {
  const since = Date.now() - 14 * DAY;
  const doses = patient.doses
    .filter(d => d.medicineId === medicineId && new Date(d.scheduledAt).getTime() >= since)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  if (!doses.length) {
    return <p className="text-xs text-slate">No data yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-[2px]">
        {doses.map(d => {
          const cls =
            d.status === 'taken' ? 'bg-taken'
            : d.status === 'missed' ? 'bg-missed'
            : d.status === 'stopped' ? 'bg-foil opacity-60'
            : 'bg-rule';
          const day = new Date(d.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          return (
            <span
              key={d.id}
              title={`${day} — ${d.status}`}
              className={`inline-block h-[10px] w-[10px] rounded-[2px] ${cls}`}
            />
          );
        })}
      </div>
      <p className="mt-1 text-xs text-slate">Last 14 days</p>
    </div>
  );
}
