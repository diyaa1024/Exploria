import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InteractiveMap } from './components/InteractiveMap';
import { SearchBar } from './components/SearchBar';
import { DiscoveryPanel } from './components/DiscoveryPanel';
import { RAGInspectorModal } from './components/RAGInspectorModal';
import { SystemDesignModal } from './components/SystemDesignModal';
import { AtlasLandingPage } from './components/AtlasLandingPage';
import type { PlaceResponse, SystemMetrics } from './types';
import { MapPin } from 'lucide-react';

export function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'app'>('landing');
  const [mapCenter, setMapCenter] = useState<[number, number]>([35.0116, 135.7681]); // Kyoto default
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number; name?: string } | null>({
    lat: 35.0116,
    lng: 135.7681,
    name: 'Kyoto, Japan'
  });
  const [placeData, setPlaceData] = useState<PlaceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState<boolean>(true);

  // Initial load: discover default place and load metrics
  useEffect(() => {
    fetchMetrics();
    fetchPlace(35.0116, 135.7681, 'Kyoto, Japan');
  }, []);

  const fetchMetrics = async () => {
    try {
      const resp = await fetch('/api/metrics');
      if (resp.ok) {
        const data = await resp.json();
        setMetrics(data);
      }
    } catch (e) {
      console.warn('Metrics fetch error:', e);
    }
  };

  const fetchPlace = async (lat: number, lng: number, placeName?: string, forceRefresh = false) => {
    setIsLoading(true);
    setMobilePanelOpen(true);
    try {
      const resp = await fetch('/api/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          place_name: placeName,
          force_refresh: forceRefresh
        })
      });

      if (resp.ok) {
        const data: PlaceResponse = await resp.json();
        setPlaceData(data);
        setSelectedPoint({
          lat: data.latitude,
          lng: data.longitude,
          name: data.place_name
        });
        fetchMetrics();
      } else {
        console.error('API place discovery error:', resp.statusText);
      }
    } catch (err) {
      console.error('Failed to discover place:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPoint({ lat, lng });
    fetchPlace(lat, lng);
  };

  const handleSelectLocation = (lat: number, lng: number, name: string) => {
    setMapCenter([lat, lng]);
    setMapZoom(14);
    setSelectedPoint({ lat, lng, name });
    fetchPlace(lat, lng, name);
  };

  const handleRefresh = () => {
    if (selectedPoint) {
      fetchPlace(selectedPoint.lat, selectedPoint.lng, selectedPoint.name, true);
    }
  };

  const handleExploreNow = (destination?: { lat: number; lng: number; name: string }) => {
    if (destination) {
      setMapCenter([destination.lat, destination.lng]);
      setMapZoom(14);
      setSelectedPoint(destination);
      fetchPlace(destination.lat, destination.lng, destination.name);
    }
    setCurrentPage('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full font-sans antialiased text-[#221E19]">
      {currentPage === 'landing' ? (
        <AtlasLandingPage
          onExploreNow={handleExploreNow}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
        />
      ) : (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#121919] text-[#FAF6ED]">
          {/* Top Header */}
          <Header
            metrics={metrics}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
            onOpenInspector={() => setIsInspectorOpen(true)}
            isInspecting={isInspectorOpen}
            onReturnToLanding={() => setCurrentPage('landing')}
          />

          {/* Main Content Layout */}
          <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Map Viewport */}
            <div className="relative flex-1 h-full min-h-[40vh]">
              {/* Floating Search Bar */}
              <div className="absolute top-4 left-4 right-4 z-20 pointer-events-auto">
                <SearchBar
                  onSelectLocation={handleSelectLocation}
                  isLoading={isLoading}
                />
              </div>

              {/* Interactive Map */}
              <InteractiveMap
                center={mapCenter}
                zoom={mapZoom}
                selectedPoint={selectedPoint}
                onMapClick={handleMapClick}
                isLoading={isLoading}
              />

              {/* Mobile Bottom Bar trigger if closed */}
              {!mobilePanelOpen && placeData && (
                <div className="absolute bottom-4 left-4 right-4 z-20 md:hidden">
                  <button
                    onClick={() => setMobilePanelOpen(true)}
                    className="w-full py-3 px-4 rounded-2xl bg-[#131F1E]/95 border border-[#DF795B]/40 text-[#FAF6ED] font-bold text-sm flex items-center justify-between shadow-2xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#DE9B35]" />
                      <span className="font-bold">{placeData.place_name}</span>
                    </div>
                    <span className="text-xs text-[#DF795B] flex items-center gap-1 font-bold">
                      View Discoveries →
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Discovery Sidebar */}
            <div
              className={`
                fixed md:relative inset-x-0 bottom-0 md:inset-auto
                h-[60vh] md:h-full md:w-[440px] lg:w-[480px] xl:w-[510px]
                z-30 md:z-10 transition-transform duration-300 ease-in-out shrink-0
                ${mobilePanelOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
              `}
            >
              <DiscoveryPanel
                data={placeData}
                isLoading={isLoading}
                onRefresh={handleRefresh}
                onClose={() => setMobilePanelOpen(false)}
                onOpenInspector={() => setIsInspectorOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* RAG Pipeline Vector Inspector Modal */}
      <RAGInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        data={placeData}
      />

      {/* System Design & Interview Architecture Modal */}
      <SystemDesignModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}

export default App;
