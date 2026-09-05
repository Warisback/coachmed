'use client';

import type { FlagKind } from '@/lib/types';

const STYLES: Record<FlagKind, { label: string; cls: string }> = {
  stopped: { label: 'Stopped', cls: 'border-missed text-missed' },
  missed_pattern: { label: 'Missing doses', cls: 'border-due text-due' },
  side_effect: { label: 'Side effect', cls: 'border-due text-due' },
  low_supply: { label: 'Low supply', cls: 'border-rule text-slate' },
};

export default function FlagBadge({ kind, count }: { kind: FlagKind; count?: number }) {
  const s = STYLES[kind];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded border bg-transparent px-1.5 py-0.5 text-xs leading-4 ${s.cls}`}
    >
      {s.label}
      {typeof count === 'number' && count > 1 && <span className="tabular-nums">{count}</span>}
    </span>
  );
}
