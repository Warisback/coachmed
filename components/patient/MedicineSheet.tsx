'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { Medicine } from '@/lib/types';
import { ClockIcon, CrossIcon } from '@/components/shared/Icon';
import LeafletCard from './LeafletCard';

/** '08:00' → '8am', '20:00' → '8pm', '08:30' → '8:30am'. */
function friendlyTime(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
}

/** 'One tablet at 8am and 8pm.' */
function scheduleLine(medicine: Medicine): string {
  const times = medicine.schedule.map(friendlyTime);
  const list =
    times.length > 1
      ? `${times.slice(0, -1).join(', ')} and ${times[times.length - 1]}`
      : times[0] ?? '';
  return `One ${medicine.form} at ${list}.`;
}

type View = 'leaflet' | 'report' | 'sent';

/**
 * Bottom sheet for one medicine: the leaflet as an infographic, plus the
 * "Something doesn't feel right" report flow. Positioned absolute inset-0 so
 * it stays inside the phone frame on /demo.
 */
export default function MedicineSheet({
  medicineId,
  patientId,
  onClose,
}: {
  medicineId: string;
  patientId: string;
  onClose: () => void;
}) {
  const patient = useStore((s) => s.patients.find((p) => p.id === patientId));
  const reportIssue = useStore((s) => s.reportIssue);
  const [view, setView] = useState<View>('leaflet');
  const [words, setWords] = useState('');
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const medicine = patient?.medicines.find((m) => m.id === medicineId);
  if (!patient || !medicine) return null;

  const stopped = patient.doses.some((d) => d.medicineId === medicineId && d.status === 'stopped');
  const notedDoses = patient.doses.filter((d) => d.medicineId === medicineId && d.note);
  const patientWords = notedDoses.length
    ? notedDoses.reduce((a, b) => (a.scheduledAt > b.scheduledAt ? a : b)).note
    : undefined;

  const send = () => {
    const text = words.trim();
    if (!text) return;
    reportIssue(medicineId, text);
    setView('sent');
    timer.current = window.setTimeout(() => onClose(), 1400);
  };

  return (
    <div
      className="absolute inset-0 z-40"
      role="dialog"
      aria-modal="true"
      aria-label={`${medicine.name} ${medicine.strength}`}
    >
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 max-h-[85%] overflow-y-auto rounded-t-xl bg-paper p-6 text-[17px] leading-relaxed text-ink">
        {view === 'sent' ? (
          <p className="py-14 text-center text-[19px] leading-snug">
            Your GP will see this before your next appointment.
          </p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-semibold leading-tight">
                  {medicine.name} {medicine.strength}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-slate">
                  <ClockIcon size={18} className="shrink-0" />
                  <span>{scheduleLine(medicine)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate"
              >
                <CrossIcon size={22} />
              </button>
            </div>

            {view === 'leaflet' ? (
              <>
                <div className="mt-6">
                  <p className="text-sm text-slate">What it’s for</p>
                  <p className="mt-1 text-[22px] leading-snug">{medicine.purpose}</p>
                </div>

                <div className="mt-6">
                  <LeafletCard medicine={medicine} patient={patient} />
                </div>

                {stopped && (
                  <div className="mt-6">
                    <p>You stopped taking this.</p>
                    {patientWords && (
                      <p className="mt-2 italic text-slate">“{patientWords}”</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setView('report')}
                  className="mt-8 h-[52px] w-full rounded-xl bg-foil font-medium text-ink"
                >
                  Something doesn’t feel right
                </button>
              </>
            ) : (
              <>
                <label htmlFor="medicine-report" className="mt-6 block text-[19px] leading-snug">
                  Tell us what happened, in your words. Your GP will see this.
                </label>
                <textarea
                  id="medicine-report"
                  autoFocus
                  rows={5}
                  value={words}
                  onChange={(e) => setWords(e.target.value)}
                  className="mt-4 w-full rounded-xl border border-rule bg-white p-4 text-[17px] leading-relaxed"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!words.trim()}
                  className="mt-4 h-[52px] w-full rounded-xl bg-ink font-medium text-paper disabled:opacity-40"
                >
                  Send to my GP
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
