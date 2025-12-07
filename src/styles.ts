import { css } from 'lit';

export const cardStyles = css`
  :host {
    --flight-card-background: var(--ha-card-background, var(--card-background-color, #fff));
    --flight-card-border-radius: var(--ha-card-border-radius, 12px);
    --flight-card-padding: 16px;
    --flight-card-text-color: var(--primary-text-color, #212121);
    --flight-card-secondary-color: var(--secondary-text-color, #727272);
  }

  ha-card {
    background: var(--flight-card-background);
    border-radius: var(--flight-card-border-radius);
    padding: var(--flight-card-padding);
    box-sizing: border-box;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .card-header .name {
    font-size: 1.2em;
    font-weight: 500;
    color: var(--flight-card-text-color);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .flight-info {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    align-items: center;
  }

  .flight-info .label {
    color: var(--flight-card-secondary-color);
    font-size: 0.9em;
  }

  .flight-info .value {
    color: var(--flight-card-text-color);
    font-weight: 500;
  }

  .state {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-radius: 8px;
    font-weight: 500;
  }

  .state.unavailable {
    background: var(--disabled-color, #bdbdbd);
  }

  .warning {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--warning-color, #ffc107);
    color: var(--primary-text-color);
    border-radius: 8px;
  }

  .error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--error-color, #db4437);
    color: #fff;
    border-radius: 8px;
  }
`;
