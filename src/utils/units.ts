import { round } from './math';

const ALTITUDE_UNITS = ['ft', 'FL', 'm'] as const;
const DISTANCE_UNITS = ['km', 'NM'] as const;
const GROUND_SPEED_UNITS = ['kts', 'M', 'kmh', 'mph'] as const;

export type UnitOptions = {
  altitude: (typeof ALTITUDE_UNITS)[number];
  distance: (typeof DISTANCE_UNITS)[number];
  ground_speed: (typeof GROUND_SPEED_UNITS)[number];
};

export const DEFAULT_UNITS: UnitOptions = {
  altitude: 'ft',
  distance: 'km',
  ground_speed: 'kts',
};

export function isValidAltitudeUnit(unit: unknown): unit is UnitOptions['altitude'] {
  return ALTITUDE_UNITS.includes(unit as (typeof ALTITUDE_UNITS)[number]);
}

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

export function isValidDistanceUnit(unit: unknown): unit is UnitOptions['distance'] {
  return DISTANCE_UNITS.includes(unit as (typeof DISTANCE_UNITS)[number]);
}

export function formatDistance(kmValue: number, unit: UnitOptions['distance']): string {
  switch (unit) {
    case 'NM':
      return `${round(kmValue * 0.539957, 2)} NM`;
    default:
      return `${round(kmValue, 1)} km`;
  }
}

export function isValidGroundSpeedUnit(unit: unknown): unit is UnitOptions['ground_speed'] {
  return GROUND_SPEED_UNITS.includes(unit as (typeof GROUND_SPEED_UNITS)[number]);
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
