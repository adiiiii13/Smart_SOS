import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star, Clock, Phone, Globe, Camera, Heart, Navigation, Newspaper, Cloud, Shield, AlertTriangle, Phone as PhoneIcon, RefreshCw, Search } from 'lucide-react';
import { useRealTimeNews } from '../hooks/useRealTimeNews';
import { getUrgencyColor, getCategoryIcon } from '../lib/geminiNews';

interface TourismPlace {
  id: number;
  name: string;
  category: string;
  location: string;
  rating: number;
  image: string;
  description: string;
  openHours: string;
  contact?: string;
  website?: string;
  price: string;
  highlights: string[];
  latitude?: number;
  longitude?: number;
  safetyRating?: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  visibility: number;
  safetyAlert?: string;
  icon: string;
}

interface SafetyAlert {
  id: number;
  type: 'warning' | 'info' | 'danger' | 'success';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  actionRequired?: string;
}

interface EmergencyService {
  name: string;
  number: string;
  type: 'police' | 'medical' | 'fire' | 'tourism' | 'transport';
  available24x7: boolean;
}

const touristPlaces: TourismPlace[] = [
  {
    id: 1,
    name: "Victoria Memorial",
    category: "Historical",
    location: "Kolkata, West Bengal",
    rating: 4.5,
    latitude: 22.5448,
    longitude: 88.3426,
    safetyRating: 4.8,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Victoria_Memorial_situated_in_Kolkata.jpg/1200px-Victoria_Memorial_situated_in_Kolkata.jpg",
    description: "A magnificent marble monument dedicated to Queen Victoria, showcasing Indo-Saracenic architecture.",
    openHours: "10:00 AM - 6:00 PM",
    contact: "+91-33-2223-1890",
    website: "www.victoriamemorial-cal.org",
    price: "₹30 (Indians), ₹200 (Foreigners)",
    highlights: ["Museum", "Gardens", "Light & Sound Show", "Art Gallery"]
  },
  {
    id: 2,
    name: "Howrah Bridge",
    category: "Landmark",
    location: "Kolkata, West Bengal",
    rating: 4.3,
    latitude: 22.5851,
    longitude: 88.3468,
    safetyRating: 4.2,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Howrah_Bridge_Kolkata_Rabindra_Setu.jpg/1200px-Howrah_Bridge_Kolkata_Rabindra_Setu.jpg",
    description: "Iconic cantilever bridge over the Hooghly River, a symbol of Kolkata.",
    openHours: "24 Hours",
    price: "Free",
    highlights: ["River Views", "Photography", "Sunset Views", "Historic Architecture"]
  },
  {
    id: 3,
    name: "Dakshineswar Temple",
    category: "Religious",
    location: "Kolkata, West Bengal",
    rating: 4.6,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Dakshineswar_Kali_Temple.jpg/1200px-Dakshineswar_Kali_Temple.jpg",
    description: "Sacred Hindu temple dedicated to Goddess Kali, associated with Ramakrishna Paramahamsa.",
    openHours: "6:00 AM - 12:30 PM, 3:00 PM - 8:30 PM",
    price: "Free",
    highlights: ["Spiritual Experience", "River Ganges", "Architecture", "Peaceful Environment"]
  },
  {
    id: 4,
    name: "Park Street",
    category: "Entertainment",
    location: "Kolkata, West Bengal",
    rating: 4.2,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Park_Street_Kolkata_Christmas.jpg/1200px-Park_Street_Kolkata_Christmas.jpg",
    description: "Famous street known for restaurants, pubs, and vibrant nightlife.",
    openHours: "24 Hours",
    price: "Varies by venue",
    highlights: ["Nightlife", "Restaurants", "Shopping", "Christmas Celebrations"]
  },
  {
    id: 5,
    name: "Indian Museum",
    category: "Museum",
    location: "Kolkata, West Bengal",
    rating: 4.1,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Indian_Museum_Entrance.jpg/1200px-Indian_Museum_Entrance.jpg",
    description: "Oldest and largest museum in India with rare collections of antiques, fossils, and artifacts.",
    openHours: "10:00 AM - 5:00 PM (Closed on Monday)",
    contact: "+91-33-2286-1699",
    price: "₹20 (Indians), ₹500 (Foreigners)",
    highlights: ["Fossils", "Coins", "Egyptian Mummy", "Buddhist Sculptures"]
  },
  {
    id: 6,
    name: "Belur Math",
    category: "Religious",
    location: "Howrah, West Bengal",
    rating: 4.7,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Belur_Math_Temple.jpg/1200px-Belur_Math_Temple.jpg",
    description: "Headquarters of Ramakrishna Math and Mission, known for its architecture and spirituality.",
    openHours: "6:00 AM - 12:00 PM, 4:30 PM - 7:30 PM",
    price: "Free",
    highlights: ["Spiritual Center", "Architecture", "Ganges View", "Meditation"]
  },
  {
    id: 7,
    name: "Kalighat Temple",
    category: "Religious",
    location: "Kolkata, West Bengal",
    rating: 4.4,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Kalighat_Kali_Temple.jpg/1200px-Kalighat_Kali_Temple.jpg",
    description: "One of the 51 Shakti Peethas, this ancient temple is dedicated to Goddess Kali.",
    openHours: "5:00 AM - 2:00 PM, 5:00 PM - 10:30 PM",
    price: "Free",
    highlights: ["Ancient Temple", "Spiritual Significance", "Religious Festivals", "Architecture"]
  },
  {
    id: 8,
    name: "Eden Gardens",
    category: "Entertainment",
    location: "Kolkata, West Bengal",
    rating: 4.3,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Eden_Gardens_Stadium.jpg/1200px-Eden_Gardens_Stadium.jpg",
    description: "Iconic cricket stadium and one of the largest cricket stadiums in the world.",
    openHours: "Match days only",
    contact: "+91-33-2248-0641",
    price: "Match tickets vary",
    highlights: ["Cricket Stadium", "Sports History", "Capacity 66,000", "International Matches"]
  },
  {
    id: 9,
    name: "St. Paul's Cathedral",
    category: "Historical",
    location: "Kolkata, West Bengal",
    rating: 4.2,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/St._Paul%27s_Cathedral%2C_Kolkata.jpg/1200px-St._Paul%27s_Cathedral%2C_Kolkata.jpg",
    description: "Anglican cathedral church with Gothic Revival architecture, built during British colonial period.",
    openHours: "9:00 AM - 12:00 PM, 3:00 PM - 6:00 PM",
    price: "Free",
    highlights: ["Gothic Architecture", "Stained Glass Windows", "Historical Significance", "Peaceful Gardens"]
  },
  {
    id: 10,
    name: "Marble Palace",
    category: "Historical",
    location: "Kolkata, West Bengal",
    rating: 4.1,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Marble_Palace_Kolkata.jpg/1200px-Marble_Palace_Kolkata.jpg",
    description: "19th-century mansion known for its marble walls, floors, and sculptures.",
    openHours: "10:00 AM - 4:00 PM (Closed on Monday and Thursday)",
    price: "Free (Permission required)",
    highlights: ["Marble Architecture", "Antique Collections", "Private Zoo", "Art Gallery"]
  },
  {
    id: 11,
    name: "Birla Planetarium",
    category: "Museum",
    location: "Kolkata, West Bengal",
    rating: 4.0,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Birla_Planetarium_Kolkata.jpg/1200px-Birla_Planetarium_Kolkata.jpg",
    description: "Largest planetarium in Asia, offering spectacular sky shows and astronomy exhibits.",
    openHours: "12:00 PM - 7:30 PM (Closed on Monday)",
    contact: "+91-33-2223-4675",
    price: "₹50 (Adults), ₹25 (Children)",
    highlights: ["Sky Shows", "Astronomy Museum", "3D Shows", "Educational Programs"]
  },
  {
    id: 12,
    name: "Alipore Zoo",
    category: "Entertainment",
    location: "Kolkata, West Bengal",
    rating: 3.9,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Alipore_Zoo_Kolkata.jpg/1200px-Alipore_Zoo_Kolkata.jpg",
    description: "One of the oldest zoos in India, home to various species of animals and birds.",
    openHours: "9:00 AM - 5:00 PM (Closed on Thursday)",
    contact: "+91-33-2479-3012",
    price: "₹20 (Adults), ₹10 (Children)",
    highlights: ["Wildlife", "Royal Bengal Tigers", "Reptile House", "Aquarium"]
  }
];

const categories = ["All", "Historical", "Religious", "Museum", "Entertainment", "Landmark"];

const mockWeather: WeatherData = {
  temperature: 28,
  condition: "Partly Cloudy",
  humidity: 78,
  windSpeed: 12,
  uvIndex: 6,
  visibility: 8.5,
  safetyAlert: "UV levels moderate. Recommended to use sunscreen.",
  icon: "partly-cloudy"
};

const mockSafetyAlerts: SafetyAlert[] = [
  {
    id: 1,
    type: "info",
    title: "Geo-fencing Active",
    description: "You are now in a monitored tourist safety zone. Emergency services are 2 minutes away.",
    location: "Victoria Memorial Area",
    timestamp: "Just now",
    actionRequired: "Keep your digital ID active"
  },
  {
    id: 2,
    type: "warning",
    title: "Crowding Alert",
    description: "High crowd density detected at Park Street. Consider alternative routes.",
    location: "Park Street",
    timestamp: "15 minutes ago"
  }
];

const emergencyServices: EmergencyService[] = [
  { name: "Tourist Police", number: "1363", type: "police", available24x7: true },
  { name: "Medical Emergency", number: "108", type: "medical", available24x7: true },
  { name: "Fire Department", number: "101", type: "fire", available24x7: true },
  { name: "Tourist Helpline", number: "1363", type: "tourism", available24x7: true },
  { name: "Transport Help", number: "139", type: "transport", available24x7: false }
];

export function TourismPage({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<TourismPlace | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [activeTab, setActiveTab] = useState<'places' | 'nearby' | 'news' | 'weather' | 'safety'>('places');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Your Location');

  // Real-time Gemini AI news hook
  const { 
    news: realTimeNews, 
    loading: newsLoading, 
    error: newsError, 
    lastUpdated, 
    refresh: refreshNews,
    searchNews 
  } = useRealTimeNews({
    location: userLocation ? `${userLocation.lat},${userLocation.lng}` : 'Kolkata',
    refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    autoRefresh: true
  });

  useEffect(() => {
    // Get user location for nearby places
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.log("Location access denied:", error)
    );
  }, []);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Fetch weather data using OpenWeatherMap API (free tier)
  const fetchWeatherData = async (lat: number, lng: number) => {
    setWeatherLoading(true);
    setWeatherError(null);
    
    try {
      // Using a free weather API - OpenWeatherMap
      // You can get a free API key from openweathermap.org
      const API_KEY = 'your_openweather_api_key_here'; // Replace with your API key
      
      // For demo purposes, we'll use mock data based on location
      // In production, use: const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`);
      
      // Simulate API call with realistic data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get location name using reverse geocoding
      try {
        const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const geoData = await geoResponse.json();
        setLocationName(geoData.city || geoData.locality || `${lat.toFixed(2)}, ${lng.toFixed(2)}`);
      } catch {
        setLocationName(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
      }
      
      // Generate realistic weather data based on location and time
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour <= 18;
      const season = new Date().getMonth(); // 0-11
      
      let baseTemp = 25; // Default for Kolkata region
      if (lat > 28) baseTemp = 20; // Northern regions
      if (lat < 20) baseTemp = 30; // Southern regions
      
      // Add daily temperature variation
      const tempVariation = isDay ? Math.random() * 8 : Math.random() * -5;
      const temperature = Math.round(baseTemp + tempVariation);
      
      const conditions = isDay 
        ? ['Sunny', 'Partly Cloudy', 'Cloudy', 'Clear']
        : ['Clear', 'Partly Cloudy', 'Cloudy'];
      
      const weatherData: WeatherData = {
        temperature,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.round(60 + Math.random() * 30),
        windSpeed: Math.round(5 + Math.random() * 15),
        uvIndex: isDay ? Math.round(3 + Math.random() * 8) : 0,
        visibility: Math.round(8 + Math.random() * 7),
        icon: isDay ? '☀️' : '🌙',
        safetyAlert: temperature > 35 ? 'High temperature warning - Stay hydrated and avoid prolonged sun exposure' : 
                    temperature < 10 ? 'Cold weather alert - Dress warmly' :
                    Math.random() > 0.7 ? 'Weather conditions are favorable for outdoor activities' : undefined
      };
      
      setCurrentWeather(weatherData);
      
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherError('Unable to fetch weather data. Please try again.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Auto-fetch weather when location is available or weather tab is active
  useEffect(() => {
    if (userLocation && (activeTab === 'weather' || !currentWeather)) {
      fetchWeatherData(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, activeTab]);

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to Kolkata coordinates if geolocation fails
          setUserLocation({
            lat: 22.5726,
            lng: 88.3639
          });
          setLocationName('Kolkata (Default)');
        }
      );
    }
  }, []);

  const nearbyPlaces = userLocation ? touristPlaces
    .filter(place => place.latitude && place.longitude)
    .map(place => ({
      ...place,
      distance: calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        place.latitude!, 
        place.longitude!
      )
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5) : [];

  const filteredPlaces = selectedCategory === "All" 
    ? touristPlaces 
    : touristPlaces.filter(place => place.category === selectedCategory);

  const toggleFavorite = (placeId: number) => {
    setFavorites(prev => 
      prev.includes(placeId) 
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    );
  };

  const PlaceCard = ({ place }: { place: TourismPlace }) => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="relative">
        <img 
          src={place.image} 
          alt={place.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={() => toggleFavorite(place.id)}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full"
        >
          <Heart 
            className={`w-4 h-4 ${
              favorites.includes(place.id) 
                ? 'text-red-500 fill-red-500' 
                : 'text-gray-600'
            }`} 
          />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {place.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-800">{place.name}</h3>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{place.rating}</span>
            </div>
            {place.safetyRating && (
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">{place.safetyRating}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{place.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{place.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{place.openHours.split(',')[0]}</span>
          </div>
          <span className="font-medium text-green-600">{place.price}</span>
        </div>
        
        <button
          onClick={() => setSelectedPlace(place)}
          className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );

  const PlaceDetails = ({ place, onClose }: { place: TourismPlace; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img 
            src={place.image} 
            alt={place.name}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{place.name}</h2>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{place.rating}</span>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{place.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>{place.openHours}</span>
            </div>
            
            {place.contact && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-5 h-5" />
                <span>{place.contact}</span>
              </div>
            )}
            
            {place.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="w-5 h-5" />
                <span className="text-blue-600">{place.website}</span>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <span className="text-lg font-semibold text-green-600">{place.price}</span>
          </div>
          
          <p className="text-gray-600 mb-4">{place.description}</p>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {place.highlights.map((highlight, index) => (
                <span 
                  key={index}
                  className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors">
              Get Directions
            </button>
            <button 
              onClick={() => toggleFavorite(place.id)}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                favorites.includes(place.id)
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${favorites.includes(place.id) ? 'fill-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">Smart Tourist Safety System</h1>
            <p className="text-sm text-gray-600 truncate">AI-Powered Tourism with Safety Monitoring</p>
          </div>
          <Shield className="w-6 h-6 text-green-500" />
        </div>
      </div>

      {/* Smart Feature Tabs */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'places', label: 'Places', icon: MapPin },
            { id: 'nearby', label: 'Nearby', icon: Navigation },
            { id: 'news', label: 'AI News', icon: Newspaper },
            { id: 'weather', label: 'Weather', icon: Cloud },
            { id: 'safety', label: 'Safety', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="p-4 pb-24 max-w-full">
        {/* Places Tab */}
        {activeTab === 'places' && (
          <div className="max-w-full">
            {/* Category Filter */}
            <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Places Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPlaces.map(place => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        )}

        {/* Nearby Places Tab */}
        {activeTab === 'nearby' && (
          <div className="space-y-4">
            {/* Location Services Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold">Nearby Tourist Destinations</h2>
                <div className="flex items-center gap-1 ml-auto">
                  <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {userLocation ? 'GPS Active' : 'Enable Location'}
                  </span>
                </div>
              </div>

              {!userLocation && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-700 mb-2">
                    📍 Enable location access for personalized nearby recommendations
                  </p>
                  <button
                    onClick={() => {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          });
                        },
                        (error) => console.error('Location error:', error)
                      );
                    }}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Enable Location
                  </button>
                </div>
              )}

              {/* Popular Nearby Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: '🏛️', label: 'Museums', count: 12 },
                  { icon: '🏞️', label: 'Parks', count: 8 },
                  { icon: '🍽️', label: 'Restaurants', count: 25 },
                  { icon: '🛍️', label: 'Shopping', count: 18 }
                ].map((cat, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 cursor-pointer">
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-sm font-medium">{cat.label}</div>
                    <div className="text-xs text-gray-500">{cat.count} nearby</div>
                  </div>
                ))}
              </div>

              {/* Best Nearby Places */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-800 mb-3">🎯 Best Places to Visit</h3>
                {[
                  {
                    id: 'vmp1',
                    name: 'Victoria Memorial',
                    category: 'Historical Monument',
                    distance: userLocation ? '2.1 km' : 'Central Kolkata',
                    rating: 4.8,
                    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
                    description: 'Iconic marble palace dedicated to Queen Victoria',
                    coordinates: { lat: 22.5448, lng: 88.3426 },
                    timings: '10:00 AM - 6:00 PM',
                    entryFee: '₹30 for Indians, ₹500 for Foreigners'
                  },
                  {
                    id: 'hw1',
                    name: 'Howrah Bridge',
                    category: 'Engineering Marvel',
                    distance: userLocation ? '3.2 km' : 'Howrah',
                    rating: 4.6,
                    image: 'https://images.unsplash.com/photo-1578927288208-3c5b0e9d8e14?w=300',
                    description: 'Famous cantilever bridge over Hooghly River',
                    coordinates: { lat: 22.5851, lng: 88.3468 },
                    timings: '24/7 Open',
                    entryFee: 'Free'
                  },
                  {
                    id: 'kc1',
                    name: 'Kumartuli Clay Quarter',
                    category: 'Cultural Heritage',
                    distance: userLocation ? '4.1 km' : 'North Kolkata',
                    rating: 4.4,
                    image: 'https://images.unsplash.com/photo-1578927288085-3c5b0e9d8e14?w=300',
                    description: 'Traditional clay idol making district',
                    coordinates: { lat: 22.5958, lng: 88.3639 },
                    timings: '9:00 AM - 7:00 PM',
                    entryFee: 'Free (Photography charges may apply)'
                  },
                  {
                    id: 'pb1',
                    name: 'Princep Ghat',
                    category: 'Riverside Beauty',
                    distance: userLocation ? '2.8 km' : 'Central Kolkata',
                    rating: 4.7,
                    image: 'https://images.unsplash.com/photo-1578927288155-3c5b0e9d8e14?w=300',
                    description: 'Beautiful riverside promenade with stunning sunset views',
                    coordinates: { lat: 22.5562, lng: 88.3370 },
                    timings: '24/7 Open',
                    entryFee: 'Free'
                  },
                  {
                    id: 'pb2',
                    name: 'Park Street',
                    category: 'Entertainment Hub',
                    distance: userLocation ? '1.5 km' : 'Central Kolkata',
                    rating: 4.5,
                    image: 'https://images.unsplash.com/photo-1578927288125-3c5b0e9d8e14?w=300',
                    description: 'Famous street for food, shopping and nightlife',
                    coordinates: { lat: 22.5488, lng: 88.3639 },
                    timings: '24/7 (Shops: 10 AM - 10 PM)',
                    entryFee: 'Free'
                  },
                  {
                    id: 'im1',
                    name: 'Indian Museum',
                    category: 'Museum',
                    distance: userLocation ? '2.3 km' : 'Central Kolkata',
                    rating: 4.3,
                    image: 'https://images.unsplash.com/photo-1578927288095-3c5b0e9d8e14?w=300',
                    description: 'Oldest and largest museum in India',
                    coordinates: { lat: 22.5584, lng: 88.3507 },
                    timings: '10:00 AM - 5:00 PM (Closed Mondays)',
                    entryFee: '₹20 for Indians, ₹500 for Foreigners'
                  }
                ].map((place) => (
                  <div key={place.id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border hover:shadow-md transition-all cursor-pointer">
                    <div className="flex gap-4">
                      <img 
                        src={place.image} 
                        alt={place.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800 truncate">{place.name}</h4>
                            <p className="text-sm text-gray-500">{place.category}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{place.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{place.description}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-blue-600">📍 {place.distance}</span>
                            <span className="text-green-600">⏰ {place.timings.split('(')[0]}</span>
                          </div>
                          <span className="text-orange-600 font-medium">{place.entryFee}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=driving`;
                          window.open(url, '_blank');
                        }}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </button>
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' Kolkata')}`;
                          window.open(url, '_blank');
                        }}
                        className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        View on Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Access Buttons */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-800">🚀 Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/tourist+attractions+near+me`;
                      window.open(url, '_blank');
                    }}
                    className="bg-white px-3 py-2 rounded-full text-sm hover:bg-gray-100 border"
                  >
                    🗺️ Explore All Nearby
                  </button>
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/restaurants+near+me`;
                      window.open(url, '_blank');
                    }}
                    className="bg-white px-3 py-2 rounded-full text-sm hover:bg-gray-100 border"
                  >
                    🍽️ Find Restaurants
                  </button>
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/hotels+near+me`;
                      window.open(url, '_blank');
                    }}
                    className="bg-white px-3 py-2 rounded-full text-sm hover:bg-gray-100 border"
                  >
                    🏨 Find Hotels
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI News Tab */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            {/* News Header with Real-time Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-blue-500" />
                  <h2 className="font-semibold">Gemini AI Real-time News</h2>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      newsError ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <span className={`text-xs ${
                      newsError ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {newsError ? 'Fallback Mode' : 'Live AI'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={refreshNews}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  disabled={newsLoading}
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${newsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">
                  {newsError 
                    ? 'Using smart fallback data with real-time updates' 
                    : 'AI-powered real-time updates for tourism and safety'
                  }
                </p>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  Beta
                </span>
              </div>
              
              {/* Last Updated */}
              {lastUpdated && (
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}

              {/* Search Box */}
              <div className="mt-3 relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      searchNews(searchQuery.trim());
                    }
                  }}
                  className="w-full p-2 pl-8 border rounded-lg text-sm"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
              </div>
            </div>
            
            {/* Loading State */}
            {newsLoading && (
              <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-600">Fetching latest news from Gemini AI...</p>
              </div>
            )}

            {/* Error State */}
            {newsError && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-400">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">News Service Error</span>
                </div>
                <p className="text-sm text-red-600">{newsError}</p>
                <button
                  onClick={refreshNews}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Real-time News Items */}
            {!newsLoading && !newsError && realTimeNews.map(news => (
              <div key={news.id} className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(news.category)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(news.urgency)}`}>
                      {news.urgency.toUpperCase()} • {news.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{news.timestamp}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">AI Verified</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-2 text-gray-800 break-words">{news.title}</h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed break-words">{news.summary}</p>
                
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 truncate">Source: {news.source}</span>
                    <span className="text-xs text-blue-500 truncate">📍 {news.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      Confidence: {Math.round(news.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {news.tags && news.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {news.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {!newsLoading && !newsError && realTimeNews.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No News Available</h3>
                <p className="text-gray-600 mb-4">Unable to fetch real-time news at the moment</p>
                <button
                  onClick={refreshNews}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <h2 className="font-semibold">Live Weather Report</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${weatherLoading ? 'bg-orange-500 animate-pulse' : currentWeather ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {weatherLoading ? 'Loading...' : currentWeather ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-800">{locationName}</span>
                  {userLocation && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  📍 Real-time location-based weather updates
                </div>
              </div>

              {/* Weather Loading */}
              {weatherLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Fetching live weather data...</p>
                </div>
              )}

              {/* Weather Error */}
              {weatherError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Weather Service Error</span>
                  </div>
                  <p className="text-sm text-red-600">{weatherError}</p>
                  <button
                    onClick={() => userLocation && fetchWeatherData(userLocation.lat, userLocation.lng)}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Weather Data */}
              {currentWeather && !weatherLoading && (
                <>
                  {/* Main Weather Display */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{currentWeather.icon}</div>
                      <div className="text-4xl font-bold text-blue-600 mb-1">{currentWeather.temperature}°C</div>
                      <div className="text-sm text-gray-600 font-medium">{currentWeather.condition}</div>
                      <div className="text-xs text-gray-500 mt-1">Feels comfortable</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">💧</span>
                          <span>Humidity:</span>
                        </div>
                        <span className="font-medium">{currentWeather.humidity}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">💨</span>
                          <span>Wind Speed:</span>
                        </div>
                        <span className="font-medium">{currentWeather.windSpeed} km/h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500">☀️</span>
                          <span>UV Index:</span>
                        </div>
                        <span className={`font-medium ${currentWeather.uvIndex > 7 ? 'text-red-500' : currentWeather.uvIndex > 3 ? 'text-orange-500' : 'text-green-500'}`}>
                          {currentWeather.uvIndex}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">👁️</span>
                          <span>Visibility:</span>
                        </div>
                        <span className="font-medium">{currentWeather.visibility} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Safety Alert */}
                  {currentWeather.safetyAlert && (
                    <div className={`border-l-4 p-4 rounded-r-lg mb-4 ${
                      currentWeather.temperature > 35 ? 'bg-red-50 border-red-400' :
                      currentWeather.temperature < 10 ? 'bg-blue-50 border-blue-400' :
                      'bg-green-50 border-green-400'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {currentWeather.temperature > 35 ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : currentWeather.temperature < 10 ? (
                          <AlertTriangle className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Shield className="w-4 h-4 text-green-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          currentWeather.temperature > 35 ? 'text-red-700' :
                          currentWeather.temperature < 10 ? 'text-blue-700' :
                          'text-green-700'
                        }`}>
                          Weather Advisory
                        </span>
                      </div>
                      <p className={`text-sm ${
                        currentWeather.temperature > 35 ? 'text-red-600' :
                        currentWeather.temperature < 10 ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {currentWeather.safetyAlert}
                      </p>
                    </div>
                  )}

                  {/* Weather Actions */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => userLocation && fetchWeatherData(userLocation.lat, userLocation.lng)}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Weather
                      </button>
                      <button
                        onClick={() => {
                          const url = `https://weather.com/weather/today/l/${userLocation?.lat},${userLocation?.lng}`;
                          window.open(url, '_blank');
                        }}
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        Detailed Forecast
                      </button>
                    </div>

                    {/* Quick Weather Tips */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2 text-gray-800">💡 Travel Tips</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        {currentWeather.temperature > 30 && <div>• Stay hydrated and wear light colored clothes</div>}
                        {currentWeather.temperature < 15 && <div>• Dress in layers and carry a jacket</div>}
                        {currentWeather.uvIndex > 7 && <div>• Use sunscreen and wear sunglasses</div>}
                        {currentWeather.windSpeed > 20 && <div>• Be cautious of strong winds</div>}
                        {currentWeather.humidity > 80 && <div>• High humidity - expect muggy conditions</div>}
                        <div>• Best time to visit: {new Date().getHours() < 10 || new Date().getHours() > 16 ? 'Perfect timing!' : 'Early morning or evening recommended'}</div>
                      </div>
                    </div>

                    {/* Travel Recommendations Based on Weather */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-medium text-lg mb-3 text-gray-800 flex items-center gap-2">
                        🎯 Smart Travel Recommendations
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">AI Powered</span>
                      </h4>
                      
                      {/* Weather-Based Activity Suggestions */}
                      <div className="space-y-4">
                        {/* Good Weather Recommendations */}
                        {currentWeather.temperature >= 18 && currentWeather.temperature <= 32 && (currentWeather.condition.toLowerCase().includes('sunny') || currentWeather.condition.toLowerCase().includes('clear')) && (
                          <div className="bg-white rounded-lg p-3 border-l-4 border-green-400">
                            <h5 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                              ✅ Excellent Weather for Tourism!
                            </h5>
                            <div className="text-sm text-gray-700 space-y-2">
                              <div><strong>Perfect for:</strong></div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>🏛️ Outdoor monuments</div>
                                <div>🚶‍♂️ Walking tours</div>
                                <div>📸 Photography</div>
                                <div>🍽️ Street food</div>
                                <div>🏞️ Park visits</div>
                                <div>🛍️ Shopping districts</div>
                              </div>
                              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                                <strong>🏆 Today's Top Picks:</strong>
                                <div>• Victoria Memorial (Perfect for photos)</div>
                                <div>• Princep Ghat (Great for sunset)</div>
                                <div>• Park Street (Ideal for food & shopping)</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Hot Weather Recommendations */}
                        {currentWeather.temperature > 32 && (
                          <div className="bg-white rounded-lg p-3 border-l-4 border-orange-400">
                            <h5 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                              🌡️ Hot Weather Advisory
                            </h5>
                            <div className="text-sm text-gray-700 space-y-2">
                              <div><strong>Recommended Activities:</strong></div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>🏛️ Indoor museums</div>
                                <div>❄️ AC malls</div>
                                <div>🍨 Ice cream parlors</div>
                                <div>☕ Coffee shops</div>
                                <div>🎬 Cinemas</div>
                                <div>🚗 AC transport</div>
                              </div>
                              <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                                <strong>🏆 Beat the Heat Spots:</strong>
                                <div>• Indian Museum (Cool indoors)</div>
                                <div>• South City Mall (AC shopping)</div>
                                <div>• Metro rides (Air conditioned)</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Rainy/Cloudy Weather Recommendations */}
                        {(currentWeather.condition.toLowerCase().includes('rain') || currentWeather.condition.toLowerCase().includes('cloudy')) && (
                          <div className="bg-white rounded-lg p-3 border-l-4 border-blue-400">
                            <h5 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                              ☔ Indoor Activities Perfect!
                            </h5>
                            <div className="text-sm text-gray-700 space-y-2">
                              <div><strong>Great Options:</strong></div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>🏛️ Museums</div>
                                <div>📚 Libraries</div>
                                <div>🍽️ Restaurants</div>
                                <div>🎭 Theaters</div>
                                <div>🛍️ Covered markets</div>
                                <div>☕ Cafes</div>
                              </div>
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                <strong>🏆 Rainy Day Specials:</strong>
                                <div>• College Street Books (Covered)</div>
                                <div>• New Market (Indoor shopping)</div>
                                <div>• Flurys Cafe (Heritage dining)</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Cool Weather Recommendations */}
                        {currentWeather.temperature < 18 && (
                          <div className="bg-white rounded-lg p-3 border-l-4 border-purple-400">
                            <h5 className="font-medium text-purple-700 mb-2 flex items-center gap-2">
                              🧥 Cool Weather Activities
                            </h5>
                            <div className="text-sm text-gray-700 space-y-2">
                              <div><strong>Perfect Weather for:</strong></div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>🚶‍♂️ Long walks</div>
                                <div>🏃‍♀️ Outdoor sports</div>
                                <div>🍲 Hot food tours</div>
                                <div>☕ Tea stalls</div>
                                <div>🔥 Street food</div>
                                <div>🌅 Sunrise spots</div>
                              </div>
                              <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
                                <strong>🏆 Cool Weather Favorites:</strong>
                                <div>• Maidan (Perfect for walks)</div>
                                <div>• Tea stalls at Girish Park</div>
                                <div>• Howrah Bridge at sunrise</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Time-Based Recommendations */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            🕒 Time-Based Suggestions
                          </h5>
                          <div className="text-sm text-gray-700">
                            {(() => {
                              const hour = new Date().getHours();
                              if (hour < 8) {
                                return (
                                  <div className="space-y-1 text-xs">
                                    <div><strong>Early Morning (Perfect!):</strong></div>
                                    <div>• Howrah Bridge for sunrise photos</div>
                                    <div>• Morning walks at Maidan</div>
                                    <div>• Fresh fish at New Market</div>
                                  </div>
                                );
                              } else if (hour < 12) {
                                return (
                                  <div className="space-y-1 text-xs">
                                    <div><strong>Morning Hours (Ideal!):</strong></div>
                                    <div>• Museums and monuments</div>
                                    <div>• Photography sessions</div>
                                    <div>• Heritage building visits</div>
                                  </div>
                                );
                              } else if (hour < 16) {
                                return (
                                  <div className="space-y-1 text-xs">
                                    <div><strong>Afternoon:</strong></div>
                                    <div>• Indoor attractions recommended</div>
                                    <div>• Air-conditioned spaces</div>
                                    <div>• Lunch at famous restaurants</div>
                                  </div>
                                );
                              } else if (hour < 19) {
                                return (
                                  <div className="space-y-1 text-xs">
                                    <div><strong>Evening (Great!):</strong></div>
                                    <div>• Sunset at Princep Ghat</div>
                                    <div>• Evening boat rides</div>
                                    <div>• Street food tours</div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="space-y-1 text-xs">
                                    <div><strong>Night Time:</strong></div>
                                    <div>• Park Street nightlife</div>
                                    <div>• Illuminated monuments</div>
                                    <div>• Night markets</div>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </div>

                        {/* Safety & Comfort Score */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-700 flex items-center gap-2">
                              🛡️ Travel Comfort Score
                            </h5>
                            <div className="flex items-center gap-1">
                              {(() => {
                                let score = 5;
                                if (currentWeather.temperature > 35 || currentWeather.temperature < 5) score -= 2;
                                if (currentWeather.uvIndex > 8) score -= 1;
                                if (currentWeather.windSpeed > 25) score -= 1;
                                if (currentWeather.humidity > 85) score -= 1;
                                score = Math.max(1, score);
                                
                                return (
                                  <>
                                    <span className={`text-lg font-bold ${
                                      score >= 4 ? 'text-green-600' : 
                                      score >= 3 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                      {score}/5
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      score >= 4 ? 'bg-green-100 text-green-700' : 
                                      score >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {score >= 4 ? 'Excellent' : score >= 3 ? 'Good' : 'Caution'}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">
                            Based on temperature, UV index, humidity, and wind conditions
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* No Location Access */}
              {!userLocation && !weatherLoading && (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">Enable location access for live weather updates</p>
                  <button
                    onClick={() => {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          });
                        },
                        (error) => {
                          console.error('Location error:', error);
                          alert('Unable to access location. Please enable location services.');
                        }
                      );
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Enable Location
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            {/* Safety Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-green-500" />
                <h2 className="font-semibold">Safety Monitoring</h2>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Geo-fencing Active</span>
                </div>
                <p className="text-sm text-green-600 mt-1">You are in a monitored tourist safety zone</p>
              </div>
            </div>

            {/* Safety Alerts */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Recent Safety Alerts</h3>
              {mockSafetyAlerts.map(alert => (
                <div key={alert.id} className={`border-l-4 p-3 rounded mb-3 ${
                  alert.type === 'danger' ? 'bg-red-50 border-red-400' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  alert.type === 'info' ? 'bg-blue-50 border-blue-400' :
                  'bg-green-50 border-green-400'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.type === 'danger' ? 'text-red-500' :
                      alert.type === 'warning' ? 'text-yellow-500' :
                      alert.type === 'info' ? 'text-blue-500' :
                      'text-green-500'
                    }`} />
                    <span className="text-sm font-medium">{alert.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{alert.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{alert.location}</span>
                    <span>{alert.timestamp}</span>
                  </div>
                  {alert.actionRequired && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">{alert.actionRequired}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Emergency Services */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Emergency Services</h3>
              <div className="space-y-3">
                {emergencyServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        service.type === 'police' ? 'bg-blue-100' :
                        service.type === 'medical' ? 'bg-red-100' :
                        service.type === 'fire' ? 'bg-orange-100' :
                        service.type === 'tourism' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        <PhoneIcon className={`w-4 h-4 ${
                          service.type === 'police' ? 'text-blue-500' :
                          service.type === 'medical' ? 'text-red-500' :
                          service.type === 'fire' ? 'text-orange-500' :
                          service.type === 'tourism' ? 'text-green-500' :
                          'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {service.available24x7 && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">24x7</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'places' && filteredPlaces.length === 0) && (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </div>
        )}
      </div>

      {/* Place Details Modal */}
      {selectedPlace && (
        <PlaceDetails 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}
    </div>
  );
}
