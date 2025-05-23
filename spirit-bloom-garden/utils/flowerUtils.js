// utils/flowerUtils.js

// Define constants for elements
export const ELEMENTS = {
  WATER: 'Water',
  FIRE: 'Fire',
  EARTH: 'Earth',
  // Add more elements as per the game design: AIR, LIGHT, SHADOW
};

// Define base energy generation rates for Tier 1 of each element
// These would likely be tuned during game balancing.
const BASE_ENERGY_RATES = {
  [ELEMENTS.WATER]: 1, // 1 Chi per second (example)
  [ELEMENTS.FIRE]: 1.2, // Fire flowers are slightly faster
  [ELEMENTS.EARTH]: 0.8, // Earth flowers are slower but maybe have other benefits later
};

// Define how energy generation scales with tier (e.g., doubles each tier)
const TIER_MULTIPLIER = 2;
const MAX_TIER = 7; // As per initial design document

/**
 * Creates a new flower object.
 * @param {string} element - The element of the flower (e.g., ELEMENTS.WATER).
 * @param {number} tier - The tier of the flower (e.g., 1, 2, 3).
 * @param {string} [id=null] - Optional unique ID for the flower instance.
 * @returns {object|null} A flower object or null if element/tier is invalid.
 */
export function createFlower(element, tier, id = null) {
  if (!Object.values(ELEMENTS).includes(element)) {
    console.error(`Invalid element: ${element}`);
    return null;
  }
  if (tier < 1 || tier > MAX_TIER) {
    console.error(`Invalid tier: ${tier}. Must be between 1 and ${MAX_TIER}.`);
    return null;
  }

  // Calculate energy generation rate: base_rate * (multiplier^(tier-1))
  const energyGenerationRate = (BASE_ENERGY_RATES[element] || 1) * Math.pow(TIER_MULTIPLIER, tier - 1);

  return {
    id: id || `flower-${element}-${tier}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Simple unique ID
    element,
    tier,
    energyGenerationRate, // Chi per unit of time (e.g., per second)
    imageAssetName: `${element.toLowerCase()}_tier${tier}.png`, // Convention for image assets
    createdAt: Date.now() // Useful for some game mechanics or debugging
  };
}

/**
 * Attempts to merge two flower spirits.
 * Flowers can be merged if they are of the same element and same tier.
 * The resulting flower will be of the same element but one tier higher.
 * @param {object} flowerA - The first flower object.
 * @param {object} flowerB - The second flower object.
 * @returns {object|null} The new merged flower object, or null if merge is not possible.
 */
export function mergeFlowers(flowerA, flowerB) {
  if (!flowerA || !flowerB) {
    // console.warn("Merge attempt with invalid flower object(s).");
    return null;
  }

  if (flowerA.element !== flowerB.element) {
    // console.log("Merge failed: Flowers are of different elements.");
    return null;
  }

  if (flowerA.tier !== flowerB.tier) {
    // console.log("Merge failed: Flowers are of different tiers.");
    return null;
  }

  const currentTier = flowerA.tier;
  if (currentTier >= MAX_TIER) {
    // console.log(`Merge failed: Flower ${flowerA.element} is already at max tier (${MAX_TIER}).`);
    return null;
  }

  const nextTier = currentTier + 1;
  return createFlower(flowerA.element, nextTier);
}
