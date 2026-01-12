import * as v from 'valibot';

import { repository, version } from '../package.json';
import { DEFAULT_UNITS } from './utils/units';

export const CARD_VERSION = version;

export const CARD_NAME = 'flightradar-flight-card';
export const CARD_DESCRIPTION =
  'A custom Home Assistant card for displaying Flightradar flight information';

export const DEFAULT_CONFIG = {
  units: DEFAULT_UNITS,
  show_flightradar_link: true,
  show_airline_info_column: true,
  show_airline_logo: true,
  show_aircraft_photo: true,
  show_progress_bar: true,
};

const configSchema = v.object({
  entities: v.array(
    v.object({
      entity_id: v.string(),
      title: v.optional(v.string()),
    }),
    'Please define at least one entity'
  ),
  units: v.fallback(
    v.object({
      altitude: v.fallback(v.string(), DEFAULT_CONFIG.units.altitude),
      distance: v.fallback(v.string(), DEFAULT_CONFIG.units.distance),
      ground_speed: v.fallback(v.string(), DEFAULT_CONFIG.units.ground_speed),
    }),
    DEFAULT_CONFIG.units
  ),
  show_flightradar_link: v.fallback(v.boolean(), DEFAULT_CONFIG.show_flightradar_link),
  show_airline_info_column: v.fallback(v.boolean(), DEFAULT_CONFIG.show_airline_info_column),
  show_airline_logo: v.fallback(v.boolean(), DEFAULT_CONFIG.show_airline_logo),
  show_aircraft_photo: v.fallback(v.boolean(), DEFAULT_CONFIG.show_aircraft_photo),
  show_progress_bar: v.fallback(v.boolean(), DEFAULT_CONFIG.show_progress_bar),
  template_airline_logo_url: v.optional(v.string()),
});

export function validateConfig(config: unknown): CardConfig {
  try {
    return v.parse(configSchema, config);
  } catch (error) {
    if (v.isValiError(error)) {
      throw new Error(v.summarize(error.issues));
    }
    console.error(error);
    throw error;
  }
}

export type CardConfig = v.InferOutput<typeof configSchema>;

export const GITHUB_REPOSITORY_URL = repository.url;
export const GITHUB_REPOSITORY = repository.url.split('/').slice(-2).join('/');
