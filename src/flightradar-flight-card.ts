import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { CARD_DESCRIPTION, CARD_NAME, CARD_VERSION, DEFAULT_CONFIG } from './const';
import { cardStyles } from './styles';
import { ChangedProps, FlightData, FlightradarFlightCardConfig, HomeAssistant } from './types';
import { formatRelativeTime } from './utils/date';
import { hasConfigOrEntityChanged } from './utils/has-changed';
import { registerCustomCard } from './utils/register-card';

console.info(
  `%c ${CARD_NAME.toUpperCase()} %c v${CARD_VERSION} `,
  'color: white; background: #3498db; font-weight: 700;',
  'color: #3498db; background: white; font-weight: 700;'
);

registerCustomCard({
  type: CARD_NAME,
  name: 'Flightradar Flight Card',
  description: CARD_DESCRIPTION,
});

@customElement(CARD_NAME)
export class FlightradarFlightCard extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @state()
  private _config!: FlightradarFlightCardConfig;

  @state()
  private _flight!: {
    id: string;
    aircraftPhoto: string | null;
    aircraftModel: string;
    airlineIcao: string | null;
    flightNumber: string | null;
    callsign: string | null;
    airlineLabel: string;
    origin: string;
    destination: string;
    distance: number;
    altitude: number;
    groundSpeed: number;
    isLive: boolean;
    /** Flight duration in seconds */
    flightTime: number;
    departureTime: number;
    arrivalTime: number;
  };

  static styles = cardStyles;

  public setConfig(config: FlightradarFlightCardConfig): void {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }

    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
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
    const entityId = this._config.entity;
    const stateObj = this.hass.states[entityId];

    if (!stateObj) {
      throw new Error(`Entity not found: ${entityId}`);
    }

    const attributes = stateObj.attributes;
    const f: FlightData = attributes.flights[0];

    this._flight = {
      id: f.id,
      flightNumber: f.flight_number,
      callsign: f.callsign,
      airlineIcao: f.airline_icao,
      get airlineLabel() {
        const airline = f.airline_short || f.airline;
        if (airline === 'Private owner') return 'Aeronave privada';
        else return airline;
      },
      aircraftPhoto: f.aircraft_photo_small,
      aircraftModel: f.aircraft_model,
      origin: f.airport_origin_city || 'Desconhecido',
      destination: f.airport_destination_city || 'Desconhecido',
      distance: f.distance,
      altitude: f.altitude,
      groundSpeed: f.ground_speed,
      departureTime: f.time_real_departure,
      arrivalTime: f.time_estimated_arrival || f.time_scheduled_arrival,
      get flightTime() {
        return this.arrivalTime - this.departureTime;
      },
      get isLive() {
        return this.arrivalTime > Date.now();
      },
    };
  }

  protected renderFlightTitle(): TemplateResult {
    if (!this._flight.flightNumber) {
      return html`<p>${this._flight.callsign}</p>`;
    }

    let href = `https://www.flightradar24.com/data/flights/${this._flight.flightNumber}`;
    if (this._flight.isLive) {
      href = `https://www.flightradar24.com/${[this._flight.callsign, this._flight.id].join('/')}`;
    }

    return html`
      <a
        href=${href}
        rel="noopener noreferrer"
        target="_blank"
        style="color:var(--primary-text-color);"
      >
        ${this._flight.flightNumber || this._flight.callsign}
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

  protected renderFlightProgress(): TemplateResult {
    if (!this._flight.isLive) return html``;

    const relativeTime = formatRelativeTime(
      new Date(),
      new Date(this._flight.arrivalTime),
      this.hass.language
    );

    return html` <div
        style="
          position: relative;
          margin-top: 16px;
          background: var(--state-active-color);
          background: linear-gradient(90deg,
            var(--state-active-color) 0%, 
            var(--state-active-color) {{ flight_percent * 100 }}%,
            var(--secondary-background-color) {{ flight_percent * 100 }}%,
            var(--secondary-background-color) 100%);
          height: 4px;
          border-radius:999px;
        "
      >
        <ha-icon
          icon="mdi:airplane"
          style="
              position: absolute;
              top: 0px;
              left: {{ flight_percent * 100 }}%;
              transform: translate(-50%, -50%);
              --mdc-icon-size: 16px;
              background: var(--card-background-color,#fff);
              color: var(--accent-color);
            "
        />
      </div>

      <p
        style="
          margin-top:6px;
          text-align:right;
          opacity: 0.6;
        "
      >
        Restam ${relativeTime} para chegar a ${this._flight.destination}
      </p>`;
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    return html`
      <ha-card style="padding: 16px;>
        <div
          style="
      width:100%;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      color:var(--primary-text-color);
    "
        >
          <div
            style="
        font-size:11px;
        opacity:0.7;
        letter-spacing:0.10em;
        text-transform:uppercase;
      "
          >
            Último avião a sobrevoar (a ${this._flight.distance.toFixed(1)} km)
          </div>

          <div
            style="
        display:grid;
        grid-template-columns:minmax(0, 1.5fr) auto;
        gap:16px;
        align-items:center;
      "
          >
            <div
              style="
          margin-top:12px;
          font-size:26px;
          line-height: 1.15;
          font-weight:600;
          color:var(--primary-text-color);
        "
            >
              ${this.renderFlightTitle()}

              <div
                style="
            display:flex;
            align-items:center;
            gap:8px;
            margin-top:4px;
          "
              >
                <p
                  style="
              font-size:15px;
              opacity:0.8;
            "
                >
                  ${this._flight.callsign}
                </p>

                ${
                  this._flight.isLive
                    ? html`
                        <div
                          style="
                display:inline-flex;
                align-items:center;
                gap:4px;
                font-size:10px;
                padding: 2px 6px;
                color: white;
                background: var(--state-active-color);
                border-radius: 999px;
              "
                        >
                          Live
                          <div
                            style="
                  width: 4px;
                  height: 4px;
                  border-radius: 100%;
                  background: white;
                  animation: pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                "
                          ></div>
                        </div>
                      `
                    : ''
                }
              </div>

              <div
                style="
            margin-top:6px;
            font-size:17px;
            opacity:0.9;
          "
              >
                ${this._flight.origin} → ${this._flight.destination}
              </div>

              ${
                this._flight.altitude && this._flight.groundSpeed
                  ? html`
                      <div
                        style="
              margin-top:8px;
              display:flex;
              gap:24px;
              font-size:13px;
            "
                      >
                        <div>
                          <p
                            style="
                  font-size:10px;
                  opacity:0.6;
                  text-transform:uppercase;
                  letter-spacing:0.10em;
                "
                          >
                            Altitude
                          </p>
                          <p
                            style="
                  font-size:20px;
                  font-weight:600;
                "
                          >
                            ${this._flight.altitude} ft
                          </p>
                        </div>

                        <div>
                          <p
                            style="
                  font-size:10px;
                  opacity:0.6;
                  text-transform:uppercase;
                  letter-spacing:0.10em;
                "
                          >
                            Velocidade de solo
                          </p>
                          <p
                            style="
                  font-size:20px;
                  font-weight:600;
                "
                          >
                            ${this._flight.groundSpeed} kts
                          </p>
                        </div>
                      </div>
                    `
                  : ''
              }
            </div>

            <div
              style="
          display: flex;
          flex-direction:column;
          align-items:center;
          gap: 6px;
        "
            >
              <div
                style="
            display: flex;
            align-items:center;
            gap: 8px;
            margin-top:4px;
          "
              >
                ${
                  this._flight.airlineIcao
                    ? html`
                        <img
                          src="http://localhost:4000/flightaware_logos/${this._flight
                            .airlineIcao}.png"
                          style="
                  max-width:70px;
                  max-height: 20px;
                  object-fit: contain;
                  filter:drop-shadow(0 0 2px var(--secondary-text-color));
                "
                        />
                      `
                    : ''
                }

                <p
                  style="
              font-size:12px;
              opacity:0.7;
              text-transform:uppercase;
            "
                >
                  ${this._flight.airlineLabel}
                </p>
              </div>

              ${
                this._flight.aircraftPhoto
                  ? html`
                      <img
                        src="${this._flight.aircraftPhoto}"
                        style="
                border-radius:8px;
                width:120px;
                height:auto;
              "
                      />
                    `
                  : ''
              }

              <p
                style="
            font-size:12px;
            opacity:0.7;
            text-transform:uppercase;
          "
              >
                ${this._flight.aircraftModel}
              </p>
            </div>
          </div>

          ${this.renderFlightProgress()}
        </div>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [CARD_NAME]: FlightradarFlightCard;
  }
}
