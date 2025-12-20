import './flight-area-card';
import './flightradar-flight-card';
import './flight-progress-bar';

import { CARD_DESCRIPTION, CARD_NAME, CARD_VERSION, GITHUB_REPOSITORY_URL } from './const';
import { registerCustomCard } from './utils/register-card';

console.info(
  `%c ${CARD_NAME.toUpperCase()} %c v${CARD_VERSION} `,
  'color: white; background: #3498db; font-weight: 700;',
  'color: #3498db; background: white; font-weight: 700;'
);

registerCustomCard({
  type: CARD_NAME,
  name: 'Flightradar Flight Card',
  description: CARD_DESCRIPTION,
  documentationURL: GITHUB_REPOSITORY_URL,
});
