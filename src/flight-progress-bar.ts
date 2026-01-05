import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { getTFunc } from './localize/localize';
import { resetStyles } from './styles';
import { HomeAssistant } from './types/homeassistant';
import { formatTimeLeft } from './utils/date';

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

  private _timerInterval?: NodeJS.Timeout;

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
    }, 10 * 1000);
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

  public render() {
    const { t } = getTFunc(this.hass.locale.language);

    const nowSeconds = this._now.getTime() / 1000;
    const timeLeft = formatTimeLeft(this.arrivalTime - nowSeconds, this.hass.locale.language);
    const percent = (nowSeconds - this.departureTime) / (this.arrivalTime - this.departureTime);

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
        ${t('flight.time_remaining', {
          time: timeLeft,
          destination: this.destination,
        })}
      </p>
    `;
  }
}
