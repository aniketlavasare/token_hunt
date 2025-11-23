"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { SpawnedReward } from "@/lib/rewards";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

type Coords = { lat: number; lng: number; accuracy: number };

type LocationTrackerProps = {
  rewards?: SpawnedReward[];
  onRewardClick?: (reward: SpawnedReward) => void;
};

export default function LocationTracker({ rewards = [], onRewardClick }: LocationTrackerProps = {}) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported by your browser");
      return;
    }

    let watchId: number | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const startWatching = () => {
      // Clear any existing watch
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      console.log(`Starting location watch (attempt ${retryCount + 1})...`);

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setIsUpdating(true);

          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setLastUpdate(new Date());
          setError(null); // Clear any previous errors
          setRetryCount(0); // Reset retry count on success

          setTimeout(() => setIsUpdating(false), 50);

          console.log("Location updated:", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          
          // Handle different error types
          let errorMessage = "Location error";
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access in settings.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location unavailable. Retrying...";
              // Retry after a delay
              if (retryCount < 3) {
                retryTimeout = setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  startWatching();
                }, 2000);
              } else {
                errorMessage = "Location unavailable after multiple attempts. Please check your GPS settings.";
              }
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out. Retrying...";
              // Retry after a delay
              if (retryCount < 3) {
                retryTimeout = setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  startWatching();
                }, 2000);
              } else {
                errorMessage = "Location timeout. Please ensure GPS is enabled.";
              }
              break;
            default:
              errorMessage = `Location error: ${err.message || "Unknown error"}`;
              // Retry for unknown errors
              if (retryCount < 2) {
                retryTimeout = setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  startWatching();
                }, 3000);
              }
              break;
          }
          
          setError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000, // Allow 5-second cache to reduce load
          timeout: 10000, // Increased timeout to 10 seconds
        }
      );
    };

    // Start watching
    startWatching();

    // Cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        console.log("Location watch cleared");
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryCount]);

  if (error) {
    return (
      <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-medium text-red-800 dark:text-red-200 mb-2">
              Location Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              {error}
            </p>
            {retryCount > 0 && retryCount < 3 && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Retry attempt {retryCount} of 3...
              </p>
            )}
            <button
              onClick={() => {
                setError(null);
                setRetryCount(0);
              }}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-8 flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
        <p className="text-gray-600 dark:text-zinc-400 font-medium text-sm sm:text-base text-center">
          Acquiring GPS coordinates...
        </p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-500 text-center">
          Please allow location access when prompted
        </p>
      </div>
    );
  }

  return (
    <LocationMap
      lat={coords.lat}
      lng={coords.lng}
      accuracy={coords.accuracy}
      lastUpdate={lastUpdate}
      isUpdating={isUpdating}
      rewards={rewards}
      onRewardClick={onRewardClick}
    />
  );
}
