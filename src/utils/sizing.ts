import { Pet, Product, ProductSize } from '../types';

export interface FitResult {
  isCompatible: boolean;
  recommendedSize: ProductSize | null;
  matchScore: number; // 0 to 100
  reason: string;
}

/**
 * Calculates whether a specific product size fits a pet's metric measurements.
 */
export function checkSizeFit(pet: Pet, size: ProductSize): { fits: boolean; reason: string } {
  const { neckCm, chestCm, backCm } = pet.metrics;

  const neckOk = neckCm >= size.minNeckCm && neckCm <= size.maxNeckCm;
  const chestOk = chestCm >= size.minChestCm && chestCm <= size.maxChestCm;
  const backOk = backCm >= size.minBackCm && backCm <= size.maxBackCm;

  if (neckOk && chestOk && backOk) {
    return {
      fits: true,
      reason: `Métricas ideais (Pescoço ${neckCm}cm, Peito ${chestCm}cm, Costas ${backCm}cm)`,
    };
  }

  const issues: string[] = [];
  if (!neckOk) {
    if (neckCm < size.minNeckCm) issues.push(`Pescoço muito largo (${size.minNeckCm}-${size.maxNeckCm}cm vs ${neckCm}cm do pet)`);
    else issues.push(`Pescoço apertado (${size.minNeckCm}-${size.maxNeckCm}cm vs ${neckCm}cm do pet)`);
  }
  if (!chestOk) {
    if (chestCm < size.minChestCm) issues.push(`Peito largo (${size.minChestCm}-${size.maxChestCm}cm)`);
    else issues.push(`Peito apertado (${size.minChestCm}-${size.maxChestCm}cm)`);
  }

  return {
    fits: false,
    reason: issues.join(', '),
  };
}

/**
 * Finds the best recommended size for a pet for a given product.
 */
export function getRecommendedSize(pet: Pet, product: Product): FitResult {
  if (!product.sizes || product.sizes.length === 0) {
    return {
      isCompatible: true,
      recommendedSize: null,
      matchScore: 100,
      reason: 'Tamanho único universal',
    };
  }

  // Check species match
  if (product.targetSpecies !== 'all' && product.targetSpecies !== pet.species) {
    return {
      isCompatible: false,
      recommendedSize: null,
      matchScore: 0,
      reason: `Produto desenhado exclusivamente para ${product.targetSpecies === 'dog' ? 'Cães' : 'Gatos'}`,
    };
  }

  let bestSize: ProductSize | null = null;
  let bestScore = -1;
  let bestReason = '';

  for (const size of product.sizes) {
    const { neckCm, chestCm, backCm } = pet.metrics;

    // Check chest first as it's the most critical for pet apparel
    const chestMid = (size.minChestCm + size.maxChestCm) / 2;
    const neckMid = (size.minNeckCm + size.maxNeckCm) / 2;
    const backMid = (size.minBackCm + size.maxBackCm) / 2;

    const chestIn = chestCm >= size.minChestCm && chestCm <= size.maxChestCm;
    const neckIn = neckCm >= size.minNeckCm && neckCm <= size.maxNeckCm;
    const backIn = backCm >= size.minBackCm && backCm <= size.maxBackCm;

    if (chestIn && neckIn && backIn) {
      // Perfect match
      const chestDiff = Math.abs(chestCm - chestMid);
      const score = 100 - chestDiff;
      if (score > bestScore) {
        bestScore = score;
        bestSize = size;
        bestReason = `Tamanho ${size.name} é 100% ideal para ${pet.name} (Peito: ${chestCm}cm)`;
      }
    } else if (chestIn) {
      // Partial match primarily on chest
      const score = 75;
      if (score > bestScore) {
        bestScore = score;
        bestSize = size;
        bestReason = `Tamanho ${size.name} recomendado principalmente pelo peito (${chestCm}cm)`;
      }
    }
  }

  if (bestSize && bestScore >= 70) {
    return {
      isCompatible: true,
      recommendedSize: bestSize,
      matchScore: Math.round(bestScore),
      reason: bestReason,
    };
  }

  // Fallback: search nearest size by chest
  const nearestSize = product.sizes.reduce((prev, curr) => {
    const prevDiff = Math.min(
      Math.abs(pet.metrics.chestCm - prev.minChestCm),
      Math.abs(pet.metrics.chestCm - prev.maxChestCm)
    );
    const currDiff = Math.min(
      Math.abs(pet.metrics.chestCm - curr.minChestCm),
      Math.abs(pet.metrics.chestCm - curr.maxChestCm)
    );
    return currDiff < prevDiff ? curr : prev;
  });

  return {
    isCompatible: false,
    recommendedSize: nearestSize,
    matchScore: 40,
    reason: `Nenhum tamanho 100% ideal. Tamanho mais aproximado: ${nearestSize.name} (${nearestSize.minChestCm}-${nearestSize.maxChestCm}cm peito)`,
  };
}
