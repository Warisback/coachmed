'use client';
import { useEffect, useState } from 'react';

/**
 * Gate for anything that reads the persisted store. The store rehydrates from
 * localStorage on the client, so rendering store data during SSR/first paint
 * causes hydration mismatches. Render a plain shell until this returns true.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted;
}
