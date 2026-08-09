/** Ignore le résultat si une bascule plus récente a été lancée pour la même cible. */
export function shouldApplyToggleResult(
  currentGeneration: number | undefined,
  expectedGeneration: number,
): boolean {
  return currentGeneration === expectedGeneration;
}
