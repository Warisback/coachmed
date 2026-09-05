export type DoseStatus = 'due' | 'taken' | 'missed' | 'stopped';

export interface Medicine {
  id: string; name: string; strength: string; form: string;
  timesPerDay: number; schedule: string[]; purpose: string;
  commonEffects: string[]; remaining: number;
}
export interface Dose {
  id: string; medicineId: string; scheduledAt: string;
  status: DoseStatus; loggedAt?: string; note?: string;
}
export interface Patient {
  id: string; name: string; age: number; nhsNumber: string;
  medicines: Medicine[]; doses: Dose[];
}
export type FlagKind = 'stopped' | 'missed_pattern' | 'side_effect' | 'low_supply';
export interface Flag {
  patientId: string; kind: FlagKind; medicineId: string;
  detail: string; patientWords?: string; raisedAt: string; assignedTo?: string;
}
