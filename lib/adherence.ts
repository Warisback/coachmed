import { Patient, Flag, Medicine } from './types';

const DAY = 86400000;

export function adherencePct(p: Patient, medicineId?: string, days = 14): number {
  const since = Date.now() - days * DAY;
  const ds = p.doses.filter(d => new Date(d.scheduledAt).getTime() >= since
    && d.status !== 'due' && (!medicineId || d.medicineId === medicineId));
  if (!ds.length) return 100;
  return Math.round(100 * ds.filter(d => d.status === 'taken').length / ds.length);
}

export function currentStreak(p: Patient, medicineId: string): number {
  const ds = p.doses.filter(d => d.medicineId === medicineId && d.status !== 'due')
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  let n = 0; for (const d of ds) { if (d.status === 'taken') n++; else break; } return n;
}

export function daysOfSupply(p: Patient, m: Medicine): number {
  return Math.floor(m.remaining / Math.max(1, m.timesPerDay));
}

export function deriveFlags(p: Patient): Flag[] {
  const out: Flag[] = [];
  const week = Date.now() - 7 * DAY;
  for (const m of p.medicines) {
    const recent = p.doses.filter(d => d.medicineId === m.id && new Date(d.scheduledAt).getTime() >= week && d.status !== 'due');
    const stopped = p.doses.filter(d => d.medicineId === m.id && d.status === 'stopped');
    const words = [...p.doses].reverse().find(d => d.medicineId === m.id && d.note)?.note;

    if (stopped.length) {
      const first = stopped.map(d => d.scheduledAt).sort()[0];
      const daysAgo = Math.round((Date.now() - new Date(first).getTime()) / DAY);
      out.push({ patientId: p.id, kind: 'stopped', medicineId: m.id, raisedAt: first,
        detail: `Stopped ${daysAgo} days ago — not reported to the practice.`, patientWords: words });
    } else if (recent.filter(d => d.status === 'missed').length >= 3) {
      out.push({ patientId: p.id, kind: 'missed_pattern', medicineId: m.id, raisedAt: new Date().toISOString(),
        detail: `${recent.filter(d => d.status === 'missed').length} missed in the last 7 days.` });
    } else if (words) {
      out.push({ patientId: p.id, kind: 'side_effect', medicineId: m.id, raisedAt: new Date().toISOString(),
        detail: 'Patient reported something didn\'t feel right.', patientWords: words });
    }
    const supply = daysOfSupply(p, m);
    if (supply <= 5) out.push({ patientId: p.id, kind: 'low_supply', medicineId: m.id, raisedAt: new Date().toISOString(),
      detail: `About ${supply} days of ${m.name} left.` });
  }
  return out;
}

/** The "before the review" paragraph for [E]. One patient → plain prose a GP reads in ten seconds. */
export function beforeReview(p: Patient): string {
  const fs = deriveFlags(p);
  if (!fs.length) return `${p.name.split(' ')[0]} is taking everything as prescribed. Nothing to raise.`;
  const name = p.name.split(' ')[0];
  const med = (id: string) => p.medicines.find(m => m.id === id)?.name ?? id;
  const parts: string[] = [];
  for (const f of fs) {
    if (f.kind === 'stopped') parts.push(`${name} stopped ${med(f.medicineId)} — ${f.detail.replace('Stopped ', '').replace(' — not reported to the practice.', '')} — and hasn't told the practice${f.patientWords ? `. In her words: "${f.patientWords}"` : ''}`);
    if (f.kind === 'missed_pattern') parts.push(`${med(f.medicineId)} is being missed regularly (${f.detail.toLowerCase()})`);
    if (f.kind === 'side_effect') parts.push(`${name} reported a problem with ${med(f.medicineId)}: "${f.patientWords}"`);
    if (f.kind === 'low_supply') parts.push(`${med(f.medicineId)} runs out in ${f.detail.match(/\d+/)?.[0]} days`);
  }
  return parts.join('. ') + '.';
}

export const flagKey = (f: Flag) => `${f.patientId}:${f.medicineId}:${f.kind}`;
