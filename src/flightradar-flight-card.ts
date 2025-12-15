import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import * as v from 'valibot';

import { CARD_NAME, CardConfig, DEFAULT_CONFIG } from './const';
import { cardStyles, resetStyles } from './styles';
import { ChangedProps, HomeAssistant } from './types/homeassistant';
import { isValidAirlineLogo } from './utils/airline-logos';
import { hasConfigOrEntityChanged } from './utils/has-changed';
import { areaFlightSchema } from './utils/schemas';

@customElement(CARD_NAME)
export class FlightradarFlightCard extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @state()
  private _config!: CardConfig;

  private _invalid!: boolean;

  @state()
  private _flight!: {
    id: string;
    aircraftRegistration: string | null;
    aircraftPhoto: string | null;
    aircraftCode: string;
    aircraftModel: string;
    airlineIcao: string | null;
    flightNumber: string | null;
    callsign: string | null;
    airlineLabel: string;
    /** Origin airport */
    origin: string;
    /** Destination airport */
    destination: string;
    /** Distance to tracked area
     * @unit kilometers
     */
    distance: number;
    /** Barometric pressure altitude above mean sea level (AMSL)
     * @unit feet
     */
    altitude: number;
    /** Speed relative to the ground
     * @unit knots */
    groundSpeed: number;
    /** Whether the flight is currently in the air */
    isLive: boolean;
    /** Flight duration in seconds */
    flightTime?: number;
    /** Departure time in seconds */
    departureTime?: number;
    /** Arrival time in seconds */
    arrivalTime?: number;
  };

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

  protected willUpdate() {
    this._invalid = false;

    const entityId = this._config.entity;
    const stateObj = this.hass.states[entityId];

    if (!stateObj) {
      throw new Error(`Entity not found: ${entityId}`);
    }

    const data = stateObj.attributes.flights[0];
    const f = v.parse(areaFlightSchema, data, {
      message: (issue) => {
        console.error(issue);
        this._invalid = true;
        return issue.message;
      },
    });

    this._flight = {
      id: f.id,
      flightNumber: f.flight_number,
      callsign: f.callsign,
      airlineIcao: f.airline_icao,
      get airlineLabel() {
        const airline = f.airline_short || f.airline;

        if (airline === 'Private owner') {
          return 'Aeronave privada';
        }

        return airline ?? 'Desconhecido';
      },
      aircraftRegistration: f.aircraft_registration,
      aircraftPhoto: f.aircraft_photo_small,
      aircraftCode: f.aircraft_code,
      aircraftModel: f.aircraft_model,
      origin: f.airport_origin_city || 'Desconhecido',
      destination: f.airport_destination_city || 'Desconhecido',
      distance: f.closest_distance ?? f.distance,
      altitude: f.altitude,
      groundSpeed: f.ground_speed,
      departureTime: f.time_real_departure ?? undefined,
      arrivalTime: f.time_estimated_arrival ?? f.time_scheduled_arrival ?? undefined,
      get flightTime() {
        if (!this.departureTime || !this.arrivalTime) return;

        return this.arrivalTime - this.departureTime;
      },
      get isLive() {
        if (!this.arrivalTime) return false;

        return this.arrivalTime > Date.now() / 1000;
      },
    };
  }

  protected renderFlightTitle() {
    if (
      !this._flight.flightNumber &&
      (!this._flight.callsign || this._flight.callsign === 'Blocked') &&
      !this._flight.aircraftRegistration
    ) {
      return html`<p>${this._flight.aircraftCode}</p>`;
    }

    const url = new URL(`https://www.flightradar24.com`);
    url.pathname = `/data/aircraft/${this._flight.aircraftRegistration}`;

    if (this._flight.flightNumber) {
      url.pathname = `/data/flights/${this._flight.flightNumber}`;
    }

    if (this._flight.isLive) {
      const urlPath = [this._flight.id];

      if (this._flight.callsign) {
        urlPath.unshift(this._flight.callsign);
      } else if (this._flight.aircraftCode) {
        urlPath.unshift(this._flight.aircraftCode);
      }

      url.pathname = `/${urlPath.join('/')}`;
    }

    const label =
      this._flight.flightNumber ?? this._flight.callsign ?? this._flight.aircraftRegistration;

    return html`
      <a
        href=${url}
        rel="noopener noreferrer"
        target="_blank"
        style="color:var(--primary-text-color);"
      >
        ${label}
        <ha-icon
          icon="mdi:open-in-new"
          style="
            --mdc-icon-size:16px;
            opacity:0.75"
          ;
        />
      </a>
    `;
  }

  protected render() {
    if (!this._config || !this.hass || this._invalid) {
      return html`<hui-error-card>Something went wrong: check console for errors</hui-error-card>`;
    }

    return html`
      <ha-card>
        <div>
          <div class="title">
            Último avião a sobrevoar (a ${this._flight.distance.toFixed(1)} km)
          </div>

          <div class="main-content">
            <div class="main-content-left">
              ${this.renderFlightTitle()}

              <div class="callsign-info">
                <p>${this._flight.callsign}</p>

                ${this._flight.isLive
                  ? html`
                      <div class="live-indicator">
                        Live
                        <div class="pulse"></div>
                      </div>
                    `
                  : nothing}
              </div>

              <div class="flight-locations">
                ${this._flight.origin}
                <ha-icon icon="mdi:arrow-right"></ha-icon>
                ${this._flight.destination}
              </div>

              <div class="flight-speed-info-container">
                <div>
                  <p class="label">Altitude</p>
                  <p class="value">${this._flight.altitude} ft</p>
                </div>

                <div>
                  <p class="label">Velocidade de solo</p>
                  <p class="value">${this._flight.groundSpeed} kts</p>
                </div>
              </div>
            </div>

            <div class="main-content-right">
              <div class="airline-container">
                ${isValidAirlineLogo(this._flight.airlineIcao)
                  ? html`
                      <img
                        src="http://localhost:4000/flightaware_logos/${this._flight
                          .airlineIcao}.png"
                      />
                    `
                  : nothing}

                <p>${this._flight.airlineLabel}</p>
              </div>

              ${this._flight.aircraftPhoto
                ? html` <img src="${this._flight.aircraftPhoto}" class="aircraft-photo" /> `
                : nothing}

              <p class="aircraft-model">${this._flight.aircraftModel}</p>
            </div>
          </div>

          ${this._flight.isLive && this._flight.arrivalTime
            ? html` <div class="flight-progress">
                <flight-progress-bar
                  .hass=${this.hass}
                  .departureTime=${this._flight.departureTime}
                  .arrivalTime=${this._flight.arrivalTime}
                  .destination=${this._flight.destination}
                />
              </div>`
            : nothing}
        </div>
      </ha-card>
    `;
  }
}
