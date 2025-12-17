export function round(value: number, decimals: number = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
