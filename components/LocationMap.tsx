"use client";

import { useRef, useEffect } from "react";
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

export default function LocationMap({ lat, lng, accuracy, lastUpdate, isUpdating }: LocationMapProps) {
  const mapRef = useRef<any>(null);

  // Update map center when coordinates change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        duration: 1000,
      });
    }
  }, [lat, lng]);

  return (
    <Card className="w-full overflow-hidden">
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
        {/* Map */}
        <div className="relative h-[250px] w-full rounded-lg overflow-hidden">
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: lng,
              latitude: lat,
              zoom: 17,
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
                <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute top-0 left-0 h-4 w-4 bg-blue-500 rounded-full opacity-25 animate-ping"></div>
              </div>
            </Marker>
          </Map>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Latitude</p>
            <p className={`text-lg font-mono font-semibold transition-colors ${isUpdating ? 'text-blue-600' : ''}`}>
              {lat.toFixed(7)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Longitude</p>
            <p className={`text-lg font-mono font-semibold transition-colors ${isUpdating ? 'text-blue-600' : ''}`}>
              {lng.toFixed(7)}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Accuracy</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">±{accuracy.toFixed(1)}m</p>
            {accuracy < 20 && (
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

