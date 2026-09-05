'use client';

import PatientScreen from '@/components/patient/PatientScreen';

export default function PatientPage() {
  return (
    <main className="flex min-h-screen justify-center bg-paper">
      <div className="relative h-screen w-full max-w-[430px] overflow-hidden border-x border-foil">
        <PatientScreen />
      </div>
    </main>
  );
}
