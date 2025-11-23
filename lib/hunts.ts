// Hunt data structure
export interface Hunt {
  huntId: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  rewardToken: "WLD";
  rewardAmount: number;
  maxClaims: number;
  campaignName: string;
  description?: string;
  sponsorWallet: string;
  claimedCount: number;
  createdAt: string;
  startTime?: string;
  endTime?: string;
}

const HUNTS_KEY = "token_hunt_hunts";

// Check if we're in browser environment
const isBrowser = typeof window !== "undefined";

/**
 * Get all hunts from localStorage
 */
export function getHunts(): Hunt[] {
  if (!isBrowser) return [];
  
  try {
    const huntsJson = localStorage.getItem(HUNTS_KEY);
    if (!huntsJson) return [];
    return JSON.parse(huntsJson) as Hunt[];
  } catch (error) {
    console.error("Error reading hunts from localStorage:", error);
    return [];
  }
}

/**
 * Save a new hunt to localStorage
 */
export function saveHunt(hunt: Hunt): void {
  if (!isBrowser) return;
  
  try {
    const hunts = getHunts();
    hunts.push(hunt);
    localStorage.setItem(HUNTS_KEY, JSON.stringify(hunts));
    console.log("Hunt saved:", hunt.huntId);
  } catch (error) {
    console.error("Error saving hunt to localStorage:", error);
    throw new Error("Failed to save hunt");
  }
}

/**
 * Get a specific hunt by ID
 */
export function getHuntById(huntId: string): Hunt | undefined {
  const hunts = getHunts();
  return hunts.find((h) => h.huntId === huntId);
}

/**
 * Delete a hunt from localStorage
 */
export function deleteHunt(huntId: string): void {
  if (!isBrowser) return;
  
  try {
    const hunts = getHunts();
    const filtered = hunts.filter((h) => h.huntId !== huntId);
    localStorage.setItem(HUNTS_KEY, JSON.stringify(filtered));
    console.log("Hunt deleted:", huntId);
  } catch (error) {
    console.error("Error deleting hunt from localStorage:", error);
    throw new Error("Failed to delete hunt");
  }
}

/**
 * Increment claim count for a hunt
 */
export function claimHunt(huntId: string, walletAddress: string): boolean {
  if (!isBrowser) return false;
  
  try {
    const hunts = getHunts();
    const hunt = hunts.find((h) => h.huntId === huntId);
    
    if (!hunt) {
      console.error("Hunt not found:", huntId);
      return false;
    }
    
    if (hunt.claimedCount >= hunt.maxClaims) {
      console.error("Hunt has reached max claims");
      return false;
    }
    
    // Increment claim count
    hunt.claimedCount += 1;
    
    // Save updated hunts
    localStorage.setItem(HUNTS_KEY, JSON.stringify(hunts));
    console.log(`Hunt ${huntId} claimed by ${walletAddress}. Count: ${hunt.claimedCount}/${hunt.maxClaims}`);
    
    return true;
  } catch (error) {
    console.error("Error claiming hunt:", error);
    return false;
  }
}

/**
 * Clear all hunts from localStorage (useful for testing)
 */
export function clearAllHunts(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(HUNTS_KEY);
    console.log("✅ All hunts cleared from localStorage");
  } catch (error) {
    console.error("Error clearing hunts:", error);
    throw new Error("Failed to clear hunts");
  }
}

/**
 * Generate a simple UUID v4
 */
export function generateHuntId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ==================== API FUNCTIONS (Global Storage) ====================

/**
 * Fetch all hunts from the backend API
 */
export async function fetchHuntsFromAPI(): Promise<Hunt[]> {
  try {
    const response = await fetch('/api/hunts', {
      method: 'GET',
      cache: 'no-store', // Always get fresh data
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch hunts from API')
    }
    
    const data = await response.json()
    console.log(`Fetched ${data.count} hunts from API`)
    return data.hunts
  } catch (error) {
    console.error('Error fetching hunts from API:', error)
    return []
  }
}

/**
 * Save a hunt to the backend API
 */
export async function saveHuntToAPI(hunt: Hunt): Promise<boolean> {
  try {
    const response = await fetch('/api/hunts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hunt),
    })
    
    if (!response.ok) {
      throw new Error('Failed to save hunt to API')
    }
    
    console.log('Hunt saved to API:', hunt.huntId)
    return true
  } catch (error) {
    console.error('Error saving hunt to API:', error)
    return false
  }
}

/**
 * Clear all hunts from the backend API
 */
export async function clearAllHuntsFromAPI(): Promise<boolean> {
  try {
    const response = await fetch('/api/hunts', {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to clear hunts from API')
    }
    
    console.log('✅ All hunts cleared from API')
    return true
  } catch (error) {
    console.error('Error clearing hunts from API:', error)
    return false
  }
}

