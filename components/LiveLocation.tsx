"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Coords = { lat: number; lng: number; accuracy: number };

export default function LiveLocation() {
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
        // Trigger update animation
        setIsUpdating(true);
        
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLastUpdate(new Date());
        
        // Reset animation after brief moment
        setTimeout(() => setIsUpdating(false), 500);
        
        console.log('Location updated:', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString()
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,  // Use GPS for highest accuracy
        maximumAge: 0,             // Always get fresh position, no cached data
        timeout: 5000,             // Reduced timeout for faster updates
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Location Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!coords) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Getting Location...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black"></div>
            <p className="text-sm text-gray-600">Acquiring GPS coordinates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📍 Your Live Location</span>
          {isUpdating && (
            <span className="text-sm font-normal text-blue-600 animate-pulse">
              Updating...
            </span>
          )}
        </CardTitle>
        <CardDescription>Real-time GPS tracking with high accuracy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Latitude</p>
            <p className={`text-lg font-mono font-semibold transition-colors ${isUpdating ? 'text-blue-600' : ''}`}>
              {coords.lat.toFixed(7)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Longitude</p>
            <p className={`text-lg font-mono font-semibold transition-colors ${isUpdating ? 'text-blue-600' : ''}`}>
              {coords.lng.toFixed(7)}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Accuracy</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">±{coords.accuracy.toFixed(1)}m</p>
            {coords.accuracy < 20 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                High precision
              </span>
            )}
          </div>
        </div>
        {lastUpdate && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Last Updated</p>
            <p className="text-sm text-gray-600">
              {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-600"></div>
          <span className="font-medium">Live tracking active - Updates automatically as you move</span>
        </div>
      </CardContent>
    </Card>
  );
}

