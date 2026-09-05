'use client';
import { useStore } from '@/lib/store';
import { useMounted } from '@/lib/useMounted';
import { adherencePct, beforeReview, deriveFlags, flagKey } from '@/lib/adherence';
import { ChevronLeftIcon } from '@/components/shared/Icon';
import FlagBadge from '@/components/gp/FlagBadge';
import AdherenceChart from '@/components/gp/AdherenceChart';
import ActionQueue from '@/components/gp/ActionQueue';

/**
 * What the duty GP reads in ten seconds before a review: one paragraph,
 * the dose record per medicine, the patient's own words, and an action
 * queue where nothing resolves itself.
 */
export default function PatientDetail({ patientId, onBack }: { patientId: string; onBack: () => void }) {
  const mounted = useMounted();
  const patients = useStore(s => s.patients);
  const reviewed = useStore(s => s.reviewed);

  if (!mounted) return <div className="h-full min-h-full bg-clinical" />;

  const patient = patients.find(p => p.id === patientId);
  if (!patient) return null;

  const firstName = patient.name.split(' ')[0] ?? patient.name;
  const flags = deriveFlags(patient).filter(f => !reviewed[flagKey(f)]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-slate hover:text-ink"
      >
        <ChevronLeftIcon size={16} />
        All patients
      </button>

      <header className="mt-4">
        <h1 className="text-lg font-medium">{patient.name}</h1>
        <p className="text-slate">{patient.age} · NHS {patient.nhsNumber}</p>
      </header>

      <section className="mt-6">
        <h2 className="mb-2 text-xs text-slate">Before the review</h2>
        <div className="max-w-prose rounded border border-rule bg-white p-4 leading-relaxed text-ink">
          {beforeReview(patient)}
        </div>
      </section>

      <section className="mt-6 space-y-6">
        {patient.medicines.map(m => {
          const medFlags = flags.filter(f => f.medicineId === m.id);
          return (
            <div key={m.id}>
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium">{m.name} {m.strength}</h3>
                <span className="tabular-nums">{adherencePct(patient, m.id)}%</span>
              </div>
              <div className="mt-2">
                <AdherenceChart patient={patient} medicineId={m.id} />
              </div>
              {medFlags.length > 0 && (
                <div className="mt-3 space-y-2">
                  {medFlags.map(f => (
                    <div key={flagKey(f)} className="rounded border border-rule bg-white p-3">
                      <div className="flex items-start gap-2">
                        <FlagBadge kind={f.kind} />
                        <p>{f.detail}</p>
                      </div>
                      {f.patientWords && (
                        <div className="mt-3 border-l-2 border-slate bg-clinical py-2 pl-3">
                          <p className="text-ink">“{f.patientWords}”</p>
                          <p className="mt-1 text-xs text-slate">{firstName}, in the app</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <div className="mt-8">
        <ActionQueue patient={patient} />
      </div>
    </div>
  );
}
