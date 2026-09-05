'use client';

import { Medicine, Patient } from '@/lib/types';
import { daysOfSupply } from '@/lib/adherence';
import { AlertIcon } from '@/components/shared/Icon';

/**
 * The leaflet rewritten as an infographic card: what to watch for, one short
 * line per fact, and a quiet supply note when the pack is running low.
 */
export default function LeafletCard({ medicine, patient }: { medicine: Medicine; patient: Patient }) {
  const supply = daysOfSupply(patient, medicine);

  return (
    <section className="rounded-xl border border-rule bg-white p-5">
      <h3 className="text-sm text-slate">What to watch for</h3>
      <ul className="mt-4 space-y-3">
        {medicine.commonEffects.map((effect) => (
          <li key={effect} className="flex items-start gap-3 leading-snug">
            <AlertIcon size={20} className="mt-0.5 shrink-0 text-slate" />
            <span>{effect}</span>
          </li>
        ))}
      </ul>
      {supply <= 7 && (
        <p className="mt-5 text-slate">
          About {supply} {supply === 1 ? 'day' : 'days'} left in the pack.
        </p>
      )}
    </section>
  );
}
