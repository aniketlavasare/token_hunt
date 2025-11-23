"use client";

import { useRef, useEffect, useState } from "react";
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";

type LocationMapProps = {
  lat: number;
  lng: number;
  accuracy: number;
};

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5pa2V0YXZhc2FyZTQyMCIsImEiOiJjbWlhbjRmcDMwejNqMmxvZ2x3bmZ1Y2duIn0.QAG-0y4eiR1quyf7XJoV4A";

export default function LocationMap({ lat, lng, accuracy }: LocationMapProps) {
  const mapRef = useRef<any>(null);
  const [showPopup, setShowPopup] = useState(true);

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
      <div className="relative h-[400px] w-full">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: 16,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl
            position="top-right"
            trackUserLocation
            showUserHeading
          />
          
          <Marker
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={() => setShowPopup(true)}
          >
            <div className="relative">
              <div className="absolute -top-10 -left-4 h-8 w-8 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
              <div className="absolute -top-10 -left-4 h-8 w-8 bg-red-500 rounded-full opacity-25 animate-ping"></div>
            </div>
          </Marker>

          {showPopup && (
            <Popup
              longitude={lng}
              latitude={lat}
              anchor="top"
              onClose={() => setShowPopup(false)}
              closeOnClick={false}
            >
              <div className="text-center p-2">
                <p className="font-semibold text-sm">📍 You are here!</p>
                <p className="text-xs text-gray-600 mt-1">
                  {lat.toFixed(7)}, {lng.toFixed(7)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Accuracy: ±{accuracy.toFixed(1)}m
                </p>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </Card>
  );
}

