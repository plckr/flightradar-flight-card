import { css } from 'lit';

export const resetStyles = css`
  p {
    margin: 0;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export const cardStyles = css`
  @keyframes pulse {
    50% {
      opacity: 0.5;
    }
  }

  ha-card {
    padding: var(--ha-space-4);
    color: var(--primary-text-color);
  }

  .title {
    font-size: var(--ha-font-size-s);
    opacity: 0.7;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .main-content {
    display: grid;
    grid-template-columns: 1.5fr 0.5fr;
    gap: var(--ha-space-4);
    align-items: flex-start;
  }

  .main-content-left {
    margin-top: 12px;
    font-size: 26px;
    line-height: 1.15;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .callsign-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .callsign-info > p {
    font-size: 15px;
    opacity: 0.8;
  }

  .callsign-info .live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    padding: 2px 6px;
    color: white;
    background: var(--state-active-color);
    border-radius: 999px;
  }

  .callsign-info .live-indicator .pulse {
    width: 4px;
    height: 4px;
    border-radius: 100%;
    background: white;
    animation: pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .flight-locations {
    margin-top: 6px;
    font-size: 17px;
    opacity: 0.9;
    --mdc-icon-size: 14px;
  }

  .flight-speed-info-container {
    margin-top: 8px;
    display: flex;
    gap: 24px;
  }

  .flight-speed-info-container .label {
    font-size: var(--ha-font-size-xs);
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .flight-speed-info-container .value {
    font-size: var(--ha-font-size-xl);
    font-weight: 600;
  }

  .main-content-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    align-self: center;
    text-align: center;
  }

  .main-content-right .airline-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .main-content-right .airline-container img {
    max-width: 70px;
    max-height: 20px;
    object-fit: contain;
    filter: drop-shadow(0 0 2px var(--secondary-text-color));
  }

  .main-content-right .airline-container p {
    font-size: 12px;
    opacity: 0.7;
    text-transform: uppercase;
  }

  .main-content-right .aircraft-photo {
    border-radius: 8px;
    max-width: 120px;
    height: auto;
    color: rgba(var(--rgb-primary-text-color), 0.7);
    --mdc-icon-size: 60px;
  }

  .main-content-right .aircraft-model {
    font-size: 12px;
    opacity: 0.7;
    text-transform: uppercase;
  }

  .flight-progress {
    margin-top: var(--ha-space-4);
  }
`;
