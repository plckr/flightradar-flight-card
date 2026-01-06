import { round } from './math';

export type UnitOptions = {
  altitude: 'ft' | 'FL' | 'm';
  distance: 'km' | 'NM';
  ground_speed: 'kts' | 'M' | 'kmh' | 'mph';
};

export const DEFAULT_UNITS: UnitOptions = {
  altitude: 'ft',
  distance: 'km',
  ground_speed: 'kts',
};

export function formatAltitude(feetValue: number, unit: UnitOptions['altitude']): string {
  switch (unit) {
    case 'FL':
      return `FL${Math.round(feetValue / 100)}`;
    case 'm':
      return `${round(feetValue * 0.3048, 0)} m`;
    default:
      return `${feetValue} ft`;
  }
}

export function formatDistance(kmValue: number, unit: UnitOptions['distance']): string {
  switch (unit) {
    case 'NM':
      return `${round(kmValue * 0.539957, 2)} NM`;
    default:
      return `${round(kmValue, 1)} km`;
  }
}

export function formatGroundSpeed(ktsValue: number, unit: UnitOptions['ground_speed']): string {
  switch (unit) {
    case 'M':
      return `M ${round(ktsValue / 661.47, 2)}`;
    case 'kmh':
      return `${round(ktsValue * 1.852, 0)} km/h`;
    case 'mph':
      return `${round(ktsValue * 1.15078, 0)} mph`;
    default:
      return `${ktsValue} kts`;
  }
}
