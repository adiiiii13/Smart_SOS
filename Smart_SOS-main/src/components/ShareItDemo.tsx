import React, { useState, useEffect } from 'react';
import { Users, Search, Bluetooth, Signal, Wifi, X, CheckCircle, AlertCircle } from 'lucide-react';
import { bluetoothManager, DiscoverableUser } from '../lib/bluetoothUtils';

export function ShareItDemo() {
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredUsers, setDiscoveredUsers] = useState<DiscoverableUser[]>([]);
  const [status, setStatus] = useState('Ready to connect like Share It');
  const [showInstructions, setShowInstructions] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      bluetoothManager.cleanup();
    };
  }, []);

  const handleStartDiscovery = async () => {
    setStatus('🔵 Making you discoverable...');
    try {
      const success = await bluetoothManager.startDiscovery('ShareIt User', 'user-' + Date.now());
      if (success) {
        setIsDiscoverable(true);
        setStatus('✅ You are now discoverable! Others can find you via Bluetooth');
      } else {
        setStatus('❌ Failed to start discovery. Check Bluetooth permissions.');
      }
    } catch (error) {
      console.error('Discovery error:', error);
      setStatus('❌ Error: Bluetooth not available or permissions denied');
    }
  };

  const handleStopDiscovery = () => {
    bluetoothManager.stopDiscovery();
    setIsDiscoverable(false);
    setStatus('🛑 No longer discoverable');
  };

  const handleScanForUsers = async () => {
    setStatus('🔍 Scanning for nearby users...');
    setIsScanning(true);
    setDiscoveredUsers([]);

    try {
      // Set up real-time device discovery
      bluetoothManager.setOnDeviceFound((device: DiscoverableUser) => {
        setDiscoveredUsers(prev => {
          // Avoid duplicates
          if (prev.find(u => u.id === device.id)) {
            return prev;
          }
          return [...prev, device];
        });
        setStatus(`📱 Found: ${device.name} (${device.distance})`);
      });

      const users = await bluetoothManager.scanForUsers();
      setDiscoveredUsers(users);
      setIsScanning(false);
      
      if (users.length > 0) {
        setStatus(`✅ Found ${users.length} nearby users`);
      } else {
        setStatus('❌ No nearby users found. Make sure others have enabled discovery.');
      }
    } catch (error) {
      console.error('Scan error:', error);
      setStatus('❌ Scan failed - Check Bluetooth permissions');
      setIsScanning(false);
    }
  };

  const handleConnectToUser = async (user: DiscoverableUser) => {
    setStatus(`🔗 Connecting to ${user.name}...`);
    try {
      const success = await bluetoothManager.connectToUser(user.id, user.name);
      if (success) {
        setStatus(`✅ Connected to ${user.name}! Added to friends.`);
        setConnectedUsers(prev => [...prev, user.id]);
        // Remove from discovered list
        setDiscoveredUsers(prev => prev.filter(u => u.id !== user.id));
      } else {
        setStatus(`❌ Failed to connect to ${user.name}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      setStatus(`❌ Connection failed: ${user.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Bluetooth className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Share It Style</h1>
              <p className="text-sm text-gray-600">Bluetooth Quick Connect</p>
            </div>
          </div>

          {/* Status Display */}
          <div className="p-4 bg-gray-50 rounded-xl mb-4 border">
            <div className="flex items-center gap-2">
              <Signal className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{status}</span>
            </div>
          </div>

          {/* Discovery Controls */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={handleStartDiscovery}
                disabled={isDiscoverable || isScanning}
                className={`flex-1 p-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all ${
                  isDiscoverable 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-500'
                } ${(isDiscoverable || isScanning) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Users className="w-6 h-6" />
                <span className="font-medium">Connect</span>
                <span className="text-xs text-center">
                  {isDiscoverable ? 'You are discoverable' : 'Make yourself discoverable'}
                </span>
              </button>

              <button
                onClick={handleScanForUsers}
                disabled={isDiscoverable || isScanning}
                className={`flex-1 p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-500 flex flex-col items-center gap-2 transition-all ${
                  (isDiscoverable || isScanning) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Search className="w-6 h-6" />
                <span className="font-medium">Get Connected</span>
                <span className="text-xs text-center">Find nearby users</span>
              </button>
            </div>

            {isDiscoverable && (
              <button
                onClick={handleStopDiscovery}
                className="w-full p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Stop Discovery
              </button>
            )}
          </div>
        </div>

        {/* Discovered Users */}
        {discoveredUsers.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-6 border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Nearby Users ({discoveredUsers.length})
            </h3>
            <div className="space-y-3">
              {discoveredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{user.distance}</span>
                      {user.rssi && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          RSSI: {user.rssi}dBm
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectToUser(user)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected Users */}
        {connectedUsers.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-6 border border-green-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Connected Friends ({connectedUsers.length})
            </h3>
            <div className="space-y-2">
              {connectedUsers.map((userId) => (
                <div key={userId} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">User {userId.slice(-4)}</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Connected
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {showInstructions && (
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">How to Test Like Share It</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>Open this page in <strong>two different browser tabs</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>In <strong>Tab 1</strong>: Click "Connect" to make yourself discoverable</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>In <strong>Tab 2</strong>: Click "Get Connected" to scan for users</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>You should see Tab 1's user appear in Tab 2's scan results</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">5.</span>
                <span>Click "Connect" to establish a real Bluetooth connection</span>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Note: Requires Bluetooth permissions and HTTPS in production</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
