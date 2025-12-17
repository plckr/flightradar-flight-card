import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { cardStyles, resetStyles } from './styles';
import { HomeAssistant } from './types/homeassistant';
import { isValidAirlineLogo } from './utils/airline-icao';
import { getFlightLabel } from './utils/flight';
import { round } from './utils/math';

export type AreaFlight = {
  id: string;
  title: string;
  aircraftRegistration: string | null;
  aircraftPhoto: string | null;
  aircraftCode: string | null;
  aircraftModel: string | null;
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
  distance?: number;
  /** Barometric pressure altitude above mean sea level (AMSL)
   * @unit feet
   */
  altitude: number;
  /** Speed relative to the ground
   * @unit knots */
  groundSpeed: number;
  /** Whether the flight is currently in the air */
  isLive: boolean;
  /** Departure time in seconds */
  departureTime?: number;
  /** Arrival time in seconds */
  arrivalTime?: number;
};

@customElement('flight-area-card')
export class FlightradarFlightCard extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @property({ type: Object })
  public flight!: AreaFlight;

  static styles = [resetStyles, cardStyles];

  protected renderFlightTitle() {
    const { label, url } = getFlightLabel(this.flight);

    if (!url) {
      return html`<p>${label}</p>`;
    }

    return html`<a
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
    </a>`;
  }

  protected render() {
    return html`
      <ha-card>
        <div>
          <div class="title">${this.flight.title}</div>

          <div class="main-content">
            <div class="main-content-left">
              ${this.renderFlightTitle()}
              ${this.flight.callsign
                ? html`
                    <div class="callsign-info">
                      <p>${this.flight.callsign}</p>

                      ${this.flight.isLive
                        ? html`
                            <div class="live-indicator">
                              Live
                              <div class="pulse"></div>
                            </div>
                          `
                        : nothing}
                    </div>
                  `
                : nothing}

              <div class="flight-locations">
                ${this.flight.origin}
                <ha-icon icon="mdi:arrow-right"></ha-icon>
                ${this.flight.destination}
              </div>

              <div class="flight-speed-info-container">
                <div>
                  <p class="label">Altitude</p>
                  <p class="value">${this.flight.altitude} ft</p>
                </div>

                <div>
                  <p class="label">Velocidade de solo</p>
                  <p class="value">${this.flight.groundSpeed} kts</p>
                </div>

                ${this.flight.distance
                  ? html`
                      <div>
                        <p class="label">Distância</p>
                        <p class="value">${round(this.flight.distance, 1)} km</p>
                      </div>
                    `
                  : nothing}
              </div>
            </div>

            <div class="main-content-right">
              <div class="airline-container">
                ${isValidAirlineLogo(this.flight.airlineIcao)
                  ? html`
                      <img
                        src="http://localhost:4000/flightaware_logos/${this.flight.airlineIcao}.png"
                        alt="Airline ICAO Logo '${this.flight.airlineIcao}'"
                      />
                    `
                  : nothing}

                <p>${this.flight.airlineLabel}</p>
              </div>

              ${this.flight.aircraftPhoto
                ? html`
                    <img
                      src="${this.flight.aircraftPhoto}"
                      .alt=${this.flight.aircraftModel ?? ''}
                      class="aircraft-photo"
                    />
                  `
                : html`<ha-icon icon="mdi:airplane" class="aircraft-photo"></ha-icon>`}
              ${this.flight.aircraftModel
                ? html` <p class="aircraft-model">${this.flight.aircraftModel}</p> `
                : nothing}
            </div>
          </div>

          ${this.flight.isLive && this.flight.arrivalTime
            ? html` <flight-progress-bar
                .hass=${this.hass}
                .departureTime=${this.flight.departureTime}
                .arrivalTime=${this.flight.arrivalTime}
                .destination=${this.flight.destination}
                class="flight-progress"
              />`
            : nothing}
        </div>
      </ha-card>
    `;
  }
}
