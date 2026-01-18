import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { AreaCardOptions, FlightData } from './flight-area-card';
import { resetStyles } from './styles';
import { HomeAssistant } from './types/homeassistant';

@customElement('flight-carousel')
export class FlightCarousel extends LitElement {
  @property({ type: String })
  public cardTitle?: string;

  @property({ attribute: false })
  public hass!: HomeAssistant;

  @property({ type: Array })
  public flights: { options: AreaCardOptions; flightData: FlightData }[] = [];

  @state()
  private _selectedIndex = 0;

  private _embla: EmblaCarouselType | null = null;

  @query('div.carousel')
  private _viewport!: HTMLElement;

  static styles = [
    resetStyles,
    css`
      .carousel {
        display: block;
        overflow: hidden;
        margin-inline: calc(var(--ha-space-4) * -1);
        padding-inline: var(--ha-space-4);
      }

      .container {
        display: flex;
        margin-left: calc(var(--ha-space-4) * -1);
      }

      .slide {
        overflow: hidden;
        flex: 0 0 100%;
        min-width: 0;
        padding-left: var(--ha-space-4);
      }

      .carousel-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--ha-space-2);
      }

      .carousel-controls {
        display: flex;
        align-items: center;
        gap: var(--ha-space-1);
      }

      .carousel-btn {
        opacity: 0.7;
        appearance: none;
        background-color: transparent;
        touch-action: manipulation;
        text-decoration: none;
        cursor: pointer;
        border: 0px;
        padding: 0px;
        margin: 0px;
        box-shadow: inset 0 0 0 1px currentColor;
        width: var(--ha-space-6);
        height: var(--ha-space-6);
        z-index: 1;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: var(--ha-space-4);
      }
    `,
  ];

  protected firstUpdated(): void {
    this._initCarousel();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._destroyCarousel();
  }

  private _initCarousel(): void {
    this._embla = EmblaCarousel(this._viewport, {
      loop: false,
    });

    this._embla.on('select', () => {
      this._selectedIndex = this._embla?.selectedScrollSnap() ?? 0;
    });
  }

  private _destroyCarousel(): void {
    if (this._embla) {
      this._embla.destroy();
      this._embla = null;
    }
  }

  protected render() {
    return html`
      <flight-wrapper .cardTitle=${this.cardTitle}>
        <div class="carousel-nav" slot="top-right">
          <div class="carousel-controls">
            <button class="carousel-btn" @click=${() => this._embla?.scrollPrev()}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="carousel-btn" @click=${() => this._embla?.scrollNext()}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>

          <p class="carousel-counter">${this._selectedIndex + 1} / ${this.flights.length}</p>
        </div>

        <div class="carousel">
          <div class="container">
            ${repeat(
              this.flights,
              (flight) => flight.flightData.id,
              (flight) => html`
                <flight-area-card
                  .hass=${this.hass}
                  .flight=${flight.flightData}
                  .options=${flight.options}
                  class="slide"
                >
                </flight-area-card>
              `
            )}
          </div>
        </div>
      </flight-wrapper>
    `;
  }
}
