// utils/flowerUtils.test.js
import { createFlower, mergeFlowers, ELEMENTS } from './flowerUtils.js';

// Simple assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertStrictEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: ${message}. Expected "${expected}" but got "${actual}".`);
  }
}

function assertDeepEquals(actual, expected, message) {
  // Basic deep equals for simple objects (flowers)
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
     throw new Error(`Assertion Failed: ${message}. Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}.`);
  }
}

function testCreateFlower() {
  console.log("--- Testing createFlower ---");

  // Test valid flower creation
  const waterFlower = createFlower(ELEMENTS.WATER, 1);
  assert(waterFlower !== null, "Test Case 1.1: Water flower (T1) should be created.");
  assertStrictEquals(waterFlower.element, ELEMENTS.WATER, "Test Case 1.2: Water flower element should be WATER.");
  assertStrictEquals(waterFlower.tier, 1, "Test Case 1.3: Water flower tier should be 1.");
  assert(waterFlower.energyGenerationRate > 0, "Test Case 1.4: Water flower energy rate should be positive.");
  assertStrictEquals(waterFlower.imageAssetName, 'water_tier1.png', "Test Case 1.5: Water flower image name should be correct.");

  const fireFlowerTier3 = createFlower(ELEMENTS.FIRE, 3);
  assert(fireFlowerTier3 !== null, "Test Case 1.6: Fire flower (T3) should be created.");
  assertStrictEquals(fireFlowerTier3.tier, 3, "Test Case 1.7: Fire flower tier should be 3.");
  const expectedFireT3Rate = 1.2 * Math.pow(2, 2); // BASE_ENERGY_RATES.FIRE * (TIER_MULTIPLIER^(3-1))
  assertStrictEquals(fireFlowerTier3.energyGenerationRate, expectedFireT3Rate, "Test Case 1.8: Fire flower (T3) energy rate calculation.");


  // Test invalid inputs
  const invalidElementFlower = createFlower("INVALID_ELEMENT", 1);
  assert(invalidElementFlower === null, "Test Case 1.9: Flower with invalid element should not be created.");

  const invalidTierLowFlower = createFlower(ELEMENTS.WATER, 0);
  assert(invalidTierLowFlower === null, "Test Case 1.10: Flower with tier 0 should not be created.");
  
  const MAX_TIER = 7; // From flowerUtils.js
  const invalidTierHighFlower = createFlower(ELEMENTS.WATER, MAX_TIER + 1);
  assert(invalidTierHighFlower === null, "Test Case 1.11: Flower with tier > MAX_TIER should not be created.");
  
  console.log("createFlower tests passed!");
}

function testMergeFlowers() {
  console.log("--- Testing mergeFlowers ---");

  const flower1A = createFlower(ELEMENTS.WATER, 1, 'id1A');
  const flower1B = createFlower(ELEMENTS.WATER, 1, 'id1B');
  const flower2A = createFlower(ELEMENTS.FIRE, 1, 'id2A');
  const flower1Tier2 = createFlower(ELEMENTS.WATER, 2, 'id1T2');
  
  const MAX_TIER = 7; // From flowerUtils.js
  const maxTierFlowerA = createFlower(ELEMENTS.WATER, MAX_TIER, 'maxA');
  const maxTierFlowerB = createFlower(ELEMENTS.WATER, MAX_TIER, 'maxB');

  // Test valid merge
  const mergedResult1 = mergeFlowers(flower1A, flower1B);
  assert(mergedResult1 !== null, "Test Case 2.1: Valid merge (Water T1 + Water T1) should produce a result.");
  assertStrictEquals(mergedResult1.element, ELEMENTS.WATER, "Test Case 2.2: Merged flower element should be WATER.");
  assertStrictEquals(mergedResult1.tier, 2, "Test Case 2.3: Merged flower tier should be 2.");

  // Test invalid merge: different elements
  const mergedResultInvalid1 = mergeFlowers(flower1A, flower2A);
  assert(mergedResultInvalid1 === null, "Test Case 2.4: Invalid merge (different elements) should return null.");

  // Test invalid merge: different tiers
  const mergedResultInvalid2 = mergeFlowers(flower1A, flower1Tier2);
  assert(mergedResultInvalid2 === null, "Test Case 2.5: Invalid merge (different tiers) should return null.");

  // Test invalid merge: one flower is null
  const mergedResultInvalid3 = mergeFlowers(flower1A, null);
  assert(mergedResultInvalid3 === null, "Test Case 2.6: Invalid merge (one flower null) should return null.");
  const mergedResultInvalid4 = mergeFlowers(null, flower1B);
  assert(mergedResultInvalid4 === null, "Test Case 2.7: Invalid merge (other flower null) should return null.");

  // Test invalid merge: flowers are already at max tier
  const mergedResultInvalidMax = mergeFlowers(maxTierFlowerA, maxTierFlowerB);
  assert(mergedResultInvalidMax === null, "Test Case 2.8: Invalid merge (max tier) should return null.");
  
  // Test merging to max tier
  const almostMaxTierFlowerA = createFlower(ELEMENTS.FIRE, MAX_TIER - 1, 'almostMaxA');
  const almostMaxTierFlowerB = createFlower(ELEMENTS.FIRE, MAX_TIER - 1, 'almostMaxB');
  const mergedToMax = mergeFlowers(almostMaxTierFlowerA, almostMaxTierFlowerB);
  assert(mergedToMax !== null, "Test Case 2.9: Valid merge to MAX_TIER should produce a result.");
  assertStrictEquals(mergedToMax.element, ELEMENTS.FIRE, "Test Case 2.10: Merged flower (to MAX_TIER) element should be FIRE.");
  assertStrictEquals(mergedToMax.tier, MAX_TIER, "Test Case 2.11: Merged flower (to MAX_TIER) tier should be MAX_TIER.");

  console.log("mergeFlowers tests passed!");
}

export function runAllFlowerUtilsTests() {
  try {
    testCreateFlower();
    testMergeFlowers();
    console.log("All flowerUtils tests completed successfully!");
    return true;
  } catch (e) {
    console.error("A test failed in flowerUtils.test.js:");
    console.error(e);
    return false;
  }
}
