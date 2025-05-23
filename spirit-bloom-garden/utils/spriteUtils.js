// utils/spriteUtils.js

export const SPRITE_TYPES = {
  SHADOW_BASIC: 'ShadowBasic',
  // Future: SHADOW_FAST: 'ShadowFast', SHADOW_HEAVY: 'ShadowHeavy'
};

const SPRITE_DEFINITIONS = {
  [SPRITE_TYPES.SHADOW_BASIC]: {
    health: 3, // e.g., 3 taps to dispel
    baseEffect: { type: "wilt", duration: 10000 }, // Wilts a flower for 10 seconds (example)
    imageAssetName: 'sprite_shadow_basic.png',
  },
  // Define other sprite types here
};

/**
 * Creates a new sprite object.
 * @param {string} type - The type of sprite (e.g., SPRITE_TYPES.SHADOW_BASIC).
 * @param {string} [id=null] - Optional unique ID for the sprite instance.
 * @returns {object|null} A sprite object or null if type is invalid.
 */
export function createSprite(type, id = null) {
  const definition = SPRITE_DEFINITIONS[type];
  if (!definition) {
    console.error(`Invalid sprite type: ${type}`);
    return null;
  }

  return {
    id: id || `sprite-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type,
    health: definition.health,
    maxHealth: definition.health, // Store max health for UI or logic
    effect: { ...definition.baseEffect }, // Copy effect so it can be modified per instance if needed
    imageAssetName: definition.imageAssetName,
    spawnedAt: Date.now(),
    currentAction: null, // e.g., 'wilting', 'blocking'
    targetPlot: null, // { row, col } - can be set after creation
  };
}
