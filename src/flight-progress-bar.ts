import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { KeyString, localize } from './localize/localize';
import { resetStyles } from './styles';
import { HomeAssistant } from './types/homeassistant';
import { formatRelativeTime } from './utils/date';

@customElement('flight-progress-bar')
export class FlightProgressBar extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @property({ type: Number })
  public departureTime!: number;

  @property({ type: Number })
  public arrivalTime!: number;

  @property({ type: String })
  public destination!: string;

  @state()
  private _now: Date = new Date();

  private _timerInterval?: number;

  connectedCallback() {
    super.connectedCallback();
    this._startTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopTimer();
  }

  private _startTimer() {
    this._timerInterval = setInterval(() => {
      this._now = new Date();
    }, 1000);
  }

  private _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = undefined;
    }
  }

  static styles = [
    resetStyles,
    css`
      .bar {
        position: relative;
        background: var(--state-active-color);
        background: linear-gradient(
          90deg,
          var(--state-active-color) 0%,
          var(--state-active-color) calc(var(--progress-percent) * 1%),
          var(--secondary-background-color) calc(var(--progress-percent) * 1%),
          var(--secondary-background-color) 100%
        );
        height: 4px;
        border-radius: 999px;
      }

      .bar > ha-icon {
        position: absolute;
        top: 0px;
        left: calc(var(--progress-percent) * 1%);
        transform: translate(-50%, -50%);
        --mdc-icon-size: var(--ha-space-4);
        background: var(--card-background-color, #fff);
        color: var(--accent-color);
      }

      .text {
        margin-top: 6px;
        text-align: right;
        opacity: 0.6;
      }
    `,
  ];

  private t(key: KeyString, params?: Record<string, string>) {
    return localize(key, this.hass.locale.language, params);
  }

  public render() {
    const relativeTime = formatRelativeTime(
      this._now,
      new Date(this.arrivalTime * 1000),
      this.hass.language
    );

    const percent =
      (this.arrivalTime * 1000 - this._now.getTime()) /
      (this.arrivalTime * 1000 - this.departureTime * 1000);

    return html`
      <div
        role="progressbar"
        aria-valuemin="0"
        aria-valuenow=${Math.round(percent * 100)}
        aria-valuemax="100"
        class="bar"
        style="--progress-percent: ${Math.round(percent * 100)};"
      >
        <ha-icon icon="mdi:airplane" />
      </div>

      <p class="text">
        ${this.t('flight.time_remaining', {
          time: relativeTime,
          destination: this.destination,
        })}
      </p>
    `;
  }
}
