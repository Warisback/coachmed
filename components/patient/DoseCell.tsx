'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckIcon } from '@/components/shared/Icon';
import type { DoseStatus } from '@/lib/types';

export interface DoseCellProps {
  status: DoseStatus;
  /** Display time, e.g. "8am" */
  timeLabel: string;
  /** Accessible label, e.g. "Metformin at 8am, due, press to log it" */
  label: string;
  /** Tap action. Due: log the dose. Missed: open the inline prompt. */
  onPress?: () => void;
  /** Hold (~500ms) opens the reason sheet. */
  onLongPress?: () => void;
}

const LONG_PRESS_MS = 500;

/**
 * One blister cell. The press is the only orchestrated animation in the
 * product: depress (whileTap) → foil tears → green fills → settle, ~220ms.
 */
export default function DoseCell({ status, timeLabel, label, onPress, onLongPress }: DoseCellProps) {
  const reduced = useReducedMotion();

  // Track the previous status so a cell that mounts already 'taken'
  // (rehydrated history) renders its end state with no animation.
  const prevStatus = useRef(status);
  const cameFrom = prevStatus.current;
  useEffect(() => {
    prevStatus.current = status;
  }, [status]);
  const tearIn = status === 'taken' && cameFrom !== 'taken' && !reduced;

  // Long-press via pointer events, with contextmenu as a fallback.
  const timer = useRef<number | null>(null);
  const longFired = useRef(false);
  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  useEffect(() => clearTimer, []);

  const handlePointerDown = () => {
    longFired.current = false;
    if (!onLongPress) return;
    clearTimer();
    timer.current = window.setTimeout(() => {
      longFired.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  };
  const handleClick = () => {
    if (longFired.current) {
      longFired.current = false;
      return;
    }
    onPress?.();
  };

  let look = 'bg-foil text-ink';
  if (status === 'due') look = 'bg-foil ring-2 ring-due text-ink';
  else if (status === 'taken') look = 'bg-foil text-white';
  else if (status === 'missed') look = 'bg-transparent border-2 border-missed text-missed';
  else if (status === 'stopped') look = 'bg-foil opacity-60 text-slate';

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={!onPress && !onLongPress}
      onPointerDown={handlePointerDown}
      onPointerUp={clearTimer}
      onPointerLeave={clearTimer}
      onPointerCancel={clearTimer}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        clearTimer();
        if (onLongPress && !longFired.current) {
          longFired.current = true;
          onLongPress();
        }
      }}
      whileTap={!reduced && onPress ? { scale: status === 'due' ? 0.9 : 0.96 } : undefined}
      transition={{ type: 'tween', duration: 0.09, ease: 'easeOut' }}
      className={`relative flex h-16 w-16 select-none items-center justify-center overflow-hidden rounded-xl ${look}`}
      style={{ touchAction: 'manipulation' }}
    >
      {status === 'taken' ? (
        <>
          <motion.span
            aria-hidden
            className="absolute inset-0"
            initial={tearIn ? { scale: 0.55, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.13, ease: 'easeOut' }}
          >
            {/* Green fill with the top-right corner torn away — foil shows through. */}
            <span
              className="absolute inset-0 bg-taken"
              style={{ clipPath: 'polygon(0 0, 68% 0, 100% 32%, 100% 100%, 0 100%)' }}
            />
            {/* The peeled foil edge, a pale sliver along the tear. */}
            <span
              className="absolute inset-0 bg-white/60"
              style={{ clipPath: 'polygon(68% 0, 78% 0, 100% 22%, 100% 32%)' }}
            />
          </motion.span>
          <motion.span
            className="relative"
            initial={tearIn ? { scale: 0.4, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.08, duration: reduced ? 0 : 0.12, ease: 'easeOut' }}
          >
            <CheckIcon size={26} className="text-white" />
          </motion.span>
        </>
      ) : (
        <span className={status === 'stopped' ? 'text-[15px] font-medium line-through' : 'text-[15px] font-medium'}>
          {timeLabel}
        </span>
      )}
    </motion.button>
  );
}
