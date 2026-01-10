import { repository, version } from '../package.json';
import { DEFAULT_UNITS, UnitOptions } from './utils/units';

export const CARD_VERSION = version;

export const CARD_NAME = 'flightradar-flight-card';
export const CARD_DESCRIPTION =
  'A custom Home Assistant card for displaying Flightradar flight information';

export type CardConfig = {
  entities: Array<{
    entity_id: string;
    title?: string;
    carousel?: boolean;
  }>;
  units?: Partial<UnitOptions>;
};

export const DEFAULT_CONFIG: Partial<CardConfig> = {
  units: DEFAULT_UNITS,
};

export const GITHUB_REPOSITORY_URL = repository.url;
export const GITHUB_REPOSITORY = repository.url.split('/').slice(-2).join('/');
