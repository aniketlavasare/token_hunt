"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LiveLocation from "@/components/LiveLocation";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Loading map...</p>
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

  return (
    <div className="w-full space-y-4">
      {coords && (
        <LocationMap lat={coords.lat} lng={coords.lng} accuracy={coords.accuracy} />
      )}
      <LiveLocation
        coords={coords}
        error={error}
        lastUpdate={lastUpdate}
        isUpdating={isUpdating}
      />
    </div>
  );
}

