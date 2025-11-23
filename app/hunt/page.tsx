'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import LocationTracker from "@/components/LocationTracker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getHunts, type Hunt } from "@/lib/hunts"

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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Load hunts from localStorage
  useEffect(() => {
    const loadedHunts = getHunts()
    setHunts(loadedHunts)
    console.log(`Loaded ${loadedHunts.length} hunts from localStorage`)

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-3 sm:p-4">
      <main className="flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8 py-6 sm:py-12">
        <div className="flex w-full flex-col items-center gap-4 sm:gap-6 text-center px-4">
          <Link href="/">
            <Image
              className="dark:invert cursor-pointer"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
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

        {/* Location Map */}
        <div className="w-full px-2 sm:px-0">
          <LocationTracker />
        </div>

        {/* Available Hunts Section */}
        <div className="w-full space-y-4 px-4 sm:px-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              Available Hunts {hunts.length > 0 && `(${hunts.length})`}
            </h2>
            <Link href="/create-hunt">
              <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                + Create
              </button>
            </Link>
          </div>

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

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">Sponsor:</span>
                        <Badge variant="outline" className="font-mono">
                          {hunt.sponsorWallet.slice(0, 6)}...{hunt.sponsorWallet.slice(-4)}
                        </Badge>
                      </div>

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
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {hunts.reduce((sum, h) => sum + h.claimedCount, 0)}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Claims</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {hunts.filter((h) => h.claimedCount >= h.maxClaims).length}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Completed Hunts</p>
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
    </div>
  )
}
