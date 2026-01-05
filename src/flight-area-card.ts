import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { getTFunc } from './localize/localize';
import { cardStyles, resetStyles } from './styles';
import { HomeAssistant } from './types/homeassistant';
import { isValidAirlineLogo } from './utils/airline-icao';
import { getFlightLabel } from './utils/flight';
import { round } from './utils/math';
import { defined } from './utils/type-guards';

export type AreaFlight = {
  id: string;
  title?: string;
  aircraftRegistration: string | null;
  aircraftPhoto: string | null;
  aircraftCode: string | null;
  aircraftModel: string | null;
  airlineIcao: string | null;
  flightNumber: string | null;
  callsign: string | null;
  airlineLabel: string | null;
  /** Origin airport */
  origin: string | null;
  /** Destination airport */
  destination: string | null;
  /** Distance to tracked area
   * @unit kilometers
   */
  distance?: number;
  /** Barometric pressure altitude above mean sea level (AMSL)
   * @unit feet
   */
  altitude?: number;
  /** Speed relative to the ground
   * @unit knots */
  groundSpeed?: number;
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
    const { t } = getTFunc(this.hass.locale.language);

    const flightInfos = (
      [
        [t('altitude'), this.flight.altitude, (v) => `${v} ft`],
        [t('ground_speed'), this.flight.groundSpeed, (v) => `${v} kts`],
        [t('distance'), this.flight.distance, (v) => `${round(v, 1)} km`],
      ] satisfies Array<[string, number | undefined, ((v: number) => number | string)?]>
    ).flatMap(([label, value, formatter]) => {
      if (defined(value)) {
        return { label, value: formatter?.(value) ?? value };
      }

      return [];
    });

    return html`
      <ha-card>
        <div>
          ${this.flight.title ? html` <div class="title">${this.flight.title}</div> ` : nothing}

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
                              ${t('flight.live')}
                              <div class="pulse"></div>
                            </div>
                          `
                        : nothing}
                    </div>
                  `
                : nothing}
              ${defined(this.flight.origin) || defined(this.flight.destination)
                ? html` <div class="flight-locations">
                    ${this.flight.origin ?? t('origin_unknown')}
                    <ha-icon icon="mdi:arrow-right"></ha-icon>
                    ${this.flight.destination ?? t('destination_unknown')}
                  </div>`
                : nothing}
              ${flightInfos.length
                ? html`
                    <div class="flight-speed-info-container">
                      ${flightInfos.map(
                        ({ label, value }) => html`
                          <div>
                            <p class="label">${label}</p>
                            <p class="value">${value}</p>
                          </div>
                        `
                      )}
                    </div>
                  `
                : nothing}
            </div>

            <div class="main-content-right">
              <div class="airline-container">
                ${isValidAirlineLogo(this.flight.airlineIcao)
                  ? html`
                      <img
                        src="__LOGOS_URL__/${this.flight.airlineIcao}.png"
                        alt="Airline ICAO Logo '${this.flight.airlineIcao}'"
                      />
                    `
                  : nothing}

                <p>${this.flight.airlineLabel ?? t('airline.unknown')}</p>
              </div>

              ${this.flight.aircraftPhoto
                ? html`
                    <img
                      src="${this.flight.aircraftPhoto}"
                      .alt=${this.flight.aircraftModel ?? ''}
                      class="aircraft-photo"
                    />
                  `
                : !!flightInfos.length
                  ? html`<ha-icon icon="mdi:airplane" class="aircraft-photo"></ha-icon>`
                  : nothing}
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
