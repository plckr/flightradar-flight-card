import * as v from 'valibot';

import { repository, version } from '../package.json';
import {
  DEFAULT_UNITS,
  UnitOptions,
  isValidAltitudeUnit,
  isValidDistanceUnit,
  isValidGroundSpeedUnit,
} from './utils/units';

export const CARD_VERSION = version;

export const CARD_NAME = 'flightradar-flight-card';
export const CARD_DESCRIPTION =
  'A custom Home Assistant card for displaying Flightradar flight information';

export const DEFAULT_CONFIG = {
  carousel: {
    enable: false,
    show_controls: true,
    loop: false,
    autoplay: false,
    autoplay_delay: 5000,
  },
  units: DEFAULT_UNITS,
  show_country_flags: false as const,
  show_flightradar_link: true,
  show_airline_info_column: true,
  show_airline_logo: true,
  show_aircraft_photo: true,
  show_progress_bar: true,
  show_distance: 'closest' as const,
  colors: {
    primary: 'var(--primary-text-color)',
    secondary: 'var(--secondary-text-color)',
    accent: 'var(--accent-color)',
    accent_light: 'var(--state-active-color)',
    progress_bar_light: 'var(--secondary-background-color)',
  },
};

const nonEmptyString = v.pipe(v.string(), v.minLength(1));

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
      altitude: v.fallback(
        v.custom<UnitOptions['altitude']>(isValidAltitudeUnit),
        DEFAULT_CONFIG.units.altitude
      ),
      distance: v.fallback(
        v.custom<UnitOptions['distance']>(isValidDistanceUnit),
        DEFAULT_CONFIG.units.distance
      ),
      ground_speed: v.fallback(
        v.custom<UnitOptions['ground_speed']>(isValidGroundSpeedUnit),
        DEFAULT_CONFIG.units.ground_speed
      ),
    }),
    DEFAULT_CONFIG.units
  ),
  carousel: v.fallback(
    v.object({
      enable: v.fallback(v.boolean(), DEFAULT_CONFIG.carousel.enable),
      show_controls: v.fallback(v.boolean(), DEFAULT_CONFIG.carousel.show_controls),
      loop: v.fallback(v.boolean(), DEFAULT_CONFIG.carousel.loop),
      autoplay: v.fallback(v.boolean(), DEFAULT_CONFIG.carousel.autoplay),
      autoplay_delay: v.fallback(v.number(), DEFAULT_CONFIG.carousel.autoplay_delay),
    }),
    DEFAULT_CONFIG.carousel
  ),
  colors: v.fallback(
    v.object({
      primary: v.fallback(nonEmptyString, DEFAULT_CONFIG.colors.primary),
      secondary: v.fallback(nonEmptyString, DEFAULT_CONFIG.colors.secondary),
      accent: v.fallback(nonEmptyString, DEFAULT_CONFIG.colors.accent),
      accent_light: v.fallback(nonEmptyString, DEFAULT_CONFIG.colors.accent_light),
      progress_bar_light: v.fallback(nonEmptyString, DEFAULT_CONFIG.colors.progress_bar_light),
    }),
    DEFAULT_CONFIG.colors
  ),
  show_country_flags: v.fallback(
    v.union([
      v.literal('image'),
      v.literal('emoji'),
      v.pipe(
        v.literal('false'),
        v.transform(() => false as const)
      ),
      v.literal(false),
    ]),
    DEFAULT_CONFIG.show_country_flags
  ),
  show_flightradar_link: v.fallback(v.boolean(), DEFAULT_CONFIG.show_flightradar_link),
  show_airline_info_column: v.fallback(v.boolean(), DEFAULT_CONFIG.show_airline_info_column),
  show_airline_logo: v.fallback(v.boolean(), DEFAULT_CONFIG.show_airline_logo),
  show_aircraft_photo: v.fallback(v.boolean(), DEFAULT_CONFIG.show_aircraft_photo),
  show_progress_bar: v.fallback(v.boolean(), DEFAULT_CONFIG.show_progress_bar),
  show_distance: v.fallback(
    v.union([
      v.literal(false),
      v.pipe(
        v.literal('false'),
        v.transform(() => false as const)
      ),
      v.pipe(
        v.literal('off'),
        v.transform(() => false as const)
      ),
      v.literal('closest'),
      v.literal('current'),
    ]),
    DEFAULT_CONFIG.show_distance
  ),
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
