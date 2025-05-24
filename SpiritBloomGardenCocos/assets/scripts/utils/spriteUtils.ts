export enum SpriteType {
    SHADOW_BASIC = 'shadow_basic',
    // Add other sprite types (e.g., 'fairy_water', 'imp_fire')
}

export interface GameSprite {
    type: SpriteType;
    imageAssetName: string; // e.g., sprite_shadow_basic.png
    health: number;
    // Add other sprite-specific data (e.g., behavior, animation)
}

export const DEFAULT_SPRITE_HEALTH = 3;

export function createSprite(type: SpriteType): GameSprite {
    if (!Object.values(SpriteType).includes(type)) {
        throw new Error(`Invalid sprite type: ${type}`);
    }
    return {
        type,
        imageAssetName: `sprite_${type}.png`,
        health: DEFAULT_SPRITE_HEALTH, // Default health
    };
}

/**
 * Gets the SpriteFrame path for a given sprite.
 * Assumes images are in 'assets/resources/images/' for cc.resources.load
 * e.g. "images/sprite_shadow_basic" (without .png)
 * @param gameSprite The sprite object
 * @returns string path for cc.resources.load or null if sprite is null
 */
export function getSpriteSpriteFramePath(gameSprite: GameSprite | null): string | null {
    if (!gameSprite) return null;
    return `images/sprite_${gameSprite.type}`;
}
