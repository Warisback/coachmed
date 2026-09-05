'use client';

import { useState } from 'react';
import type { DoseStatus, Medicine, Patient } from '@/lib/types';
import { useStore } from '@/lib/store';
import DoseCell from './DoseCell';

/** What a cell hands upward when the reason sheet should open. */
export interface ReasonTarget {
  doseId: string;
  medicineId: string;
  timeLabel: string;
}

export function fmtClock(hours: number, minutes: number): string {
  const suffix = hours >= 12 ? 'pm' : 'am';
  const h = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0 ? `${h}${suffix}` : `${h}:${String(minutes).padStart(2, '0')}${suffix}`;
}

export function fmtScheduleTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return fmtClock(h, m);
}

export function fmtDoseTime(iso: string): string {
  const d = new Date(iso);
  return fmtClock(d.getHours(), d.getMinutes());
}

export function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

/**
 * A dose's display status. A medicine the patient has stopped keeps 'due'
 * doses in the seed for today; they should read as stopped, not pressable.
 */
export function effectiveStatus(status: DoseStatus, medicineStopped: boolean): DoseStatus {
  return medicineStopped && status === 'due' ? 'stopped' : status;
}

function dayLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-GB', { weekday: 'short' });
}

function scheduleLine(m: Medicine): string {
  return `${m.schedule.map(fmtScheduleTime).join(' and ')}, every day`;
}

interface BlisterPackProps {
  patient: Patient;
  onOpenMedicine: (medicineId: string) => void;
  onOpenReasons: (target: ReasonTarget) => void;
  onLogged: () => void;
}

/** One foil tray per medicine: today's real doses, then two derived days. */
export default function BlisterPack({ patient, onOpenMedicine, onOpenReasons, onLogged }: BlisterPackProps) {
  const logDose = useStore((s) => s.logDose);
  const [missedPrompt, setMissedPrompt] = useState<ReasonTarget | null>(null);

  return (
    <div className="space-y-6">
      {patient.medicines.map((m) => {
        const medStopped = patient.doses.some((d) => d.medicineId === m.id && d.status === 'stopped');
        const todays = patient.doses
          .filter((d) => d.medicineId === m.id && isToday(d.scheduledAt))
          .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
        const rows = Math.max(todays.length, m.schedule.length, 1);
        const prompt = missedPrompt && missedPrompt.medicineId === m.id ? missedPrompt : null;

        return (
          <section key={m.id}>
            <button
              type="button"
              onClick={() => onOpenMedicine(m.id)}
              className="block min-h-[44px] rounded-xl text-left"
            >
              <span className="block font-semibold leading-snug">
                {m.name} {m.strength}
              </span>
              <span className="block text-[15px] text-slate">
                {medStopped ? 'Stopped' : scheduleLine(m)}
              </span>
            </button>

            <div className="mt-2 rounded-xl border border-foil bg-white/50 p-3">
              <div className="flex items-start gap-4">
                {/* Today: the real, pressable cells. */}
                <div
                  className="grid justify-items-center gap-2"
                  style={{ gridTemplateRows: `auto repeat(${rows}, 4rem)` }}
                >
                  <span className="self-center text-[13px] text-slate">Today</span>
                  {todays.map((d) => {
                    const status = effectiveStatus(d.status, medStopped);
                    const timeLabel = fmtDoseTime(d.scheduledAt);
                    const target: ReasonTarget = { doseId: d.id, medicineId: m.id, timeLabel };
                    return (
                      <div key={d.id} className="self-center">
                        <DoseCell
                          status={status}
                          timeLabel={timeLabel}
                          label={`${m.name} at ${timeLabel}, ${
                            status === 'due' ? 'due, press to log it' : status
                          }`}
                          onPress={
                            status === 'due'
                              ? () => {
                                  logDose(d.id);
                                  onLogged();
                                }
                              : status === 'missed'
                                ? () => setMissedPrompt((p) => (p && p.doseId === d.id ? null : target))
                                : undefined
                          }
                          onLongPress={
                            status !== 'stopped'
                              ? () => {
                                  setMissedPrompt(null);
                                  onOpenReasons(target);
                                }
                              : undefined
                          }
                        />
                      </div>
                    );
                  })}
                </div>

                <div aria-hidden className="w-px self-stretch bg-foil" />

                {/* The next two days, derived from the schedule — flat, quiet. */}
                {[1, 2].map((offset) => (
                  <div
                    key={offset}
                    className="grid justify-items-center gap-2"
                    style={{ gridTemplateRows: `auto repeat(${rows}, 4rem)` }}
                  >
                    <span className="self-center text-[13px] text-slate">{dayLabel(offset)}</span>
                    {m.schedule.map((t) => (
                      <div key={t} aria-hidden className="h-10 w-10 self-center rounded-xl bg-foil opacity-60" />
                    ))}
                  </div>
                ))}
              </div>

              {prompt && (
                <div className="mt-3 rounded-xl border border-foil bg-paper p-4 text-[15px]">
                  <p className="text-ink">Missed at {prompt.timeLabel}. Tap to log it late or say why.</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        logDose(prompt.doseId);
                        onLogged();
                        setMissedPrompt(null);
                      }}
                      className="min-h-[44px] flex-1 rounded-xl border border-foil bg-white px-3 text-ink"
                    >
                      Log it late
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenReasons(prompt);
                        setMissedPrompt(null);
                      }}
                      className="min-h-[44px] flex-1 rounded-xl border border-foil bg-white px-3 text-ink"
                    >
                      Say why
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
