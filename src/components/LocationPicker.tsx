import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Search, MapPin, X, Check } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onClose: () => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Component to handle map click events
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ onLocationSelect, onClose }: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Default location (you can change this to user's current location)
  const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York

  // Search for locations using Nominatim
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      setSelectedAddress(data.display_name || 'Unknown location');
    } catch (error) {
      console.error('Error getting address:', error);
      setSelectedAddress('Unknown location');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handle location selection from map click
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    getAddressFromCoordinates(lat, lng);
  };

  // Handle search result selection
  const handleSearchResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedLocation({ lat, lng });
    setSelectedAddress(result.display_name);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(query);
    }, 500);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedLocation && selectedAddress) {
      onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: selectedAddress
      });
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Location on Map</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Close map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Map Section */}
          <div className="flex-1 relative">
            <MapContainer
              center={selectedLocation || defaultLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              {selectedLocation && (
                <Marker position={selectedLocation} />
              )}
            </MapContainer>
            
            {/* Instructions overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Click on map to select location</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 p-4 border-l bg-gray-50 overflow-y-auto">
            {/* Search Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Enter address or place name..."
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 text-sm"
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {result.display_name.split(',')[0]}
                      </div>
                      <div className="text-gray-500 text-xs truncate">
                        {result.display_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {isSearching && (
                <div className="mt-2 text-center text-sm text-gray-500">
                  Searching...
                </div>
              )}
            </div>

            {/* Selected Location Details */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Location
              </label>
              {selectedLocation ? (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-gray-600 mb-2">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                  <div className="text-sm">
                    {isLoadingAddress ? (
                      <div className="text-gray-500">Loading address...</div>
                    ) : (
                      <div className="text-gray-900">{selectedAddress}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-500">
                  Click on the map to select a location
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleSubmit}
                disabled={!selectedLocation || !selectedAddress}
                className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Use This Location
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            {/* Attribution */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              © OpenStreetMap contributors
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
