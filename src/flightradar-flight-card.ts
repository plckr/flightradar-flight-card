import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import * as v from 'valibot';

import { CARD_NAME, CardConfig, DEFAULT_CONFIG } from './const';
import { AreaFlight } from './flight-area-card';
import { KeyString, localize } from './localize/localize';
import { cardStyles, resetStyles } from './styles';
import { ChangedProps, HomeAssistant } from './types/homeassistant';
import { computeAirlineIcao, getAirlineName } from './utils/airline-icao';
import { hasConfigOrEntityChanged } from './utils/has-changed';
import { areaFlightSchema, mostTrackedFlightSchema } from './utils/schemas';

@customElement(CARD_NAME)
export class FlightradarFlightCard extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @state()
  private _config!: CardConfig;

  static styles = [resetStyles, cardStyles];

  public setConfig(config: Partial<CardConfig>): void {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }

    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
      entity: config.entity,
    };
  }

  public getCardSize(): number {
    return 3;
  }

  protected shouldUpdate(changedProps: ChangedProps): boolean {
    if (!this._config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render() {
    const t = (key: KeyString, params?: Record<string, string>) => {
      return localize(key, this.hass.locale.language, params);
    };

    const entityId = this._config.entity;
    const stateObj = this.hass.states[entityId];

    if (!stateObj) {
      throw new Error(`Entity not found: ${entityId}`);
    }

    const data = stateObj.attributes.flights[0];
    const f = v.parse(
      v.fallback(
        v.union([
          mostTrackedFlightSchema,
          areaFlightSchema,
          v.object({ _type: v.literal('unknown') }),
        ]),
        { _type: 'unknown' }
      ),
      data
    );

    if (!this._config || !this.hass) {
      return html`<hui-error-card>Something went wrong: check console for errors</hui-error-card>`;
    }

    if (f._type === 'area') {
      const distance = f.closest_distance ?? f.distance;

      const flight: AreaFlight = {
        id: f.id,
        title: `Último avião a sobrevoar (a ${distance.toFixed(1)} km)`,
        flightNumber: f.flight_number,
        callsign: f.callsign,
        airlineIcao:
          f.airline_icao ??
          computeAirlineIcao({
            flightNumber: f.flight_number,
            callsign: f.callsign,
          }),
        get airlineLabel() {
          const airline = f.airline_short || f.airline;

          if (airline === 'Private owner') {
            return t('airline.private');
          }

          return airline;
        },
        aircraftRegistration: f.aircraft_registration,
        aircraftPhoto: f.aircraft_photo_small,
        aircraftCode: f.aircraft_code,
        aircraftModel: f.aircraft_model,
        origin: f.airport_origin_city,
        destination: f.airport_destination_city,
        distance,
        altitude: f.altitude,
        groundSpeed: f.ground_speed,
        departureTime: f.time_real_departure ?? undefined,
        arrivalTime: f.time_estimated_arrival ?? f.time_scheduled_arrival ?? undefined,
        get isLive() {
          if (!this.arrivalTime) return false;

          return this.arrivalTime > Date.now() / 1000;
        },
      };

      return html`<flight-area-card .hass=${this.hass} .flight=${flight}></flight-area-card>`;
    }

    if (f._type === 'tracked') {
      const airlineIcao = computeAirlineIcao({
        flightNumber: f.flight_number,
        callsign: f.callsign,
      });

      const airlineLabel = airlineIcao ? getAirlineName(airlineIcao) : null;

      const flight: AreaFlight = {
        id: f.id,
        title: 'Most tracked flights from FlightRadar24',
        flightNumber: f.flight_number,
        callsign: f.callsign,
        airlineIcao,
        airlineLabel,
        aircraftRegistration: null,
        aircraftPhoto: null,
        aircraftCode: f.aircraft_code,
        aircraftModel: f.aircraft_model,
        origin: f.airport_origin_city,
        destination: f.airport_destination_city,
        distance: 0,
        altitude: 0,
        groundSpeed: 0,
        departureTime: undefined,
        arrivalTime: undefined,
        isLive: true,
      };

      return html`<flight-area-card .hass=${this.hass} .flight=${flight}></flight-area-card>`;
    }

    return html`<hui-error-card>Unhandled flight type</hui-error-card>`;
  }
}
