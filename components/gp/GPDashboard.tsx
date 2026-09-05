'use client';

import { useState } from 'react';
import { useMounted } from '@/lib/useMounted';
import { useStore } from '@/lib/store';
import { deriveFlags, flagKey } from '@/lib/adherence';
import PatientTable from './PatientTable';
import PatientDetail from '@/components/gp/PatientDetail';

export default function GPDashboard() {
  const mounted = useMounted();
  const [selected, setSelected] = useState<string | null>(null);
  const patients = useStore((s) => s.patients);
  const reviewed = useStore((s) => s.reviewed);

  if (!mounted) return <div className="h-full min-h-full bg-clinical" />;

  const flaggedCount = patients.filter((p) =>
    deriveFlags(p).some((f) => !reviewed[flagKey(f)])
  ).length;

  return (
    <div className="h-full min-h-full overflow-y-auto bg-clinical font-gp text-sm tabular-nums text-ink">
      {selected ? (
        <PatientDetail patientId={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          <header className="flex items-baseline justify-between gap-4 border-b border-rule px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h1 className="font-medium">Oakfield surgery</h1>
              <span className="text-slate">Medication check-ins</span>
            </div>
            <div className="whitespace-nowrap text-slate">
              {patients.length} patients · {flaggedCount} flagged
            </div>
          </header>
          <PatientTable onSelect={setSelected} />
        </>
      )}
    </div>
  );
}
