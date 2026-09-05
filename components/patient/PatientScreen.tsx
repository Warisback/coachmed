'use client';

import { useEffect, useRef, useState } from 'react';
import { useMounted } from '@/lib/useMounted';
import { useStore } from '@/lib/store';
import type { Medicine } from '@/lib/types';
import MedicineSheet from '@/components/patient/MedicineSheet';
import TodayHeader from './TodayHeader';
import BlisterPack, { type ReasonTarget } from './BlisterPack';

const OPTION =
  'block w-full min-h-[48px] rounded-xl border border-foil bg-white px-4 py-3 text-left text-ink';

/**
 * Long-press sheet: log it, skip it with a quick reason, or stop the
 * medicine in the patient's own words. Appears still — the press is the
 * only animated moment in the product.
 */
function ReasonSheet({
  target,
  medicine,
  onClose,
  onLogged,
}: {
  target: ReasonTarget;
  medicine: Medicine;
  onClose: () => void;
  onLogged: () => void;
}) {
  const logDose = useStore((s) => s.logDose);
  const skipDose = useStore((s) => s.skipDose);
  const stopMedicine = useStore((s) => s.stopMedicine);
  const [open, setOpen] = useState<'skip' | 'stop' | null>(null);
  const [words, setWords] = useState('');

  return (
    <div className="absolute inset-0 z-30">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div className="absolute inset-x-0 bottom-0 max-h-[85%] overflow-y-auto rounded-t-xl bg-paper p-6">
        <p className="text-[15px] text-slate">
          {medicine.name} {medicine.strength}, {target.timeLabel}
        </p>
        <div className="mt-4 space-y-3">
          <button
            type="button"
            className={OPTION}
            onClick={() => {
              logDose(target.doseId);
              onLogged();
              onClose();
            }}
          >
            I took it earlier
          </button>

          <button
            type="button"
            className={OPTION}
            onClick={() => setOpen((o) => (o === 'skip' ? null : 'skip'))}
          >
            Skip this one
          </button>
          {open === 'skip' && (
            <div className="flex flex-wrap gap-2">
              {['Felt sick', 'Forgot', 'Away from home'].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    skipDose(target.doseId, reason);
                    onClose();
                  }}
                  className="min-h-[44px] grow rounded-xl border border-foil bg-white px-4 text-[15px] text-ink"
                >
                  {reason}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className={OPTION}
            onClick={() => setOpen((o) => (o === 'stop' ? null : 'stop'))}
          >
            I&rsquo;ve stopped taking this
          </button>
          {open === 'stop' && (
            <div>
              <label htmlFor="stop-words" className="block text-[15px] text-slate">
                Tell us why, in your words. Your GP will see this.
              </label>
              <textarea
                id="stop-words"
                rows={3}
                value={words}
                onChange={(e) => setWords(e.target.value)}
                className="mt-2 w-full rounded-xl border border-foil bg-white p-3 text-ink"
              />
              <button
                type="button"
                disabled={!words.trim()}
                onClick={() => {
                  stopMedicine(target.medicineId, words.trim());
                  onClose();
                }}
                className="mt-3 min-h-[48px] w-full rounded-xl bg-ink text-white disabled:opacity-40"
              >
                Send to my GP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** The whole patient app for Ellen. Fills its parent and scrolls internally. */
export default function PatientScreen() {
  const mounted = useMounted();
  const patients = useStore((s) => s.patients);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [viewH, setViewH] = useState<number | null>(null);
  const [medicineSheetId, setMedicineSheetId] = useState<string | null>(null);
  const [reasonTarget, setReasonTarget] = useState<ReasonTarget | null>(null);
  const [logged, setLogged] = useState(false);
  const toastTimer = useRef<number | null>(null);

  // Overlays live in a sticky zero-height layer so they cover the visible
  // screen even when the root has scrolled (absolute inset-0 in a scroll
  // container only covers the first viewport). Measure the visible height.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => setViewH(el.clientHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [mounted]);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showLogged = () => {
    setLogged(true);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setLogged(false), 1500);
  };

  if (!mounted) return <div className="h-full bg-paper" />;
  const patient = patients.find((p) => p.id === 'ellen');
  if (!patient) return <div className="h-full bg-paper" />;

  const reasonMedicine = reasonTarget
    ? patient.medicines.find((m) => m.id === reasonTarget.medicineId)
    : undefined;
  const sheetOpen = medicineSheetId !== null || (reasonTarget !== null && !!reasonMedicine);

  return (
    <div ref={rootRef} className="relative h-full overflow-y-auto bg-paper text-ink text-[17px]">
      {sheetOpen && (
        <div className="sticky top-0 z-30 h-0">
          <div className="relative" style={{ height: viewH ?? undefined }}>
            {medicineSheetId && (
              <MedicineSheet
                medicineId={medicineSheetId}
                patientId="ellen"
                onClose={() => setMedicineSheetId(null)}
              />
            )}
            {reasonTarget && reasonMedicine && (
              <ReasonSheet
                target={reasonTarget}
                medicine={reasonMedicine}
                onClose={() => setReasonTarget(null)}
                onLogged={showLogged}
              />
            )}
          </div>
        </div>
      )}

      {logged && (
        <div className="pointer-events-none sticky top-0 z-20 h-0">
          <div className="relative" style={{ height: viewH ?? undefined }}>
            <div className="absolute inset-x-0 bottom-6 flex justify-center">
              <span className="rounded-xl border border-foil bg-white px-4 py-2 text-[15px] text-slate">
                Logged.
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pb-16 pt-7">
        <TodayHeader patient={patient} />
        <div className="mt-7">
          <BlisterPack
            patient={patient}
            onOpenMedicine={setMedicineSheetId}
            onOpenReasons={setReasonTarget}
            onLogged={showLogged}
          />
        </div>
      </div>
    </div>
  );
}
