"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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

export default function LocationTracker() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setIsUpdating(true);

        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLastUpdate(new Date());

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
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (error) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-medium text-sm sm:text-base">Location Error</p>
        <p className="text-red-500 text-xs sm:text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-lg p-6 sm:p-8 flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
        <p className="text-gray-600 font-medium text-sm sm:text-base text-center">Acquiring GPS coordinates...</p>
        <p className="text-xs sm:text-sm text-gray-500 text-center">Please allow location access</p>
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
    />
  );
}

