import { useState, useEffect, useRef } from 'react';
import emergencySiren from './assets/dirty-siren-40635.mp3';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
  onerror: () => void;
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

import { Bell, Home, Stethoscope, Activity, UserCircle, Phone, MessageCircle, X, Send, HeartPulse, MapPin, Camera, Mic } from 'lucide-react';
import { PredictionPage } from './pages/prediction';
import { DetectionTrackerPage } from './pages/detection-tracker';
import { QuickFirstAidPage } from './pages/quick-first-aid';
import { CallEmergencyPage, ManualPage, TipsPage, VideoGuidePage } from './pages/quick-actions';
import { ProfilePage } from './pages/profile';
import { FriendsPage } from './pages/friends';
import { LoginPage } from './pages/login';
import { SignupPage } from './pages/signup';

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
  const [messages, setMessages] = useState([
    { text: "Hello! I'm here to help you with emergency-related questions.", type: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { text: input, type: 'user' }]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "I understand you need help. Please click the SOS button for immediate emergency assistance, or let me know what specific information you need.",
        type: 'bot'
      }]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 max-w-[calc(100vw-2rem)]">
      <div className="bg-red-500 p-4 flex justify-between items-center">
        <h3 className="text-white font-semibold">Emergency Assistant</h3>
        <button onClick={onClose} className="text-white hover:text-red-100">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.type === 'user' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-red-500"
        />
        <button
          onClick={toggleListening}
          className={`p-2 rounded-full ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Mic className="w-5 h-5" />
        </button>
        <button
          onClick={handleSend}
          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function EmergencyReport() {
  const [selectedType, setSelectedType] = useState('');
  const [location] = useState('Kothrud, Pune, 411038');
  const [images] = useState<string[]>([]);

  const emergencyTypes = [
    { id: 'accident', label: 'Accident', icon: Activity },
    { id: 'fire', label: 'Fire', icon: Bell },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'flood', label: 'Flood', icon: Activity },
    { id: 'quake', label: 'Quake', icon: Activity },
    { id: 'robbery', label: 'Robbery', icon: Bell },
    { id: 'assault', label: 'Assault', icon: Bell },
    { id: 'other', label: 'Other', icon: Bell },
  ];

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-t-3xl -mt-6 min-h-screen">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Select Emergency type</h2>
        
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8">
          {emergencyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex flex-col items-center p-2 sm:p-3 rounded-lg ${
                  selectedType === type.id ? 'bg-red-50 text-red-500' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                <span className="text-[10px] sm:text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>

        {selectedType && (
          <div className="space-y-4 pb-24">
            <div className="p-3 border border-red-500 rounded-lg">
              <p className="text-gray-700">Stuck in elevator</p>
            </div>

            <div className="space-y-2">
              <label className="text-lg font-semibold">Location</label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="text-gray-400 w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
                <button className="text-red-500 text-sm font-medium ml-2 flex-shrink-0">Change</button>
              </div>
            </div>

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

            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Mic className="text-gray-400 w-4 h-4" />
                <span className="text-sm">recorded audio</span>
              </div>
              <button className="text-red-500 text-sm font-medium">remove</button>
            </div>

            <button className="w-full bg-red-500 text-white py-3 rounded-lg font-medium text-sm">
              Submit Report
            </button>
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  useEffect(() => {
    // Create audio element for emergency sound
    audioRef.current = new Audio(emergencySiren);
    audioRef.current.loop = true;
  }, []);

  const handleSOSClick = () => {
    if (!audioRef.current) return;

    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

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
    // Show login/signup pages only when explicitly navigating to them
    if (!isAuthenticated && (currentPage === 'login' || currentPage === 'signup')) {
      if (currentPage === 'login') {
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onSwitchToSignup={() => setCurrentPage('signup')}
            onForgotPassword={async (email) => {
              try {
                await resetPassword(email);
                alert('Password reset email sent. Please check your inbox.');
              } catch (e) {
                console.error(e);
                alert('Failed to send reset email. Please try again.');
              }
            }} 
          />
        );
      } else {
        return (
          <SignupPage 
            onSignup={handleSignup} 
            onSwitchToLogin={() => setCurrentPage('login')} 
          />
        );
      }
    }

    switch (currentPage) {
      case 'prediction':
        return <PredictionPage />;
      case 'detection':
        return <DetectionTrackerPage />;
      case 'firstaid':
        return <QuickFirstAidPage onOpen={(key) => {
          if (key === 'call') setCurrentPage('call');
          if (key === 'video') setCurrentPage('video');
          if (key === 'manual') setCurrentPage('manual');
          if (key === 'tips') setCurrentPage('tips');
        }} />;
      case 'call':
        return <CallEmergencyPage onBack={() => setCurrentPage('firstaid')} />
      case 'video':
        return <VideoGuidePage onBack={() => setCurrentPage('firstaid')} />
      case 'manual':
        return <ManualPage onBack={() => setCurrentPage('firstaid')} />
      case 'tips':
        return <TipsPage onBack={() => setCurrentPage('firstaid')} />
      case 'profile':
        return isAuthenticated ? (
          <ProfilePage onLogout={handleLogout} onOpenFriends={() => setCurrentPage('friends')} />
        ) : (
          <LoginPage 
            onLogin={handleLogin} 
            onSwitchToSignup={() => setCurrentPage('signup')} 
          />
        );
      case 'friends':
        return <FriendsPage onBack={() => setCurrentPage('profile')} />
      default:
        return (
          <div className="flex flex-col min-h-screen">
            <div className="p-4 flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Hey, {isAuthenticated ? `${user?.displayName || (user?.email ? user.email.split('@')[0] : 'User')}!` : 'Guest!'}</p>
                <h1 className="text-xl font-bold">Emergency Help</h1>
              </div>
              {!isAuthenticated && (
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="text-red-500 font-medium text-sm"
                >
                  Login
                </button>
              )}
              {isAuthenticated && <Bell className="w-5 h-5 text-red-500" />}
            </div>

            <div className="px-4 py-6 flex flex-col items-center">
              <p className="text-gray-600 text-center text-sm mb-2">
                Help is just a click away!
              </p>
              <p className="text-gray-600 text-center text-sm mb-6">
                Click <span className="text-red-500 font-semibold">SOS button</span> to call for help.
              </p>

              <button 
                onClick={handleSOSClick}
                className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full ${
                  isPlaying ? 'bg-red-600' : 'bg-red-500'
                } text-white font-bold text-xl shadow-lg hover:bg-red-600 transition-all duration-300 relative`}
              >
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <span className="relative z-10">{isPlaying ? 'STOP' : 'SOS'}</span>
              </button>

              <div className="mt-8 w-full max-w-sm p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">Volunteer for help</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              </div>
            </div>

            <EmergencyReport />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {renderPage()}

      {/* Chatbot Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed right-4 bottom-24 bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600 transition-all duration-300 z-50"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3">
        <div className="flex justify-around items-center">
          <div 
            className={`flex flex-col items-center ${currentPage === 'prediction' ? 'text-red-500' : 'text-gray-400'} transition-colors duration-200`}
            onClick={() => setCurrentPage('prediction')}
          >
            <HeartPulse className="w-5 h-5 cursor-pointer" />
            <span className="text-[10px] mt-1">Prediction</span>
          </div>
          <div 
            className={`flex flex-col items-center ${currentPage === 'firstaid' ? 'text-red-500' : 'text-gray-400'} transition-colors duration-200`}
            onClick={() => setCurrentPage('firstaid')}
          >
            <Stethoscope className="w-5 h-5 cursor-pointer" />
            <span className="text-[10px] mt-1">Quick First Aid</span>
          </div>
          <div 
            className={`flex flex-col items-center ${currentPage === 'home' ? 'text-red-500' : 'text-gray-400'} transition-colors duration-200`}
            onClick={() => setCurrentPage('home')}
          >
            <Home className="w-5 h-5 cursor-pointer" />
            <span className="text-[10px] mt-1">Home</span>
          </div>
          <div 
            className={`flex flex-col items-center ${currentPage === 'detection' ? 'text-red-500' : 'text-gray-400'} transition-colors duration-200`}
            onClick={() => setCurrentPage('detection')}
          >
            <Activity className="w-5 h-5 cursor-pointer" />
            <span className="text-[10px] mt-1">Detection Tracker</span>
          </div>
          <div 
            className={`flex flex-col items-center ${currentPage === 'profile' ? 'text-red-500' : 'text-gray-400'} transition-colors duration-200`}
            onClick={() => setCurrentPage(isAuthenticated ? 'profile' : 'login')}
          >
            <UserCircle className="w-5 h-5 cursor-pointer" />
            <span className="text-[10px] mt-1">Profile</span>
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