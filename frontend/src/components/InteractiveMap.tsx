import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFarmContext } from '../context/FarmContext';
import { MapPin } from 'lucide-react';

// Custom Leaflet marker icon fix
const farmMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationMarkerProps {
  onSelectCoords: (lat: number, lon: number) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ onSelectCoords }) => {
  const { location } = useFarmContext();

  useMapEvents({
    click(e) {
      onSelectCoords(e.latlng.lat, e.latlng.lng);
    }
  });

  return (
    <Marker position={[location.lat, location.lon]} icon={farmMarkerIcon}>
      <Popup>
        <div className="p-1 text-slate-900 font-sans">
          <div className="font-bold text-sm flex items-center gap-1 text-emerald-700">
            🌾 Active Farm Site
          </div>
          <div className="text-xs text-slate-600 mt-1">
            <b>City:</b> {location.city}, {location.state}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            <b>Lat/Lon:</b> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export const InteractiveMap: React.FC = () => {
  const { location, setLocation } = useFarmContext();

  const handleSelectCoords = (lat: number, lon: number) => {
    setLocation({
      city: `Custom Pin (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
      state: 'Selected Location',
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000
    });
  };

  return (
    <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl">
      <MapContainer
        center={[location.lat, location.lon]}
        zoom={9}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelectCoords={handleSelectCoords} />
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-xs flex items-center space-x-2 text-slate-200 shadow-lg">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <span>Click anywhere on the map to pinpoint your exact farm location</span>
      </div>
    </div>
  );
};
