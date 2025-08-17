import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notificationUtils';

export interface EmergencyReport {
  id?: string;
  userId: string;
  userName: string;
  emergencyType: string;
  specificType: string;
  location: string;
  description: string;
  status: 'active' | 'resolved' | 'pending';
  priority: 'high' | 'medium' | 'low';
  timestamp: any;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  images?: string[];
  audioUrl?: string;
}

export interface EmergencyPrediction {
  type: string;
  risk: 'High' | 'Medium' | 'Low';
  location: string;
  time: string;
  factors: string[];
  confidence: number;
}

// Submit emergency report and notify all users
export const submitEmergencyReport = async (reportData: Omit<EmergencyReport, 'id' | 'timestamp' | 'status'>) => {
  try {
    // Add emergency report to Firestore
    const emergencyRef = collection(db, 'emergencies');
    const docRef = await addDoc(emergencyRef, {
      ...reportData,
      timestamp: serverTimestamp(),
      status: 'active'
    });

    // Get all users to send notifications
    const usersRef = collection(db, 'profiles');
    const usersSnapshot = await getDocs(usersRef);
    
    // Create notifications for all users
    const notificationPromises = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      return createNotification({
        userId: doc.id,
        type: 'emergency',
        title: 'Emergency Alert',
        message: `${reportData.specificType} reported in ${reportData.location}. Emergency services have been notified.`,
        priority: 'high',
        location: reportData.location,
        emergencyType: reportData.specificType
      });
    });

    await Promise.all(notificationPromises);

    return docRef.id;
  } catch (error) {
    console.error('Error submitting emergency report:', error);
    throw error;
  }
};

// Get recent emergencies for prediction page
export const getRecentEmergencies = async (limitCount: number = 10) => {
  try {
    const emergencyRef = collection(db, 'emergencies');
    const q = query(
      emergencyRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const emergencies: EmergencyReport[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      emergencies.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        emergencyType: data.emergencyType,
        specificType: data.specificType,
        location: data.location,
        description: data.description,
        status: data.status,
        priority: data.priority,
        timestamp: data.timestamp?.toDate() || new Date(),
        coordinates: data.coordinates,
        images: data.images,
        audioUrl: data.audioUrl
      });
    });

    return emergencies;
  } catch (error) {
    console.error('Error fetching recent emergencies:', error);
    return [];
  }
};

// Get emergencies by area
export const getEmergenciesByArea = async (area: string, limitCount: number = 10) => {
  try {
    const emergencyRef = collection(db, 'emergencies');
    const q = query(
      emergencyRef,
      where('location', '>=', area),
      where('location', '<=', area + '\uf8ff'),
      orderBy('location'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const emergencies: EmergencyReport[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      emergencies.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        emergencyType: data.emergencyType,
        specificType: data.specificType,
        location: data.location,
        description: data.description,
        status: data.status,
        priority: data.priority,
        timestamp: data.timestamp?.toDate() || new Date(),
        coordinates: data.coordinates,
        images: data.images,
        audioUrl: data.audioUrl
      });
    });

    return emergencies;
  } catch (error) {
    console.error('Error fetching emergencies by area:', error);
    return [];
  }
};

// Generate risk predictions based on recent emergencies
export const generateRiskPredictions = (emergencies: EmergencyReport[]): EmergencyPrediction[] => {
  const predictions: EmergencyPrediction[] = [];
  
  // Analyze emergency patterns
  const emergencyCounts: { [key: string]: number } = {};
  const locationCounts: { [key: string]: number } = {};
  
  emergencies.forEach(emergency => {
    emergencyCounts[emergency.specificType] = (emergencyCounts[emergency.specificType] || 0) + 1;
    locationCounts[emergency.location] = (locationCounts[emergency.location] || 0) + 1;
  });

  // Generate predictions based on frequency
  Object.entries(emergencyCounts).forEach(([type, count]) => {
    if (count >= 2) {
      const risk = count >= 5 ? 'High' : count >= 3 ? 'Medium' : 'Low';
      const factors = [];
      
      if (count >= 5) factors.push('High Frequency');
      if (count >= 3) factors.push('Recent Incidents');
      if (count >= 2) factors.push('Pattern Detected');

      predictions.push({
        type,
        risk,
        location: 'Multiple Locations',
        time: 'Next 24 hours',
        factors,
        confidence: Math.min(count * 20, 95)
      });
    }
  });

  // Add location-specific predictions
  Object.entries(locationCounts).forEach(([location, count]) => {
    if (count >= 2) {
      const risk = count >= 3 ? 'High' : 'Medium';
      predictions.push({
        type: 'General Emergency',
        risk,
        location,
        time: 'Next 12 hours',
        factors: ['High Activity Area', 'Recent Incidents'],
        confidence: Math.min(count * 25, 90)
      });
    }
  });

  return predictions.slice(0, 5); // Return top 5 predictions
};

// Update emergency status
export const updateEmergencyStatus = async (emergencyId: string, status: 'active' | 'resolved' | 'pending') => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const emergencyRef = doc(db, 'emergencies', emergencyId);
    await updateDoc(emergencyRef, { status });
  } catch (error) {
    console.error('Error updating emergency status:', error);
    throw error;
  }
};
