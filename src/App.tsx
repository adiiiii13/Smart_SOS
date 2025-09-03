import { useState, useEffect, useRef } from 'react';
import emergencySiren from './assets/dirty-siren-40635.mp3';
import notificationSound from './assets/Notifi.wav';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase, TABLES } from './lib/supabase';
import { submitEmergencyReport, sendSOSAlertToFriends, reverseGeocode } from './lib/emergencyUtils';
// import { connectToDatabase } from './lib/mongodb';

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void; // broaden to capture event details
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognitionInstance;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognitionInstance;
    };
  }
}

import { Bell, Phone, X, Send, MapPin, Camera, Mic, CheckCircle, Bot, RefreshCw, Activity, Stethoscope, HeartPulse, Home, UserCircle, MessageCircle, Compass } from 'lucide-react';
import { PredictionPage } from './pages/prediction';
import { DetectionTrackerPage } from './pages/detection-tracker';
import { QuickFirstAidPage } from './pages/quick-first-aid';
import { CallEmergencyPage, ManualPage, TipsPage, VideoGuidePage } from './pages/quick-actions';
import { ProfilePage } from './pages/profile';
import { FriendsPage } from './pages/friends';
import { NotificationsPage } from './pages/notifications';
import { TourismPage } from './pages/tourism';
import { LoginPage } from './pages/login';
import { SignupPage } from './pages/signup';
import { geminiAI } from './lib/geminiAI';

function SplashScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Phone className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold text-red-500">Emergency</h1>
      <p className="text-red-400">Response System</p>
    </div>
  );
}

function ChatBot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<{ text: string; type: 'user' | 'bot' }[]>([
    { text: 'Namaste! 🙏 Main aapka Emergency Response AI Assistant hoon. Emergency situations mein help karne ke liye yahan hoon. Kya help chahiye aapko?', type: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognitionRef.current = recognition;
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
            console.log('🎤 Speech recognized:', transcript);
            setInput(transcript);
            setIsListening(false);
        };
        recognition.onerror = (event) => {
          console.error('🎤 Speech recognition error:', event);
          setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
      } catch (e) {
        console.warn('Speech recognition init failed:', e);
      }
    }
    return () => recognitionRef.current?.abort();
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const clearChat = () => {
    setMessages([{ text: 'Namaste! 🙏 Main aapka Emergency Response AI Assistant hoon. Emergency situations mein help karne ke liye yahan hoon. Kya help chahiye aapko?', type: 'bot' }]);
    setInput('');
  };

  const handleSend = async (override?: string) => {
    const content = (override ?? input).trim();
    if (!content || isLoading) return;
    setMessages(prev => [...prev, { text: content, type: 'user' }]);
    setInput('');
    setIsLoading(true);
    try {
      const reply = await geminiAI.sendMessage(content);
      setMessages(prev => [...prev, { text: reply, type: 'bot' }]);
    } catch (e) {
      console.error('AI send error', e);
      setMessages(prev => [...prev, { text: 'Mujhe thoda issue aa raha hai. Kripya thodi der baad try karein. Emergency ho toh turant 100 / 101 / 102 par call karein.', type: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-lg flex flex-col h-[80vh] sm:h-[600px]">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-red-500"><Bot className="w-5 h-5" /> AI Assistant</div>
          <div className="flex items-center gap-2">
            <button onClick={clearChat} className="p-2 rounded-full hover:bg-gray-100" title="Clear chat">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" title="Close">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${m.type === 'user' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'}`}>{m.text}</div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 text-sm flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                AI soch raha hai...
              </div>
            </div>
          )}
          {messages.length <= 1 && !isLoading && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 text-center">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSend('Bleeding ka first aid kya hai?')} className="text-xs bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100">🩸 First Aid</button>
                <button onClick={() => handleSend('Fire emergency mein kya karna chahiye?')} className="text-xs bg-orange-50 text-orange-600 p-2 rounded-lg hover:bg-orange-100">🔥 Fire Safety</button>
                <button onClick={() => handleSend('India ke emergency numbers kya hain?')} className="text-xs bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100">📞 Emergency Numbers</button>
                <button onClick={() => handleSend('Earthquake mein kaise safe rahein?')} className="text-xs bg-yellow-50 text-yellow-600 p-2 rounded-lg hover:bg-yellow-100">🌋 Earthquake Safety</button>
              </div>
              <div className="text-center mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">🎤 Voice Commands</p>
                <p className="text-xs text-blue-500">Mic dabayein & Hindi/English bolen</p>
              </div>
            </div>
          )}
        </div>
        <div className="border-t p-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={isLoading ? 'AI is responding...' : 'Type your message...'}
            disabled={isLoading}
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-red-500 disabled:bg-gray-50"
          />
          <button
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isListening ? 'Listening... click to stop' : 'Speak'}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-full ${isLoading || !input.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmergencyReport({ onToggleSOS, sosPlaying }: { onToggleSOS: () => void; sosPlaying: boolean }) {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [location, setLocation] = useState('Park Street, Kolkata, 700016');
  const [images] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [volunteer, setVolunteer] = useState(false);

  const emergencyTypes = [
    { 
      id: 'accident', 
      label: 'Accident', 
      icon: Activity,
      options: [
        'Car Accident',
        'Motorcycle Accident',
        'Pedestrian Hit',
        'Bicycle Accident',
        'Construction Accident',
        'Industrial Accident'
      ]
    },
    { 
      id: 'fire', 
      label: 'Fire', 
      icon: Bell,
      options: [
        'Building Fire',
        'Vehicle Fire',
        'Forest Fire',
        'Kitchen Fire',
        'Electrical Fire',
        'Gas Leak'
      ]
    },
    { 
      id: 'medical', 
      label: 'Medical', 
      icon: Stethoscope,
      options: [
        'Heart Attack',
        'Stroke',
        'Unconscious Person',
        'Severe Bleeding',
        'Difficulty Breathing',
        'Allergic Reaction',
        'Seizure',
        'Overdose'
      ]
    },
    { 
      id: 'flood', 
      label: 'Flood', 
      icon: Activity,
      options: [
        'Flash Flood',
        'River Overflow',
        'Sewage Backup',
        'Storm Surge',
        'Dam Break'
      ]
    },
    { 
      id: 'quake', 
      label: 'Earthquake', 
      icon: Activity,
      options: [
        'Minor Earthquake',
        'Major Earthquake',
        'Aftershock',
        'Building Collapse',
        'Landslide'
      ]
    },
    { 
      id: 'robbery', 
      label: 'Robbery', 
      icon: Bell,
      options: [
        'Armed Robbery',
        'Bank Robbery',
        'Home Invasion',
        'Vehicle Theft',
        'Shoplifting'
      ]
    },
    { 
      id: 'assault', 
      label: 'Assault', 
      icon: Bell,
      options: [
        'Physical Assault',
        'Sexual Assault',
        'Domestic Violence',
        'Gang Violence',
        'Hate Crime'
      ]
    },
    { 
      id: 'other', 
      label: 'Other', 
      icon: Bell,
      options: [
        'Natural Disaster',
        'Chemical Spill',
        'Power Outage',
        'Gas Leak',
        'Suspicious Package',
        'Animal Attack'
      ]
    },
  ];

  const handleEmergencyTypeClick = (typeId: string) => {
    if (selectedType === typeId) {
      // If clicking the same type, hide it
      setSelectedType('');
      setSelectedOption('');
    } else {
      // If clicking a different type, show it
      setSelectedType(typeId);
      setSelectedOption('');
    }
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    // Scroll to the bottom to show the form
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    setShowLocationInput(false);
  };

  const quickLocations = [
    'Park Street, Kolkata, 700016',
    'Salt Lake City, Kolkata, 700091',
    'New Town, Kolkata, 700156',
    'Howrah, Kolkata, 711101',
    'Dum Dum, Kolkata, 700028',
    'Tollygunge, Kolkata, 700033',
    'Ballygunge, Kolkata, 700019',
    'Alipore, Kolkata, 700027',
    'Esplanade, Kolkata, 700069',
    'Bidhannagar, Kolkata, 700064'
  ];

  const handleSubmitReport = async () => {
    if (!user || !selectedType || !selectedOption) {
      alert('Please select an emergency type and option');
      return;
    }

    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[UI] Submitting emergency report...');
      await submitEmergencyReport({
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        emergencyType: selectedType,
        specificType: selectedOption,
        location: location.trim(),
        description: description || 'No additional details provided',
        priority: 'high'
      });

      setSubmitSuccess(true);
      // Reset form
      setSelectedType('');
      setSelectedOption('');
      setDescription('');
      setLocation('Park Street, Kolkata, 700016'); // Reset to default
      
      // Show success message
      alert('Emergency report submitted successfully! All users have been notified.');
      
      // Reset success state after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: unknown) {
      console.error('[UI] Error submitting emergency report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to submit emergency report: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-t-3xl -mt-6 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Page Title (global greeting moved to header) */}
        <div className="text-left mb-4">
          <h1 className="text-2xl font-bold">Emergency Help</h1>
        </div>

        {/* SOS Section */}
        <div className="flex flex-col items-center mb-10 mt-4">
          <p className="text-sm text-gray-600 text-center mb-2">Help is just a click away!</p>
          <p className="text-sm text-gray-600 text-center mb-6">
            Click <span className="text-red-600 font-medium">{sosPlaying ? 'STOP' : 'SOS'} button</span> to {sosPlaying ? 'stop alert' : 'call for help'}.
          </p>
          <div className="relative flex items-center justify-center">
            {/* Pulsing background */}
            <div className={`absolute w-72 h-72 rounded-full bg-red-100/60 animate-ping ${sosPlaying ? 'animation-duration-1000' : ''}`}></div>
            <div className={`absolute w-56 h-56 rounded-full bg-red-100/80 ${sosPlaying ? 'animate-pulse' : ''}`}></div>
            <button
              onClick={onToggleSOS}
              aria-pressed={sosPlaying ? 'true' : 'false'}
              className={`relative w-64 h-64 rounded-full shadow-xl flex items-center justify-center text-2xl font-bold tracking-wide transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 select-none ${
                sosPlaying 
                  ? 'bg-gradient-to-br from-red-700 to-red-500 text-white scale-105' 
                  : 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:scale-105'
              }`}
              title={sosPlaying ? 'Stop SOS Alert' : 'Send SOS Alert'}
            >
              {sosPlaying ? 'STOP' : 'SOS'}
            </button>
          </div>
          {/* Volunteer toggle */}
          <div className="mt-6 flex items-center gap-4 bg-white rounded-full px-4 py-2 shadow-sm border">
            <span className="text-sm font-medium text-gray-700">Volunteer for help</span>
            <button
              onClick={() => setVolunteer(v => !v)}
              role="switch"
              aria-checked={volunteer ? 'true' : 'false'}
              className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${volunteer ? 'bg-red-500 justify-end' : 'bg-gray-300 justify-start'}`}
              title={volunteer ? 'Volunteer mode is ON' : 'Volunteer mode is OFF'}
            >
              <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${volunteer ? 'translate-x-0' : 'translate-x-0'}`}></span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Select Emergency Type</h2>
          {selectedType && (
            <button
              onClick={() => {
                setSelectedType('');
                setSelectedOption('');
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8">
          {emergencyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleEmergencyTypeClick(type.id)}
                className={`flex flex-col items-center p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                  selectedType === type.id ? 'bg-red-50 text-red-500 ring-2 ring-red-200' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                <span className="text-[10px] sm:text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>

        {selectedType && (
          <div className="space-y-4 pb-24 animate-in slide-in-from-bottom-2 duration-300">
            {/* Emergency Type Options */}
            <div className="space-y-2">
              <label className="text-lg font-semibold">Select Specific Type</label>
              <div className="grid grid-cols-2 gap-2">
                {emergencyTypes.find(type => type.id === selectedType)?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedOption === option 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <p className="text-sm font-medium">{option}</p>
                  </button>
                ))}
              </div>
            </div>
            {showLocationInput ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter emergency location..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  autoFocus
                />

                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Quick Locations:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickLocations.map((loc, index) => (
                      <button
                        key={index}
                        onClick={() => setLocation(loc)}
                        className={`p-2 text-xs rounded-lg border transition-colors ${
                          location === loc ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {loc.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleLocationChange(location)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Save Location
                  </button>
                  <button
                    onClick={() => {
                      setShowLocationInput(false)
                      setLocation('Park Street, Kolkata, 700016')
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="text-gray-400 w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                  {location !== 'Park Street, Kolkata, 700016' && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Custom</span>
                  )}
                </div>
                <button
                  onClick={() => setShowLocationInput(true)}
                  className="text-red-500 text-sm font-medium ml-2 flex-shrink-0 hover:text-red-600"
                >
                  Change
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-lg font-semibold">Attach proof</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    {i < images.length ? (
                      <div className="relative w-full h-full">
                        <img src={images[i]} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button className="absolute top-1 right-1 text-xs bg-black bg-opacity-50 text-white px-1.5 py-0.5 rounded">
                          remove
                        </button>
                      </div>
                    ) : (
                      <Camera className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-lg font-semibold">Additional Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the emergency situation in detail..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-red-500"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Mic className="text-gray-400 w-4 h-4" />
                <span className="text-sm">recorded audio</span>
              </div>
              <button className="text-red-500 text-sm font-medium">remove</button>
            </div>

            <button 
              onClick={handleSubmitReport}
              disabled={!selectedOption || isSubmitting}
              className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
                selectedOption && !isSubmitting
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>

            {submitSuccess && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Report Submitted!</h3>
                  <p className="text-gray-600 mb-4">All users have been notified. Emergency services have been alerted.</p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MainApp() {
  const { user, signOut, signUp, signIn, resetPassword } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [incomingSOS, setIncomingSOS] = useState<null | { fromUserId: string; fromUserName: string; location?: string; lat?: number; lng?: number; address?: string | null }>(null);
  // const [lastKnownCoords, setLastKnownCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [lastKnownAddress, setLastKnownAddress] = useState<string | null>(null);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  // Keep refs to avoid effect resubscriptions
  const previousNotificationCountRef = useRef(0);
  const lastNotificationIdsRef = useRef<string[]>([]);
  // Track if we've processed the very first snapshot to avoid playing sound for pre-existing notifications
  const firstNotificationSnapshotRef = useRef(true);
  // Ensure audio element is ready (some mobile browsers need it in DOM first)
  const ensureAudio = () => {
    if (!audioRef.current) {
      const el = new Audio(emergencySiren);
      el.loop = true;
      el.preload = 'auto';
      audioRef.current = el;
    }
  };

  const handleSOSClick = async () => {
    ensureAudio();
    const audio = audioRef.current;
    if (!audio) return;
    if (!isPlaying) {
      // Broadcast SOS immediately; don't depend on audio playback
      (async () => {
        try {
          if (user) {
            const name = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
            // Try to pull a fresh location and resolve address for richer alert
            let coords: { lat: number; lng: number } | null = null;
            try {
              const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }));
              coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            } catch {}
            const address = coords ? await reverseGeocode(coords.lat, coords.lng) : null;
            setLastKnownAddress(address || null);
            const loc = address || 'Live location';
            const delivered = await sendSOSAlertToFriends(user.uid, name, loc, undefined, coords, address);
            console.log(`SOS sent to ${delivered} friend(s).`);
          }
        } catch (e) {
          console.warn('SOS friend broadcast failed (best-effort):', e);
          alert('SOS alert could not be delivered to friends. Check Supabase RLS policies for notifications/friends tables.');
        }
      })();
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Play blocked', err);
        alert('Tap again to enable sound.');
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // MongoDB connection removed - MongoDB cannot run in browser
  // You need a backend server to use MongoDB

  // Removed unused handleSOSClick (siren controls not currently exposed in UI)

  // React to Firebase auth state changes (email/password or Google)
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      setCurrentPage('home');
      if (!hasWelcomed) {
        const name = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
        alert(`Welcome, ${name}!`);
        setHasWelcomed(true);
      }
    } else {
      setIsAuthenticated(false);
      setHasWelcomed(false);
    }
  }, [user]);

  // Listen for unread notifications count
  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      console.log('🔔 Playing notification sound...');
      const audio = new Audio(notificationSound);
      audio.volume = 0.7; // Set volume to 70%
      audio.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
    } catch (error) {
      console.error('Error creating notification audio:', error);
    }
  };

  // (Old Firebase listener removed; implementing Supabase unread notifications listener below.)

  // Unread notifications listener (Supabase)
  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      previousNotificationCountRef.current = 0;
      lastNotificationIdsRef.current = [];
      return;
    }
    const loadUnread = async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.NOTIFICATIONS)
          .select('id')
          .eq('user_id', user.uid)
          .eq('is_read', false);
        
        if (error) { 
          console.warn('Unread notifications fetch error (using fallback):', error); 
          // Use fallback - don't break the app
          setUnreadNotifications(0);
          setSupabaseConnected(false);
          return; 
        }
        
        const ids = (data || []).map(d => d.id as string);
        const count = ids.length;
        const hasNew = ids.some(id => !lastNotificationIdsRef.current.includes(id));
        const isFirst = firstNotificationSnapshotRef.current;
        
        if (!isFirst && (hasNew || previousNotificationCountRef.current !== count)) {
          playNotificationSound();
        }
        
        if (isFirst) firstNotificationSnapshotRef.current = false;
        setUnreadNotifications(count);
        lastNotificationIdsRef.current = ids;
        previousNotificationCountRef.current = count;
        setSupabaseConnected(true); // Connection is working
      } catch (error) {
        console.warn('Failed to load notifications (network issue):', error);
        // Graceful fallback - app continues to work
        setUnreadNotifications(0);
        setSupabaseConnected(false);
      }
    };
    loadUnread();
    
    let channel: any = null;
    try {
      channel = supabase.channel('unread_notifications_' + user.uid)
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.NOTIFICATIONS, filter: `user_id=eq.${user.uid}` }, async (payload) => {
          // If a new emergency alert arrives, display SOS banner and play siren
          try {
            const row: any = payload.new;
            if (row && row.type === 'emergency' && (row.action_type === 'emergency_alert' || row.emergency_type === 'sos')) {
              const fromUserName = row.action_data?.fromUserName || 'A friend';
              const fromUserId = row.action_data?.fromUserId || '';
              setIncomingSOS({ fromUserId, fromUserName, location: row.location || undefined, lat: row.action_data?.lat, lng: row.action_data?.lng, address: row.action_data?.address ?? null });
              ensureAudio();
              const el = audioRef.current;
              if (el) {
                try { await el.play(); } catch { /* ignore */ }
              }
            }
          } catch (error) {
            console.warn('Error processing notification:', error);
          }
          await loadUnread();
        })
        .subscribe();
    } catch (error) {
      console.warn('Failed to subscribe to notifications (offline mode):', error);
    }
    
    return () => { 
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('Error removing channel:', error);
        }
      }
    };
  }, [user]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setIsAuthenticated(true);
      setCurrentPage('home');
      setError(null);
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please check your credentials and try again.');
    }
  };

  const handleSignup = async (name: string, email: string, phone: string, password: string) => {
    try {
      await signUp(name, email, phone, password);
      // Don't set authenticated yet - user needs to verify email
      setCurrentPage('login');
      alert('Please check your email to verify your account before logging in.');
      setError(null);
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to sign up. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setCurrentPage('login');
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  // Show error message if present
  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  // Removed the authentication check here to allow direct access to home page
  const renderPage = () => {
    if (!isAuthenticated && (currentPage === 'login' || currentPage === 'signup')) {
      return currentPage === 'login' ? (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToSignup={() => setCurrentPage('signup')}
          onForgotPassword={async (email) => {
            try { await resetPassword(email); alert('Password reset email sent.'); }
            catch { alert('Failed to send reset email.'); }
          }}
        />
      ) : (
        <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setCurrentPage('login')} />
      );
    }
    switch (currentPage) {
      case 'prediction': return <PredictionPage />;
      case 'detection': return <DetectionTrackerPage />;
      case 'firstaid': return <QuickFirstAidPage onOpen={(key) => setCurrentPage(key)} />;
      case 'call': return <CallEmergencyPage onBack={() => setCurrentPage('firstaid')} />;
      case 'video': return <VideoGuidePage onBack={() => setCurrentPage('firstaid')} />;
      case 'manual': return <ManualPage onBack={() => setCurrentPage('firstaid')} />;
      case 'tips': return <TipsPage onBack={() => setCurrentPage('firstaid')} />;
      case 'tourism': return <TourismPage onBack={() => setCurrentPage('home')} />;
      case 'profile': 
        return <ProfilePage onLogout={handleLogout} onOpenFriends={() => setCurrentPage('friends')} />;
      case 'friends': 
        return <FriendsPage onBack={() => setCurrentPage('profile')} />;
      case 'notifications': 
        return (
          <NotificationsPage
            onBack={() => setCurrentPage('home')}
            onUnreadDelta={(delta) => setUnreadNotifications(prev => Math.max(0, prev + delta))}
          />
        );
      default: 
        return <EmergencyReport onToggleSOS={handleSOSClick} sosPlaying={isPlaying} />;
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hidden/inline audio element improves reliability on iOS & some Android browsers */}
      <audio
        ref={audioRef}
        src={emergencySiren}
        loop
        preload="auto"
        // style hidden but keep in DOM
        className="hidden"
      />
      {/* Top: greeting left, notifications right (hidden on Profile page) */}
      {currentPage !== 'profile' && (
        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">Hey, {user ? (user.displayName || (user.email ? user.email.split('@')[0] : 'User')) : 'Guest'}!</div>
          <div className="flex items-center gap-2">
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                isOnline && supabaseConnected ? 'bg-green-500' : 
                isOnline ? 'bg-orange-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs ${
                isOnline && supabaseConnected ? 'text-green-600' : 
                isOnline ? 'text-orange-600' : 'text-red-600'
              }`}>
                {isOnline && supabaseConnected ? 'Online' : 
                 isOnline ? 'Limited' : 'Offline'}
              </span>
            </div>
            
            {isAuthenticated ? (
              <button onClick={() => setCurrentPage('notifications')} className="relative p-2 rounded-full hover:bg-gray-100" aria-label="Notifications">
                <Bell className="w-5 h-5 text-gray-700" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">{unreadNotifications}</span>
                )}
              </button>
            ) : (
              <button onClick={() => setCurrentPage('login')} className="text-red-500 text-sm font-medium">Login</button>
            )}
          </div>
        </div>
      )}
      {renderPage()}

      {/* Incoming SOS banner */}
      {incomingSOS && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 text-center">
            <div className="text-red-600 font-bold text-2xl mb-2">EMERGENCY SOS</div>
            <div className="text-gray-800 mb-1">Alert from: <span className="font-semibold">{incomingSOS.fromUserName}</span></div>
            {incomingSOS.location && <div className="text-gray-600 mb-3">Location: {incomingSOS.location}</div>}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button
                onClick={() => {
                  // Navigate to Detection Tracker and stop siren
                  const el = audioRef.current; if (el) { el.pause(); el.currentTime = 0; }
                  setIsPlaying(false);
                  // Show address popup before redirect
                  const addressText = incomingSOS?.address || lastKnownAddress || incomingSOS?.location || 'Live location';
                  alert(`Here is the address of user:\n${addressText}`);
                  setIncomingSOS(null);
                  setCurrentPage('detection');
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Live Location
              </button>
              <button
                onClick={() => {
                  // Stop local siren but keep banner until dismissed
                  const el = audioRef.current; if (el) { el.pause(); el.currentTime = 0; }
                  setIsPlaying(false);
                }}
                className="px-4 py-2 rounded-lg border text-red-600 border-red-200 hover:bg-red-50"
              >
                Mute Siren
              </button>
              <button
                onClick={() => {
                  // Stop siren and dismiss banner
                  const el = audioRef.current; if (el) { el.pause(); el.currentTime = 0; }
                  setIsPlaying(false);
                  setIncomingSOS(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed right-4 bottom-24 bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600 transition-all duration-300 z-50"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl">
        <div className="relative">
          {/* Gradient overlay for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-white to-blue-50 opacity-30"></div>
          
          <div className="relative flex justify-around items-center py-2 px-1">
            {/* Prediction Button */}
            <button 
              className={`group relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                currentPage === 'prediction' 
                ? 'text-red-600 bg-red-50 shadow-md' 
                : 'text-gray-500 hover:text-red-500 hover:bg-red-50/50'
              }`}
              onClick={() => setCurrentPage('prediction')}
              title="Health Prediction & Analysis"
            >
              <div className={`p-1 rounded-lg transition-all duration-300 ${
                currentPage === 'prediction' ? 'bg-red-100' : 'group-hover:bg-red-100/60'
              }`}>
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className={`text-[9px] mt-1 font-medium transition-all duration-300 ${
                currentPage === 'prediction' ? 'text-red-700' : 'text-gray-600 group-hover:text-red-600'
              }`}>
                Prediction
              </span>
              {currentPage === 'prediction' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
              )}
            </button>

            {/* First Aid Button */}
            <button 
              className={`group relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                currentPage === 'firstaid' 
                ? 'text-green-600 bg-green-50 shadow-md' 
                : 'text-gray-500 hover:text-green-500 hover:bg-green-50/50'
              }`}
              onClick={() => setCurrentPage('firstaid')}
              title="Emergency First Aid Guide"
            >
              <div className={`p-1 rounded-lg transition-all duration-300 ${
                currentPage === 'firstaid' ? 'bg-green-100' : 'group-hover:bg-green-100/60'
              }`}>
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className={`text-[9px] mt-1 font-medium transition-all duration-300 ${
                currentPage === 'firstaid' ? 'text-green-700' : 'text-gray-600 group-hover:text-green-600'
              }`}>
                First Aid
              </span>
              {currentPage === 'firstaid' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
              )}
            </button>

            {/* Home Button - Special Centered Design */}
            <button 
              className={`group relative flex flex-col items-center p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                currentPage === 'home' 
                ? 'text-white bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-200' 
                : 'text-gray-500 hover:text-red-500 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:shadow-md'
              }`}
              onClick={() => setCurrentPage('home')}
              title="Emergency Home Dashboard"
            >
              <div className={`transition-all duration-300 ${
                currentPage === 'home' ? 'drop-shadow-sm' : 'group-hover:drop-shadow-sm'
              }`}>
                <Home className="w-6 h-6" />
              </div>
              <span className={`text-[9px] mt-1 font-bold transition-all duration-300 ${
                currentPage === 'home' ? 'text-white' : 'text-gray-600 group-hover:text-red-600'
              }`}>
                Home
              </span>
              {currentPage === 'home' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-white rounded-full shadow-sm"></div>
              )}
            </button>

            {/* Tourism Button */}
            <button 
              className={`group relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                currentPage === 'tourism' 
                ? 'text-blue-600 bg-blue-50 shadow-md' 
                : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50/50'
              }`}
              onClick={() => setCurrentPage('tourism')}
              title="Smart Tourism & Travel Guide"
            >
              <div className={`p-1 rounded-lg transition-all duration-300 ${
                currentPage === 'tourism' ? 'bg-blue-100' : 'group-hover:bg-blue-100/60'
              }`}>
                <Compass className="w-5 h-5" />
              </div>
              <span className={`text-[9px] mt-1 font-medium transition-all duration-300 ${
                currentPage === 'tourism' ? 'text-blue-700' : 'text-gray-600 group-hover:text-blue-600'
              }`}>
                Tourism
              </span>
              {currentPage === 'tourism' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
              )}
            </button>

            {/* Detection Button */}
            <button 
              className={`group relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                currentPage === 'detection' 
                ? 'text-purple-600 bg-purple-50 shadow-md' 
                : 'text-gray-500 hover:text-purple-500 hover:bg-purple-50/50'
              }`}
              onClick={() => setCurrentPage('detection')}
              title="Real-time Detection & Monitoring"
            >
              <div className={`p-1 rounded-lg transition-all duration-300 ${
                currentPage === 'detection' ? 'bg-purple-100' : 'group-hover:bg-purple-100/60'
              }`}>
                <Activity className="w-5 h-5" />
              </div>
              <span className={`text-[9px] mt-1 font-medium transition-all duration-300 ${
                currentPage === 'detection' ? 'text-purple-700' : 'text-gray-600 group-hover:text-purple-600'
              }`}>
                Detection
              </span>
              {currentPage === 'detection' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
              )}
            </button>

            {/* Profile Button */}
            <button 
              className={`group relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                currentPage === 'profile' 
                ? 'text-orange-600 bg-orange-50 shadow-md' 
                : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50/50'
              }`}
              onClick={() => setCurrentPage(isAuthenticated ? 'profile' : 'login')}
              title={isAuthenticated ? "User Profile & Settings" : "Login to Account"}
            >
              <div className={`p-1 rounded-lg transition-all duration-300 relative ${
                currentPage === 'profile' ? 'bg-orange-100' : 'group-hover:bg-orange-100/60'
              }`}>
                <UserCircle className="w-5 h-5" />
                {!isAuthenticated && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                )}
              </div>
              <span className={`text-[9px] mt-1 font-medium transition-all duration-300 ${
                currentPage === 'profile' ? 'text-orange-700' : 'text-gray-600 group-hover:text-orange-600'
              }`}>
                Profile
              </span>
              {currentPage === 'profile' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      {showSplash ? <SplashScreen /> : <MainApp />}
    </AuthProvider>
  );
}

export default App;