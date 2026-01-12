import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import {
  CARD_NAME,
  CardConfig,
  DEFAULT_CONFIG,
  GITHUB_REPOSITORY,
  GITHUB_REPOSITORY_URL,
} from './const';
import { getTFunc } from './localize/localize';
import { HomeAssistant } from './types/homeassistant';
import { DEFAULT_UNITS, UnitOptions } from './utils/units';

export const EDITOR_NAME = `${CARD_NAME}-editor`;

@customElement(EDITOR_NAME)
export class FlightradarFlightCardEditor extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @state()
  private _config!: CardConfig;

  static styles = css`
    .section {
      margin-top: var(--ha-space-4);
    }

    .section:first-child {
      margin-top: 0;
    }

    .section-title {
      font-weight: 500;
      margin-bottom: 8px;
    }

    ha-formfield {
      padding: 8px 0;
    }

    .entities {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .handle {
      cursor: grab;
      padding: 8px;
      color: var(--secondary-text-color);
    }
    .handle:active {
      cursor: grabbing;
    }

    .entity-row {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-radius: var(--ha-border-radius-md);
      border: 1px solid var(--outline-color);
    }
    .entity-row-content {
      flex: 1;
    }
    .entity-row-form-fields {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .remove-entity {
      margin-top: 8px;
    }

    .add-entity {
      margin-top: 12px;
    }

    .units-section {
      margin-top: 16px;
    }
    .units-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `;

  public setConfig(config: CardConfig): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const { t } = getTFunc(this.hass.locale.language);

    const entities = this._config.entities || [];
    const units = { ...DEFAULT_UNITS, ...this._config.units };

    const showFlightradarLink =
      this._config.show_flightradar_link ?? DEFAULT_CONFIG.show_flightradar_link;
    const showAirlineInfoColumn =
      this._config.show_airline_info_column ?? DEFAULT_CONFIG.show_airline_info_column;
    const showAirlineLogo = this._config.show_airline_logo ?? DEFAULT_CONFIG.show_airline_logo;
    const showAircraftPhoto =
      this._config.show_aircraft_photo ?? DEFAULT_CONFIG.show_aircraft_photo;
    const showProgressBar = this._config.show_progress_bar ?? DEFAULT_CONFIG.show_progress_bar;

    return html`
      <div class="section">
        <ha-sortable handle-selector=".handle" @item-moved=${this._entityMoved}>
          <div class="entities">
            ${entities.map(
              (entity, index) => html`
                <div class="entity-row">
                  <div class="handle">
                    <ha-icon icon="mdi:drag"></ha-icon>
                  </div>

                  <div class="entity-row-content">
                    <div class="entity-row-form-fields">
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{
                          entity: {
                            filter: {
                              domain: 'sensor',
                              integration: 'flightradar24',
                            },
                          },
                        }}
                        .value=${entity.entity_id}
                        @required=${true}
                        @value-changed=${(ev: CustomEvent) => {
                          this._entityChanged(index, ev.detail.value);
                        }}
                      ></ha-selector>
                      <ha-textfield
                        .label=${`${t('editor.title')} (${t('editor.optional_field')})`}
                        .value=${entity.title || ''}
                        @input=${(ev: Event) => {
                          this._titleChanged(index, (ev.target as HTMLInputElement).value);
                        }}
                      ></ha-textfield>
                    </div>

                    ${index > 0
                      ? html`
                          <ha-button
                            class="remove-entity"
                            size="small"
                            appearance="plain"
                            variant="danger"
                            @click=${() => this._removeEntity(index)}
                          >
                            <ha-icon icon="mdi:delete" slot="start"></ha-icon>
                            ${t('editor.remove_entity_button')}
                          </ha-button>
                        `
                      : nothing}
                  </div>
                </div>
              `
            )}
          </div>
        </ha-sortable>

        <ha-button size="small" appearance="filled" class="add-entity" @click=${this._addEntity}>
          <ha-icon icon="mdi:playlist-plus" slot="start"></ha-icon>
          ${t('editor.add_entity_button')}
        </ha-button>

        <p>${t('editor.usage_description')}</p>
      </div>

      <div class="section">
        <div class="section-title">Appearance & Layout</div>

        <ha-formfield class="form-field-carousel" label="Show Flightradar24 Link">
          <ha-switch
            .checked=${showFlightradarLink}
            @change=${(ev: Event) => {
              const value = (ev.target as HTMLInputElement).checked;
              this._updateConfig({ ...this._config, show_flightradar_link: value });
            }}
          ></ha-switch>
        </ha-formfield>
      </div>

      <div class="section">
        <ha-formfield label="Show Airline Info Column">
          <ha-switch
            .checked=${showAirlineInfoColumn}
            @change=${(ev: Event) => {
              const value = (ev.target as HTMLInputElement).checked;
              this._updateConfig({ ...this._config, show_airline_info_column: value });
            }}
          ></ha-switch>
        </ha-formfield>
      </div>

      <div class="section">
        <ha-formfield label="Show Airline Logo">
          <ha-switch
            .checked=${showAirlineLogo}
            .disabled=${!showAirlineInfoColumn}
            @change=${(ev: Event) => {
              const value = (ev.target as HTMLInputElement).checked;
              this._updateConfig({ ...this._config, show_airline_logo: value });
            }}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield label="Show Aircraft Photo">
          <ha-switch
            .checked=${showAircraftPhoto}
            .disabled=${!showAirlineInfoColumn}
            @change=${(ev: Event) => {
              const value = (ev.target as HTMLInputElement).checked;
              this._updateConfig({ ...this._config, show_aircraft_photo: value });
            }}
          ></ha-switch>
        </ha-formfield>
      </div>

      <div class="section">
        <ha-formfield label="Show Progress Bar">
          <ha-switch
            .checked=${showProgressBar}
            @change=${(ev: Event) => {
              const value = (ev.target as HTMLInputElement).checked;
              this._updateConfig({ ...this._config, show_progress_bar: value });
            }}
          ></ha-switch>
        </ha-formfield>
      </div>

      <div class="units-section">
        <div class="section-title">${t('editor.units_section')}</div>
        <div class="units-grid">
          <ha-select
            .label=${t('editor.altitude_unit')}
            .value=${units.altitude}
            @selected=${(ev: CustomEvent) => {
              this._unitChanged(
                'altitude',
                (ev.target as HTMLSelectElement).value as UnitOptions['altitude']
              );
            }}
            @closed=${(ev: Event) => ev.stopPropagation()}
          >
            <mwc-list-item value="ft">${t('editor.unit_ft')}</mwc-list-item>
            <mwc-list-item value="FL">${t('editor.unit_fl')}</mwc-list-item>
            <mwc-list-item value="m">${t('editor.unit_m')}</mwc-list-item>
          </ha-select>

          <ha-select
            .label=${t('editor.distance_unit')}
            .value=${units.distance}
            @selected=${(ev: CustomEvent) => {
              this._unitChanged(
                'distance',
                (ev.target as HTMLSelectElement).value as UnitOptions['distance']
              );
            }}
            @closed=${(ev: Event) => ev.stopPropagation()}
          >
            <mwc-list-item value="km">${t('editor.unit_km')}</mwc-list-item>
            <mwc-list-item value="NM">${t('editor.unit_nm')}</mwc-list-item>
          </ha-select>

          <ha-select
            .label=${t('editor.ground_speed_unit')}
            .value=${units.ground_speed}
            @selected=${(ev: CustomEvent) => {
              this._unitChanged(
                'ground_speed',
                (ev.target as HTMLSelectElement).value as UnitOptions['ground_speed']
              );
            }}
            @closed=${(ev: Event) => ev.stopPropagation()}
          >
            <mwc-list-item value="kts">${t('editor.unit_kts')}</mwc-list-item>
            <mwc-list-item value="kmh">${t('editor.unit_kmh')}</mwc-list-item>
            <mwc-list-item value="mph">${t('editor.unit_mph')}</mwc-list-item>
            <mwc-list-item value="M">${t('editor.unit_mach')}</mwc-list-item>
          </ha-select>
        </div>

        <p>
          ${t('editor.more_info_link')}:
          <a href=${GITHUB_REPOSITORY_URL} target="_blank">${GITHUB_REPOSITORY}</a>
        </p>
      </div>
    `;
  }

  private _unitChanged<K extends keyof UnitOptions>(key: K, value: UnitOptions[K]): void {
    const units = { ...DEFAULT_UNITS, ...this._config.units, [key]: value };
    this._updateConfig({ ...this._config, units });
  }

  private _entityChanged(index: number, value: string): void {
    if (!value) return;
    const entities = [...this._config.entities];
    entities[index] = { ...entities[index], entity_id: value };
    this._updateConfig({ ...this._config, entities });
  }

  private _titleChanged(index: number, value: string): void {
    const entities = [...this._config.entities];
    if (value) {
      entities[index] = { ...entities[index], title: value };
    } else {
      const { title, ...rest } = entities[index];
      entities[index] = rest as CardConfig['entities'][number];
    }
    this._updateConfig({ ...this._config, entities });
  }

  private _addEntity(): void {
    const defaultEntityId = 'sensor.flightradar24_most_tracked';
    const defaultEntityExists = this.hass.states[defaultEntityId] !== undefined;

    const entities = [
      ...(this._config.entities ?? []),
      { entity_id: defaultEntityExists ? defaultEntityId : '' },
    ];
    this._updateConfig({ ...this._config, entities });
  }

  private _removeEntity(index: number): void {
    const entities = this._config.entities.filter((_, i) => i !== index);
    this._updateConfig({ ...this._config, entities });
  }

  private _entityMoved(ev: CustomEvent<{ oldIndex: number; newIndex: number }>): void {
    ev.stopPropagation();
    const { oldIndex, newIndex } = ev.detail;
    const entities = [...this._config.entities];
    const [moved] = entities.splice(oldIndex, 1);
    entities.splice(newIndex, 0, moved);
    this._updateConfig({ ...this._config, entities });
  }

  private _updateConfig(config: CardConfig): void {
    const event = new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}
