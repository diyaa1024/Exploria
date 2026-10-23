import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Sparkles, Layers } from 'lucide-react';

interface InteractiveMapProps {
  center: [number, number];
  zoom: number;
  selectedPoint: { lat: number; lng: number; name?: string } | null;
  onMapClick: (lat: number, lng: number) => void;
  isLoading: boolean;
}

// Custom animated Radar Ping Icon in Mid-Century Polar Atlas Terracotta & Ochre
const createRadarIcon = () => {
  return L.divIcon({
    className: 'custom-radar-pin',
    html: `
      <div style="position: relative; width: 46px; height: 46px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
        <div class="radar-ping-terracotta" style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(223, 121, 91, 0.45);"></div>
        <div class="radar-ping-ochre" style="position: absolute; inset: 8px; border-radius: 9999px; background: rgba(222, 155, 53, 0.55);"></div>
        <div style="position: relative; width: 18px; height: 18px; border-radius: 9999px; background: #DF795B; border: 3px solid #FAF7EE; box-shadow: 0 0 14px rgba(223, 121, 91, 0.7), 0 0 22px rgba(222, 155, 53, 0.5);"></div>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23]
  });
};

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

type MapLayerType = 'atlas' | 'dark' | 'satellite';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  zoom,
  selectedPoint,
  onMapClick,
  isLoading
}) => {
  const [mapLayer, setMapLayer] = useState<MapLayerType>('atlas');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className={`w-full h-full z-0 ${mapLayer === 'atlas' ? 'atlas-tiles' : mapLayer === 'dark' ? 'dark-canvas' : ''}`}
        attributionControl={false}
      >
        {/* Layer 1: Illustrated OpenStreetMap (Atlas Tone) */}
        {mapLayer === 'atlas' && (
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap Atlas Filter'
            maxZoom={19}
          />
        )}

        {/* Layer 2: ESRI Dark Canvas */}
        {mapLayer === 'dark' && (
          <>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; ESRI Dark Gray'
              maxZoom={16}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; ESRI Labels'
              maxZoom={16}
            />
          </>
        )}

        {/* Layer 3: High-Res Satellite Imagery */}
        {mapLayer === 'satellite' && (
          <>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; ESRI World Imagery'
              maxZoom={18}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; ESRI Boundaries'
              maxZoom={18}
            />
          </>
        )}

        <MapClickHandler onMapClick={onMapClick} />
        <MapRecenter center={center} zoom={zoom} />

        {selectedPoint && (
          <Marker
            position={[selectedPoint.lat, selectedPoint.lng]}
            icon={createRadarIcon()}
          />
        )}
      </MapContainer>

      {/* Map Bottom Instruction Banner */}
      <div className="absolute bottom-5 left-5 z-10 pointer-events-none hidden sm:block">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131F1E]/95 backdrop-blur-md border border-[#EDE4CE]/25 text-xs font-bold text-[#FAF6ED] shadow-xl">
          <Navigation className="w-3.5 h-3.5 text-[#DE9B35]" />
          <span>Click anywhere on the physical globe to synthesize cultural discoveries</span>
        </div>
      </div>

      {/* Floating Map Layer Switcher in Archival Atlas Style */}
      <div className="absolute bottom-5 right-5 z-10">
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#131F1E]/95 hover:bg-[#1A2C2A] text-xs font-bold text-[#FAF6ED] border border-[#EDE4CE]/25 shadow-xl backdrop-blur-xl transition-all active:scale-95 hover:border-[#DE9B35]"
            title="Switch Map Basemap Style"
          >
            <Layers className="w-3.5 h-3.5 text-[#DE9B35]" />
            <span className="capitalize">{mapLayer === 'atlas' ? '🗺️ Illustrated Atlas' : mapLayer === 'dark' ? '🌑 Dark Canvas' : '🛰️ Satellite'}</span>
          </button>

          {showLayerMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 rounded-xl bg-[#142221]/98 border border-[#EDE4CE]/25 shadow-2xl p-1.5 backdrop-blur-2xl space-y-1 text-xs font-bold">
              <button
                onClick={() => { setMapLayer('atlas'); setShowLayerMenu(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  mapLayer === 'atlas' ? 'bg-[#DF795B]/20 text-[#FAF6ED] font-black border border-[#DF795B]/50' : 'text-[#EDE4CE] hover:bg-[#1E3230]'
                }`}
              >
                <span>🗺️ Illustrated Atlas</span>
                {mapLayer === 'atlas' && <span className="w-1.5 h-1.5 rounded-full bg-[#DF795B]" />}
              </button>

              <button
                onClick={() => { setMapLayer('dark'); setShowLayerMenu(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  mapLayer === 'dark' ? 'bg-[#DF795B]/20 text-[#FAF6ED] font-black border border-[#DF795B]/50' : 'text-[#EDE4CE] hover:bg-[#1E3230]'
                }`}
              >
                <span>🌑 Dark Canvas</span>
                {mapLayer === 'dark' && <span className="w-1.5 h-1.5 rounded-full bg-[#DF795B]" />}
              </button>

              <button
                onClick={() => { setMapLayer('satellite'); setShowLayerMenu(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  mapLayer === 'satellite' ? 'bg-[#DF795B]/20 text-[#FAF6ED] font-black border border-[#DF795B]/50' : 'text-[#EDE4CE] hover:bg-[#1E3230]'
                }`}
              >
                <span>🛰️ Satellite</span>
                {mapLayer === 'satellite' && <span className="w-1.5 h-1.5 rounded-full bg-[#DF795B]" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay on the map */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-[#131F1E]/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none transition-all">
          <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-[#142221]/98 border border-[#DF795B]/50 shadow-2xl">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#DE9B35]/30 border-t-[#DF795B] animate-spin" />
              <Sparkles className="w-6 h-6 text-[#DE9B35] animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-[#FAF6ED] font-['Fraunces']">Synthesizing Physical Location</p>
              <p className="text-xs font-medium text-[#B8C4C2] mt-0.5">Querying Wikipedia, OpenStreetMap, & Gemini Embeddings...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
