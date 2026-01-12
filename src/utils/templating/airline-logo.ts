export function parseAirlineLogoUrl(templateUrl: string, data: { airlineIcao: string }): string {
  return templateUrl.replaceAll('{ICAO}', data.airlineIcao);
}
