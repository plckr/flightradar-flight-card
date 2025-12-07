import { LovelaceCardConfig } from 'custom-card-helpers';

export interface FlightradarFlightCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  show_header?: boolean;
  show_state?: boolean;
}

// Home Assistant entity state interface
export interface FlightEntityState {
  state: string;
  attributes: {
    friendly_name?: string;
    flight_number?: string;
    airline?: string;
    origin?: string;
    destination?: string;
    altitude?: number;
    speed?: number;
    heading?: number;
    latitude?: number;
    longitude?: number;
    aircraft_type?: string;
    registration?: string;
    [key: string]: unknown;
  };
  entity_id: string;
  last_changed: string;
  last_updated: string;
}
