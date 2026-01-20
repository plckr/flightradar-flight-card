import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { getTFunc } from '../localize/localize';
import { resetStyles } from '../styles';
import { HomeAssistant } from '../types/homeassistant';
import { formatTimeLeft, toSeconds } from '../utils/date';

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
        background: var(--flight-card-accent-color-light);
        background: linear-gradient(
          90deg,
          var(--flight-card-accent-color-light) 0%,
          var(--flight-card-accent-color-light) calc(var(--progress-percent) * 1%),
          var(--flight-card-progress-bar-light-color) calc(var(--progress-percent) * 1%),
          var(--flight-card-progress-bar-light-color) 100%
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
        transform: translate(-50%, -50%);
        --mdc-icon-size: var(--ha-space-4);
        color: var(--flight-card-accent-color);
      }

      .bar-icon ha-icon[icon='mdi:airplane'] {
        transform: translate(calc(-50% - 0.5px), -50%) rotate(45deg);
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

    const secondsLeft = this.arrivalTime - nowSeconds;
    const secondsSinceDeparture = nowSeconds - this.departureTime;
    const totalSeconds = this.arrivalTime - this.departureTime;
    const percent = secondsSinceDeparture / totalSeconds;

    const timeLeft = formatTimeLeft(secondsLeft, this.hass.locale.language);

    let icon = 'mdi:airplane';
    if (secondsSinceDeparture < toSeconds({ minutes: 30 }) && percent < 0.15) {
      icon = 'mdi:airplane-takeoff';
    } else if (secondsLeft < toSeconds({ minutes: 30 }) && percent > 0.85) {
      icon = 'mdi:airplane-landing';
    }

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
          <ha-icon icon=${icon}></ha-icon>
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
