"use client";

import { useRef, useEffect, useState } from "react";
import Map, { Marker, GeolocateControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LocationMapProps = {
  lat: number;
  lng: number;
  accuracy: number;
  lastUpdate: Date | null;
  isUpdating: boolean;
};

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5pa2V0YXZhc2FyZTQyMCIsImEiOiJjbWlhbjRmcDMwejNqMmxvZ2x3bmZ1Y2duIn0.QAG-0y4eiR1quyf7XJoV4A";

// Minimum distance in meters to trigger a map update (reduces unnecessary requests)
const MIN_DISTANCE_THRESHOLD = 5; // 5 meters

// Calculate distance between two coordinates using Haversine formula
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

export default function LocationMap({ lat, lng, accuracy, lastUpdate, isUpdating }: LocationMapProps) {
  const mapRef = useRef<any>(null);
  const [lastMapCenter, setLastMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Update map center only when coordinates change significantly
  useEffect(() => {
    if (mapRef.current) {
      // If this is the first update, always update the map
      if (!lastMapCenter) {
        mapRef.current.flyTo({
          center: [lng, lat],
          duration: 1000,
        });
        setLastMapCenter({ lat, lng });
        console.log('Map initialized at:', { lat, lng });
        return;
      }

      // Calculate distance from last map center
      const distance = calculateDistance(lastMapCenter.lat, lastMapCenter.lng, lat, lng);
      
      // Only update map if movement is significant
      if (distance >= MIN_DISTANCE_THRESHOLD) {
        mapRef.current.flyTo({
          center: [lng, lat],
          duration: 1000,
        });
        setLastMapCenter({ lat, lng });
        console.log(`Map updated - moved ${distance.toFixed(1)}m`);
      } else {
        console.log(`Map not updated - movement too small (${distance.toFixed(1)}m < ${MIN_DISTANCE_THRESHOLD}m)`);
      }
    }
  }, [lat, lng, lastMapCenter]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-lg sm:text-xl">📍 Your Live Location</span>
          {isUpdating && (
            <span className="text-sm font-normal text-blue-600 animate-pulse">
              Updating...
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-sm">Real-time GPS tracking with high accuracy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Map */}
        <div className="relative h-[200px] sm:h-[250px] w-full rounded-lg overflow-hidden touch-none">
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: lng,
              latitude: lat,
              zoom: 20,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            attributionControl={false}
            logoPosition="bottom-left"
          >
            <GeolocateControl
              position="top-right"
              trackUserLocation
              showUserHeading
              showAccuracyCircle={true}
            />
            
            <Marker
              longitude={lng}
              latitude={lat}
              anchor="center"
            >
              <div className="relative">
                <div className="h-3 w-3 sm:h-4 sm:w-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute top-0 left-0 h-3 w-3 sm:h-4 sm:w-4 bg-blue-500 rounded-full opacity-25 animate-ping"></div>
              </div>
            </Marker>
          </Map>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Latitude</p>
            <p className={`text-sm sm:text-lg font-mono font-semibold transition-colors break-all ${isUpdating ? 'text-blue-600' : ''}`}>
              {lat.toFixed(7)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Longitude</p>
            <p className={`text-sm sm:text-lg font-mono font-semibold transition-colors break-all ${isUpdating ? 'text-blue-600' : ''}`}>
              {lng.toFixed(7)}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-gray-500">Accuracy</p>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base sm:text-lg font-semibold">±{accuracy.toFixed(1)}m</p>
            {accuracy < 20 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                High precision
              </span>
            )}
          </div>
        </div>

        {lastUpdate && (
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Last Updated</p>
            <p className="text-xs sm:text-sm text-gray-600">
              {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 bg-green-50 px-2 sm:px-3 py-2 rounded-lg">
          <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-600"></div>
          <span className="font-medium">Live tracking active - Updates automatically as you move</span>
        </div>
      </CardContent>
    </Card>
  );
}

