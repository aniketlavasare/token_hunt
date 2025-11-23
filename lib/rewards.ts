/**
 * lib/rewards.ts
 * 
 * Off-chain reward spawning and management.
 * Generates random reward pickup locations within hunt areas.
 */

export const MAX_CLAIMS_CAP = 50; // Hard limit for performance/sanity

export type SpawnedReward = {
  rewardId: string;
  huntId: string;
  lat: number;
  lng: number;
  amount: number; // per-claim reward
  claimed: boolean;
  createdAt: string;
};

/**
 * Generate a random point uniformly distributed within a circle.
 * Uses correct geographic math to avoid bias toward center.
 * 
 * @param centerLat - Center latitude
 * @param centerLng - Center longitude
 * @param radiusMeters - Radius in meters
 * @returns {lat, lng} - Random point within circle
 */
function generateRandomPointInCircle(
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): { lat: number; lng: number } {
  // Random angle [0, 2π)
  const theta = Math.random() * 2 * Math.PI;
  
  // Random radius with sqrt for uniform area distribution
  const u = Math.random();
  const r = radiusMeters * Math.sqrt(u);
  
  // Convert meters to degrees
  // ~111,320 meters per degree at equator
  const METERS_PER_DEGREE = 111320;
  
  const latOffset = (r * Math.cos(theta)) / METERS_PER_DEGREE;
  const lngOffset = (r * Math.sin(theta)) / (METERS_PER_DEGREE * Math.cos((centerLat * Math.PI) / 180));
  
  return {
    lat: centerLat + latOffset,
    lng: centerLng + lngOffset,
  };
}

/**
 * Spawn rewards for a single hunt.
 * 
 * @param hunt - Hunt to spawn rewards for
 * @returns Array of spawned rewards
 */
export function spawnRewardsForHunt(hunt: {
  huntId: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  rewardAmount: number;
  maxClaims: number;
}): SpawnedReward[] {
  // Clamp maxClaims to cap
  let claimsToSpawn = hunt.maxClaims;
  if (claimsToSpawn > MAX_CLAIMS_CAP) {
    console.warn(
      `⚠️ Hunt ${hunt.huntId} maxClaims (${hunt.maxClaims}) exceeds cap (${MAX_CLAIMS_CAP}). Clamping.`
    );
    claimsToSpawn = MAX_CLAIMS_CAP;
  }

  // Compute per-claim reward
  const perClaimReward = hunt.rewardAmount / claimsToSpawn;

  console.log(
    `🪙 Spawning ${claimsToSpawn} rewards for hunt ${hunt.huntId} (${perClaimReward.toFixed(4)} WLD each)`
  );

  // Generate random pickup locations
  const rewards: SpawnedReward[] = [];
  for (let i = 0; i < claimsToSpawn; i++) {
    const point = generateRandomPointInCircle(hunt.lat, hunt.lng, hunt.radiusMeters);
    
    rewards.push({
      rewardId: crypto.randomUUID(),
      huntId: hunt.huntId,
      lat: point.lat,
      lng: point.lng,
      amount: perClaimReward,
      claimed: false,
      createdAt: new Date().toISOString(),
    });
  }

  return rewards;
}

/**
 * Fetch rewards from API.
 */
export async function fetchRewardsFromAPI(): Promise<SpawnedReward[]> {
  try {
    const response = await fetch('/api/rewards');
    if (response.ok) {
      const data = await response.json();
      return data.rewards || [];
    }
    console.error('Failed to fetch rewards:', response.statusText);
    return [];
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
}

/**
 * Save rewards to API.
 */
export async function saveRewardsToAPI(rewards: SpawnedReward[]): Promise<boolean> {
  try {
    const response = await fetch('/api/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewards }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving rewards:', error);
    return false;
  }
}

/**
 * Ensure all hunts have spawned rewards (idempotent).
 * 
 * @param hunts - All hunts
 * @returns Promise that resolves when spawning is complete
 */
export async function ensureRewardsSpawned(
  hunts: { huntId: string; lat: number; lng: number; radiusMeters: number; rewardAmount: number; maxClaims: number }[]
): Promise<void> {
  // Fetch existing rewards
  const existingRewards = await fetchRewardsFromAPI();
  const existingHuntIds = new Set(existingRewards.map((r) => r.huntId));

  // Find hunts that need spawning
  const huntsNeedingSpawn = hunts.filter((h) => !existingHuntIds.has(h.huntId));

  if (huntsNeedingSpawn.length === 0) {
    console.log('✅ All hunts already have spawned rewards (idempotent check passed)');
    return;
  }

  console.log(`🎯 Spawning rewards for ${huntsNeedingSpawn.length} new hunt(s)...`);

  // Spawn rewards for new hunts
  const newRewards: SpawnedReward[] = [];
  for (const hunt of huntsNeedingSpawn) {
    const huntRewards = spawnRewardsForHunt(hunt);
    newRewards.push(...huntRewards);
  }

  // Merge with existing and save
  const allRewards = [...existingRewards, ...newRewards];
  const success = await saveRewardsToAPI(allRewards);

  if (success) {
    console.log(`✅ Spawned ${newRewards.length} new rewards successfully`);
  } else {
    console.error('❌ Failed to save spawned rewards');
  }
}

/**
 * Clear all rewards (for testing).
 */
export async function clearAllRewardsFromAPI(): Promise<boolean> {
  try {
    const response = await fetch('/api/rewards', { method: 'DELETE' });
    return response.ok;
  } catch (error) {
    console.error('Error clearing rewards:', error);
    return false;
  }
}

/**
 * Claim a reward by rewardId.
 */
export async function claimReward(rewardId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/rewards/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error claiming reward:', error);
    return false;
  }
}

