'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useMounted } from '@/lib/useMounted';
import PhoneFrame from '@/components/shared/PhoneFrame';
import PatientScreen from '@/components/patient/PatientScreen';
import GPDashboard from '@/components/gp/GPDashboard';

/**
 * The stage view: the patient's phone on the left, the GP dashboard on the
 * right. Both panes render from the same store instance, so a tap on the
 * phone moves the GP numbers in the same tick — no sync code exists or is
 * needed.
 */
export default function DemoPage() {
  const mounted = useMounted();

  // Keyboard reset: R resets the demo, ignored while typing.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'r' && event.key !== 'R') return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      useStore.getState().resetDemo();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Scripted mode (?scripted=1): a hands-free timed sequence for the stage.
  useEffect(() => {
    if (!window.location.search.includes('scripted=1')) return;
    const timeoutIds: number[] = [];
    timeoutIds.push(
      window.setTimeout(() => {
        useStore.getState().resetDemo();
      }, 800),
    );
    timeoutIds.push(
      window.setTimeout(() => {
        useStore.getState().logDose('met-0-0');
      }, 2500),
    );
    timeoutIds.push(
      window.setTimeout(() => {
        useStore
          .getState()
          .reportIssue(
            'gli',
            'It was making me feel shaky and a bit sick in the afternoons, so I left it off.',
          );
      }, 5000),
    );
    timeoutIds.push(
      window.setTimeout(() => {
        useStore.getState().assignFlag('ellen:gli:stopped', 'Dr Osei');
      }, 7500),
    );
    return () => timeoutIds.forEach((id) => window.clearTimeout(id));
  }, []);

  if (!mounted) return <div className="h-screen bg-clinical" />;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-clinical">
      <div className="relative w-[480px] shrink-0 h-full flex items-center justify-center border-r border-rule">
        <PhoneFrame>
          <PatientScreen />
        </PhoneFrame>
        <p className="absolute bottom-4 left-4 text-xs text-slate">
          Press R to reset
        </p>
      </div>
      <div className="flex-1 h-full overflow-y-auto">
        <GPDashboard />
      </div>
    </div>
  );
}
