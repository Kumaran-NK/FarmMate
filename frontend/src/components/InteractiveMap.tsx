import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFarmContext } from '../context/FarmContext';
import { api } from '../services/api';
import { MapPin, Satellite, Map as MapIcon, Maximize2, Minimize2, Loader2 } from 'lucide-react';

// Bundle marker images locally instead of loading them from unpkg
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const farmMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Free tile sources that work without an API key
const TILE_LAYERS = {
  satellite: {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  },
  street: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }
} as const;

type MapStyle = keyof typeof TILE_LAYERS;

const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center[0], center[1], map]);
  return null;
};

/**
 * Re-measures the map after the container changes size (expand / collapse)
 * and only enables scroll-wheel zoom while expanded, so the page can still
 * scroll normally when the map is inline.
 */
const MapResizer: React.FC<{ expanded: boolean }> = ({ expanded }) => {
  const map = useMap();
  useEffect(() => {
    if (expanded) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();

    // Wait for the CSS size change to settle, then tell Leaflet to redraw
    const t = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(t);
  }, [expanded, map]);
  return null;
};

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
        <div className="p-1 text-gray-900 font-sans">
          <div className="font-bold text-sm flex items-center gap-1 text-emerald-800">
            🌾 Active Farm Coordinates
          </div>
          <div className="text-xs text-gray-600 mt-1">
            <b>Region:</b> {location.city}, {location.state}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            <b>Lat/Lon:</b> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export const InteractiveMap: React.FC = () => {
  const { location, setLocation, setLatestWeather } = useFarmContext();
  const [mapStyle, setMapStyle] = useState<MapStyle>('satellite');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);

  const handleSelectCoords = async (lat: number, lon: number) => {
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLon = Math.round(lon * 10000) / 10000;

    // Immediately update coordinates so the pin and map center move right away
    setLocation({
      city: `Plot (${roundedLat.toFixed(2)}, ${roundedLon.toFixed(2)})`,
      state: 'Selected Location',
      lat: roundedLat,
      lon: roundedLon
    });

    setLoadingWeather(true);
    try {
      // Query OpenWeatherMap with coordinates to retrieve localized telemetry and place name
      const weatherData = await api.predictWeather('', roundedLat, roundedLon);
      if (weatherData && weatherData.current_weather) {
        setLatestWeather(weatherData);
        const resolvedCity = weatherData.current_weather.city;
        const resolvedCountry = weatherData.current_weather.country;
        setLocation({
          city: resolvedCity && resolvedCity.trim() !== '' ? resolvedCity : `Plot (${roundedLat.toFixed(2)}, ${roundedLon.toFixed(2)})`,
          state: resolvedCountry === 'IN' ? 'India' : (resolvedCountry || 'Selected Location'),
          lat: roundedLat,
          lon: roundedLon
        });
      }
    } catch (err) {
      console.error('Failed to fetch weather for coordinates:', err);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Close with Escape and lock page scroll while expanded
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

  const tiles = TILE_LAYERS[mapStyle];

  return (
    // Placeholder keeps the page layout stable while the map is fullscreen
    <div className="w-full h-[460px] sm:h-[540px] lg:h-[620px]">
      {/* Dimmed backdrop while expanded (click to close) */}
      {expanded && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px]"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={
          expanded
            ? 'fixed inset-3 sm:inset-6 z-[9999] rounded-2xl overflow-hidden border border-green-200 shadow-2xl bg-white'
            : 'relative w-full h-full rounded-2xl overflow-hidden border border-green-200 shadow-sm'
        }
      >
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={expanded ? 11 : 10}
          scrollWheelZoom={false}
          className="w-full h-full"
          style={{ background: '#e8f5e9' }}
        >
          {/* key forces the layer to reload when the style changes */}
          <TileLayer key={mapStyle} attribution={tiles.attribution} url={tiles.url} maxZoom={19} />
          <MapRecenter center={[location.lat, location.lon]} />
          <MapResizer expanded={expanded} />
          <LocationMarker onSelectCoords={handleSelectCoords} />
        </MapContainer>

        {/* Light green tint, only on the street map (it would distort satellite colors) */}
        {mapStyle === 'street' && (
          <div className="absolute inset-0 bg-green-600/[0.06] pointer-events-none z-[5]" />
        )}

        {/* Top-right controls: style toggle + expand */}
        <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
          <div className="flex rounded-xl overflow-hidden border border-green-200 bg-white/95 backdrop-blur-md shadow-md text-xs">
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
                mapStyle === 'satellite' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-green-50'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('street')}
              className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
                mapStyle === 'street' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-green-50'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Street
            </button>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Exit full screen map' : 'Expand map'}
            title={expanded ? 'Exit full screen (Esc)' : 'Expand map'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-green-200 bg-white/95 backdrop-blur-md shadow-md text-xs text-gray-700 hover:bg-green-50 transition-colors"
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {/* Floating Info Overlay */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-green-200 text-xs flex items-center space-x-2 text-gray-700 shadow-md">
          {loadingWeather ? (
            <>
              <Loader2 className="w-4 h-4 text-emerald-600 shrink-0 animate-spin" />
              <span className="font-semibold text-emerald-800">
                Updating weather & localized micro-climate for selected plot...
              </span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Click anywhere on the map to set your active plot coordinates
                {expanded ? ' · Scroll to zoom · Esc to close' : ''}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};