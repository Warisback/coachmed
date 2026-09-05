'use client';
import { useState } from 'react';
import { Flag, FlagKind, Patient } from '@/lib/types';
import { deriveFlags, flagKey } from '@/lib/adherence';
import { useStore } from '@/lib/store';

const PEOPLE = ['Dr Osei', 'Dr Patel', 'Nurse Adeyemi'];
const REPEAT_ASSIGNEE = 'Dr Osei — repeat to sign';

const KIND_LABEL: Record<FlagKind, string> = {
  stopped: 'Stopped',
  missed_pattern: 'Missing doses',
  side_effect: 'Side effect',
  low_supply: 'Low supply',
};

/**
 * One row per active flag. Nothing here auto-resolves: assignment and issuing a
 * repeat are an audit trail, and "Mark reviewed" is the one explicit dismissal.
 */
export default function ActionQueue({ patient }: { patient: Patient }) {
  const assignments = useStore(s => s.assignments);
  const reviewed = useStore(s => s.reviewed);
  const assignFlag = useStore(s => s.assignFlag);
  const markReviewed = useStore(s => s.markReviewed);

  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [repeatSent, setRepeatSent] = useState<Record<string, true>>({});

  const flags = deriveFlags(patient).filter(f => !reviewed[flagKey(f)]);
  if (!flags.length) return null;

  const medName = (id: string) => patient.medicines.find(m => m.id === id)?.name ?? id;

  const rowLabel = (f: Flag) => `${KIND_LABEL[f.kind]} · ${medName(f.medicineId)}`;

  return (
    <section>
      <h2 className="mb-2 text-xs text-slate">Actions</h2>
      <div className="divide-y divide-rule rounded border border-rule bg-white">
        {flags.map(f => {
          const key = flagKey(f);
          const assigned = assignments[key];
          return (
            <div key={key} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
              <span className="min-w-[11rem] font-medium">{rowLabel(f)}</span>

              <span className="flex flex-wrap items-center gap-2">
                {assigned ? (
                  <span className="text-slate">Assigned to {assigned}.</span>
                ) : menuFor === key ? (
                  <span className="flex items-center gap-1">
                    {PEOPLE.map(person => (
                      <button
                        key={person}
                        onClick={() => { assignFlag(key, person); setMenuFor(null); }}
                        className="rounded border border-rule bg-white px-2 py-1 text-xs hover:bg-clinical"
                      >
                        {person}
                      </button>
                    ))}
                  </span>
                ) : (
                  <button
                    onClick={() => setMenuFor(key)}
                    className="rounded border border-rule bg-white px-2 py-1 text-xs hover:bg-clinical"
                  >
                    Assign
                  </button>
                )}

                {f.kind === 'low_supply' && !repeatSent[key] && assigned !== REPEAT_ASSIGNEE && (
                  <button
                    onClick={() => {
                      assignFlag(key, REPEAT_ASSIGNEE);
                      setRepeatSent(prev => ({ ...prev, [key]: true }));
                      setMenuFor(null);
                    }}
                    className="rounded border border-rule bg-white px-2 py-1 text-xs hover:bg-clinical"
                  >
                    Issue repeat
                  </button>
                )}
                {f.kind === 'low_supply' && repeatSent[key] && (
                  <span className="text-xs text-slate">Repeat sent for sign-off.</span>
                )}

                <button
                  onClick={() => markReviewed(key)}
                  className="rounded border border-rule bg-white px-2 py-1 text-xs text-slate hover:bg-clinical hover:text-ink"
                >
                  Mark reviewed
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
