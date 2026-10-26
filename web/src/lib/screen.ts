import type { Parcel } from './types';

// What the kiosk screen on the locker is showing right now.
export type ScreenState =
  | { kind: 'connecting' }
  | { kind: 'offline' }
  | { kind: 'idle' }
  | { kind: 'placing'; parcel: Parcel; options: number }
  | { kind: 'placed'; parcelId: string; compartmentId: string }
  | { kind: 'picked'; parcelId: string; compartmentId: string };
