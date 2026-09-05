'use client';

import React from 'react';

/**
 * A quiet, believable phone shell. It is a physical object sitting on the
 * desk next to the GP dashboard, so it carries the one drop shadow the
 * product allows. Children fill the inner screen and position their own
 * overlays absolute against it.
 */
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[380px] h-[min(800px,90vh)] rounded-[44px] bg-ink p-[10px] shadow-2xl shadow-ink/30">
      {/* Speaker slot, inside the top bezel */}
      <div
        aria-hidden="true"
        className="absolute top-[3px] left-1/2 -translate-x-1/2 h-[4px] w-14 rounded-full bg-white/20"
      />
      <div className="h-full w-full rounded-[34px] overflow-hidden relative bg-paper">
        {children}
      </div>
    </div>
  );
}
