export function getCountryFlagUrl(countryCode: string, width = 16): string {
  return `https://flagsapi.com/${countryCode.toUpperCase()}/shiny/${width}.png`;
}

export function getCountryFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
