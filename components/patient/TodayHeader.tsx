'use client';

import type { Patient } from '@/lib/types';
import { fmtDoseTime, isToday } from './BlisterPack';

/**
 * Weekday and date, then one calm status line computed from today's doses.
 * No greeting, no score, no praise.
 */
export default function TodayHeader({ patient }: { patient: Patient }) {
  const now = new Date();
  const dateLine = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Medicines the patient has stopped keep seed doses marked 'due' today;
  // they are not actually due, so they never drive the status line.
  const stoppedMeds = new Set(
    patient.doses.filter((d) => d.status === 'stopped').map((d) => d.medicineId),
  );
  const pending = patient.doses
    .filter((d) => isToday(d.scheduledAt) && d.status === 'due' && !stoppedMeds.has(d.medicineId))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const next = pending[0];
  const nextMedicine = next ? patient.medicines.find((m) => m.id === next.medicineId) : undefined;
  const statusLine =
    next && nextMedicine
      ? `${nextMedicine.name} at ${fmtDoseTime(next.scheduledAt)}.`
      : 'Nothing due until tomorrow.';

  return (
    <header>
      <p className="text-[15px] text-slate">{dateLine}</p>
      <p className="mt-1 text-[20px] font-medium leading-snug text-ink">{statusLine}</p>
    </header>
  );
}
