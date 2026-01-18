import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { resetStyles } from '../styles';

@customElement('flight-wrapper')
export class FlightWrapper extends LitElement {
  @property({ type: String })
  public cardTitle?: string;

  static styles = [
    resetStyles,
    css`
      ha-card {
        padding: var(--ha-space-4);
        color: var(--primary-text-color);
        height: 100%;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ha-space-3);
        color: rgba(var(--rgb-primary-text-color), 0.7);
      }

      .header .title {
        font-size: var(--ha-font-size-s);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: var(--ha-space-3);
      }

      .header ::slotted(*) {
        margin-bottom: var(--ha-space-3);
      }
    `,
  ];

  protected render() {
    return html`
      <ha-card>
        <div class="header">
          <div>${this.cardTitle ? html`<p class="title">${this.cardTitle}</p>` : nothing}</div>
          <slot name="top-right"></slot>
        </div>

        <slot></slot>
      </ha-card>
    `;
  }
}
