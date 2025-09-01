import { useState, useEffect } from 'react';
import { X, Navigation2, MapPin, AlertTriangle, Clock } from 'lucide-react';
import { LocationPicker } from '../components/LocationPicker';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Red icon for emergency markers
const redMarkerIcon = new Icon({
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function DetectionTrackerPage() {
  const [showAlert, setShowAlert] = useState(true);
  const [compass, setCompass] = useState(0);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [lastFixAt, setLastFixAt] = useState<number | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [improving, setImproving] = useState(false);
  // Real demo emergencies (to be geocoded once)
  const [realEmergencies, setRealEmergencies] = useState<Array<{
    id: number;
    type: string;
    address: string;
    location: string;
    severity: 'High' | 'Medium' | 'Low';
    timeReported: string;
    lat?: number;
    lng?: number;
  }>>([
    {
      id: 101,
      type: 'Fire Alert',
      address:
        'Sealdah, Bepin Behari Ganguly Street, Sealdah, Kolkata, West Bengal, 700009, India',
      location: 'Sealdah, Kolkata',
      severity: 'High',
      timeReported: '1 minute ago'
    },
    {
      id: 102,
      type: 'Bomb Blast',
      address:
        'Amity University, Kolkata, New Town, Bidhannagar, North 24 Parganas, West Bengal, India',
      location: 'Amity University, Kolkata',
      severity: 'High',
      timeReported: 'Just now'
    }
  ]);
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Fallback: center of India

  // Fix default Leaflet marker icons (works well with Vite)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (Icon.Default.prototype as any)._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
  
  // Simulate compass rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCompass((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Get user's current location and watch updates (best-effort)
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    // Initial precise fix
  navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    setAccuracy(pos.coords.accuracy ?? null);
    setLastFixAt(Date.now());
      },
      () => {
        // Ignore errors; we'll use defaultCenter
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
    );
    // Watch continuous updates
  const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    setAccuracy(pos.coords.accuracy ?? null);
    setLastFixAt(Date.now());
      },
      () => {
        // Ignore watch errors
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    return () => {
      if (typeof watchId === 'number') navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Geocode real demo emergencies (Nominatim)
  useEffect(() => {
    let cancelled = false;
    const toFetch = realEmergencies.filter((e) => e.lat === undefined || e.lng === undefined);
    if (toFetch.length === 0) return;
    const fetchOne = async (e: (typeof realEmergencies)[number]) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(e.address)}&limit=1`;
      try {
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          }
        });
        if (!res.ok) return;
        const json: Array<{ lat: string; lon: string } & Record<string, unknown>> = await res.json();
        if (cancelled) return;
        if (json && json[0]) {
          const lat = parseFloat(json[0].lat);
          const lng = parseFloat(json[0].lon);
          setRealEmergencies((prev) => prev.map((x) => (x.id === e.id ? { ...x, lat, lng } : x)));
        }
      } catch {
        // ignore
      }
    };
    // Fetch sequentially to be gentle
    (async () => {
      for (const e of toFetch) {
        await fetchOne(e);
        await new Promise((r) => setTimeout(r, 500));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [realEmergencies]);

  const nearbyEmergencies = [
    {
      id: 1,
      type: 'Medical Emergency',
      distance: '0.3 km',
      direction: 45, // degrees
      location: 'Kothrud Main Road',
      severity: 'High',
      timeReported: '2 minutes ago'
    },
    {
      id: 2,
      type: 'Fire Incident',
      distance: '0.8 km',
      direction: 180,
      location: 'Law College Road',
      severity: 'Medium',
      timeReported: '5 minutes ago'
    }
  ];

  // Small helper: compute offset lat/lng from a center, given distance (km) and bearing (deg)
  function offsetLocation(center: { lat: number; lng: number }, distanceKm: number, bearingDeg: number) {
    const R = 6371; // km
    const bearing = (bearingDeg * Math.PI) / 180;
    const lat1 = (center.lat * Math.PI) / 180;
    const lon1 = (center.lng * Math.PI) / 180;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distanceKm / R) +
        Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearing)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(distanceKm / R) * Math.cos(lat1),
        Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
      );
  return { lat: (lat2 * 180) / Math.PI, lng: (lon2 * 180) / Math.PI };
  }

  // Distance (km) between two coords
  function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    const la1 = (a.lat * Math.PI) / 180;
    const la2 = (b.lat * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  }

  // Bearing from a to b (deg, 0=N)
  function bearingDeg(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  }

  // Derive marker positions for emergencies around the current center
  const mapCenter = currentPos || defaultCenter;
  const mapKey = currentPos ? 'hasLoc' : 'noLoc';

  // Try to improve accuracy by sampling best-of readings for a few seconds
  const improveAccuracy = () => {
    if (!('geolocation' in navigator) || improving) return;
    setImproving(true);
    let best: { lat: number; lng: number; acc: number } | null = null;
    const started = Date.now();
    const done = () => setImproving(false);
    const onPos = (pos: GeolocationPosition) => {
      const acc = pos.coords.accuracy ?? 9999;
      if (!best || acc < best.acc) {
        best = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc };
      }
      // Stop early if we have a great fix
      if (best && best.acc <= 20) finish();
    };
    const onErr = () => {
      // ignore errors during sampling
    };
    const finish = () => {
      if (typeof watchId === 'number') navigator.geolocation.clearWatch(watchId);
      if (best) {
        setCurrentPos({ lat: best.lat, lng: best.lng });
        setAccuracy(best.acc);
        setLastFixAt(Date.now());
      }
      done();
    };
    const watchId = navigator.geolocation.watchPosition(onPos, onErr, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    });
    // Hard stop after ~7s
    const interval = setInterval(() => {
      if (Date.now() - started > 7000) {
        clearInterval(interval);
        finish();
      }
    }, 500);
  };
  // Synthetic emergencies projected from the current center
  const syntheticWithPos = nearbyEmergencies.map((e) => {
    const km = parseFloat(e.distance);
    const pos = Number.isFinite(km) ? offsetLocation(mapCenter, km, e.direction) : mapCenter;
    return { ...e, position: pos };
  });

  // Real emergencies with derived fields
  const realWithPos = realEmergencies
    .filter((e) => typeof e.lat === 'number' && typeof e.lng === 'number')
    .map((e) => {
      const position = { lat: e.lat as number, lng: e.lng as number };
      const distKm = currentPos ? haversineKm(currentPos, position) : null;
      const distance = distKm !== null ? `${distKm.toFixed(distKm < 1 ? 2 : 1)} km` : '—';
      const direction = currentPos ? Math.round(bearingDeg(currentPos, position)) : 0;
      return {
        id: e.id,
        type: e.type,
        distance,
        direction,
        location: e.location,
        severity: e.severity,
        timeReported: e.timeReported,
        position
      };
    });

  const emergenciesWithPos = [...syntheticWithPos, ...realWithPos];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Emergency Alert Popup */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-red-500 p-4 flex justify-between items-center">
              <h2 className="text-white font-semibold text-lg">Emergency Alert</h2>
              <button 
                onClick={() => setShowAlert(false)}
                className="text-white hover:text-red-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <h3 className="font-semibold text-lg">Emergencies Found Nearby</h3>
                  <p className="text-gray-600">{emergenciesWithPos.length} incidents nearby</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {emergenciesWithPos.map((emergency) => (
                  <div key={emergency.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{emergency.type}</h4>
                      <span className="text-sm text-red-500">{emergency.distance}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{emergency.location}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{emergency.timeReported}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        emergency.severity === 'High' ? 'bg-red-100 text-red-500' :
                        'bg-orange-100 text-orange-500'
                      }`}>
                        {emergency.severity} Priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

  {/* Compass UI */}
  <div className="p-6 pt-20 sm:pt-24 pb-24 sm:pb-28">
        <h1 className="text-2xl font-bold mb-2">Emergency Tracker</h1>
        <p className="text-gray-600 mb-8">Track nearby emergencies in real-time</p>

        <div className="relative aspect-square max-w-md mx-auto mb-8">
          {/* Compass Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200">
            {/* Compass markers */}
            {['N', 'E', 'S', 'W'].map((direction, index) => (
              <div
                key={direction}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-start justify-center"
                style={{ transform: `translate(-50%, -50%) rotate(${index * 90}deg)` }}
              >
                <span className="text-gray-400 font-medium mt-2">{direction}</span>
              </div>
            ))}
          </div>

          {/* Rotating compass needle */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${compass}deg)` }}
          >
            <Navigation2 className="w-16 h-16 text-red-500" />
          </div>

          {/* Emergency indicators */}
          {emergenciesWithPos.map((emergency) => (
            <div
              key={emergency.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ 
                transform: `translate(-50%, -50%) rotate(${emergency.direction}deg) translateY(-45%)` 
              }}
            >
              <div className="bg-red-500 w-3 h-3 rounded-full relative pulse-animation" />
            </div>
          ))}
        </div>

        {/* Map (Leaflet) */}
    <div className="mb-8 relative z-0">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Map View</h2>
                <p className="text-sm text-gray-600">
                  Your location and nearby emergencies
                  {currentPos && (
                    <span className="ml-2 text-gray-500">
                      • acc: {Math.round(Math.min(Math.max(accuracy ?? 0, 0), 999))}m
                      {lastFixAt ? ` • updated ${Math.max(1, Math.round((Date.now() - lastFixAt) / 1000))}s ago` : ''}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={improveAccuracy}
                  disabled={improving}
                  className={`px-3 py-1.5 text-sm rounded-lg border ${improving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  title="Try to improve GPS accuracy"
                >
                  {improving ? 'Improving…' : 'Improve accuracy'}
                </button>
                <button
                  onClick={() => setShowLocationPicker(true)}
                  className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                  title="Set location manually"
                >
                  Set manually
                </button>
              </div>
            </div>
      <div className="h-80">
              <MapContainer
                key={mapKey}
                center={mapCenter}
                zoom={14}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
             >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* User location (blue dot + accuracy radius) */}
                {currentPos && (
                  <>
                    <Circle
                      center={currentPos}
                      radius={Math.min(Math.max(accuracy ?? 50, 10), 200)}
                      pathOptions={{ color: '#60a5fa', fillColor: '#93c5fd', fillOpacity: 0.25, weight: 1 }}
                    />
                    <CircleMarker
                      center={currentPos}
                      radius={6}
                      pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
                    />
                  </>
                )}
                {/* User position */}
                {currentPos && (
                  <Marker position={currentPos}>
                    <Popup>
                      You are here
                    </Popup>
                  </Marker>
                )}
                {/* Emergency markers */}
                {emergenciesWithPos.map((e) => (
                  <Marker key={e.id} position={e.position} icon={redMarkerIcon}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-medium">{e.type}</div>
                        <div className="text-gray-600">{e.location}</div>
                        <div className="mt-1">
                          <span className="inline-block text-xs px-2 py-0.5 rounded-full "
                            style={{
                              backgroundColor: e.severity === 'High' ? 'rgba(254, 226, 226, 1)' : 'rgba(255, 237, 213, 1)',
                              color: e.severity === 'High' ? 'rgb(239, 68, 68)' : 'rgb(234, 88, 12)'
                            }}
                          >
                            {e.severity} • {e.distance}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Manual location picker */}
        {showLocationPicker && (
          <LocationPicker
            onLocationSelect={(loc) => {
              setCurrentPos({ lat: loc.lat, lng: loc.lng });
              setAccuracy(20);
              setLastFixAt(Date.now());
              setShowLocationPicker(false);
            }}
            onClose={() => setShowLocationPicker(false)}
          />
        )}

        {/* Emergency List */}
  <div className="space-y-4 mb-24">
          <h2 className="text-xl font-semibold">Nearby Emergencies</h2>
          {emergenciesWithPos.map((emergency) => (
            <div key={emergency.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${
                    emergency.severity === 'High' ? 'text-red-500' : 'text-orange-500'
                  }`} />
                  <h3 className="font-semibold">{emergency.type}</h3>
                </div>
                <span className="text-sm font-medium text-red-500">{emergency.distance}</span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{emergency.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{emergency.timeReported}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(3);
              opacity: 0;
            }
          }
          .pulse-animation::after {
            content: '';
            position: absolute;
            inset: 0;
            background-color: rgb(239, 68, 68);
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
        `}
      </style>
    </div>
  );
}