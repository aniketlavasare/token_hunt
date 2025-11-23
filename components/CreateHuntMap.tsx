"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Map, { Marker, Layer, Source } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5pa2V0YXZhc2FyZTQyMCIsImEiOiJjbWlhbjRmcDMwejNqMmxvZ2x3bmZ1Y2duIn0.QAG-0y4eiR1quyf7XJoV4A";

// Fallback location if user denies location permission (Buenos Aires, Argentina)
const FALLBACK_LOCATION = { lat: -34.58352, lng: -58.38973 };

type CreateHuntMapProps = {
  onLocationChange: (lat: number, lng: number) => void;
  radiusMeters: number;
  initialLat?: number;
  initialLng?: number;
};

export default function CreateHuntMap({
  onLocationChange,
  radiusMeters,
  initialLat,
  initialLng,
}: CreateHuntMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    initialLng || FALLBACK_LOCATION.lng,
    initialLat || FALLBACK_LOCATION.lat,
  ]);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation && !initialLat && !initialLng) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setMapCenter([lng, lat]);
          console.log("User location acquired:", { lat, lng });
        },
        (error) => {
          console.log("Could not get user location, using fallback:", error.message);
          setUserLocation(FALLBACK_LOCATION);
        }
      );
    }
  }, [initialLat, initialLng]);

  // Handle map click to drop pin
  const handleMapClick = useCallback(
    (event: any) => {
      const { lng, lat } = event.lngLat;
      setMarkerPosition({ lat, lng });
      onLocationChange(lat, lng);
      console.log("Pin dropped at:", { lat, lng });
    },
    [onLocationChange]
  );

  // Handle marker drag
  const handleMarkerDrag = useCallback(
    (event: any) => {
      const { lng, lat } = event.lngLat;
      setMarkerPosition({ lat, lng });
      onLocationChange(lat, lng);
    },
    [onLocationChange]
  );

  // Create circle GeoJSON for radius visualization
  const createCircle = (center: [number, number], radiusInMeters: number) => {
    const points = 64;
    const coords = {
      latitude: center[1],
      longitude: center[0],
    };

    const km = radiusInMeters / 1000;
    const ret = [];
    const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [ret],
          },
          properties: {},
        },
      ],
    };
  };

  const circleData = markerPosition
    ? createCircle([markerPosition.lng, markerPosition.lat], radiusMeters)
    : null;

  return (
    <div className="relative w-full h-[250px] sm:h-[300px] rounded-lg overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: mapCenter[0],
          latitude: mapCenter[1],
          zoom: 15,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleMapClick}
        attributionControl={false}
      >
        {/* Radius circle overlay */}
        {circleData && (
          <Source id="radius-circle" type="geojson" data={circleData}>
            <Layer
              id="radius-fill"
              type="fill"
              paint={{
                "fill-color": "#3b82f6",
                "fill-opacity": 0.2,
              }}
            />
            <Layer
              id="radius-outline"
              type="line"
              paint={{
                "line-color": "#3b82f6",
                "line-width": 2,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        {/* Draggable marker */}
        {markerPosition && (
          <Marker
            longitude={markerPosition.lng}
            latitude={markerPosition.lat}
            draggable
            onDrag={handleMarkerDrag}
            anchor="bottom"
          >
            <div className="relative">
              <div className="absolute -bottom-8 -left-6 text-4xl cursor-move">📍</div>
            </div>
          </Marker>
        )}
      </Map>

      {/* Instruction overlay */}
      {!markerPosition && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium">
            📍 Click on the map to drop a pin
          </div>
        </div>
      )}

      {/* Pin info */}
      {markerPosition && (
        <div className="absolute top-2 left-2 right-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs">
          <p className="font-semibold text-black dark:text-white">Pin Location</p>
          <p className="text-zinc-600 dark:text-zinc-400 font-mono">
            {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}

