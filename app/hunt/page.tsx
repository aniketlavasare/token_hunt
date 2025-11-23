'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import LocationTracker from "@/components/LocationTracker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchHuntsFromAPI, clearAllHuntsFromAPI, type Hunt } from "@/lib/hunts"
import { fetchRewardsFromAPI, ensureRewardsSpawned, clearAllRewardsFromAPI, type SpawnedReward } from "@/lib/rewards"

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export default function HuntPage() {
  const [hunts, setHunts] = useState<Hunt[]>([])
  const [rewards, setRewards] = useState<SpawnedReward[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isSpawningRewards, setIsSpawningRewards] = useState(false)
  const [claimedRewardIds, setClaimedRewardIds] = useState<Set<string>>(new Set())
  const [showClaimPopup, setShowClaimPopup] = useState(false)
  const [claimedReward, setClaimedReward] = useState<SpawnedReward | null>(null)
  const [claimableDistance, setClaimableDistance] = useState(10) // 10 meters default

  // Load hunts and rewards from API, trigger spawning
  useEffect(() => {
    const loadData = async () => {
      // 1. Load hunts
      const loadedHunts = await fetchHuntsFromAPI()
      // Filter out invalid/incomplete hunts
      const validHunts = loadedHunts.filter(hunt => 
        hunt.huntId && 
        hunt.lat !== undefined && 
        hunt.lng !== undefined && 
        hunt.campaignName &&
        hunt.sponsorWallet
      )
      setHunts(validHunts)
      console.log(`Loaded ${validHunts.length} valid hunts from API (${loadedHunts.length} total)`)

      // 2. Ensure rewards are spawned (idempotent)
      setIsSpawningRewards(true)
      try {
        await ensureRewardsSpawned(validHunts)
        
        // 3. Load rewards
        const loadedRewards = await fetchRewardsFromAPI()
        setRewards(loadedRewards)
        console.log(`Loaded ${loadedRewards.length} rewards from API`)
      } catch (error) {
        console.error('Error spawning/loading rewards:', error)
      } finally {
        setIsSpawningRewards(false)
      }
    }
    
    loadData()

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Could not get user location:", error.message)
        }
      )
    }
  }, [])

  // Check if user is in range of any claimable rewards
  useEffect(() => {
    if (!userLocation || rewards.length === 0) return;

    const checkClaimableRewards = () => {
      for (const reward of rewards) {
        // Skip if already claimed locally
        if (claimedRewardIds.has(reward.rewardId)) continue;
        
        // Skip if already claimed in database
        if (reward.claimed) continue;

        // Calculate distance to reward
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          reward.lat,
          reward.lng
        );

        // Check if user is within claimable distance
        if (distance <= claimableDistance) {
          console.log(`🎯 User in range of reward ${reward.rewardId} (${distance.toFixed(1)}m away)`);
          
          // Mark as claimed locally
          setClaimedRewardIds(prev => new Set(prev).add(reward.rewardId));
          
          // Show claim popup
          setClaimedReward(reward);
          setShowClaimPopup(true);
          
          // Auto-hide after 4 seconds
          setTimeout(() => {
            setShowClaimPopup(false);
          }, 4000);
          
          // Only claim one reward at a time
          break;
        }
      }
    };

    checkClaimableRewards();
  }, [userLocation, rewards, claimedRewardIds, claimableDistance]);

  // Handle clear all hunts and rewards
  const handleClearAllHunts = async () => {
    const huntsSuccess = await clearAllHuntsFromAPI()
    const rewardsSuccess = await clearAllRewardsFromAPI()
    
    if (huntsSuccess && rewardsSuccess) {
      setHunts([])
      setRewards([])
      setClaimedRewardIds(new Set()) // Clear claimed rewards
      setShowClearConfirm(false)
      console.log("All hunts and rewards cleared from server!")
    } else {
      console.error("Failed to clear hunts/rewards")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-3 sm:p-4">
      <main className="flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8 py-6 sm:py-12">
        <div className="flex w-full flex-col items-center gap-4 sm:gap-6 text-center px-4">
          <Link href="/">
            <Image
              className="cursor-pointer"
              src="/token_hunt_logo.png"
              alt="Token Hunt logo"
              width={70}
              height={70}
              priority
            />
          </Link>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            🏹 Hunt Tokens
          </h1>

          <p className="max-w-md text-base sm:text-lg leading-6 sm:leading-8 text-zinc-600 dark:text-zinc-400 px-2">
            Your live location is being tracked. Find tokens near you!
          </p>
        </div>

        {/* Location Map with Reward Markers */}
        <div className="w-full px-2 sm:px-0">
          {isSpawningRewards ? (
            <div className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-8 flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-yellow-500"></div>
              <p className="text-gray-600 dark:text-zinc-400 font-medium text-sm sm:text-base text-center">
                🪙 Spawning reward tokens...
              </p>
            </div>
          ) : (
            <LocationTracker 
              rewards={rewards.filter(r => !claimedRewardIds.has(r.rewardId))} 
              onRewardClick={(reward) => {
                console.log("Reward clicked:", reward);
                // Calculate distance to check if in range
                if (userLocation) {
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    reward.lat,
                    reward.lng
                  );
                  console.log(`Distance to reward: ${distance.toFixed(1)}m`);
                  if (distance <= claimableDistance) {
                    console.log("✅ In range! Claiming...");
                  } else {
                    console.log(`❌ Not in range. Need to be within ${claimableDistance}m`);
                  }
                }
              }}
            />
          )}
        </div>

        {/* Available Hunts Section */}
        <div className="w-full space-y-4 px-4 sm:px-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              Available Hunts {hunts.length > 0 && `(${hunts.length})`}
            </h2>
            <div className="flex items-center gap-2">
              {/* Clear All Button (Testing) */}
              {hunts.length > 0 && !showClearConfirm && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                >
                  🗑️ Clear
                </button>
              )}
              <Link href="/create-hunt">
                <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                  + Create
                </button>
              </Link>
            </div>
          </div>

          {/* Clear Confirmation */}
          {showClearConfirm && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium mb-3">
                ⚠️ Clear all hunts? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAllHunts}
                  className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white rounded-full text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {hunts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  No token hunts available yet.
                </p>
                <Link href="/create-hunt">
                  <button className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                    Create Your First Hunt
                  </button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {hunts.map((hunt) => {
                const distance = userLocation
                  ? calculateDistance(userLocation.lat, userLocation.lng, hunt.lat, hunt.lng)
                  : null
                const canClaim = distance !== null && distance <= hunt.radiusMeters
                const isActive = hunt.claimedCount < hunt.maxClaims

                return (
                  <Card key={hunt.huntId} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg sm:text-xl">
                          {hunt.campaignName}
                        </CardTitle>
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? "Active" : "Completed"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Reward</p>
                          <p className="font-semibold text-black dark:text-white">
                            {hunt.rewardAmount} WLD
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Claims</p>
                          <p className="font-semibold text-black dark:text-white">
                            {hunt.claimedCount} / {hunt.maxClaims}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Radius</p>
                          <p className="font-semibold text-black dark:text-white">
                            {hunt.radiusMeters}m
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Distance</p>
                          <p className="font-semibold text-black dark:text-white">
                            {distance !== null ? `${Math.round(distance)}m` : "Calculating..."}
                          </p>
                        </div>
                      </div>

                      {hunt.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {hunt.description}
                        </p>
                      )}

                      {hunt.sponsorWallet && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">Sponsor:</span>
                          <Badge variant="outline" className="font-mono">
                            {hunt.sponsorWallet.slice(0, 6)}...{hunt.sponsorWallet.slice(-4)}
                          </Badge>
                        </div>
                      )}

                      <div className="pt-2">
                        {!isActive ? (
                          <button
                            disabled
                            className="w-full h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium cursor-not-allowed"
                          >
                            Hunt Completed
                          </button>
                        ) : canClaim ? (
                          <button className="w-full h-10 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
                            🎯 Claim Reward
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium cursor-not-allowed"
                          >
                            {distance !== null && distance > hunt.radiusMeters
                              ? `Move ${Math.round(distance - hunt.radiusMeters)}m closer`
                              : "Out of Range"}
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {claimedRewardIds.size}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Rewards Found</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {hunts.reduce((sum, h) => sum + h.claimedCount, 0)}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Total Claims</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {hunts.filter((h) => h.claimedCount >= h.maxClaims).length}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="flex w-full flex-col gap-3 sm:gap-4 text-base font-medium sm:flex-row sm:justify-center px-4 sm:px-0">
          <Link href="/" className="w-full sm:w-auto">
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-6 sm:px-8 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]">
              ← Back to Home
            </button>
          </Link>
          <Link href="/campaign" className="w-full sm:w-auto">
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-6 sm:px-8 text-white dark:text-black transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200">
              🚀 Learn About Campaigns
            </button>
          </Link>
        </div>
      </main>

      {/* Claim Reward Popup */}
      {showClaimPopup && claimedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-sm mx-4 animate-in zoom-in duration-500 relative overflow-hidden">
            {/* Confetti/Celebration Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-100 dark:from-yellow-900/20 dark:via-orange-900/10 dark:to-yellow-900/20 opacity-50"></div>
            
            {/* Animated Coin Rain */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                >
                  🪙
                </div>
              ))}
            </div>

            <CardContent className="relative z-10 py-8 text-center space-y-4">
              {/* Success Icon */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
                    <span className="text-5xl">🎉</span>
                  </div>
                  <div className="absolute inset-0 h-20 w-20 rounded-full bg-yellow-400 animate-ping opacity-20"></div>
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 animate-pulse">
                  Reward Claimed!
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You found a treasure! 🏆
                </p>
              </div>

              {/* Reward Amount */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-lg border-2 border-yellow-400 dark:border-yellow-600">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You earned</p>
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                  +{claimedReward.amount.toFixed(4)} WLD
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono">
                  Reward #{claimedReward.rewardId.slice(0, 8)}...
                </p>
              </div>

              {/* Celebration Text */}
              <div className="space-y-2 pt-2">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  ✨ Amazing! ✨
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep exploring to find more rewards!
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowClaimPopup(false)}
                className="mt-4 w-full h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Awesome! 🚀
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
