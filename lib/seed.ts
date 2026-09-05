import { Patient, Dose, Medicine } from './types';

const at = (daysAgo: number, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const t = new Date(); t.setDate(t.getDate() - daysAgo); t.setHours(h, m, 0, 0);
  return t.toISOString();
};

type Rule = (daysAgo: number, idx: number) => { status: Dose['status']; note?: string };

function doses(med: Medicine, rule: Rule): Dose[] {
  const out: Dose[] = [];
  for (let d = 13; d >= 0; d--) {
    med.schedule.forEach((time, i) => {
      const r = d === 0 ? { status: 'due' as const } : rule(d, i);
      out.push({
        id: `${med.id}-${d}-${i}`, medicineId: med.id, scheduledAt: at(d, time),
        status: r.status, loggedAt: r.status === 'due' ? undefined : at(d, time), note: r.note,
      });
    });
  }
  return out;
}

const metformin: Medicine = { id: 'met', name: 'Metformin', strength: '500mg', form: 'tablet', timesPerDay: 2,
  schedule: ['08:00', '20:00'], purpose: 'Keeps your blood sugar steady through the day.',
  commonEffects: ['An upset stomach in the first few weeks', 'Feeling sick if taken without food'], remaining: 8 };
const gliclazide: Medicine = { id: 'gli', name: 'Gliclazide', strength: '40mg', form: 'tablet', timesPerDay: 1,
  schedule: ['08:00'], purpose: 'Helps your body release more insulin after meals.',
  commonEffects: ['Feeling shaky, sweaty or sick — can mean low sugar', 'Dizziness'], remaining: 26 };
const atorvastatin: Medicine = { id: 'ato', name: 'Atorvastatin', strength: '20mg', form: 'tablet', timesPerDay: 1,
  schedule: ['22:00'], purpose: 'Lowers cholesterol to protect your heart.',
  commonEffects: ['Aching muscles', 'Headache'], remaining: 19 };
const amlodipine: Medicine = { id: 'aml', name: 'Amlodipine', strength: '5mg', form: 'tablet', timesPerDay: 1,
  schedule: ['08:00'], purpose: 'Lowers your blood pressure.', commonEffects: ['Swollen ankles', 'Flushing'], remaining: 24 };
const sertraline: Medicine = { id: 'ser', name: 'Sertraline', strength: '50mg', form: 'tablet', timesPerDay: 1,
  schedule: ['09:00'], purpose: 'Helps with low mood and anxiety over time.', commonEffects: ['Feeling sick at first', 'Trouble sleeping'], remaining: 21 };
const ramipril: Medicine = { id: 'ram', name: 'Ramipril', strength: '2.5mg', form: 'capsule', timesPerDay: 1,
  schedule: ['08:00'], purpose: 'Lowers your blood pressure.', commonEffects: ['A dry cough', 'Dizziness when standing'], remaining: 28 };

export const seed: Patient[] = [
  { id: 'ellen', name: 'Ellen Harkin', age: 68, nhsNumber: '943 476 5919',
    medicines: [metformin, gliclazide, atorvastatin],
    doses: [
      ...doses(metformin, (d, i) => ({ status: (d === 9 && i === 1) || (d === 3 && i === 0) ? 'missed' : 'taken' })),
      ...doses(gliclazide, (d) => d === 13
        ? { status: 'stopped', note: 'It was making me feel shaky and a bit sick in the afternoons, so I left it off.' }
        : { status: 'stopped' }),
      ...doses(atorvastatin, (d) => ({ status: [12, 8, 5, 2].includes(d) ? 'missed' : 'taken' })),
    ] },
  { id: 'raymond', name: 'Raymond Okonjo', age: 74, nhsNumber: '485 777 3456',
    medicines: [amlodipine, { ...atorvastatin, id: 'ato-r' }],
    doses: [...doses(amlodipine, () => ({ status: 'taken' })), ...doses({ ...atorvastatin, id: 'ato-r' }, () => ({ status: 'taken' }))] },
  { id: 'priya', name: 'Priya Nandra', age: 59, nhsNumber: '401 023 2376',
    medicines: [sertraline],
    doses: doses(sertraline, (d) => {
      const day = new Date(at(d, '09:00')).getDay();
      return { status: day === 0 || day === 6 ? 'missed' : 'taken' };
    }) },
  { id: 'tom', name: 'Tom Bassey', age: 41, nhsNumber: '629 302 8842',
    medicines: [ramipril],
    doses: doses(ramipril, () => ({ status: 'due' })).filter(x => x.status === 'due' && new Date(x.scheduledAt).toDateString() === new Date().toDateString()) },
];
