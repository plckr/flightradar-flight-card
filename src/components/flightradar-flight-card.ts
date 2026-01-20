import './flight-area-card';
import './flight-carousel';
import './flight-wrapper';

import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import * as v from 'valibot';

import { CARD_NAME, CardConfig, validateConfig } from '../const';
import { getTFunc } from '../localize/localize';
import { resetStyles } from '../styles';
import { HomeAssistant } from '../types/homeassistant';
import { computeAirlineIcao, getAirlineName } from '../utils/airline-icao';
import { hasConfigChanged, hasEntityChanged } from '../utils/has-changed';
import { FRAreaFlight, FRMostTrackedFlight, parseFlight } from '../utils/schemas';
import { parseAirlineLogoUrl } from '../utils/templating/airline-logo';
import { defined } from '../utils/type-guards';
import { AreaCardOptions, FlightData } from './flight-area-card';
import { EDITOR_NAME } from './flightradar-flight-card-editor';

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
        color: var(--flight-card-primary-color);
      }
    `,
  ];

  public setConfig(config: Partial<CardConfig>): void {
    this._config = validateConfig(config);
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

    return validateConfig({
      entities: defaultEntities.filter((entity) => {
        return hass.states[entity.entity_id] !== undefined;
      }),
    });
  }

  public static async getConfigElement() {
    await import('./flightradar-flight-card-editor');
    return document.createElement(EDITOR_NAME);
  }

  protected shouldUpdate(changedProps: PropertyValues<this>): boolean {
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

  protected firstUpdated() {
    this._setStyles();
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('_config')) {
      this._setStyles();
    }
  }

  private _setStyles() {
    this.style.setProperty('--flight-card-primary-color', this._config.colors.primary);
    this.style.setProperty('--flight-card-secondary-color', this._config.colors.secondary);
    this.style.setProperty('--flight-card-accent-color', this._config.colors.accent);
    this.style.setProperty('--flight-card-accent-color-light', this._config.colors.accent_light);
    this.style.setProperty(
      '--flight-card-progress-bar-light-color',
      this._config.colors.progress_bar_light
    );
  }

  protected render() {
    if (!this._config || !this.hass) {
      console.error('Missing config or hass');
      return html`<hui-error-card>Something went wrong: check console for errors</hui-error-card>`;
    }

    const { t } = getTFunc(this.hass.locale.language);

    const entities: {
      title?: string;
      flights: { options: AreaCardOptions; flightData: FlightData }[];
    }[] = [];

    for (const entity of this._config.entities) {
      const stateObj = this.hass.states[entity.entity_id];
      if (!stateObj) {
        console.error(`Entity not found: ${entity.entity_id}`);
        continue;
      }

      const stateFlights = v.parse(
        v.fallback(v.array(v.unknown()), [undefined]),
        stateObj?.attributes?.flights
      );

      const entityFlights = stateFlights
        .map(parseFlight)
        .filter((flight) => flight._type !== 'unknown')
        .map((flight) => {
          const flightData = getFlightCardData(flight, {
            customTitle: entity.title,
            locale: this.hass.locale.language,
          });

          const customAirlineLogoUrl =
            flightData.airlineIcao && defined(this._config.template_airline_logo_url)
              ? parseAirlineLogoUrl(this._config.template_airline_logo_url, {
                  airlineIcao: flightData.airlineIcao,
                })
              : undefined;

          const options = {
            units: this._config.units,
            showFlightradarLink: this._config.show_flightradar_link,
            showAirlineInfoColumn: this._config.show_airline_info_column,
            showAirlineLogo: this._config.show_airline_logo,
            showAircraftPhoto: this._config.show_aircraft_photo,
            showProgressBar: this._config.show_progress_bar,
            customAirlineLogoUrl,
          };

          return { options, flightData };
        });

      if (entityFlights.length) {
        entities.push({
          title: entity.title,
          flights: entityFlights,
        });
      }
    }

    if (!entities.length) {
      return html`<ha-card>
        <ha-icon icon="mdi:airplane"></ha-icon>
        <span>${t('no_flights')}</span>
      </ha-card>`;
    }

    const selectedEntity = entities[0];

    if (selectedEntity.flights.length > 1 && this._config.carousel.enable) {
      return html`
        <flight-carousel
          .cardTitle=${selectedEntity.title}
          .hass=${this.hass}
          .flights=${selectedEntity.flights}
          .emblaOptions=${{
            loop: this._config.carousel.loop,
            autoplay: this._config.carousel.autoplay,
            autoplayDelay: this._config.carousel.autoplay_delay,
            showControls: this._config.carousel.show_controls,
          }}
        ></flight-carousel>
      `;
    }

    const selectedFlight = selectedEntity.flights[0];

    return html`<flight-wrapper .cardTitle=${selectedEntity.title}>
      <flight-area-card
        .hass=${this.hass}
        .flight=${selectedFlight.flightData}
        .options=${selectedFlight.options}
      ></flight-area-card>
    </flight-wrapper>`;
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
