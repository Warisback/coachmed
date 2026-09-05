'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Dose, Patient } from './types';
import { seed } from './seed';

type State = {
  patients: Patient[];
  assignments: Record<string, string>;   // flagKey → person
  reviewed: Record<string, true>;        // flagKey → dismissed
  logDose: (doseId: string) => void;
  skipDose: (doseId: string, reason?: string) => void;
  stopMedicine: (medicineId: string, reason: string) => void;
  reportIssue: (medicineId: string, words: string) => void;
  assignFlag: (flagKey: string, person: string) => void;
  markReviewed: (flagKey: string) => void;
  resetDemo: () => void;
};

const now = () => new Date().toISOString();

export const useStore = create<State>()(persist((set) => ({
  patients: seed, assignments: {}, reviewed: {},

  logDose: (doseId) => set(s => ({ patients: s.patients.map(p => ({ ...p,
    doses: p.doses.map((d): Dose => d.id === doseId ? { ...d, status: 'taken', loggedAt: now() } : d) })) })),

  skipDose: (doseId, reason) => set(s => ({ patients: s.patients.map(p => ({ ...p,
    doses: p.doses.map((d): Dose => d.id === doseId ? { ...d, status: 'missed', loggedAt: now(), note: reason || d.note } : d) })) })),

  stopMedicine: (medicineId, reason) => set(s => ({ patients: s.patients.map(p => ({ ...p,
    doses: p.doses.map((d): Dose => d.medicineId === medicineId && d.status === 'due'
      ? { ...d, status: 'stopped', loggedAt: now(), note: reason } : d) })) })),

  // Attach the patient's words to the most recent dose of a medicine without changing its
  // status — deriveFlags surfaces the latest note as the flag's patientWords.
  reportIssue: (medicineId, words) => set(s => ({ patients: s.patients.map(p => {
    const ds = p.doses.filter(d => d.medicineId === medicineId);
    if (!ds.length) return p;
    const latest = ds.reduce((a, b) => (a.scheduledAt > b.scheduledAt ? a : b));
    return { ...p, doses: p.doses.map((d): Dose => d.id === latest.id ? { ...d, note: words } : d) };
  }) })),

  assignFlag: (key, person) => set(s => ({ assignments: { ...s.assignments, [key]: person } })),
  markReviewed: (key) => set(s => ({ reviewed: { ...s.reviewed, [key]: true } })),
  resetDemo: () => set({ patients: seed, assignments: {}, reviewed: {} }),
}), {
  name: 'adherence-demo-v1',
  storage: createJSONStorage(() => localStorage),
  partialize: (s) => ({ patients: s.patients, assignments: s.assignments, reviewed: s.reviewed }),
}));

// Cross-tab sync, only needed if patient and GP views are ever opened in separate tabs.
// The /demo route renders both in one tab and needs none of this.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'adherence-demo-v1') useStore.persist.rehydrate();
  });
}
