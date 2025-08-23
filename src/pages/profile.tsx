import React, { useState, useEffect } from 'react';
import { 
  Settings, Bell, Shield, Heart, Clock, MapPin, Phone, Mail, ChevronRight, 
  Award, Users, Smartphone, Activity, Home, Building, Plus, Trash2, Battery, 
  Search, X, Watch, Monitor, Tablet, Save 
} from 'lucide-react';
import { LocationPicker } from '../components/LocationPicker';
import { useAuth } from '../contexts/AuthContext';
import { getUserFriends } from '../lib/friendUtils';

interface ProfilePageProps {
  onLogout: () => void;
  onOpenFriends: () => void;
}

interface Device {
  id: string;
  name: string;
  type: 'Smartphone' | 'Wearable' | 'IoT Device' | 'Tablet' | 'Computer';
  status: 'Connected' | 'Disconnected' | 'Pairing' | 'Available';
  battery?: string;
  lastSeen?: string;
  macAddress?: string;
  signalStrength?: number;
}

interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

interface SavedLocation {
  id: number;
  name: string;
  address: string;
  type: 'Residence' | 'Office' | 'Recreation' | 'Other';
}

export function ProfilePage({ onLogout, onOpenFriends }: ProfilePageProps) {
  const { user } = useAuth();
  const [friendCount, setFriendCount] = useState(0);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showDeviceDiscovery, setShowDeviceDiscovery] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [pairingDevice, setPairingDevice] = useState<Device | null>(null);
  
  // Emergency Contact Form States
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContact, setNewContact] = useState<{
    name: string;
    phone: string;
    relationship: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
  }>({
    name: '',
    phone: '',
    relationship: '',
    priority: 'Medium'
  });
  
  // Location Form States
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [newLocation, setNewLocation] = useState<{
    name: string;
    address: string;
    type: 'Residence' | 'Office' | 'Recreation' | 'Other';
  }>({
    name: '',
    address: '',
    type: 'Residence'
  });
  
  // Share It style connection states
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [isScanningForUsers, setIsScanningForUsers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string; name: string; distance: string}>>([]);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  
  const displayName = user?.displayName || 'User';
  const emailAddress = user?.email || 'user@example.com';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  // Load friend count
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = getUserFriends(user.uid, (friends) => {
      setFriendCount(friends.length);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  const userStats = [
    { icon: Heart, label: 'Lives Saved', value: '5' },
    { icon: Clock, label: 'Response Time', value: '3m' },
    { icon: Users, label: 'Friends', value: friendCount.toString() }
  ];

  const emergencyStats = [
    { icon: Activity, label: 'Emergencies Responded', value: '12', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { icon: Clock, label: 'Avg Response Time', value: '2.3m', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: Heart, label: 'Community Impact', value: '8.5', color: 'text-red-600', bgColor: 'bg-red-50' }
  ];

  const detailedStats = [
    { label: 'Response Rate', value: 94, color: 'bg-purple-500', unit: '%', maxValue: 100 },
    { label: 'Community Rating', value: 4.8, color: 'bg-yellow-500', unit: '/5', maxValue: 5 },
    { label: 'Success Rate', value: 98, color: 'bg-green-500', unit: '%', maxValue: 100 },
    { label: 'Volunteer Hours', value: 156, color: 'bg-blue-500', unit: 'hrs', maxValue: 200 }
  ];

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: 1, name: 'John Doe', phone: '+1 234 567 8901', relationship: 'Family', priority: 'High' },
    { id: 2, name: 'Jane Smith', phone: '+1 234 567 8902', relationship: 'Friend', priority: 'Medium' },
    { id: 3, name: 'Dr. Mike Johnson', phone: '+1 234 567 8903', relationship: 'Doctor', priority: 'High' },
    { id: 4, name: 'Emergency Services', phone: '911', relationship: 'Emergency', priority: 'Critical' }
  ]);

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    { id: 1, name: 'Home', address: '123 Main St, City, State', type: 'Residence' },
    { id: 2, name: 'Work', address: '456 Business Ave, City, State', type: 'Office' },
    { id: 3, name: 'Gym', address: '789 Fitness Blvd, City, State', type: 'Recreation' }
  ]);

  const connectedDevices: Device[] = [
    { id: '1', name: 'iPhone 15', type: 'Smartphone', status: 'Connected', battery: '85%', lastSeen: '2 min ago' },
    { id: '2', name: 'Apple Watch', type: 'Wearable', status: 'Connected', battery: '72%', lastSeen: '1 min ago' },
    { id: '3', name: 'Smart Home Hub', type: 'IoT Device', status: 'Connected', battery: 'N/A', lastSeen: '5 min ago' }
  ];

  // Simulated available devices for discovery
  const discoverableDevices: Device[] = [
    { id: '4', name: 'Samsung Galaxy S24', type: 'Smartphone', status: 'Available', macAddress: 'AA:BB:CC:DD:EE:FF', signalStrength: 85 },
    { id: '5', name: 'Fitbit Sense', type: 'Wearable', status: 'Available', macAddress: '11:22:33:44:55:66', signalStrength: 72 },
    { id: '6', name: 'iPad Pro', type: 'Tablet', status: 'Available', macAddress: 'AA:11:BB:22:CC:33', signalStrength: 91 },
    { id: '7', name: 'MacBook Pro', type: 'Computer', status: 'Available', macAddress: 'DD:44:EE:55:FF:66', signalStrength: 78 },
    { id: '8', name: 'Google Pixel Watch', type: 'Wearable', status: 'Available', macAddress: '77:88:99:AA:BB:CC', signalStrength: 65 }
  ];

  const menuItems = [
    { icon: Bell, label: 'Notifications', badge: '3' },
    { icon: Shield, label: 'Emergency Contacts', badge: '4' },
    { icon: MapPin, label: 'Saved Locations', badge: '3' },
    { icon: Smartphone, label: 'Connected Devices', badge: '3' },
    { icon: Activity, label: 'Emergency Statistics', badge: 'New' },
    { icon: Settings, label: 'Settings' }
  ];

  // Device discovery functions
  const startDeviceScan = () => {
    setIsScanning(true);
    setAvailableDevices([]);
    
    // Simulate device discovery
    setTimeout(() => {
      setAvailableDevices(discoverableDevices);
      setIsScanning(false);
    }, 3000);
  };

  const stopDeviceScan = () => {
    setIsScanning(false);
  };

  const pairDevice = async (device: Device) => {
    setPairingDevice(device);
    
    // Simulate pairing process
    setTimeout(() => {
      setPairingDevice(null);
      setShowDeviceDiscovery(false);
      alert(`${device.name} has been successfully connected!`);
    }, 2000);
  };

  const disconnectDevice = () => {
    if (confirm('Are you sure you want to disconnect this device?')) {
      alert('Device disconnected successfully');
    }
  };

  // Share It style connection functions
  const startDiscovery = () => {
    setIsDiscoverable(true);
    setShowConnectionModal(true);
    alert('You are now discoverable! Other users can find and connect to you.');
  };

  const stopDiscovery = () => {
    setIsDiscoverable(false);
    setShowConnectionModal(false);
    alert('You are no longer discoverable.');
  };

  const scanForUsers = () => {
    setIsScanningForUsers(true);
    setAvailableUsers([]);
    
    // Simulate scanning for nearby users
    setTimeout(() => {
      const mockUsers = [
        { id: '1', name: 'John Smith', distance: '2m away' },
        { id: '2', name: 'Sarah Johnson', distance: '5m away' },
        { id: '3', name: 'Mike Wilson', distance: '8m away' }
      ];
      setAvailableUsers(mockUsers);
      setIsScanningForUsers(false);
      setShowConnectionModal(true);
    }, 3000);
  };

  const connectToUser = (userId: string, userName: string) => {
    alert(`Connecting to ${userName}...`);
    // Simulate connection process
    setTimeout(() => {
      // Add the connected user to emergency contacts
      const newContact: EmergencyContact = {
        id: Date.now(),
        name: userName,
        phone: `+1 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`, // Generate random phone number
        relationship: 'Connected User',
        priority: 'Medium'
      };
      
      setEmergencyContacts(prev => [...prev, newContact]);
      alert(`Successfully connected to ${userName}! They have been added to your emergency contacts.`);
      setShowConnectionModal(false);
      setAvailableUsers([]);
    }, 2000);
  };

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-green-600" />;
      case 'Wearable':
        return <Watch className="w-5 h-5 text-green-600" />;
      case 'Tablet':
        return <Tablet className="w-5 h-5 text-green-600" />;
      case 'Computer':
        return <Monitor className="w-5 h-5 text-green-600" />;
      default:
        return <Smartphone className="w-5 h-5 text-green-600" />;
    }
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-500';
    if (strength >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Emergency Contact Functions
  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim() || !newContact.relationship.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now(),
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      relationship: newContact.relationship.trim(),
      priority: newContact.priority
    };

    setEmergencyContacts(prev => [...prev, contact]);
    setNewContact({ name: '', phone: '', relationship: '', priority: 'Medium' });
    setShowAddContactForm(false);
    alert('Emergency contact added successfully!');
  };

  const handleDeleteContact = (id: number) => {
    if (confirm('Are you sure you want to delete this emergency contact?')) {
      setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
      alert('Emergency contact deleted successfully!');
    }
  };

  // Location Functions
  const handleAddLocation = () => {
    if (!newLocation.name.trim() || !newLocation.address.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const location: SavedLocation = {
      id: Date.now(),
      name: newLocation.name.trim(),
      address: newLocation.address.trim(),
      type: newLocation.type
    };

    setSavedLocations(prev => [...prev, location]);
    setNewLocation({ name: '', address: '', type: 'Residence' });
    setShowAddLocationForm(false);
    alert('Location added successfully!');
  };

  const handleDeleteLocation = (id: number) => {
    if (confirm('Are you sure you want to delete this location?')) {
      setSavedLocations(prev => prev.filter(location => location.id !== id));
      alert('Location deleted successfully!');
    }
  };

  // Handle location selection from map
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    // Extract a name from the address (first part before comma)
    const name = location.address.split(',')[0].trim();
    
    setNewLocation({
      name: name,
      address: location.address,
      type: 'Residence' as const
    });
    
    setShowLocationPicker(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile Header with gradient and top Friends button */}
      <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-red-100 text-sm">Manage your information</p>
          </div>
          <button
            onClick={onOpenFriends}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors backdrop-blur px-3 py-2 rounded-lg"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Friends</span>
            {friendCount > 0 && (
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {friendCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center mt-6">
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
            <span className="text-2xl font-bold">{initials}</span>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <p className="text-red-100">{emailAddress}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-white/20 text-white text-xs rounded-full">
              Active Volunteer
            </span>
          </div>
        </div>
      </div>

      {/* Contact card */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <Phone className="w-4 h-4 mr-2 text-red-500" />
              <span>+1 234 567 8900</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Mail className="w-4 h-4 mr-2 text-red-500" />
              <span>{emailAddress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {userStats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl text-center shadow-sm border">
            <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-red-50 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

       

      {/* Enhanced Emergency Contacts */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Emergency Contacts</h2>
          <button
            onClick={() => setShowEmergencyContacts(!showEmergencyContacts)}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            {showEmergencyContacts ? 'Hide' : 'Manage'}
          </button>
        </div>
        <div className="bg-white rounded-xl p-4">
          {!showEmergencyContacts ? (
            <button 
              onClick={() => setShowEmergencyContacts(!showEmergencyContacts)}
              className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium">{emergencyContacts.length} Emergency Contacts</div>
                  <div className="text-sm text-gray-500">Tap to manage your contacts</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ) : (
            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.phone}</div>
                      <div className="text-xs text-gray-400">{contact.relationship}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      contact.priority === 'Critical' ? 'bg-red-100 text-red-600' :
                      contact.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                      contact.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {contact.priority}
                    </span>
                    <button 
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setShowAddContactForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-300 hover:text-red-500"
              >
                <Plus className="w-4 h-4" />
                Add Emergency Contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Saved Locations */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Saved Locations</h2>
          <button
            onClick={() => setShowLocations(!showLocations)}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            {showLocations ? 'Hide' : 'Manage'}
          </button>
        </div>
        <div className="bg-white rounded-xl p-4">
          {!showLocations ? (
            <button 
              onClick={() => setShowLocations(!showLocations)}
              className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{savedLocations.length} Saved Locations</div>
                  <div className="text-sm text-gray-500">Tap to manage your locations</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ) : (
            <div className="space-y-3">
              {savedLocations.map((location) => (
                <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {location.type === 'Residence' ? <Home className="w-5 h-5 text-blue-600" /> :
                       location.type === 'Office' ? <Building className="w-5 h-5 text-blue-600" /> :
                       <MapPin className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-gray-500">{location.address}</div>
                      <div className="text-xs text-gray-400">{location.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDeleteLocation(location.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setShowAddLocationForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-300 hover:text-red-500"
              >
                <Plus className="w-4 h-4" />
                Add New Location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connected Devices */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Connected Devices</h2>
          <button
            onClick={() => setShowDevices(!showDevices)}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            {showDevices ? 'Hide' : 'Manage'}
          </button>
        </div>
        <div className="bg-white rounded-xl p-4">
          {!showDevices ? (
            <button 
              onClick={() => setShowDevices(!showDevices)}
              className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">{connectedDevices.length} Connected Devices</div>
                  <div className="text-sm text-gray-500">Tap to manage your devices</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ) : (
            <div className="space-y-3">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-gray-500">{device.type}</div>
                      <div className="text-xs text-gray-400">Last seen: {device.lastSeen}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">
                      {device.status}
                    </span>
                    {device.battery !== 'N/A' && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Battery className="w-3 h-3" />
                        {device.battery}
                      </div>
                    )}
                                         <button 
                       onClick={() => disconnectDevice()}
                       className="p-1 text-gray-400 hover:text-red-500"
                       title="Disconnect device"
                     >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setShowDeviceDiscovery(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-300 hover:text-red-500"
              >
                <Plus className="w-4 h-4" />
                Connect New Device
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Emergency Contact Modal */}
      {showAddContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Emergency Contact</h3>
              <button 
                onClick={() => setShowAddContactForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter contact name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
                <input
                  type="text"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="e.g., Family, Friend, Doctor"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                 <select
                   value={newContact.priority}
                   onChange={(e) => setNewContact(prev => ({ ...prev, priority: e.target.value as 'Critical' | 'High' | 'Medium' | 'Low' }))}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                   title="Select priority level"
                 >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddContactForm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddLocationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add New Location</h3>
              <button 
                onClick={() => setShowAddLocationForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Name *</label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Home, Work, Gym"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  value={newLocation.address}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter full address"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Type</label>
                                 <select
                   value={newLocation.type}
                   onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value as 'Residence' | 'Office' | 'Recreation' | 'Other' }))}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                   title="Select location type"
                 >
                  <option value="Residence">Residence</option>
                  <option value="Office">Office</option>
                  <option value="Recreation">Recreation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowAddLocationForm(false)}
                  className="py-2.5 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowLocationPicker(true)}
                  className="flex-1 py-2.5 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  Add through map
                </button>
                <button
                  onClick={handleAddLocation}
                  className="py-2.5 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  Add Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Discovery Modal */}
      {showDeviceDiscovery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Connect New Device</h3>
              <button 
                onClick={() => setShowDeviceDiscovery(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Close device discovery"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Scan Controls */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Available Devices</h4>
                  <p className="text-sm text-gray-500">Nearby devices ready to connect</p>
                </div>
                {isScanning ? (
                  <button 
                    onClick={stopDeviceScan}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
                  >
                    Stop Scan
                  </button>
                ) : (
                  <button 
                    onClick={startDeviceScan}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
                  >
                    Start Scan
                  </button>
                )}
              </div>

              {/* Scanning Indicator */}
              {isScanning && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Scanning for devices...</p>
                  </div>
                </div>
              )}

              {/* Available Devices */}
              {!isScanning && availableDevices.length > 0 && (
                <div className="space-y-2">
                  {availableDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-gray-500">{device.type}</div>
                          <div className="text-xs text-gray-400">{device.macAddress}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xs ${getSignalStrengthColor(device.signalStrength || 0)}`}>
                          {device.signalStrength}%
                        </div>
                        <button 
                          onClick={() => pairDevice(device)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Devices Found */}
              {!isScanning && availableDevices.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No devices found</p>
                  <p className="text-sm text-gray-400">Make sure your device is discoverable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pairing Modal */}
      {pairingDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Connecting to {pairingDevice.name}</h3>
            <p className="text-gray-500">Please wait while we establish the connection...</p>
          </div>
        </div>
      )}

      {/* Emergency Statistics */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Emergency Statistics</h2>
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            {showStats ? 'Hide' : 'View'}
          </button>
        </div>
        <div className="bg-white rounded-xl p-4">
          {!showStats ? (
            <button 
              onClick={() => setShowStats(!showStats)}
              className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Emergency Response Stats</div>
                  <div className="text-sm text-gray-500">Tap to view detailed statistics</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ) : (
            <div className="space-y-6">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {emergencyStats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Detailed Progress Bars */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Performance Metrics</h4>
                {detailedStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{stat.label}</span>
                      <span className="font-medium">{stat.value}{stat.unit}</span>
                    </div>
                                         <div className="w-full bg-gray-200 rounded-full h-2">
                       <div 
                         className={`${stat.color} h-2 rounded-full transition-all duration-500`} 
                         style={{ width: `${(stat.value / stat.maxValue) * 100}%` }}
                       ></div>
                     </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Responded to emergency call - 2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Completed first aid training - 1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Helped community member - 3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

                     {/* Emergency Contact Connect Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Emergency Contact Connect</h2>
          <button
            onClick={onOpenFriends}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            View All
          </button>
        </div>
         
         {/* Quick Connect Buttons */}
         <div className="bg-white rounded-xl p-4 mb-4">
           <h3 className="text-md font-medium mb-3 text-gray-800">Quick Connect</h3>
           <div className="grid grid-cols-2 gap-3">
             <button
               onClick={startDiscovery}
               className={`p-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                 isDiscoverable 
                   ? 'border-green-500 bg-green-50 text-green-700' 
                   : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
               }`}
             >
               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                 isDiscoverable ? 'bg-green-100' : 'bg-gray-100'
               }`}>
                 <Users className={`w-5 h-5 ${isDiscoverable ? 'text-green-600' : 'text-gray-500'}`} />
               </div>
               <span className="font-medium text-sm">Connect</span>
               <span className="text-xs text-center">
                 {isDiscoverable ? 'You are discoverable' : 'Make yourself discoverable'}
               </span>
             </button>
             
              <button
               onClick={scanForUsers}
               className="p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-500 flex flex-col items-center justify-center gap-2 transition-all"
             >
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                 <Search className="w-5 h-5 text-blue-500" />
               </div>
               <span className="font-medium text-sm">Get Connected</span>
               <span className="text-xs text-center">Find nearby users</span>
              </button>
            </div>
         </div>

                   <div className="bg-white rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium">Emergency Contact Connect</div>
                  <div className="text-sm text-gray-500">Use Quick Connect to find nearby users</div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Certifications</h2>
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">First Aid Certified</h3>
              <p className="text-sm text-gray-600">Valid until Dec 2025</p>
            </div>
            <Award className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">CPR Specialist</h3>
              <p className="text-sm text-gray-600">Valid until Nov 2025</p>
            </div>
            <Award className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow border">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                switch (item.label) {
                  case 'Notifications':
                    // Navigate to notifications page or show notifications modal
                    alert('Notifications feature coming soon!');
                    break;
                  case 'Emergency Contacts':
                    setShowEmergencyContacts(true);
                    break;
                  case 'Saved Locations':
                    setShowLocations(true);
                    break;
                  case 'Connected Devices':
                    setShowDevices(true);
                    break;
                  case 'Emergency Statistics':
                    setShowStats(true);
                    break;
                  case 'Settings':
                    // Navigate to settings page or show settings modal
                    alert('Settings feature coming soon!');
                    break;
                  default:
                    break;
                }
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 text-red-500" />
                <span className="ml-3">{item.label}</span>
              </div>
              <div className="flex items-center">
                {item.badge && (
                  <span className={`mr-2 px-2 py-1 rounded-full text-xs ${
                    item.badge === 'New' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

             {/* Location Picker Modal */}
       {showLocationPicker && (
         <LocationPicker
           onLocationSelect={handleLocationSelect}
           onClose={() => setShowLocationPicker(false)}
         />
       )}

       {/* Connection Modal */}
       {showConnectionModal && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
             {/* Header */}
             <div className="p-4 border-b flex items-center justify-between">
               <h3 className="text-lg font-semibold">
                 {isDiscoverable ? 'You are Discoverable' : 'Available Users'}
               </h3>
               <button 
                 onClick={() => {
                   setShowConnectionModal(false);
                   setIsDiscoverable(false);
                   setAvailableUsers([]);
                 }}
                 className="p-2 hover:bg-gray-100 rounded-full"
                 title="Close connection modal"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>

             {/* Content */}
             <div className="p-4">
               {isDiscoverable ? (
                 <div className="text-center py-8">
                   <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                     <Users className="w-8 h-8 text-green-600" />
                   </div>
                   <h4 className="text-lg font-semibold mb-2">You are discoverable!</h4>
                   <p className="text-gray-600 mb-4">
                     Other users can now find and connect to you. Keep this screen open.
                   </p>
                   <div className="animate-pulse">
                     <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                   </div>
                   <button
                     onClick={stopDiscovery}
                     className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                   >
                     Stop Discovery
                   </button>
                 </div>
               ) : isScanningForUsers ? (
                 <div className="text-center py-8">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                   <h4 className="text-lg font-semibold mb-2">Scanning for users...</h4>
                   <p className="text-gray-600">Looking for nearby discoverable users</p>
                 </div>
               ) : availableUsers.length > 0 ? (
                 <div className="space-y-3">
                   <p className="text-sm text-gray-600 mb-4">Found {availableUsers.length} user(s) nearby:</p>
                   {availableUsers.map((user) => (
                     <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                           <Users className="w-5 h-5 text-blue-600" />
                         </div>
                         <div>
                           <div className="font-medium">{user.name}</div>
                           <div className="text-sm text-gray-500">{user.distance}</div>
                         </div>
                       </div>
                       <button 
                         onClick={() => connectToUser(user.id, user.name)}
                         className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                       >
                         Connect
                       </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   <p className="text-gray-500">No users found</p>
                   <p className="text-sm text-gray-400">Make sure other users have tapped "Connect"</p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

      {/* Logout Button */}
      <div className="p-4">
        <button 
          onClick={onLogout}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-medium shadow-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}