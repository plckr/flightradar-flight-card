import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { CARD_NAME, CardConfig, DEFAULT_CONFIG } from './const';
import { FlightData } from './flight-area-card';
import { EDITOR_NAME } from './flightradar-flight-card-editor';
import { getTFunc } from './localize/localize';
import { resetStyles } from './styles';
import { ChangedProps, HomeAssistant } from './types/homeassistant';
import { computeAirlineIcao, getAirlineName } from './utils/airline-icao';
import { hasConfigChanged, hasEntityChanged } from './utils/has-changed';
import { FRAreaFlight, FRMostTrackedFlight, parseFlight } from './utils/schemas';
import { defined } from './utils/type-guards';

@customElement(CARD_NAME)
export class FlightradarFlightCard extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @state()
  private _config!: CardConfig;

  static styles = [
    resetStyles,
    css`
      ha-card {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
    `,
  ];

  public setConfig(config: Partial<CardConfig>): void {
    if (!config.entities || config.entities.length === 0) {
      throw new Error('Please define at least one entity');
    }

    if (!config.entities.every((entity) => entity.entity_id)) {
      throw new Error('All entities must have an entity defined');
    }

    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
      entities: config.entities,
    };
  }

  public getCardSize(): number {
    return 3;
  }

  public static getStubConfig(
    hass: HomeAssistant,
    _entities: string[],
    _entitiesFallback: string[]
  ): CardConfig {
    const defaultEntities = [
      { entity_id: 'sensor.flightradar24_current_in_area', title: 'Currently in area' },
      { entity_id: 'sensor.flightradar24_most_tracked' },
    ];

    return {
      entities: defaultEntities.filter((entity) => {
        return hass.states[entity.entity_id] !== undefined;
      }),
    };
  }

  public static async getConfigElement() {
    await import('./flightradar-flight-card-editor');
    return document.createElement(EDITOR_NAME);
  }

  protected shouldUpdate(changedProps: ChangedProps): boolean {
    if (!this._config) {
      return false;
    }

    return (
      hasConfigChanged(this.hass, changedProps) ||
      hasEntityChanged(
        this.hass,
        changedProps,
        this._config.entities.map((entity) => entity.entity_id)
      )
    );
  }

  protected render() {
    if (!this._config || !this.hass) {
      console.error('Missing config or hass');
      return html`<hui-error-card>Something went wrong: check console for errors</hui-error-card>`;
    }

    const { t } = getTFunc(this.hass.locale.language);

    const entries = this._config.entities
      .map((entity) => {
        const stateObj = this.hass.states[entity.entity_id];
        if (!stateObj) {
          console.error(`Entity not found: ${entity.entity_id}`);
          return undefined;
        }

        const data = stateObj.attributes.flights[0];

        return {
          title: entity.title,
          flight: parseFlight(data),
        };
      })
      .filter(defined)
      .sort((a, b) => {
        // Put not passed schema objects at the end
        if (a.flight._type === 'unknown') return 1;
        if (b.flight._type === 'unknown') return -1;
        return 0;
      });

    const { flight: f, title: cardTitle } = entries[0];

    if (f._type === 'unknown' || !entries.length) {
      return html`<ha-card>
        <ha-icon icon="mdi:airplane"></ha-icon>
        <span>${t('no_flights')}</span>
      </ha-card>`;
    }

    const flightData = getFlightCardData(f, {
      customTitle: cardTitle,
      locale: this.hass.locale.language,
    });

    return html`<flight-area-card .hass=${this.hass} .flight=${flightData}></flight-area-card>`;
  }
}

function getFlightCardData(
  flight: FRMostTrackedFlight | FRAreaFlight,
  options: {
    customTitle?: string;
    locale: string;
  }
): FlightData {
  const { t } = getTFunc(options.locale);

  switch (flight._type) {
    case 'area': {
      const distance = flight.closest_distance ?? flight.distance;

      return {
        id: flight.id,
        title: options.customTitle || t('title.default_area'),
        flightNumber: flight.flight_number,
        callsign: flight.callsign,
        airlineIcao:
          flight.airline_icao ??
          computeAirlineIcao({
            flightNumber: flight.flight_number,
            callsign: flight.callsign,
          }),
        get airlineLabel() {
          const airline = flight.airline_short || flight.airline;

          if (airline === 'Private owner') {
            return t('airline.private');
          }

          return airline;
        },
        aircraftRegistration: flight.aircraft_registration,
        aircraftPhoto: flight.aircraft_photo_small,
        aircraftCode: flight.aircraft_code,
        aircraftModel: flight.aircraft_model,
        origin: flight.airport_origin_city,
        destination: flight.airport_destination_city,
        distance,
        altitude: flight.altitude,
        groundSpeed: flight.ground_speed,
        departureTime:
          flight.time_real_departure ??
          flight.time_estimated_departure ??
          flight.time_scheduled_departure ??
          undefined,
        arrivalTime: flight.time_estimated_arrival ?? flight.time_scheduled_arrival ?? undefined,
        get isLive() {
          if (!this.arrivalTime) return false;

          return this.arrivalTime > Date.now() / 1000;
        },
      };
    }

    case 'tracked': {
      const airlineIcao = computeAirlineIcao({
        flightNumber: flight.flight_number,
        callsign: flight.callsign,
      });

      const airlineLabel = airlineIcao ? getAirlineName(airlineIcao) : null;

      return {
        id: flight.id,
        title: options.customTitle || t('title.default_mosttracked'),
        flightNumber: flight.flight_number,
        callsign: flight.callsign,
        airlineIcao,
        airlineLabel,
        aircraftRegistration: null,
        aircraftPhoto: null,
        aircraftCode: flight.aircraft_code,
        aircraftModel: flight.aircraft_model,
        origin: flight.airport_origin_city,
        destination: flight.airport_destination_city,
        isLive: true,
      };
    }
  }
}
