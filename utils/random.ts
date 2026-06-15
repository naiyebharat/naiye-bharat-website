/**
 * Deterministic pseudo-random based on seed.
 * Ensures that randomly generated values (like particle positions) 
 * remain consistent between Server (SSR) and Client hydration.
 * 
 * @param seed - Numeric seed for repeatable values
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  const val = x - Math.floor(x);
  return Math.round(val * 1000000) / 1000000;
}
