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

      .bar-icon {
        position: absolute;
        top: 50%;
        left: calc(var(--progress-percent) * 1%);
        width: var(--ha-space-5);
        height: var(--ha-space-5);
        transform: translate(-50%, calc((50% + 1px) * -1));
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: 999px;
      }

      .bar-icon ha-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(calc(-50% - 0.5px), -50%) rotate(45deg);
        --mdc-icon-size: var(--ha-space-4);
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
        <div class="bar-icon">
          <ha-icon icon="mdi:airplane" />
        </div>
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
