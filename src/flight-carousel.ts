import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { FlightData } from './flight-area-card';
import { resetStyles } from './styles';
import { HomeAssistant } from './types/homeassistant';
import { UnitOptions } from './utils/units';

@customElement('flight-carousel')
export class FlightCarousel extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @property({ type: Array })
  public flights: FlightData[] = [];

  @property({ type: Object })
  public units!: UnitOptions;

  @state()
  private _selectedIndex = 0;

  private _embla: EmblaCarouselType | null = null;

  static styles = [
    resetStyles,
    css`
      :host {
        display: block;
      }

      .carousel {
        overflow: hidden;
      }

      .carousel__container {
        display: flex;
      }

      .carousel__slide {
        flex: 0 0 100%;
        min-width: 0;
      }

      .carousel__dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
      }

      .carousel__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--secondary-text-color);
        opacity: 0.3;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: opacity 0.2s ease;
      }

      .carousel__dot:hover {
        opacity: 0.5;
      }

      .carousel__dot--selected {
        opacity: 1;
        background: var(--primary-color);
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

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('flights')) {
      // Reinitialize carousel when flights change
      this._destroyCarousel();
      this.updateComplete.then(() => {
        this._initCarousel();
      });
    }
  }

  private _initCarousel(): void {
    const viewport = this.shadowRoot?.querySelector('.carousel') as HTMLElement;
    if (!viewport || this.flights.length <= 1) return;

    this._embla = EmblaCarousel(viewport, {
      loop: false,
      align: 'start',
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

  private _onDotClick(index: number): void {
    this._embla?.scrollTo(index);
  }

  protected render() {
    if (this.flights.length === 0) {
      return html``;
    }

    // Single flight - no carousel needed
    if (this.flights.length === 1) {
      return html`
        <flight-area-card
          .hass=${this.hass}
          .flight=${this.flights[0]}
          .units=${this.units}
        ></flight-area-card>
      `;
    }

    // Multiple flights - render carousel
    return html`
      <div class="carousel">
        <div class="carousel__container">
          ${this.flights.map(
            (flight) => html`
              <div class="carousel__slide">
                <flight-area-card
                  .hass=${this.hass}
                  .flight=${flight}
                  .units=${this.units}
                ></flight-area-card>
              </div>
            `
          )}
        </div>
      </div>
      <div class="carousel__dots">
        ${this.flights.map(
          (_, index) => html`
            <button
              class="carousel__dot ${index === this._selectedIndex
                ? 'carousel__dot--selected'
                : ''}"
              @click=${() => this._onDotClick(index)}
              aria-label="Go to slide ${index + 1}"
            ></button>
          `
        )}
      </div>
    `;
  }
}
