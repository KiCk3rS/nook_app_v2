import type { CreditPack } from '../types/audioGuideCreation';

/** Catalogue packs crédits démo (fallback offline / mock). */
export const DEMO_CREDIT_PACKS: CreditPack[] = [
  { productId: 'credits_5', credits: 5, priceLabel: '2,99 €' },
  { productId: 'credits_15', credits: 15, priceLabel: '6,99 €' },
  { productId: 'credits_30', credits: 30, priceLabel: '11,99 €' },
];

export function getDemoCreditPack(productId: string): CreditPack | undefined {
  return DEMO_CREDIT_PACKS.find((pack) => pack.productId === productId);
}
