declare global {
  interface Window {
    customCards?: WindowCustomCard[];
  }
}

type WindowCustomCard = {
  /** Custom card type. E.g.: content-card-example */
  type: string;
  /** Friendly name for the card */
  name: string;
  /** Optional - defaults to false */
  preview?: boolean;
  /** Description of the card */
  description?: string;
  documentationURL?: string;
};

export function registerCustomCard(params: WindowCustomCard) {
  window.customCards = window.customCards || [];
  window.customCards.push(params);
}
