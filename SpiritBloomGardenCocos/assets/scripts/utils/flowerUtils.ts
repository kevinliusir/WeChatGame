export enum Elements {
    WATER = 'water',
    FIRE = 'fire',
    EARTH = 'earth',
}

export enum FlowerTiers {
    TIER_1 = 1,
    TIER_2 = 2,
    TIER_3 = 3,
}

export interface Flower {
    element: Elements;
    tier: FlowerTiers;
    imageAssetName: string; // e.g., water_tier1.png
    // Add other flower-specific data if needed (e.g., growth time, value)
}

export function createFlower(element: Elements, tier: FlowerTiers = FlowerTiers.TIER_1): Flower {
    if (!Object.values(Elements).includes(element)) {
        throw new Error(`Invalid element: ${element}`);
    }
    if (!Object.values(FlowerTiers).includes(tier)) {
        throw new Error(`Invalid tier: ${tier}`);
    }
    return {
        element,
        tier,
        imageAssetName: `${element}_tier${tier}.png`,
    };
}

export function mergeFlowers(flower1: Flower, flower2: Flower): Flower | null {
    if (flower1.element !== flower2.element || flower1.tier !== flower2.tier) {
        return null; // Cannot merge different types or tiers (for now)
    }
    if (flower1.tier >= FlowerTiers.TIER_3) { // Assuming TIER_3 is the max tier
        return null; // Max tier reached
    }
    // Tier upgrade logic:
    const nextTierValue = flower1.tier + 1;
    if (!FlowerTiers[nextTierValue]) { // Check if next tier exists in enum
         return null; // Next tier is invalid/out of bounds
    }

    return createFlower(flower1.element, nextTierValue as FlowerTiers);
}

/**
 * Gets the SpriteFrame path for a given flower.
 * Assumes images are in 'assets/resources/images/' for cc.resources.load
 * e.g. "images/water_tier1" (without .png)
 * @param flower The flower object
 * @returns string path for cc.resources.load or null if flower is null
 */
export function getFlowerSpriteFramePath(flower: Flower | null): string | null {
    if (!flower) return null;
    return `images/${flower.element}_tier${flower.tier}`;
}
