"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";

// Fix for default marker icon in react-leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type LocationMapProps = {
  lat: number;
  lng: number;
  accuracy: number;
};

// Component to update map center when coordinates change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LocationMap({ lat, lng, accuracy }: LocationMapProps) {
  const position: [number, number] = [lat, lng];

  return (
    <Card className="w-full overflow-hidden">
      <div className="relative h-[400px] w-full">
        <MapContainer
          center={position}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <ChangeView center={position} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={icon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">You are here!</p>
                <p className="text-xs text-gray-600">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500">Accuracy: ±{accuracy.toFixed(1)}m</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </Card>
  );
}

