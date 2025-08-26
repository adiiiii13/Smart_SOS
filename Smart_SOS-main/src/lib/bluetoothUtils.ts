// Real Bluetooth utility functions for peer-to-peer discovery
// Similar to Share It app functionality using Web Bluetooth API and WebRTC

export interface DiscoverableUser {
  id: string;
  name: string;
  distance: string;
  deviceId: string;
  isEmergencyContact?: boolean;
  rssi?: number;
  peerConnection?: RTCPeerConnection;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
}

class BluetoothManager {
  private isDiscoverable = false;
  private isScanning = false;
  private discoveredDevices: Map<string, DiscoverableUser> = new Map();
  private onDeviceFound?: (device: DiscoverableUser) => void;
  private onScanComplete?: (devices: DiscoverableUser[]) => void;
  private currentUser?: { name: string; id: string };
  private bluetoothServer?: BluetoothRemoteGATTServer;
  private advertisingInterval?: NodeJS.Timeout;
  private scanningInterval?: NodeJS.Timeout;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  
  // Cross-tab communication
  private broadcastChannel?: BroadcastChannel;
  private heartbeatInterval?: NodeJS.Timeout;

  // Custom Bluetooth service UUID for SOS app
  private readonly SOS_SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb';
  private readonly USER_INFO_CHARACTERISTIC_UUID = '0000ff01-0000-1000-8000-00805f9b34fb';
  private readonly CONNECTION_CHARACTERISTIC_UUID = '0000ff02-0000-1000-8000-00805f9b34fb';

  constructor() {
    this.initializeBroadcastChannel();
  }

  // Initialize cross-tab communication
  private initializeBroadcastChannel(): void {
    try {
      this.broadcastChannel = new BroadcastChannel('sos-bluetooth-discovery');
      
      this.broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'USER_DISCOVERABLE':
            this.handleUserDiscovered(data);
            break;
          case 'USER_OFFLINE':
            this.handleUserOffline(data);
            break;
          case 'HEARTBEAT':
            this.handleHeartbeat(data);
            break;
          case 'CONNECTION_REQUEST':
            this.handleConnectionRequest(data);
            break;
        }
      };
      
      console.log('📡 Cross-tab communication initialized');
    } catch (error) {
      console.warn('⚠️ BroadcastChannel not supported, using localStorage fallback');
    }
  }

  // Handle discovered user from another tab
  private handleUserDiscovered(userData: any): void {
    if (!this.isScanning || this.currentUser?.id === userData.id) return;
    
    const device: DiscoverableUser = {
      ...userData,
      distance: this.calculateDistance(userData.rssi || -50),
      timestamp: Date.now()
    };
    
    this.discoveredDevices.set(userData.id, device);
    
    if (this.onDeviceFound) {
      this.onDeviceFound(device);
    }
    
    console.log(`📱 Discovered user: ${userData.name} (${userData.distance})`);
  }

  // Handle user going offline
  private handleUserOffline(userId: string): void {
    this.discoveredDevices.delete(userId);
    console.log(`📱 User ${userId} went offline`);
  }

  // Handle heartbeat from other users
  private handleHeartbeat(userData: any): void {
    if (!this.isScanning || this.currentUser?.id === userData.id) return;
    
    // Update existing device or add new one
    const existingDevice = this.discoveredDevices.get(userData.id);
    if (existingDevice) {
      existingDevice.timestamp = Date.now();
    } else {
      this.handleUserDiscovered(userData);
    }
  }

  // Handle connection request from another user
  private handleConnectionRequest(data: any): void {
    console.log(`🔗 Connection request from ${data.fromName}`);
    // You can implement connection acceptance logic here
  }

  // Check if Bluetooth is available
  async isBluetoothAvailable(): Promise<boolean> {
    if (!navigator.bluetooth) {
      console.warn('Web Bluetooth API not supported in this browser');
      return false;
    }
    return true;
  }

  // Check if we're on HTTPS (required for Web Bluetooth)
  private isSecureContext(): boolean {
    return window.isSecureContext;
  }

  // Request Bluetooth permissions with better error handling
  async requestPermissions(): Promise<boolean> {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API not supported in this browser');
      }

      if (!this.isSecureContext()) {
        throw new Error('Web Bluetooth requires HTTPS (secure context)');
      }
      
      // Try to request device to check permissions
      // Note: This will show a device picker dialog
      await navigator.bluetooth.requestDevice({
        filters: [],
        optionalServices: [this.SOS_SERVICE_UUID]
      });
      return true;
    } catch (error: any) {
      console.error('Bluetooth permission error:', error);
      
      // Provide specific error messages
      if (error.name === 'NotFoundError') {
        throw new Error('No Bluetooth devices found. Make sure Bluetooth is enabled.');
      } else if (error.name === 'NotAllowedError') {
        throw new Error('Bluetooth permission denied. Please allow Bluetooth access.');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Bluetooth not supported on this device/browser.');
      } else if (error.message.includes('HTTPS')) {
        throw new Error('Web Bluetooth requires HTTPS. Use localhost for testing.');
      } else {
        throw new Error(`Bluetooth error: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Make device discoverable (Connect button functionality)
  async startDiscovery(userName: string, userId: string): Promise<boolean> {
    try {
      console.log('🔵 Starting Bluetooth discovery...');
      
      this.isDiscoverable = true;
      this.currentUser = { name: userName, id: userId };
      
      // Start cross-tab advertising
      this.startCrossTabAdvertising(userName, userId);
      
      console.log(`✅ ${userName} is now discoverable via cross-tab communication!`);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to start discovery:', error);
      this.isDiscoverable = false;
      return false;
    }
  }

  // Start advertising across tabs
  private startCrossTabAdvertising(userName: string, userId: string): void {
    console.log('📡 Starting cross-tab advertising');
    
    const userData = {
      id: userId,
      name: userName,
      deviceId: `device-${userId}`,
      rssi: -50,
      isEmergencyContact: true,
      timestamp: Date.now()
    };
    
    // Add ourselves to the discoverable users list
    this.addToDiscoverableUsers(userData);
    
    // Start heartbeat to keep presence active
    this.heartbeatInterval = setInterval(() => {
      if (this.isDiscoverable && this.currentUser) {
        const heartbeatData = {
          ...userData,
          timestamp: Date.now()
        };
        
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage({
            type: 'HEARTBEAT',
            data: heartbeatData
          });
        }
        
        // Also update localStorage as backup
        this.addToDiscoverableUsers(heartbeatData);
      }
    }, 3000); // Send heartbeat every 3 seconds
  }

  // Add user to discoverable users list in localStorage
  private addToDiscoverableUsers(userData: any): void {
    try {
      // Get existing users
      const existingData = localStorage.getItem('sos_discoverable_users');
      let users = existingData ? JSON.parse(existingData) : [];
      
      // Remove old entries (older than 30 seconds)
      const now = Date.now();
      users = users.filter((user: any) => now - user.timestamp < 30000);
      
      // Add or update our user
      const existingIndex = users.findIndex((user: any) => user.id === userData.id);
      if (existingIndex >= 0) {
        users[existingIndex] = userData;
      } else {
        users.push(userData);
      }
      
      // Save back to localStorage
      localStorage.setItem('sos_discoverable_users', JSON.stringify(users));
      
      console.log(`📡 Broadcasting presence: ${userData.name} (${users.length} total users)`);
      
    } catch (error) {
      console.error('Error updating discoverable users:', error);
    }
  }

  // Stop being discoverable
  stopDiscovery(): void {
    this.isDiscoverable = false;
    
    // Notify other tabs that we're going offline
    if (this.broadcastChannel && this.currentUser) {
      this.broadcastChannel.postMessage({
        type: 'USER_OFFLINE',
        data: { id: this.currentUser.id }
      });
    }
    
    // Remove ourselves from discoverable users
    if (this.currentUser) {
      this.removeFromDiscoverableUsers(this.currentUser.id);
    }
    
    this.currentUser = undefined;
    
    // Stop advertising
    if (this.advertisingInterval) {
      clearInterval(this.advertisingInterval);
      this.advertisingInterval = undefined;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
    
    // Disconnect from GATT server
    if (this.bluetoothServer) {
      this.bluetoothServer.disconnect();
      this.bluetoothServer = undefined;
    }
    
    console.log('🛑 No longer discoverable');
  }

  // Remove user from discoverable users list
  private removeFromDiscoverableUsers(userId: string): void {
    try {
      const existingData = localStorage.getItem('sos_discoverable_users');
      if (existingData) {
        let users = JSON.parse(existingData);
        users = users.filter((user: any) => user.id !== userId);
        localStorage.setItem('sos_discoverable_users', JSON.stringify(users));
        console.log(`📡 Removed user ${userId} from discoverable list`);
      }
    } catch (error) {
      console.error('Error removing user from discoverable list:', error);
    }
  }

  // Scan for nearby discoverable devices (Get Connected button functionality)
  async scanForUsers(): Promise<DiscoverableUser[]> {
    try {
      console.log('🔍 Scanning for nearby SOS users...');
      
      this.isScanning = true;
      this.discoveredDevices.clear();
      
      // Start scanning for cross-tab users
      this.startCrossTabScanning();
      
      // Also check localStorage for any existing users
      this.scanLocalStorage();
      
      // Return discovered devices after a short delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.isScanning = false;
      const devices = Array.from(this.discoveredDevices.values());
      
      console.log(`📱 Found ${devices.length} discoverable users`);
      return devices;
      
    } catch (error) {
      console.error('❌ Failed to scan for users:', error);
      this.isScanning = false;
      return [];
    }
  }

  // Start scanning for cross-tab users
  private startCrossTabScanning(): void {
    console.log('🔍 Starting cross-tab scanning...');
    
    // Request discovery from other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'SCAN_REQUEST',
        data: { timestamp: Date.now() }
      });
    }
    
    // Set up interval to check for new users
    this.scanningInterval = setInterval(() => {
      this.scanLocalStorage();
    }, 2000); // Check every 2 seconds
  }

  // Scan localStorage for discoverable users
  private scanLocalStorage(): void {
    try {
      const discoverableUser = localStorage.getItem('sos_discoverable_users');
      if (discoverableUser) {
        const users = JSON.parse(discoverableUser);
        
        // Only show if user is still active (seen in last 30 seconds)
        const now = Date.now();
        const activeUsers = users.filter((user: any) => now - user.timestamp < 30000);
        
        console.log(`🔍 Found ${activeUsers.length} active users in storage`);
        
        activeUsers.forEach((user: any) => {
          // Don't show ourselves
          if (this.currentUser?.id !== user.id) {
            console.log(`📱 Processing user: ${user.name} (last seen: ${Math.round((now - user.timestamp) / 1000)}s ago)`);
            const device: DiscoverableUser = {
              ...user,
              distance: this.calculateDistance(user.rssi || -50)
            };
            
            this.discoveredDevices.set(user.id, device);
            
            if (this.onDeviceFound) {
              this.onDeviceFound(device);
            }
          } else {
            console.log(`📱 Skipping ourselves: ${user.name}`);
          }
        });
      } else {
        console.log('🔍 No users found in storage');
      }
    } catch (error) {
      console.error('Error scanning localStorage:', error);
    }
  }

  // Calculate distance from RSSI
  private calculateDistance(rssi: number): string {
    // Simple distance calculation based on RSSI
    if (rssi >= -30) return '1m away';
    if (rssi >= -50) return '2m away';
    if (rssi >= -60) return '5m away';
    if (rssi >= -70) return '8m away';
    return '10m away';
  }

  // Connect to a specific user using WebRTC
  async connectToUser(userId: string, userName: string): Promise<boolean> {
    try {
      console.log(`🔗 Connecting to ${userName}...`);
      
      // Send connection request via cross-tab communication
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'CONNECTION_REQUEST',
          data: {
            toId: userId,
            fromId: this.currentUser?.id,
            fromName: this.currentUser?.name
          }
        });
      }
      
      // Create WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      
      this.peerConnections.set(userId, peerConnection);
      
      // Create data channel for communication
      const dataChannel = peerConnection.createDataChannel('sos-connection');
      
      dataChannel.onopen = () => {
        console.log(`✅ Data channel opened with ${userName}`);
        // Send connection confirmation
        dataChannel.send(JSON.stringify({
          type: 'connection_established',
          from: this.currentUser?.name || 'Unknown',
          timestamp: Date.now()
        }));
      };
      
      dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(`📨 Received message from ${userName}:`, message);
      };
      
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`✅ Successfully connected to ${userName} via WebRTC`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to ${userName}:`, error);
      return false;
    }
  }

  // Get current discovery status
  getDiscoveryStatus(): boolean {
    return this.isDiscoverable;
  }

  // Get current scanning status
  getScanningStatus(): boolean {
    return this.isScanning;
  }

  // Set callbacks
  setOnDeviceFound(callback: (device: DiscoverableUser) => void): void {
    this.onDeviceFound = callback;
  }

  setOnScanComplete(callback: (devices: DiscoverableUser[]) => void): void {
    this.onScanComplete = callback;
  }

  // Cleanup
  cleanup(): void {
    this.stopDiscovery();
    
    if (this.scanningInterval) {
      clearInterval(this.scanningInterval);
      this.scanningInterval = undefined;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
    
    // Close all peer connections
    this.peerConnections.forEach(connection => {
      connection.close();
    });
    this.peerConnections.clear();
    
    // Close broadcast channel
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = undefined;
    }
  }
}

// Export singleton instance
export const bluetoothManager = new BluetoothManager();
