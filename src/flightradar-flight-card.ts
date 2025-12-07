import { LitElement, html, TemplateResult, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, hasConfigOrEntityChanged } from 'custom-card-helpers';

import { FlightradarFlightCardConfig } from './types';
import { cardStyles } from './styles';
import { CARD_NAME, CARD_DESCRIPTION, CARD_VERSION, DEFAULT_CONFIG } from './const';
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
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: FlightradarFlightCardConfig;

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

  // protected shouldUpdate(changedProps: PropertyValues): boolean {
  //   if (!this._config) {
  //     return false;
  //   }

  //   const result = hasConfigOrEntityChanged(this, changedProps, false);
  //   return result;
  // }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    const entityId = this._config.entity;
    const stateObj = this.hass.states[entityId];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="error">Entity not found: ${entityId}</div>
        </ha-card>
      `;
    }

    const name = this._config.name || stateObj.attributes.friendly_name || entityId;
    const state = stateObj.state;
    const attributes = stateObj.attributes;

    return html`
      <ha-card>
        ${this._config.show_header
          ? html`
              <div class="card-header">
                <span class="name">${name}</span>
              </div>
            `
          : ''}

        <div class="card-content">
          ${this._config.show_state
            ? html`
                <div class="state ${state === 'unavailable' ? 'unavailable' : ''}">${state}</div>
              `
            : ''}

          <div class="flight-info">
            ${attributes.flight_number
              ? html`
                  <span class="label">Flight</span>
                  <span class="value">${attributes.flight_number}</span>
                `
              : ''}
            ${attributes.airline
              ? html`
                  <span class="label">Airline</span>
                  <span class="value">${attributes.airline}</span>
                `
              : ''}
            ${attributes.origin
              ? html`
                  <span class="label">Origin</span>
                  <span class="value">${attributes.origin}</span>
                `
              : ''}
            ${attributes.destination
              ? html`
                  <span class="label">Destination</span>
                  <span class="value">${attributes.destination}</span>
                `
              : ''}
            ${attributes.altitude !== undefined
              ? html`
                  <span class="label">Altitude</span>
                  <span class="value">${attributes.altitude} ft</span>
                `
              : ''}
            ${attributes.speed !== undefined
              ? html`
                  <span class="label">Speed</span>
                  <span class="value">${attributes.speed} kts</span>
                `
              : ''}
            ${attributes.aircraft_type
              ? html`
                  <span class="label">Aircraft</span>
                  <span class="value">${attributes.aircraft_type}</span>
                `
              : ''}
          </div>
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
