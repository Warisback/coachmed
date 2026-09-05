'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { adherencePct, deriveFlags, flagKey } from '@/lib/adherence';
import type { Flag, Patient } from '@/lib/types';
import PatientRow from './PatientRow';

type SortKey = 'name' | 'adherence' | 'last';
type SortDir = 'asc' | 'desc';
type Sort = { key: SortKey; dir: SortDir } | null;

interface RowData {
  patient: Patient;
  flags: Flag[];
  pct: number | null;
  lastLogged: number | null;
}

/** Ascending compare that always sends nulls (no data) to the bottom. */
function nullsLast(a: number | null, b: number | null, dir: SortDir): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return dir === 'asc' ? a - b : b - a;
}

function Triangle({ dir }: { dir: SortDir }) {
  return (
    <span
      aria-hidden
      className={
        dir === 'asc'
          ? 'inline-block h-0 w-0 border-x-4 border-x-transparent border-b-4 border-b-slate'
          : 'inline-block h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-slate'
      }
    />
  );
}

export default function PatientTable({ onSelect }: { onSelect: (patientId: string) => void }) {
  const patients = useStore((s) => s.patients);
  const reviewed = useStore((s) => s.reviewed);
  const [sort, setSort] = useState<Sort>(null);

  const toggle = (key: SortKey) =>
    setSort((s) =>
      s && s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );

  const rows = useMemo<RowData[]>(() => {
    const data: RowData[] = patients.map((p) => {
      const flags = deriveFlags(p).filter((f) => !reviewed[flagKey(f)]);
      const hasData = p.doses.some((d) => d.status !== 'due');
      const logged = p.doses
        .filter((d) => d.loggedAt)
        .map((d) => new Date(d.loggedAt as string).getTime());
      return {
        patient: p,
        flags,
        pct: hasData ? adherencePct(p) : null,
        lastLogged: logged.length ? Math.max(...logged) : null,
      };
    });

    if (!sort) {
      // Default: flagged patients pinned to the top by active flag count, then worst adherence first.
      data.sort(
        (a, b) => b.flags.length - a.flags.length || nullsLast(a.pct, b.pct, 'asc')
      );
    } else if (sort.key === 'name') {
      data.sort(
        (a, b) =>
          a.patient.name.localeCompare(b.patient.name) * (sort.dir === 'asc' ? 1 : -1)
      );
    } else if (sort.key === 'adherence') {
      data.sort((a, b) => nullsLast(a.pct, b.pct, sort.dir));
    } else {
      data.sort((a, b) => nullsLast(a.lastLogged, b.lastLogged, sort.dir));
    }
    return data;
  }, [patients, reviewed, sort]);

  const indicator = (key: SortKey) =>
    sort && sort.key === key ? <Triangle dir={sort.dir} /> : null;

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="text-xs text-slate">
          <th className="border-b border-rule px-4 py-2 font-medium">
            <button
              type="button"
              onClick={() => toggle('name')}
              className="flex select-none items-center gap-1 hover:text-ink"
            >
              Patient {indicator('name')}
            </button>
          </th>
          <th className="border-b border-rule px-3 py-2 text-right font-medium">Medicines</th>
          <th className="border-b border-rule px-3 py-2 font-medium">
            <button
              type="button"
              onClick={() => toggle('adherence')}
              className="flex w-full select-none items-center justify-end gap-1 hover:text-ink"
            >
              14-day adherence {indicator('adherence')}
            </button>
          </th>
          <th className="border-b border-rule px-3 py-2 font-medium">Flags</th>
          <th className="border-b border-rule px-3 py-2 font-medium">
            <button
              type="button"
              onClick={() => toggle('last')}
              className="flex w-full select-none items-center justify-end gap-1 hover:text-ink"
            >
              Last logged {indicator('last')}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <PatientRow
            key={r.patient.id}
            patient={r.patient}
            flags={r.flags}
            pct={r.pct}
            lastLogged={r.lastLogged}
            onSelect={() => onSelect(r.patient.id)}
          />
        ))}
      </tbody>
    </table>
  );
}
