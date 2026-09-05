'use client';

import type { ReactNode } from 'react';

type IconProps = { size?: number; className?: string };

function IconBase({
  size = 20,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** A capsule at 45° with a seam across the middle. */
export function PillIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <rect x="8.5" y="5" width="7" height="14" rx="3.5" transform="rotate(45 12 12)" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" transform="rotate(45 12 12)" />
    </IconBase>
  );
}

/** A blister pack: rounded square holding a 2×2 grid of pockets. */
export function BlisterIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="2.2" />
      <circle cx="15" cy="9" r="2.2" />
      <circle cx="9" cy="15" r="2.2" />
      <circle cx="15" cy="15" r="2.2" />
    </IconBase>
  );
}

/** A clock face with the hands at eight o'clock. */
export function ClockIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <line x1="12" y1="12" x2="12" y2="7" />
      <line x1="12" y1="12" x2="8.5" y2="14" />
    </IconBase>
  );
}

/** A pole with a pennant; the pole closes the pennant's back edge. */
export function FlagIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <line x1="6" y1="3" x2="6" y2="21" />
      <path d="M6 4 L18 6.5 L6 9" />
    </IconBase>
  );
}

/** A mobile handset with a speaker slit. */
export function PhoneIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <rect x="8" y="3" width="8" height="18" rx="2.5" />
      <line x1="11" y1="6" x2="13" y2="6" />
    </IconBase>
  );
}

export function CheckIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <polyline points="5,13 10,18 19,6" />
    </IconBase>
  );
}

export function CrossIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </IconBase>
  );
}

export function ChevronLeftIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <polyline points="14.5,5 7.5,12 14.5,19" />
    </IconBase>
  );
}

/** A warning triangle with a stem and a round-cap dot. */
export function AlertIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <path d="M12 3.5 L21 19.5 L3 19.5 Z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="12" y1="16.8" x2="12" y2="17" />
    </IconBase>
  );
}

/** A head above a shoulder curve. */
export function UserIcon({ size = 20, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
    </IconBase>
  );
}
